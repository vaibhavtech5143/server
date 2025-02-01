import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import Supervisors from '../models/Supervisors.js';

// Helper function to sign JWT
const signToken = (supervisor) => {
  const { _id, name, email} = supervisor;
  return jwt.sign(
    {
      id: _id,
      name,
      email,
      role: supervisor.role, // Dynamic role assignment
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN
    }
  );
};

// Register Supervisor
export const registerSupervisor = async (req, res) => {
  try {
    // Check for duplicate email
    const existingSupervisor = await Supervisors.findOne({ email: req.body.email });
    if (existingSupervisor) {
      return res.status(400).json({ status: 'fail', message: 'Email already in use' });
    }

    // Hash password and create supervisor
    const hashedPassword = await bcrypt.hash(req.body.password, 12);
    const newSupervisor = await Supervisors.create({ ...req.body, password: hashedPassword });

    // Sign token and exclude password in response
    const token = signToken(newSupervisor);
    res.status(201).json({
      status: 'success',
      token,
      data: { supervisor: { ...newSupervisor.toObject(), password: undefined } }
    });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err.message });
  }
};

// Login Supervisor
export const loginSupervisor = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ status: 'fail', message: 'Please provide email and password' });
    }

    // Find supervisor by email and include password for comparison
    const supervisor = await Supervisors.findOne({ email }).select('+password');
    if (!supervisor || !(await bcrypt.compare(password, supervisor.password))) {
      return res.status(401).json({ status: 'fail', message: 'Incorrect email or password' });
    }

    // Sign token and send response
    const token = signToken(supervisor);
    res.status(200).json({ status: 'success', token });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err.message });
  }
};
