const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema(
    {
    title: {
        type: String,
        required: [true, 'Please provide job title'],
        trim,
    },
    description: {
        type: String,
        required: [true, 'Please provide job description'],
    },
    company: {
        type: String,
        required: [true, 'Please provide company name'],
        trim: true,
    },
    location: {
        type: String,
        required: [true, 'Please provide job location'],
    },
    salary: {
        min: {
            type: Number,
            default: 0,
        },
        max: {
            type: Number,
            default: 0,
        },
        currency: {
            type: String,
            default: 'USD',
        },
    },
    jobType: {
        type: String,
        enum: ['Full-time', 'Part-time', 'Contract', 'Temporary', 'Internship', 'Remote'],
        required: true,
    },
    category: {
        type: String,
        required: true,
    },
    expirience: {
        min: {
            type: Number,
            default: 0,
        },
        max: {
            type: Number,
            default: 10,
        },
        level: {
            type: String,
            enum: ['Entry-level','Mid-level','Senior', 'Executive'],
            default: 'Entry-level'
        },
    },
    skills: [
        {
            type: String,
        },
    ],
    responsibilities: [
        {
    type: String,   
    }
],
requirements: [
    {type: String,
    }
],
benefits: [
    {
        type: String,
    }
],
createdBy: {
    type: mongoose.Schema.Types.Object,
    ref: 'User',
    required: true,
},
applications: [
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'JobApplication',
    },
],
views: {
        type: Number,
        default: 0,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    postedDate: {
        type: Date,
        default: Date.now,
    },
    expireDate: {
        type: Date,
        required: true,
    },
    isExpired: {
        type:Boolean,
        default: false,
    },
    applications: {
        type: Number,
        default: 0,
    },
},
{ timestamps: true }
);


// Index for faster queries.
jobSchema.index({ title: 'text', description: 'text', company: 'text' });
jobSchema.index({ isActive: 1, isExpired: 1});
jobSchema.index({ expireDate: 1 });

module.exports = mongoose.model('Job', jobSchema);