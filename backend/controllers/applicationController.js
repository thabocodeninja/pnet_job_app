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

exportsgetMyApplications = async (req, res, next) => {
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
                    toal,
                    pages: Math.ceil(total / limit),
                },
            }); 
    } catch (error) {
        next(error);
    }
}