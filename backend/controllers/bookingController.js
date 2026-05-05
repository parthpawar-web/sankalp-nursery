import mongoose from 'mongoose';
import Booking from '../models/bookingModel.js';
import Variety from '../models/varietyModel.js';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import { sendReceiptEmail } from '../utils/sendEmail.js';
import { sendWhatsAppReceipt } from '../utils/sendWhatsApp.js';
// Helper: Get Razorpay Instance safely
const getRazorpayInstance = () => {
  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;

  if (!key_id || key_id === 'placeholder_key_id') {
    console.warn('⚠️ Razorpay Key ID is missing or using placeholder. Online payments will fail.');
  }

  return new Razorpay({
    key_id: key_id || 'dummy_id',
    key_secret: key_secret || 'dummy_secret',
  });
};

/**
 * @desc    GET Razorpay Configuration (Public Key)
 * @route   GET /api/bookings/config/razorpay
 * @access  Private
 */
export const getRazorpayConfig = async (req, res) => {
  res.json({
    key: process.env.RAZORPAY_KEY_ID || 'placeholder_key_id'
  });
};

/**
 * @desc    CREATE a new seedling booking
 * @route   POST /api/bookings
 * @access  Private (Registered Farmers Only)
 */
export const createBooking = async (req, res) => {
  try {
    const { 
      variety, 
      quantity, 
      mobile, 
      village, 
      note, 
      paymentMethod, 
      paymentStatus, 
      razorpayOrderId, 
      razorpayPaymentId 
    } = req.body;

    // 1. Validation
    if (!variety || !quantity || !mobile || !village) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required information.' 
      });
    }

    // 2. ID Validation & Variety Fetch
    if (!mongoose.Types.ObjectId.isValid(variety)) {
      return res.status(400).json({ success: false, message: 'Invalid variety selected.' });
    }

    const varietyData = await Variety.findById(variety);
    if (!varietyData) {
      return res.status(404).json({ success: false, message: 'Variety no longer available in nursery.' });
    }

    const totalAmount = varietyData.price * quantity;

    // 3. Save the booking
    const booking = new Booking({
      user: req.user._id, 
      variety,
      quantity,
      mobile,
      village,
      note,
      totalAmount,
      paymentMethod: paymentMethod || 'cash',
      paymentStatus: paymentStatus || 'Pending',
      razorpayOrderId,
      razorpayPaymentId,
      status: 'Pending', // Order status (different from payment status)
    });

    const createdBooking = await booking.save();

    // 4. Respond to user immediately to ensure UI feels fast
    res.status(201).json({ 
      success: true, 
      message: 'Booking placed successfully!',
      data: createdBooking 
    });

    // 5. Send notifications in the background (fire-and-forget)
    setImmediate(() => {
      sendReceiptEmail({
        to: req.user.email,
        name: req.user.name,
        orderRef: createdBooking._id.toString().slice(-8).toUpperCase(),
        varietyName: varietyData.varietyName,
        volume: createdBooking.quantity,
        totalAmount: createdBooking.totalAmount,
        paymentStatus: createdBooking.paymentStatus,
        date: new Date(createdBooking.createdAt).toLocaleDateString()
      });

      sendWhatsAppReceipt({
        mobile: createdBooking.mobile,
        name: req.user.name,
        orderRef: createdBooking._id.toString().slice(-8).toUpperCase(),
        varietyName: varietyData.varietyName,
        volume: createdBooking.quantity,
        totalAmount: createdBooking.totalAmount,
        paymentStatus: createdBooking.paymentStatus
      });
    });

  } catch (error) {
    res.status(400).json({ success: false, message: `Booking error: ${error.message}` });
  }
};

/**
 * @desc    CREATE Razorpay Order
 * @route   POST /api/bookings/razorpay-order
 * @access  Private
 */
export const createRazorpayOrder = async (req, res) => {
  try {
    const { varietyId, quantity } = req.body;

    // 1. ID Validation
    if (!mongoose.Types.ObjectId.isValid(varietyId)) {
      return res.status(400).json({ success: false, message: 'Invalid Variety ID.' });
    }

    if (!varietyId || !quantity || isNaN(quantity) || quantity <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid quantity or variety selected.' });
    }

    const variety = await Variety.findById(varietyId);
    if (!variety) {
      return res.status(404).json({ success: false, message: 'Variety not found' });
    }

    if (!variety.price || isNaN(variety.price)) {
      return res.status(400).json({ success: false, message: 'Variety price information is invalid.' });
    }

    // Razorpay expects amount in paise (1 INR = 100 paise)
    const amount = Math.round((variety.price || 0) * (quantity || 0) * 100);

    if (isNaN(amount) || amount <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid total amount calculated.' });
    }

    const options = {
      amount,
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
    };

    // 2. Create Order
    const razorpayInstance = getRazorpayInstance();
    console.log('--- Razorpay Order Attempt ---');
    console.log('Key ID:', process.env.RAZORPAY_KEY_ID ? 'Present' : 'MISSING');
    console.log('Options:', JSON.stringify(options));
    
    const order = await razorpayInstance.orders.create(options);

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    // 1. Handle SDK TypeError (often happens on missing keys OR no internet)
    if (error.message && error.message.includes('reading \'status\'')) {
      // Check if it's likely a network issue
      const isInternetDown = !process.env.RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID.includes('test'); 
      // Actually, let's just be more descriptive
      console.error('💳 Razorpay SDK TypeError Caught:', error);
      
      return res.status(401).json({ 
        success: false, 
        message: 'Razorpay Payment Initialization Failed. This usually means your API keys are invalid OR you have no internet connection.', 
        isAuthError: true 
      });
    }

    // 2. Handle Network Errors
    if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
      return res.status(503).json({
        success: false,
        message: 'Unable to connect to Razorpay. Please check your internet connection.'
      });
    }

    console.error('--- Razorpay Error Details ---');
    console.error(error);
    
    // Extract cleaner error message
    let errorMessage = 'Payment initiation failed.';
    if (error.error && error.error.description) {
      errorMessage = error.error.description;
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    res.status(500).json({ success: false, message: errorMessage });
  }
};

/**
 * @desc    VERIFY Razorpay Payment Signature
 * @route   POST /api/bookings/verify-payment
 * @access  Private
 */
export const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
    hmac.update(razorpay_order_id + '|' + razorpay_payment_id);
    const generatedSignature = hmac.digest('hex');

    if (generatedSignature === razorpay_signature) {
      res.status(200).json({ success: true, message: 'Payment verified successfully' });
    } else {
      res.status(400).json({ success: false, message: 'Payment verification failed' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: `Verification Error: ${error.message}` });
  }
};

/**
 * @desc    GET current user's bookings
 * @route   GET /api/bookings/my
 * @access  Private
 */
export const getMyBookings = async (req, res) => {
  try {
    // .populate() is used here to join the 'variety' data from the Varieties collection
    // This allows us to see the Variety Name and Price directly in the booking object
    const bookings = await Booking.find({ user: req.user._id })
      .populate('variety', 'varietyName price image');

    res.json({ success: true, data: bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: `Error fetching your bookings: ${error.message}` });
  }
};

/**
 * @desc    GET ALL bookings (Dashboard View)
 * @route   GET /api/bookings
 * @access  Private/Admin
 */
export const getBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({})
      .populate('user', 'name email')
      .populate('variety', 'varietyName price');
      
    res.json({ success: true, count: bookings.length, data: bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: `Admin error: ${error.message}` });
  }
};

/**
 * @desc    UPDATE booking status (Cancel, Approve, Complete)
 * @route   PATCH /api/bookings/:id/status
 * @access  Private
 */
export const updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const booking = await Booking.findById(req.params.id);

    if (booking) {
      booking.status = status;
      const updatedBooking = await booking.save();
      res.json({ success: true, message: `Booking status updated to ${status}`, data: updatedBooking });
    } else {
      res.status(404).json({ success: false, message: 'Ordering record not found' });
    }
  } catch (error) {
    res.status(400).json({ success: false, message: `Update error: ${error.message}` });
  }
};

/**
 * @desc    MARK booking as paid (Admin manual update for Cash)
 * @route   PATCH /api/bookings/:id/pay
 * @access  Private/Admin
 */
export const markAsPaid = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (booking) {
      booking.paymentStatus = 'Paid';
      const updatedBooking = await booking.save();
      res.json({ success: true, message: 'Payment status updated to Paid', data: updatedBooking });
    } else {
      res.status(404).json({ success: false, message: 'Booking not found' });
    }
  } catch (error) {
    res.status(400).json({ success: false, message: `Payment update error: ${error.message}` });
  }
};
