import express from 'express';
import { adminAuth } from '../middleware/auth.js';
import User from '../models/User.js';
import Property from '../models/Property.js';
import Inquiry from '../models/Inquiry.js';
import mongoose from 'mongoose';
import { check, validationResult } from 'express-validator';

const router = express.Router();

// @route   GET api/admin/dashboard
// @desc    Get admin dashboard data
// @access  Admin only
router.get('/dashboard', adminAuth, async (req, res) => {
    try {
        // Get counts of users and properties
        const userCount = await User.countDocuments();
        const propertyCount = await Property.countDocuments();
        const inquiryCount = await Inquiry.countDocuments();
        
        // Get latest properties
        const latestProperties = await Property.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('owner', 'name email');
        
        // Get latest users
        const latestUsers = await User.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .select('-password');
        
        // Get latest inquiries
        const latestInquiries = await Inquiry.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('property', 'title');
        
        res.json({
            counts: {
                users: userCount,
                properties: propertyCount,
                inquiries: inquiryCount
            },
            latestProperties,
            latestUsers,
            latestInquiries
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/admin/users
// @desc    Get all users
// @access  Admin only
router.get('/users', adminAuth, async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.json(users);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/admin/properties
// @desc    Get all properties
// @access  Admin only
router.get('/properties', adminAuth, async (req, res) => {
    try {
        const properties = await Property.find()
            .populate('owner', 'name email');
        res.json(properties);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST api/admin/properties
// @desc    Create a property as admin
// @access  Admin only
router.post('/properties', [
    adminAuth,
    [
        check('title', 'Title is required').not().isEmpty(),
        check('description', 'Description is required').not().isEmpty(),
        check('price', 'Price is required').isNumeric(),
        check('location', 'Location is required').not().isEmpty()
    ]
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const {
            title,
            description,
            price,
            location,
            type,
            bedrooms,
            bathrooms,
            area,
            images,
            features
        } = req.body;

        // Find a default user to assign as owner or use system user
        let owner;
        const defaultUser = await User.findOne();
        
        if (defaultUser) {
            owner = defaultUser._id;
        } else {
            // If no user exists, create a system user ID
            owner = mongoose.Types.ObjectId();
        }

        const newProperty = new Property({
            title,
            description,
            price,
            location,
            type,
            bedrooms,
            bathrooms,
            area,
            images,
            features,
            owner
        });

        const property = await newProperty.save();
        res.json(property);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT api/admin/properties/:id
// @desc    Update a property as admin
// @access  Admin only
router.put('/properties/:id', adminAuth, async (req, res) => {
    try {
        const property = await Property.findById(req.params.id);
        
        if (!property) {
            return res.status(404).json({ msg: 'Property not found' });
        }
        
        // Admin can update any property
        const updatedProperty = await Property.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true }
        );
        
        res.json(updatedProperty);
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Property not found' });
        }
        res.status(500).send('Server Error');
    }
});

// @route   DELETE api/admin/users/:id
// @desc    Delete a user
// @access  Admin only
router.delete('/users/:id', adminAuth, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }
        
        await user.deleteOne();
        
        res.json({ msg: 'User removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   DELETE api/admin/properties/:id
// @desc    Delete a property
// @access  Admin only
router.delete('/properties/:id', adminAuth, async (req, res) => {
    try {
        const property = await Property.findById(req.params.id);
        
        if (!property) {
            return res.status(404).json({ msg: 'Property not found' });
        }
        
        await property.deleteOne();
        
        res.json({ msg: 'Property removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

export default router; 