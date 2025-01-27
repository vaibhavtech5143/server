import jwt from 'jsonwebtoken';
import Vendors from '../models/Vendors.js';

// Sign token with all vendor data except password
const signToken = (vendor) => {
  const { _id, name, email, businessName, contactNumber, address } = vendor.toObject();
  return jwt.sign(
    { id: _id, name, email, businessName, contactNumber, address, role: 'vendor' },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
};

export const registerVendor = async (req, res) => {
  try {
    const newVendor = await Vendors.create(req.body);
    const token = signToken(newVendor);
    res.status(201).json({ status: 'success', token, data: { vendor: newVendor } });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err.message });
  }
};

export const loginVendor = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ status: 'fail', message: 'Please provide email and password' });
    }
    const vendor = await Vendors.findOne({ email }).select('+password');
    if (!vendor || !(await vendor.comparePassword(password))) {
      return res.status(401).json({ status: 'fail', message: 'Incorrect email or password' });
    }
    const token = signToken(vendor);
    res.status(200).json({ status: 'success', token });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err.message });
  }
};
