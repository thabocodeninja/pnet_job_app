const Job = require('../models/Job');
const User = require('../models/User');
const { getJobExpiryDate, isJobExpired } = require('../utils/helpers');


exports.getAllJobs = async (req, res, next) => {

    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const { search, category, jobType, location } = req.query;


        let query = { isActive: true, isExpired: false };

        if (search) {
            query.$text = { $search: search };
        }

        if (category) query.category = category;
        if (jobType) query.jobType = jobType;
        if (location) query.location = new ReqExp(location, 'i');

      const total = await Job.countDocuments(query);
      const jobs = await Job.find(query)  
      .populate('createdBy', 'firstName lastName')
      .skip(skip)
      .limit(limit)
      .sort({ postedDate: -1 });


       res.status(200).json({
        success: true,
        data: jobs,
        pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
        },
       });
    }
    catch (error){
        next(error);
    }
}

exports.getJobById = async (req, res, next) => {

    try {
    const job = await Job.findById(req.params.id)
    .populate('createdBy', 'firstName lastName')
    .populate('applicants');

    if(!Job) {
        return res.status(404).json({
            success: false,
            message: 'Job not found',
        })
    }
    job.views += 1;
    await job.save();

    res.status(200).json({
        success: true,
        data: job,
    });
    } catch (error) {
        next(error);
    }
}

exports.createJob = async (req, res, next) => {
    try {
        const {
            title,
            description,
            company,
             location,
             salary,
             jobType,
             category,
             expirience,
             skills,
             responsibilities,
             requirements,
             benefits,
        } = req.body;

        const job = await Job.create({
            title,
            description,
            company,
            location,
            salary,
            jobType,
            category,
            expirience,
            skills,
            responsibilities,
            requirements,
            benefits,
            createdBy: req.user._id,
            expiryDate: getJobExpiryDate(),
        });


        res.status(201).json({
            success: true,
            message: 'Job created successfully',
            data: job,
        })
    }
    catch (error){
        next(error);
    }
}





exports.updateJob = async (req, res, next) => {

    try {
        let job = await Job.findById(req.params.id);

        if(!job) {
            return res.status(404).json({
                success: false,
                message: 'Job not found',
            })
        }

        // check if user is admin or job creator
        if(req.user.role !== 'admin' && job.createdBy.toString() !== req.user._id.toString()){
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this job',
            })
        }

        const updateData = { ...req.body }
    job = await Job.findByIdAndUpdate(req.params, updateData, {
        new: true,
        runValidators: true,
    })

    res.status(200).json({
        success: true,
        message: 'Job updated successfully',
        data: job,
    })
    } catch (error) {
        next(error);
    }
}

exports.deleteJob = async (req, res, next) => {
    try {
        const job = await Job.findById(req.params.id);

        if (!job) {
            return res.status(404).json({
               success: false,
               message: 'Job not found',
            })
        }

        //check if user is admin 
        if (req.user.role !== 'admin'){
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this job',
            })
        }

        await Job.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            message: 'Job deleted successfully',
        })
    } catch (error) {
        next(error);
    }
}

exports.expireJob = async (req, res, next) => {
    try {
        const job = await Job.findByIdAndUpdate(
            req.params.id,
            { isExpired: true, isActive: false },
            { new: true }
        )

        if (!job) {
            return res.status(404).json({
                success: false,
                message: 'Job not found',
            })
        }
        res.status(200).json({
            success: true,
            message: 'Job expired successfully',
            data: job,
        })
    } catch (error) {
        next(error);
    }  
}

exports.getTrendingJobs = async (req, res, next) => {
    try {
        const jobs = await Job.find({ isActive: true, isExpired: false })
        .sort({ views: -1, postedDate: -1 })
        .limit(10);


        res.status(200).json({
            success: true,
            data: jobs,
        })
    } catch (error) {
        next(error);
    }
}


