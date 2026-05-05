import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import User from './models/userModel.js';
import Variety from './models/varietyModel.js';
import Booking from './models/bookingModel.js';
import bcrypt from 'bcryptjs';

dotenv.config();

connectDB();

const seedData = async () => {
    try {
        await User.deleteMany();
        await Variety.deleteMany();
        await Booking.deleteMany();

        // Add an admin user and a default test user
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash('123456', salt);
        
        await User.insertMany([
            { name: 'Admin', email: 'admin@nursery.com', password: hash, role: 'admin' },
            { name: 'Test Farmer', email: 'farmer@nursery.com', password: hash, role: 'farmer' }
        ]);

        // Add premium cabbage varieties
        await Variety.insertMany([
            {
                varietyName: 'Veer 333',
                price: 1.5,
                stock: 50000,
                description: 'High-yielding cabbage variety, known for its deep green color and solid round heads. Excellent disease resistance and ideal for both summer and winter plantations.',
                image: 'images/veer-333.jpg',
                available: true
            },
            {
                varietyName: 'Sukrti',
                price: 1.2,
                stock: 35000,
                description: 'A premium medium-sized cabbage variety. Takes fewer days to mature and features a highly compact, crisp structure. Suitable for premium market selling.',
                image: 'images/sukriti.jpg',
                available: true
            },
            {
                varietyName: 'Dollar',
                price: 2.0,
                stock: 20000,
                description: 'Our top-tier variety. Large head size, exceptionally uniform growth, and outstanding field holding capacity. Best choice for long-distance transport.',
                image: 'images/dollar.jpg',
                available: true
            }
        ]);

        console.log('🌱 Nursery database successfully seeded with Premium Cabbage Varieties!');
        process.exit();
    } catch (error) {
        console.error(`❌ Error seating data: ${error.message}`);
        process.exit(1);
    }
};

seedData();
