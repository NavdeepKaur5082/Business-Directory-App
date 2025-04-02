const express = require('express');
const router = express.Router();
const BusinessProfile = require('../models/BusinessProfile');
const { authenticate, authorizeRoles } = require('../middleware/authMiddleware');

// Create or update business profile
router.post('/profile', authenticate, authorizeRoles('business'), async (req, res) => {
  try {
    const existing = await BusinessProfile.findOne({ user: req.user.id });

    if (existing) {
      // Update existing
      const updated = await BusinessProfile.findOneAndUpdate(
        { user: req.user.id },
        req.body,
        { new: true }
      );
      return res.json(updated);
    }

    // Create new
    const profile = await BusinessProfile.create({ ...req.body, user: req.user.id });
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


// GET /api/business/search?name=ai&type=Private
router.get('/search', async (req, res) => {
    try {
      const { name, type, industry, location } = req.query;
      const filter = {};
  
      if (name) {
        filter.businessName = { $regex: name, $options: 'i' };
      }
  
      if (type) {
        filter.incorporationType = type;
      }
  
      // Add more filters as needed (industry, location, etc.)
      const profiles = await BusinessProfile.find(filter).populate('user', 'name');
      res.json(profiles);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });

  router.get('/profile/:userId', async (req, res) => {
    try {
      const profile = await BusinessProfile.findOne({ user: req.params.userId }).populate('user', 'name');
      if (!profile) return res.status(404).json({ message: 'Profile not found' });
      res.json(profile);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  
  

module.exports = router;
