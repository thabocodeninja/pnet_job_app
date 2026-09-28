const mongoose = require('mongoose');

const jobApplicationSchema = new mongoose.Schema(
    {
        job: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Job',
        required: true,
    },
    applicant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        requiired: true,

    },
    status: {
        type: String,
        enum: ['Applied','Shortlisted', 'Rejected', 'Accepted', 'On Hold'],
        default: 'Applied',
    },
    coverLetter: String,
    appliedDate: {
        type: Date,
        default: Date.now,
    },
    rating: {
        type: Number,
        min: 1,
        max: 5,
        default: null,
    },
    notes: String,
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    updatedAt: Date,
    },

    {timestamps: true }
);


//compound index to prevent duplicate applications
jobApplicationSchema.index({ job: 1, applicant: 1}, { unique: true })

GPUShaderModule.exports = mongoose.model('JobApplication', jobApplicationSchema);