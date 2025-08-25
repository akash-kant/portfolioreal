const razorpay = require('../config/razorpay');
const crypto = require('crypto');
const Purchase = require('../models/Purchase');
const Resource = require('../models/Resource');
const { createTransporter } = require('../config/email');

// @desc    Create Razorpay order for resource purchase
// @route   POST /api/payments/create-order
// @access  Public
const createOrder = async (req, res) => {
  try {
    const { resourceId, customerInfo } = req.body;

    // Get resource details
    const resource = await Resource.findById(resourceId);
    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found'
      });
    }

    const amount = resource.price * 100; // Convert to paise

    const options = {
      amount,
      currency: resource.currency,
      receipt: `resource_${resourceId}_${Date.now()}`,
      notes: {
        resourceId,
        resourceTitle: resource.title,
        customerEmail: customerInfo.email,
        customerName: customerInfo.name
      }
    };

    const order = await razorpay.orders.create(options);

    res.status(200).json({
      success: true,
      data: {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        resource: {
          id: resource._id,
          title: resource.title,
          price: resource.price
        }
      }
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      message: 'Unable to create order'
    });
  }
};

// @desc    Verify payment and create purchase record
// @route   POST /api/payments/verify
// @access  Public
const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      resourceId,
      customerInfo
    } = req.body;

    // Verify signature
    const sign = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest('hex');

    if (razorpay_signature !== expectedSign) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment signature'
      });
    }

    // Get resource details
    const resource = await Resource.findById(resourceId);
    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found'
      });
    }

    // Create purchase record
    const purchase = await Purchase.create({
      resource: resourceId,
      user: req.user?.id || null,
      customerInfo,
      paymentId: razorpay_payment_id,
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      amount: resource.price,
      currency: resource.currency,
      status: 'Completed'
    });

    // Update resource download count
    resource.downloads += 1;
    await resource.save({ validateBeforeSave: false });

    // Generate download token
    const downloadToken = crypto.randomBytes(32).toString('hex');
    purchase.downloadLinks.push({
      token: downloadToken,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
    });
    await purchase.save();

    // Send confirmation email
    await sendPurchaseConfirmationEmail(purchase, resource, downloadToken);

    res.status(200).json({
      success: true,
      message: 'Payment verified successfully',
      data: {
        purchaseId: purchase._id,
        downloadToken,
        downloadUrl: `${process.env.CLIENT_URL}/download/${downloadToken}`
      }
    });
  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Payment verification failed'
    });
  }
};

// @desc    Download purchased resource
// @route   GET /api/payments/download/:token
// @access  Public
const downloadResource = async (req, res) => {
  try {
    const { token } = req.params;

    const purchase = await Purchase.findOne({
      'downloadLinks.token': token,
      'downloadLinks.used': false,
      'downloadLinks.expiresAt': { $gt: new Date() }
    }).populate('resource');

    if (!purchase) {
      return res.status(404).json({
        success: false,
        message: 'Invalid or expired download link'
      });
    }

    // Check download limit
    if (purchase.downloadCount >= purchase.maxDownloads) {
      return res.status(403).json({
        success: false,
        message: 'Download limit exceeded'
      });
    }

    // Mark token as used and increment download count
    const downloadLink = purchase.downloadLinks.find(link => link.token === token);
    downloadLink.used = true;
    purchase.downloadCount += 1;
    await purchase.save();

    // Redirect to actual file URL
    res.redirect(purchase.resource.file.url);
  } catch (error) {
    console.error('Download resource error:', error);
    res.status(500).json({
      success: false,
      message: 'Unable to download resource'
    });
  }
};

// @desc    Get user's purchases
// @route   GET /api/payments/purchases
// @access  Private
const getUserPurchases = async (req, res) => {
  try {
    const purchases = await Purchase.find({
      $or: [
        { user: req.user.id },
        { 'customerInfo.email': req.user.email }
      ]
    })
    .populate('resource', 'title description price currency type')
    .sort('-createdAt');

    res.status(200).json({
      success: true,
      data: purchases
    });
  } catch (error) {
    console.error('Get purchases error:', error);
    res.status(500).json({
      success: false,
      message: 'Unable to fetch purchases'
    });
  }
};

// Helper function to send purchase confirmation email
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
            <a href="${downloadUrl}" 
               style="background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Download Now
            </a>
          </div>

          <p><strong>Important:</strong></p>
          <ul>
            <li>This download link is valid for 24 hours</li>
            <li>You can download the file up to 5 times</li>
            <li>Keep this email for your records</li>
          </ul>

          <p>If you have any issues, please contact us at support@yourportfolio.com</p>
          
          <p>Best regards,<br>Your Portfolio Team</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Send email error:', error);
  }
};

module.exports = {
  createOrder,
  verifyPayment,
  downloadResource,
  getUserPurchases
};