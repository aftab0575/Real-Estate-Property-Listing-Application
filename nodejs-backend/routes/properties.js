import express from 'express';
import Property from '../models/Property.js';
import auth from '../middleware/auth.js';
import { check, validationResult } from 'express-validator';

const router = express.Router();

// @route   GET api/properties
// @desc    Get all properties
// @access  Public
router.get('/', async (req, res) => {
    try {
        const {
            search,
            type,
            minPrice,
            maxPrice,
            minBedrooms,
            minBathrooms,
            sortBy = 'createdAt',
            sortOrder = 'desc'
        } = req.query;

        // Build filter object
        const filter = {};

        // Search in title, description, and location
        if (search) {
            filter.$text = { $search: search };
        }

        // Filter by property type
        if (type) {
            filter.type = type;
        }

        // Filter by price range
        if (minPrice || maxPrice) {
            filter.price = {};
            if (minPrice) filter.price.$gte = Number(minPrice);
            if (maxPrice) filter.price.$lte = Number(maxPrice);
        }

        // Filter by bedrooms
        if (minBedrooms) {
            filter.bedrooms = { $gte: Number(minBedrooms) };
        }

        // Filter by bathrooms
        if (minBathrooms) {
            filter.bathrooms = { $gte: Number(minBathrooms) };
        }

        // Build sort object
        const sort = {};
        sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

        const properties = await Property.find(filter)
            .sort(sort)
            .populate('owner', 'name email')
            .select('-__v');

        res.json(properties);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST api/properties
// @desc    Create a property
// @access  Private
router.post('/', [
    auth,
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
            owner: req.user.id
        });

        const property = await newProperty.save();
        res.json(property);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/properties/:id
// @desc    Get property by ID
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const property = await Property.findById(req.params.id)
            .populate('owner', 'name email')
            .select('-__v');

        if (!property) {
            return res.status(404).json({ msg: 'Property not found' });
        }

        res.json(property);
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Property not found' });
        }
        res.status(500).send('Server Error');
    }
});

// @route   PUT api/properties/:id
// @desc    Update property
// @access  Private
router.put('/:id', auth, async (req, res) => {
    try {
        const property = await Property.findById(req.params.id);

        if (!property) {
            return res.status(404).json({ msg: 'Property not found' });
        }

        // Check if user owns the property
        if (property.owner.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'Not authorized' });
        }

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

// @route   DELETE api/properties/:id
// @desc    Delete property
// @access  Private
router.delete('/:id', auth, async (req, res) => {
    try {
        const property = await Property.findById(req.params.id);

        if (!property) {
            return res.status(404).json({ msg: 'Property not found' });
        }

        // Check if user owns the property
        if (property.owner.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'Not authorized' });
        }

        await property.deleteOne();
        res.json({ msg: 'Property removed' });
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Property not found' });
        }
        res.status(500).send('Server Error');
    }
});

export default router; 