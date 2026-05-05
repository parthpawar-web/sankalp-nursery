import mongoose from 'mongoose';

/**
 * Review Schema Definition
 * Stores individual ratings and comments for a variety.
 */
const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    name: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      default: 0,
    },
    comment: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Variety Schema Definition
 * Stores the specific cabbage varieties offered by the nursery.
 */
const varietySchema = new mongoose.Schema(
  {
    varietyName: {
      type: String,
      required: [true, 'Please add a variety name (e.g. Veer 333, Sukrti)'],
      unique: true,
      trim: true,
    },
    company: {
      type: String,
      default: 'Sankalp Hi-Tech Nursery',
    },
    price: {
      type: Number,
      required: [true, 'Please add a price per seedling (in ₹)'],
    },
    stock: {
      type: Number,
      required: [true, 'Please add available stock quantity'],
      default: 0,
    },
    description: {
      type: String,
      required: [true, 'Please add a variety description'],
    },
    features: {
      type: [String], // Array of strings (e.g. ['60-70 days', 'Heat Tolerant'])
      default: [],
    },
    benefits: {
      type: [String],
      default: [],
    },
    image: {
      type: String, // Path to the image file
      default: '/images/hero-cabbage.png',
    },
    available: {
      type: Boolean,
      default: true,
    },
    reviews: [reviewSchema],
    rating: {
      type: Number,
      required: true,
      default: 5.0, // Base default to maintain aesthetics
    },
    numReviews: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const Variety = mongoose.model('Variety', varietySchema);
export default Variety;
