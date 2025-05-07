import mongoose from 'mongoose';

const inquirySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true
    },
    phone: {
        type: String,
        trim: true
    },
    message: {
        type: String,
        required: true
    },
    property: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Property',
        required: true
    },
    isRead: {
        type: Boolean,
        default: false
    },
    status: {
        type: String,
        enum: ['new', 'contacted', 'resolved'],
        default: 'new'
    }
}, {
    timestamps: true
});

const Inquiry = mongoose.model('Inquiry', inquirySchema);

export default Inquiry; 