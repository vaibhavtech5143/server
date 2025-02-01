import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const signToken = (user) => {
  const { _id, name, email, role, address, mobile} = user;
  return jwt.sign(
    {
      id: _id,
      name,
      email,
      role,
      address,
      mobile
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN
    }
  );
};

export const registerUser = async (req, res) => {
  try {
    const newUser = await User.create(req.body);
    const token = signToken(newUser.toObject()); // Include user data without password
    res.status(201).json({ status: 'success', token, data: { user: newUser } });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err.message });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ status: 'fail', message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ status: 'fail', message: 'Incorrect email or password' });
    }

    const token = signToken(user.toObject()); // Include user data without password
    res.status(200).json({ status: 'success', token });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err.message });
  }
};
