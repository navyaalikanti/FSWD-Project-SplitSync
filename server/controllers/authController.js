const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { seedDemoDataForUser } = require('../utils/seedDemoData');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'supersecretjwtkey123', {
    expiresIn: '30d',
  });
};

const register = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    const userExists = await User.findOne({ email: email.toLowerCase() });

    if (userExists) {
      return res.status(400).json({ message: 'A user with this email already exists' });
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      avatar: `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(name)}`,
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user registration data' });
    }
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration', error: error.message });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar || `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(user.name)}`,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login', error: error.message });
  }
};

const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (user) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar || `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(user.name)}`,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Demo user login for presentation & reviewer evaluations
const demoLogin = async (req, res) => {
  try {
    const demoEmail = 'priya.sharma@splitsync.demo';
    let demoUser = await User.findOne({ email: demoEmail });

    if (!demoUser) {
      demoUser = await User.create({
        name: 'Priya Sharma',
        email: demoEmail,
        password: 'demopassword123',
        avatar: 'https://api.dicebear.com/7.x/notionists/svg?seed=Priya',
      });
    }

    // Seed realistic sample data if not already seeded
    await seedDemoDataForUser(demoUser);

    res.json({
      _id: demoUser._id,
      name: demoUser.name,
      email: demoUser.email,
      avatar: demoUser.avatar,
      token: generateToken(demoUser._id),
      isDemo: true,
    });
  } catch (error) {
    console.error('Demo login error:', error);
    res.status(500).json({ message: 'Error initiating demo account', error: error.message });
  }
};

module.exports = {
  register,
  login,
  getMe,
  demoLogin,
};
