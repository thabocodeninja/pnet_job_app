const User = require('../models/User');
const generateToken= require('../utils/helpers');
const {validationResult} = require('express-validator');



exports.registerUser = async (req, res) => {
try {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({
            success: false,
            errors: errors.array()
        });
    }
 const { firstname, lastname, email, password, phone, role } = req.body;


 //create user
 const user = await User.create({
    firstname,
    lastname,
    email,
    password,
    phone,
    role: role?.toLowerCase() === 'admin' ? 'user' : 'user',
 });

 //Generate token
 const token = generateToken(user._id);

 res.status(201).json({
    success: true,
    message: 'User registered successfully',
    token,
    user: user.toJSON(),
 });
} catch (error) {
    next(error);
}
}

exports.loginUser = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if(!errors.isEmpty()){
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }
        const { email, password } = req.body;

        //check if user exists
        const user = await User.findOne({ email }).select('+password');
        if(!user){
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials',
            });
        }
        //check if password matches
        const isMatch = await user.matchPassword(password);
        if(!isMatch){
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials',
            });
        }
    } catch (error) {
        next(error);
    }
}

exports.getUserProfile = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        res.status(200).json({
            success: true,
            data: user,
        });

    } catch (error) {
        next(error);
    }

}


exports.updateUserProfile = async (req, res, next) => {
    try {
        const  { firstname, lastname ,  phone, bio , location, skills , expirience, education } = req.body;
        const user = await User.findByIdAndUpdate(req.user.id, {
            firstname,
            lastname,
            phone,
            bio,
            location,
            skills,
            expirience,
            education,
        }, 
        { new: true , runValidators: true });
        res.status(200).json({
            success: true,
            message: 'User profile updated successfully',
            data: user,
        });
    } catch (error) {
        next(error);
    }
    
}

exports.logoutUser = async (req, res, next) => {
    try {
        res.status(200).json({
            success: true,
            message: 'User logged out successfully',
        });
    } catch (error) {
        next(error);
    }           
}