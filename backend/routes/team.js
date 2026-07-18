import express from 'express';
import User from '../models/User.js';
import Organization from '../models/Organization.js';
import { authenticate, requireRoles } from '../middleware/auth.js';

const router = express.Router();

// @route   GET api/team
// @desc    Get all members of the user's organization
router.get('/', authenticate, async (req, res) => {
  try {
    const members = await User.find({ organizationId: req.user.organizationId }).select('-password');
    res.json(members);
  } catch (error) {
    console.error('Fetch team error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST api/team/invite
// @desc    Invite/Add a new member to the organization (checks seat limit)
router.post('/invite', authenticate, requireRoles(['Owner']), async (req, res) => {
  const { name, email, role } = req.body;

  try {
    if (!name || !email || !role) {
      return res.status(400).json({ message: 'Please enter all fields' });
    }

    // Check if user already exists in the system
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User with this email is already registered' });
    }

    const organization = await Organization.findById(req.user.organizationId);
    if (!organization) {
      return res.status(404).json({ message: 'Organization not found' });
    }

    // Validate seat limit
    if (organization.seatsUsed >= organization.seatLimit) {
      return res.status(400).json({ 
        message: `Seat limit reached (${organization.seatsUsed}/${organization.seatLimit}). Please upgrade your subscription plan to add more members.` 
      });
    }

    // Create new member
    const newMember = new User({
      name,
      email,
      password: 'password123', // default password for testing
      role,
      organizationId: organization._id,
    });
    await newMember.save();

    // Increment seatsUsed in Organization
    organization.seatsUsed += 1;
    await organization.save();

    res.status(201).json({
      message: 'Member invited successfully!',
      member: {
        _id: newMember._id,
        name: newMember.name,
        email: newMember.email,
        role: newMember.role,
        organizationId: newMember.organizationId,
      }
    });
  } catch (error) {
    console.error('Invite member error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT api/team/:id/role
// @desc    Change member's role (Owner only)
router.put('/:id/role', authenticate, requireRoles(['Owner']), async (req, res) => {
  const { role } = req.body;
  const memberId = req.params.id;

  try {
    if (!['Owner', 'Billing Admin', 'Member'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    // Find the member
    const member = await User.findOne({ _id: memberId, organizationId: req.user.organizationId });
    if (!member) {
      return res.status(404).json({ message: 'Member not found in your organization' });
    }

    // Prevent changing own role or preventing at least one Owner
    if (member._id.toString() === req.user.id) {
      return res.status(400).json({ message: 'You cannot change your own role' });
    }

    member.role = role;
    await member.save();

    res.json({ message: 'Member role updated successfully', member });
  } catch (error) {
    console.error('Update role error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE api/team/:id
// @desc    Remove a member from the organization (Owner only)
router.delete('/:id', authenticate, requireRoles(['Owner']), async (req, res) => {
  const memberId = req.params.id;

  try {
    const member = await User.findOne({ _id: memberId, organizationId: req.user.organizationId });
    if (!member) {
      return res.status(404).json({ message: 'Member not found in your organization' });
    }

    // Prevent deleting yourself
    if (member._id.toString() === req.user.id) {
      return res.status(400).json({ message: 'You cannot remove yourself from the organization' });
    }

    await User.deleteOne({ _id: memberId });

    // Decrement seatsUsed in Organization
    const organization = await Organization.findById(req.user.organizationId);
    if (organization) {
      organization.seatsUsed = Math.max(1, organization.seatsUsed - 1);
      await organization.save();
    }

    res.json({ message: 'Member removed successfully' });
  } catch (error) {
    console.error('Remove member error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
