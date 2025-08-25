const express = require('express');
const {
  getAvailability,
  createBooking,
  confirmPayment,
  getUserBookings,
  cancelBooking
} = require('../controllers/bookingController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/availability/:serviceId', getAvailability);
router.post('/', createBooking);
router.post('/confirm-payment', confirmPayment);
router.get('/my-bookings', protect, getUserBookings);
router.put('/:id/cancel', protect, cancelBooking);

module.exports = router;