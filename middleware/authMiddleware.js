const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
require('dotenv').config();

exports.protect = async (req, res, next) => {
  let token = req.cookies.accessToken;
    if (!token) return res.status(401).json({ msg: 'No token, authorization denied' });
  
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      // Find the user by ID from the token
    req.user = await User.findById(decoded.id);
    
    if (!req.user) {
      return res.status(401).json({ error: 'User not found, authorization denied' });
    }

      next();
    } catch (error) {
      res.status(401).json({ error: 'Not authorized, token failed' });
    }
  
 
};