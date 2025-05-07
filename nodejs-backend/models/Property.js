import mongoose from 'mongoose';

const propertySchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true,
        enum: ['House', 'Apartment', 'Condo']
    },
    bedrooms: {
        type: Number,
        required: true,
        min: 1
    },
    bathrooms: {
        type: Number,
        required: true,
        min: 1
    },
    area: {
        type: Number,
        required: true,
        min: 0
    },
    images: [{
        type: String,
        required: true
    }],
    features: [{
        type: String
    }],
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['available', 'sold', 'pending'],
        default: 'available'
    }
}, {
    timestamps: true
});

// Add text index for search functionality
propertySchema.index({ title: 'text', description: 'text', location: 'text' });

const Property = mongoose.model('Property', propertySchema);

export default Property; 