import express from 'express';
import {
  createBooking,
  getMyBookings,
  getBookings,
  updateBookingStatus,
  createRazorpayOrder,
  verifyPayment,
  markAsPaid,
  getRazorpayConfig,
} from '../controllers/bookingController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').post(protect, createBooking).get(protect, admin, getBookings);
router.route('/my').get(protect, getMyBookings);
router.route('/razorpay-order').post(protect, createRazorpayOrder);
router.route('/verify-payment').post(protect, verifyPayment);
router.route('/config/razorpay').get(protect, getRazorpayConfig);
router.route('/:id/status').patch(protect, admin, updateBookingStatus);
router.route('/:id/pay').patch(protect, admin, markAsPaid);

export default router;
