const express = require('express');
const router = express.Router();
const BusinessProfile = require('../models/BusinessProfile');
const { authenticate, authorizeRoles } = require('../middleware/authMiddleware');
const mongoose = require('mongoose');

// Create or update business profile
router.post('/profile', authenticate, authorizeRoles('business'), async (req, res) => {
  try {
    const existing = await BusinessProfile.findOne({ user: req.user.id });

    if (existing) {
      const updated = await BusinessProfile.findOneAndUpdate(
        { user: req.user.id },
        req.body,
        { new: true }
      );
      return res.json(updated);
    }

    const profile = await BusinessProfile.create({
      ...req.body,
      user: new mongoose.Types.ObjectId(req.user.id)
    });
    res.status(201).json(profile);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all public profiles
router.get('/profiles', async (req, res) => {
  try {
    const profiles = await BusinessProfile.find().populate('user', 'name');
    res.json(profiles);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ Place this BEFORE /profile/:userId
router.get('/profile/me', authenticate, authorizeRoles('business'), async (req, res) => {
  try {
    console.log("✅ Logged-in user:", req.user);

    const profile = await BusinessProfile.findOne({ user: new mongoose.Types.ObjectId(req.user.id) });

    if (!profile) return res.status(404).json({ message: 'Profile not found' });

    res.json(profile);
  } catch (err) {
    console.error("❌ Error in /profile/me:", err.message);
    res.status(500).json({ message: err.message });
  }
});

// Get single business profile by user ID
router.get('/profile/:userId', async (req, res) => {
  try {
    const profile = await BusinessProfile.findOne({ user: req.params.userId }).populate('user', 'name');
    if (!profile) return res.status(404).json({ message: 'Profile not found' });
    res.json(profile);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Search businesses
router.get('/search', async (req, res) => {
  try {
    const { name, type, location, sortBy = 'revenue' } = req.query;
    const filter = {};

    // Name filter (case-insensitive partial match)
    if (name) filter.businessName = { $regex: name, $options: 'i' };

    // Type filter (e.g., Private, Corporation)
    if (type) filter.incorporationType = type;

    // Industry filter (case-insensitive)

    // Location filter (search within contact.address)

    // Sorting logic
    let sortCriteria = {};

    switch (sortBy) {
      case 'revenue':
        // Get the latest revenue (last entry in array)
        sortCriteria = { 'financialStats.revenue.0.amount': -1 };
        break;
      case 'cagr':
        sortCriteria = { 'financialStats.cagr': -1 };
        break;
      case 'roi':
        sortCriteria = { 'financialStats.roi': -1 };
        break;
      case 'profitMargin':
        sortCriteria = { 'financialStats.profitMargin': -1 };
        break;
      default:
        sortCriteria = {};
    }

    const businesses = await BusinessProfile.find(filter)
      .populate('user', 'name')
      .sort(sortCriteria);

    res.json(businesses);
  } catch (err) {
    console.error("❌ Error in /search:", err.message);
    res.status(500).json({ message: err.message });
  }
});



// Save financial stats
router.get('/financials/me', authenticate, authorizeRoles('business'), async (req, res) => {
  try {
    const profile = await BusinessProfile.findOne({ user: req.user.id });

    if (!profile || !profile.financialStats || !Array.isArray(profile.financialStats.revenue)) {
      return res.status(404).json({ message: 'Revenue data not found' });
    }

    res.json(profile.financialStats.revenue); // ✅ Only send revenue array
  } catch (err) {
    console.error("❌ Error in /financials/me:", err.message);
    res.status(500).json({ message: err.message });
  }
});
router.post('/financials', authenticate, authorizeRoles('business'), async (req, res) => {
  try {
    const profile = await BusinessProfile.findOne({ user: req.user.id });
    if (!profile) return res.status(404).json({ message: 'Profile not found' });

    profile.financialStats = req.body;
    await profile.save();
    res.json({ message: 'Financial stats updated', financialStats: profile.financialStats });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});



// Get financial stats by user ID
router.get('/financials/:userId', async (req, res) => {
  try {
    const profile = await BusinessProfile.findOne({ user: req.params.userId });
    if (!profile) return res.status(404).json({ message: 'Business profile not found' });
    res.json(profile.financialStats);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});



module.exports = router;
