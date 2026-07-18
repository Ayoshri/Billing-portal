import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Organization from '../models/Organization.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Generate JWT token helper
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role, organizationId: user.organizationId },
    process.env.JWT_SECRET || 'saas_billing_portal_super_secret_key_2026',
    { expiresIn: '7d' }
  );
};

// @route   POST api/auth/register
// @desc    Register a new user and create an organization (Owner role)
router.post('/register', async (req, res) => {
  const { name, email, password, organizationName } = req.body;

  try {
    if (!name || !email || !password || !organizationName) {
      return res.status(400).json({ message: 'Please enter all fields' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // 1. Create Organization
    const organization = new Organization({
      name: organizationName,
      plan: 'Free',
      seatLimit: 5,
      storageLimit: 2, // 2 GB
      apiCallsLimit: 1000,
    });
    await organization.save();

    // 2. Create Owner User
    const user = new User({
      name,
      email,
      password,
      role: 'Owner',
      organizationId: organization._id,
    });
    await user.save();

    const token = generateToken(user);

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        organizationId: user.organizationId,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST api/auth/login
// @desc    Authenticate user and get token
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ message: 'Please enter all fields' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user);

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        organizationId: user.organizationId,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET api/auth/me
// @desc    Get current user details & organization
router.get('/me', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const organization = await Organization.findById(req.user.organizationId);

    res.json({
      user,
      organization,
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST api/auth/seed
// @desc    Seed test accounts for Acme Corp (Owner, Billing Admin, Member)
router.post('/seed', async (req, res) => {
  try {
    // Delete existing Acme Corp organization and its users if they exist
    const acmeOrg = await Organization.findOne({ name: 'Acme Corp' });
    if (acmeOrg) {
      await User.deleteMany({ organizationId: acmeOrg._id });
      await Organization.deleteOne({ _id: acmeOrg._id });
    }

    // 1. Create Acme Corp Organization
    const organization = new Organization({
      name: 'Acme Corp',
      plan: 'Starter', // seeded in Starter plan
      seatLimit: 15,
      storageLimit: 10,
      apiCallsLimit: 10000,
      seatsUsed: 3,
      storageUsed: 3.4,
      apiCallsUsed: 1450,
      billingCycleStart: new Date(),
      billingCycleEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });
    await organization.save();

    // 2. Create Users
    const owner = new User({
      name: 'Alice Smith (Owner)',
      email: 'owner@acme.com',
      password: 'alice123',
      role: 'Owner',
      organizationId: organization._id,
    });
    await owner.save();

    const billingAdmin = new User({
      name: 'Bob Jones (Billing Admin)',
      email: 'billing@acme.com',
      password: 'password123',
      role: 'Billing Admin',
      organizationId: organization._id,
    });
    await billingAdmin.save();

    const member = new User({
      name: 'Charlie Brown (Member)',
      email: 'member@acme.com',
      password: 'password123',
      role: 'Member',
      organizationId: organization._id,
    });
    await member.save();

    res.json({
      message: 'Database seeded successfully with Acme Corp testing accounts!',
      credentials: {
        owner: { email: 'owner@acme.com', password: 'alice123', role: 'Owner' },
        billingAdmin: { email: 'billing@acme.com', password: 'password123', role: 'Billing Admin' },
        member: { email: 'member@acme.com', password: 'password123', role: 'Member' },
      }
    });
  } catch (error) {
    console.error('Seeding error:', error);
    res.status(500).json({ message: 'Server seeding failed' });
  }
});

export default router;
