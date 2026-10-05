const User = require('../models/User');
const path = require('path');
const fs = require('fs');




//uploud cv 
exports.uploadCV = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded',
            });
        }
        const user = await User.findById(req.user._id);

        //Delete the old CV file if it exists
        if (user.cv && user.cv.filename) {
            const oldFilePath = path.join(__dirname, '../uploads/cvs/', user.cv.filename);
            if (fs.existsSync(oldFilePath)) {
                fs.unlinkSync(oldFilePath);
            }
    }

    //uploud new CV file
    user.cv = {
        filename: req.file.filename,
        url: `/uploads/cvs/${req.file.filename}`,
        uploadedAt: new Date(),
    };
    await user.save();

    res.status(200).json({
        success: true,
        message: 'CV uploaded successfully',
        data: {
            filename: user.cv.filename,
            url: `/uploads/cvs/${user.cv.filename}`,
            uploadedAt: user.cv.uploadedAt,
        },
    });
} catch (error) {
    next(error);
}
}

exports.uploadProfileImage = async (req, res, next) => {
    try {
        if(!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded',
            });
        }
        const user = await User.findById(req.user._id);

        //Delete the old profile image if it exists
        if (user.profileImage && user.profileImage.filename) {
            const oldFilePath = path.join(__dirname, '../uploads/profileImages/', user.profileImage.filename);
            if (fs.existsSync(oldFilePath)) {
                fs.unlinkSync(oldFilePath);
            }
        }

        //uploud new profile image info
        user.profileImage = `/uploads/profiles/${req.file.filename}`;
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Profile image uploaded successfully',
            data: {
                url: `/uploads/profiles/${req.file.filename}`,
            },
        });
    } catch (error) {
        next(error);
    }
}

// getuser cv
exports.getUserCV = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id);

        if(!user || !user.cv){
            return res.status(404).json({
                success: false,
                message: 'CV not found',
            });
        }

        const filePath = path.join(__dirname, '../uploads/cvs/', user.cv.filename);
        res.download(filePath);
    } catch (error) {
        next(error);
    }
}