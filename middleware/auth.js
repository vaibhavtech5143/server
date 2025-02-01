import jwt from 'jsonwebtoken';
import User from "../models/User.js";
import Supervisor from "../models/Supervisors.js";
import Vendor from "../models/Vendors.js";

export const protect = async (req, res, next) => {
  try {
    let token;
    // Extract token from Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        status: 'fail',
        message: 'You are not logged in. Please provide a valid token.'
      });
    }

    // Verify the token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      console.error("Token verification error:", err.message);
      return res.status(401).json({
        status: 'fail',
        message: 'Invalid token'
      });
    }

 

    // Determine the user model to query based on the role
    let user;
    switch (decoded.role) {
      case 'resident':
        user = await User.findById(decoded.id);
        break;
      case 'supervisor':
        user = await Supervisor.findById(decoded.id);
        break;
      case 'vendor':
        user = await Vendor.findById(decoded.id);
        break;
      default:
        console.error("Invalid role in token:", decoded.role);
        return res.status(401).json({
          status: 'fail',
          message: 'Invalid role in token'
        });
    }

  
    // Check if the user exists
    if (!user) {
      return res.status(401).json({
        status: 'fail',
        message: 'User no longer exists'
      });
    }

    // Attach the user object to the request for further use
    req.user = user;
    next();
  } catch (err) {
    console.error("Error in protect middleware:", err.message);
    res.status(500).json({
      status: 'fail',
      message: 'Internal server error'
    });
  }
};

export const restrictTo = (...roles) => {
  // console.log(...roles);
  
  return (req, res, next) => {
    console.log("Role Received",req.user);

    // console.log(...roles, " was ", req.user.role);
    if (!roles.includes(req.user.role)) {      
      return res.status(403).json({
        status: 'fail',
        message: 'You do not have permission to perform this action'
      });
    }
    next();
  };
};
