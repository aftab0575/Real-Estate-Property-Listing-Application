import express from 'express';
import upload from '../utils/fileUpload.js';
import { adminAuth } from '../middleware/auth.js';
import path from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// @route   POST api/upload/property-images
// @desc    Upload property images
// @access  Admin only
router.post('/property-images', adminAuth, upload.array('images', 10), (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ msg: 'No files were uploaded' });
        }

        // Map each file to its URL path
        const fileUrls = req.files.map(file => {
            // Format relative URL for the file
            return `/uploads/properties/${file.filename}`;
        });

        res.json({ 
            success: true, 
            files: fileUrls,
            message: `${req.files.length} ${req.files.length === 1 ? 'image' : 'images'} uploaded successfully`
        });
    } catch (err) {
        console.error('Upload error:', err);
        res.status(500).json({ 
            success: false, 
            msg: err.message || 'Error uploading files' 
        });
    }
});

// Error handling middleware
router.use((err, req, res, next) => {
    if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
            success: false,
            msg: 'File size too large. Maximum size is 5MB'
        });
    }
    
    if (err.message.includes('Only .jpeg, .jpg, .png and .webp')) {
        return res.status(400).json({
            success: false,
            msg: err.message
        });
    }
    
    console.error(err);
    res.status(500).json({
        success: false,
        msg: 'Server error during file upload'
    });
});

export default router; 