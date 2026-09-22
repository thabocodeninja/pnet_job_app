const mongoose = require('mongoose');

const adminActivitySchema = new mongoose.Schema({

    {
        admin: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        action: {
            type: String,
            enum: ['CREATE_JOB', 'UPDATE_JOB', 'DELETE_JOB', 'EXPIRE_JOB', 'MANAGE_USERS' , 'VIEW_ANALYTICS'],
            required: true,         
    },
    targetId: mongoose.Schema.Types.ObjectId,
    description: String,
    details: mongoose.Schema.Types.Mixed,
},
    { timestamps: true }
);

module.exports = mongoose.model('AdminActivity', adminActivitySchema);