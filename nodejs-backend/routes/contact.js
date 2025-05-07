import express from 'express';
import { check, validationResult } from 'express-validator';
import User from '../models/User.js';
import Property from '../models/Property.js';
import Inquiry from '../models/Inquiry.js';
import { adminAuth } from '../middleware/auth.js';

const router = express.Router();

// @route   POST api/contact/inquiry
// @desc    Send a property inquiry
// @access  Public
router.post('/inquiry', [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('message', 'Message is required').not().isEmpty(),
    check('propertyId', 'Property ID is required').not().isEmpty(),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, phone, message, propertyId } = req.body;

    try {
        // Validate property exists
        const property = await Property.findById(propertyId);
        if (!property) {
            return res.status(404).json({ msg: 'Property not found' });
        }

        // Create new inquiry
        const newInquiry = new Inquiry({
            name,
            email,
            phone: phone || '',
            message,
            property: propertyId
        });

        await newInquiry.save();

        // Get property owner
        const owner = await User.findById(property.owner);
        if (!owner) {
            return res.status(404).json({ msg: 'Property owner not found' });
        }

        // In a real application, you would:
        // 1. Send an email notification to the property owner
        // 2. Perhaps create a notification in the owner's dashboard

        res.json({ 
            msg: 'Inquiry sent successfully',
            inquiry: {
                id: newInquiry._id,
                name,
                email,
                phone: phone || 'Not provided',
                message,
                property: {
                    id: property._id,
                    title: property.title
                }
            }
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/contact/inquiries
// @desc    Get all inquiries
// @access  Admin only
router.get('/inquiries', adminAuth, async (req, res) => {
    try {
        const inquiries = await Inquiry.find()
            .sort({ createdAt: -1 })
            .populate('property', 'title location price');
        
        res.json(inquiries);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/contact/user-inquiries
// @desc    Get user inquiries by email
// @access  Public
router.get('/user-inquiries', [
    check('email', 'Please include a valid email').isEmail()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { email } = req.query;
        
        const inquiries = await Inquiry.find({ email })
            .sort({ createdAt: -1 })
            .populate('property', 'title location price images');
        
        res.json(inquiries);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/contact/inquiries/:id
// @desc    Get inquiry by ID
// @access  Admin only
router.get('/inquiries/:id', adminAuth, async (req, res) => {
    try {
        const inquiry = await Inquiry.findById(req.params.id)
            .populate('property');
        
        if (!inquiry) {
            return res.status(404).json({ msg: 'Inquiry not found' });
        }
        
        res.json(inquiry);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT api/contact/inquiries/:id
// @desc    Update inquiry status
// @access  Admin only
router.put('/inquiries/:id', adminAuth, async (req, res) => {
    try {
        const { isRead, status } = req.body;
        
        // Find inquiry
        const inquiry = await Inquiry.findById(req.params.id);
        
        if (!inquiry) {
            return res.status(404).json({ msg: 'Inquiry not found' });
        }
        
        // Update fields
        if (isRead !== undefined) inquiry.isRead = isRead;
        if (status) inquiry.status = status;
        
        await inquiry.save();
        
        res.json(inquiry);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

export default router; 