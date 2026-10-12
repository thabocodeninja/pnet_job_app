const User = require('../models/User');
const Job = require('../models/Job');
const JobApplication = require('../models/JobApplication');
const AdminActivity = require('../models/AdminActivity');
const { isJobExpired } = require('../utils/helpers');



// get dashboard statistics
exports.getStats = async (req, res, next) => {
    try {
        const totalUsers = await User.countDocuments({ role: 'user' });
        const totalJobs = await Job.countDocuments();
        const activeJobs = await Job.countDocuments({ isActive: true , isExpired: false });
        const totalApplications = await JobApplication.countDocuments();
        const expiredJobs = await Job.countDocuments({ isExpired: true });


        res.status(200).json({
            success: true,
            data: {
                totalUsers,
                totalJobs,
                activeJobs,
                totalApplications,
                expiredJobs,
            }
        })
    } catch (error) {
        next(error);
    }
}

// Get all users
exports.getAllUsers = async (req, res, next) => {
    try{
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;


        const total = await User.countDocuments();
        const users = await User.find()
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: users,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        })
    } catch (error) {
        next(error);
    }
}


//Manage user (activate/deactivate)

exports.manageUser = async (req, res, next) =>  {
    try {
        const { isActive } = req.body;

        const user = await User.findByIdAndUpdate(
            req.params.userId,
            { isActive },
            { new: true }   
        );

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }

        //log admin activity
        await AdminActivity.create({
            admin: req.user._id,
            action: 'MANAGE_USER',
            tagertId: user._id,
            description: `User ${isActive ? 'activated' : 'deactivated'}`,
        });

        res.sattus(200).json({
            success: true,
            message: 'User updated successfully',
            data: user,
        });
    } catch (error) {
        next(error);
    }
}
