const mongoose = require('mongoose');

const businessProfileSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  incorporationType: { type: String, required: true },
  businessName: { type: String, required: true },
  description: String,
  contact: {
    email: String,
    phone: String,
    website: String,
    address: String
  },
  productsAndServices: [
    {
      name: String,
      description: String,
      price: Number,
      availability: Boolean
    }
  ],
  financialStats: {
    revenue: [{ year: Number, amount: Number }],
    cagr: Number,
    roi: Number,
    profitMargin: Number
  }
});

module.exports = mongoose.model('BusinessProfile', businessProfileSchema);
