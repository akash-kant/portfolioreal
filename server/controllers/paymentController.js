const razorpay = require('../config/razorpay');
const crypto = require('crypto');
const Purchase = require('../models/Purchase');
const Resource = require('../models/Resource');
const { createTransporter } = require('../config/email');

const createOrder = async (req, res) => {
  try {
    const { resourceId, customerInfo } = req.body;
    const resource = await Resource.findById(resourceId);
    if (!resource) return res.status(404).json({ success: false, message: 'Resource not found' });

    const amount = Math.round(Number(resource.price) * 100);
    const order = await razorpay.orders.create({
      amount,
      currency: resource.currency,
      receipt: `resource_${resourceId}_${Date.now()}`,
      notes: { resourceId, resourceTitle: resource.title, customerEmail: customerInfo.email, customerName: customerInfo.name },
    });

    res.status(200).json({
      success: true,
      data: {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        resource: { id: resource._id, title: resource.title, price: resource.price },
      },
    });
  } catch (e) {
    console.error('Create order error:', e);
    res.status(500).json({ success: false, message: 'Unable to create order' });
  }
};

const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, resourceId, customerInfo } = req.body;

    const sign = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSign = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET).update(sign).digest('hex');
    if (razorpay_signature !== expectedSign) {
      return res.status(400).json({ success: false, message: 'Invalid payment signature' });
    }

    const resource = await Resource.findById(resourceId);
    if (!resource) return res.status(404).json({ success: false, message: 'Resource not found' });

    const purchase = await Purchase.create({
      resource: resourceId,
      user: req.user?.id || null,
      customerInfo,
      paymentId: razorpay_payment_id,
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      amount: resource.price,
      currency: resource.currency,
      status: 'Completed',
    });

    resource.downloads += 1;
    await resource.save({ validateBeforeSave: false });

    const downloadToken = crypto.randomBytes(32).toString('hex');
    purchase.downloadLinks.push({
      token: downloadToken,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });
    await purchase.save();

    await sendPurchaseConfirmationEmail(purchase, resource, downloadToken);

    res.status(200).json({
      success: true,
      message: 'Payment verified successfully',
      data: { purchaseId: purchase._id, downloadToken, downloadUrl: `${process.env.CLIENT_URL}/download/${downloadToken}` },
    });
  } catch (e) {
    console.error('Verify payment error:', e);
    res.status(500).json({ success: false, message: 'Payment verification failed' });
  }
};

const downloadResource = async (req, res) => {
  try {
    const { token } = req.params;
    const purchase = await Purchase.findOne({
      'downloadLinks.token': token,
      'downloadLinks.used': false,
      'downloadLinks.expiresAt': { $gt: new Date() },
    }).populate('resource');

    if (!purchase) {
      return res.status(404).json({ success: false, message: 'Invalid or expired download link' });
    }

    if (purchase.downloadCount >= purchase.maxDownloads) {
      return res.status(403).json({ success: false, message: 'Download limit exceeded' });
    }

    const link = purchase.downloadLinks.find((l) => l.token === token);
    link.used = true;
    purchase.downloadCount += 1;
    await purchase.save();

    if (!purchase.resource?.file?.url) {
      return res.status(500).json({ success: false, message: 'File is not available for download' });
    }

    res.redirect(purchase.resource.file.url);
  } catch (e) {
    console.error('Download resource error:', e);
    res.status(500).json({ success: false, message: 'Unable to download resource' });
  }
};

const getUserPurchases = async (req, res) => {
  try {
    const purchases = await Purchase.find({
      $or: [{ user: req.user.id }, { 'customerInfo.email': req.user.email }],
    })
      .populate('resource', 'title description price currency type')
      .sort('-createdAt');

    res.status(200).json({ success: true, data: purchases });
  } catch (e) {
    console.error('Get purchases error:', e);
    res.status(500).json({ success: false, message: 'Unable to fetch purchases' });
  }
};

const sendPurchaseConfirmationEmail = async (purchase, resource, downloadToken) => {
  try {
    const transporter = createTransporter();
    const downloadUrl = `${process.env.CLIENT_URL}/download/${downloadToken}`;
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: purchase.customerInfo.email,
      subject: `Purchase Confirmation - ${resource.title}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Thank you for your purchase!</h2>
          <p>Hi ${purchase.customerInfo.name},</p>
          <p>Your purchase of <strong>${resource.title}</strong> has been confirmed.</p>
          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Purchase Details</h3>
            <p><strong>Item:</strong> ${resource.title}</p>
            <p><strong>Amount:</strong> ${resource.currency} ${resource.price}</p>
            <p><strong>Payment ID:</strong> ${purchase.paymentId}</p>
            <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
          </div>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${downloadUrl}" style="background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Download Now
            </a>
          </div>
          <p><strong>Important:</strong></p>
          <ul>
            <li>This download link is valid for 24 hours</li>
            <li>You can download the file up to 5 times</li>
          </ul>
          <p>Best regards,<br/>Portfolio Team</p>
        </div>
      `,
    };
    await transporter.sendMail(mailOptions);
  } catch (e) {
    console.error('Send email error:', e);
  }
};

module.exports = { createOrder, verifyPayment, downloadResource, getUserPurchases };
