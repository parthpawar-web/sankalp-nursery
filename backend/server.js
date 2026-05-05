import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import Razorpay from 'razorpay';
import connectDB from './config/db.js';
import { errorHandler, notFound } from './middleware/errorMiddleware.js';

// Routes
import authRoutes from './routes/authRoutes.js';
import varietyRoutes from './routes/varietyRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const app = express();

// =========================   
//   Middleware
// =========================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// =========================
//   Static Files
// =========================
app.use(express.static(path.join(__dirname, '..', 'frontend')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// =========================
//   Database
// =========================
connectDB();

// =========================
//   Razorpay Setup ✅
// =========================
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// 👉 Create Order API (THIS FIXES UPI ISSUE)
app.post('/api/create-order', async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount) {
      return res.status(400).json({
        success: false,
        message: 'Amount is required',
      });
    }

    const options = {
      amount: amount, // in paise
      currency: 'INR',
      receipt: 'receipt_' + Date.now(),
    };

    const order = await razorpay.orders.create(options);

    res.json({
      success: true,
      order,
    });
  } catch (error) {
    console.error('Razorpay Order Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create order',
    });
  }
});

// =========================
//   API Routes
// =========================
app.use('/api/auth', authRoutes);
app.use('/api/varieties', varietyRoutes);
app.use('/api/bookings', bookingRoutes);

// =========================
//   SPA Fallback
// =========================
app.get('/{*splat}', (req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({
      success: false,
      message: 'API route not found',
    });
  }
  res.sendFile(path.join(__dirname, '..', 'frontend', 'index.html'));
});

// =========================
//   Error Handling
// =========================
app.use(notFound);
app.use(errorHandler);

// =========================
//   Start Server
// =========================
const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`\n🌿 Booking Server running at http://localhost:${PORT}`);
  console.log(`📦 API Base: http://localhost:${PORT}/api`);
  console.log(`🖥️  Frontend: http://localhost:${PORT}`);
  console.log(`📱 Mobile Test: http://192.168.1.9:${PORT}\n`);
});