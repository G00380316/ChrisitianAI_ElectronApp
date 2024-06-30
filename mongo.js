const mongoose = require('mongoose');
const path = require("path");
require('dotenv').config({path: path.join(__dirname, 'resources', '.env')});

const connectMongoDB = async () => { 
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
        throw error;
    }
};

module.exports = { connectMongoDB };
