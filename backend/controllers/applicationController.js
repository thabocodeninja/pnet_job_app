const JobApplication = require('../models/jobApplication');
const Job = require('../models/job');
const User = require('../models/User');



// apply for a job
exports.applyForJob = async (req, res) => {
    try {
        const { jobId, coverLetter } = req.body;

        // Check if the job exists and is active
        const job = await Job.findById(jobId);
        if(!job) {
            return res.status(404).json({ 
                success: false,
                message: 'Job not found'
            });
    }
    

    //check if job is expired
    if(job.isExpired || !job.isActive) {
        return res.status(400).json({
            success: false,
            message: 'Job is no longer available or has expired'
        });
    }

    //check if already applied for the job
    const existingApplication = await JobApplication.findOne({ 
        job: jobId, applicant: req.user._id 
    });
    if(existingApplication) {
        return res.status(400).json({
            success: false,
            message: 'You have already applied for this job',
        });
    }

    //create a new job application
    const application = new JobApplication({
        job: jobId,
        applicant: req.user._id,
        coverLetter,
    });

//Update job applications count and add application to job's applications array
await Job.findByIdAndUpdate(jobId, {
    $inc: { applications: 1 },
    $push: { applications: application._id }

});

//Add job to users applied Jobs 
await User.findByIdAndUpdate(req.user._id, {
    $push: { appliedJobs: jobId },
});

res.status(201).json({
    success: true,
    message: 'Job application submitted successfully',
    data: application,
});
} catch (error) {
    next(error);
}
};

exports.getMyApplications = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const total = await JobApplication.countDocuments({ applicant: req.user._id });
        const applications = await JobApplication.find({ applicant: req.user._id })
            .populate('job', 'title company location')
            .sort({ appliedDate: -1 })
            .skip(skip)
            .limit(limit);


            res.status(200).json({
                success: true,
                data: applications,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit),
                },
            }); 
    } catch (error) {
        next(error);
    }
}

exports.updateApplicationStatus = async (req, res, next) => {
    try {
        const {status, notes, rating } = req.body;
        const application = await JobApplication.findByIdAndUpdate(
            req.params.id,
            {
                status,
                notes,
                rating,
                updatedBy: req.user._id,
            updatedAt: Date.now(),
        },
        { new: true }
    ).populate('applicant').populate('job');

    if (!application) {
        return res.status(404).json({
            success: false,
            message: 'Application not found',
        });
    }
res.status(200).json({
    success: true,
    message: 'Application status updated successfully',
    data: application,  
});
} catch (error) {
    next(error);
}
}


exports.saveJob = async (req, res, next) => {
    try {
        const { jobId } = req.params;

        const job = await Job.findById(jobId);
        if(!job) {
            return res.status(404).json({
                success: false,
                message: 'Job not found',
            });
        }

        const user = await User.findById(req.user._id);
        const isAlreadySaved = user.savedJobs.includes(jobId);

        if (isAlreadySaved) {
            await User.findByIdAndUpdate(req.user._id, {
                $pull: { savedJobs: jobId },
            });
            return res.status(200).json({
                success: true,
                message: 'Job removed from saved jobs',
            });
        }
        await User.findByIdAndUpdate(req.user._id, {
            $push: { savedJobs: jobId },
     });

    } catch (error) {
        next(error);
    }

}

//get saved jobs
exports.getSavedJobs = async (req, res, next) => {
try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;


    const user = await User.findById(req.user._id).populate({
        path: 'savedJobs',
        options: {
            skip,
            limit,
            sort: { postedDate: -1 },
        },
 } );


 const total = user.savedJobs.length;

 res.status(200).json({
    success: true,
    data: user.savedJobs,
    pagination: {
        page,
        limit,
        total,
        pages: Math.cell(total /limit),
    },
})
    } catch (error){
        next(error);
}
}


