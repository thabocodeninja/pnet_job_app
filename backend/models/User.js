const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  firstname: {
    type: String,
    required: [true, 'Please add a first name'],
    trim: true,
  },
  lastname: {
    type: String,
    required: [true, 'Please add a last name'],
    trim: true,
    },
    email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    lowercase: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email',
    ],
  },
  phone: {
    type: String,
    trim: true,
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: 6,
    Select: false,
  },
  profileImage: {
    type: String,
    default: null,
  },
  bio: {
    type: String,
    maxlength: 500,
  },
  skills : [
    {
    type: String
    },
  ],
  expirience: {
    type: Number,
    default: 0,
  },
  education: {
    institution: String,
    degree: String,
    field: String,
    graduationYear: Number,
  },
  cv: {
    filename: String,
    url: String,
    uploadedAt: Date,
  },
  appliedJobs: [
    {
        type : mongoose.Schema.Types.ObjectId,
        ref: 'Job',
    },
  ],
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',    
  },
  isVerified: {
    type: Boolean,
    default: false,
    },
    vericationToken: String,
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    isActive: {
    type: Boolean,
    default: true,  
    },
}, {
  timestamps: true,
}); 


//hash password before saving the user
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  } 
});

//compare password method
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

//method to get user dat without sensitive information
userSchema.methods.toJSON = function () {
  const userObject = this.toObject();
  delete userObject.password;
  delete userObject.vericationToken;
    delete userObject.resetPasswordExpire;
    return userObject;

}


module.exports = mongoose.model('User', userSchema);
