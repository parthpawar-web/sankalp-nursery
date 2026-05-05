import mongoose from 'mongoose';

/**
 * Booking Schema Definition
 * Tracks seedling orders placed by farmers.
 */
const bookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User', // Creates a relationship with the User model
    },
    variety: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Variety', // Creates a relationship with the Variety model
    },
    quantity: {
      type: Number,
      required: [true, 'Please add a quantity'],
    },
    mobile: {
      type: String,
      required: [true, 'Please add a mobile number'],
    },
    village: {
      type: String,
      required: [true, 'Please add your village/location'],
    },
    bookingDate: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['Pending', 'Confirmed', 'Dispatched', 'Delivered', 'Completed', 'Cancelled'],
      default: 'Pending',
    },
    note: {
      type: String, // Optional additional info from the farmer
    },
    totalAmount: {
      type: Number,
      required: true,
      default: 0,
    },
    paymentMethod: {
      type: String,
      enum: ['cash', 'online'],
      default: 'cash',
    },
    paymentStatus: {
      type: String,
      enum: ['Pending', 'Paid', 'Failed'],
      default: 'Pending',
    },
    razorpayOrderId: {
      type: String,
    },
    razorpayPaymentId: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const Booking = mongoose.model('Booking', bookingSchema);
export default Booking;
