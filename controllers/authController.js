const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { sendActivationEmail } = require('../validations/activateAccount');
const { generateUniqueChars } = require('../validations/utils');
const { validateRegister } = require('../validations/registerValidation');
const User = require('../models/userModel');
const dotenv = require('dotenv');
const { default: mongoose } = require('mongoose');
dotenv.config();mongoose

exports.register = async (req, res) => {
  
    const error = await validateRegister(req.body);

    if(error){
  
    return  res.status(400).json({message: error});
    }
    
    const { name, email, password } = req.body;

    const emailExists = await User.findOne({ email });
    if (emailExists) {
      return res.status(400).json({ message: "Email Already Exist" });
    }

   const activationToken = generateUniqueChars(32);
   const activationTokenExpires = Date.now() + 20 * 60 *1000;


    //return console.log(hashedPassword);

    const user = new User({
        name, 
        email,
        password,
      
      });

      user.activationToken = activationToken;
      user.activationTokenExpires = activationTokenExpires;

      await user.save();

       const activationUrl = `${req.protocol}://${req.get('host')}/api/activate/${activationToken}`;
      
       const message = `
        <body style="background-color: light;" class="">
        <h4> Hello ${name}! </h4>

        Please Click the link below to activate your account

        <a href="${activationUrl}" class="btn btn-dark btn-sm">Activate Account </a>
        
        
        <i> Do not reply email.</i>
        </body>
   `;

      try{
          await sendActivationEmail(email,message)
      }catch(error){
        console.error(error);
      }
      res.status(201).json({ message: 'User Registered', user });
    
   
}

 exports.activate = async(req, res) =>{
  const activationToken = req.params.activationToken;

  const user = await User.find().sort({activationToken: -1});

  if(!user){
    return res.status(404).json({msg:'Invalid Token'});
  }

  if(Date.now() > user.activationTokenExpires){
    return res.status(400).json({msg:"token has expired"})
  }
  
  user.isActivate =true;
  user.activationToken = undefined;
  user.activationTokenExpires = undefined;

  await user.save();

  res.status(200).json({message:"Account Activated Succesfully"});

}

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    // Find user by email
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(400).json({ error: 'Invalid email' });
    }

    // Check if password matches
    if (!(await user.matchPassword(password))) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    user.loggedIn = true;
    user.lastSeen = new Date();
    await user.save();
    // Generate a JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

    // Set the accessToken as a cookie (httpOnly, secure if in production)
    res.cookie('accessToken', token, {
      httpOnly: true, // prevents client-side JavaScript from accessing the cookie
      secure: process.env.NODE_ENV === 'production', // secure flag for HTTPS in production
      sameSite: 'strict', // prevents CSRF attacks
      maxAge: 24 * 60 * 60 * 1000, // 1 day in milliseconds
      path: '/' // cookie available site-wide
    });

    // Optionally, return user info (without sending the token in the response)
    res.json({
      message: 'Login successful',
      user: {
        userId: user._id,
        name: user.name,
        email: user.email,
      }
    });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.logout = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update user's logged-in status to false
    user.loggedIn = false;
    user.lastSeen = new Date();
    await user.save();

    res.json({ message: 'User logged out successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
      // Fetch all users and select only the name and lastSeen fields
      const users = await User.find().select('name lastSeen');

      if (!users || users.length === 0) {
          return res.status(404).json({ message: 'No users found' });
      }

      // Send all users as the response
      res.json(users);
  } catch (err) {
      res.status(500).json({ message: 'Server error', error: err.message });
  }
};


exports.getUserDetails = async (req, res) => {
  try {
      const user = await User.findById(req.params.userId).select('name lastSeen');

      if (!user) {
          return res.status(404).json({ message: 'User not found' });
      }

      // Send user details as response
      res.json({
          name: user.name,
          lastSeen: user.lastSeen
      });
  } catch (err) {
      res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select('loggedIn lastSeen');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Respond with the user's online status and last seen time
    res.json({
      username: user.name,
      loggedIn: user.loggedIn,
      lastSeen: user.lastSeen
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};


