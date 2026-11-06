import User from '../models/User.js';
import jwt from 'jsonwebtoken';

function generateToken(id) {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'devradar_default_secret', {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
}

// @desc    Register a new user
// @route   POST /api/auth/register (or /api/auth/signup)
// @access  Public
export async function register(req, res) {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and password.'
      });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists.'
      });
    }

    // Generate custom inbound address for email tracking
    const cleanPrefix = email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '');
    const inboundEmail = `sync-${cleanPrefix}_${Date.now().toString().slice(-4)}@inbound.devradar.app`;
    const avatar = name.substring(0, 2).toUpperCase();

    // Create user (password is automatically hashed by pre-save hook)
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      avatar,
      inboundEmail
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        inboundEmail: user.inboundEmail,
        isEmailLinked: true
      }
    });
  } catch (err) {
    console.error('Registration Error:', err);
    res.status(500).json({
      success: false,
      message: err.message || 'Server error during registration.'
    });
  }
}

// @desc    Login user with email and password
// @route   POST /api/auth/login
// @access  Public
export async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password.'
      });
    }

    // Check for user (explicitly select password)
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    // Verify password with bcrypt
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        inboundEmail: user.inboundEmail || `sync-${user.email.split('@')[0]}@inbound.devradar.app`,
        isEmailLinked: true
      }
    });
  } catch (err) {
    console.error('Login Error:', err);
    res.status(500).json({
      success: false,
      message: err.message || 'Server error during login.'
    });
  }
}

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
export async function getMe(req, res) {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        inboundEmail: user.inboundEmail || `sync-${user.email.split('@')[0]}@inbound.devradar.app`,
        isEmailLinked: true
      }
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user profile.'
    });
  }
}
