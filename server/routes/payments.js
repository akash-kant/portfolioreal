const express = require('express');
const {
  createOrder,
  verifyPayment,
  downloadResource,
  getUserPurchases
} = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/create-order', createOrder);
router.post('/verify', verifyPayment);
router.get('/download/:token', downloadResource);
router.get('/purchases', protect, getUserPurchases);

module.exports = router;