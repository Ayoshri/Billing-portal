import express from 'express';
import Organization from '../models/Organization.js';
import Invoice from '../models/Invoice.js';
import User from '../models/User.js';
import { authenticate, requireRoles } from '../middleware/auth.js';

const router = express.Router();

const PLAN_CONFIGS = {
  Free: { price: 0, seatLimit: 5, storageLimit: 2, apiCallsLimit: 1000 },
  Starter: { price: 29, seatLimit: 15, storageLimit: 10, apiCallsLimit: 10000 },
  Pro: { price: 99, seatLimit: 50, storageLimit: 50, apiCallsLimit: 100000 },
  Enterprise: { price: 499, seatLimit: 1000, storageLimit: 500, apiCallsLimit: 1000000 },
};

// @route   POST api/billing/subscribe
// @desc    Change subscription plan (upgrades/downgrades)
router.post('/subscribe', authenticate, requireRoles(['Owner', 'Billing Admin']), async (req, res) => {
  const { plan } = req.body;

  if (!PLAN_CONFIGS[plan]) {
    return res.status(400).json({ message: 'Invalid plan selected' });
  }

  try {
    const organization = await Organization.findById(req.user.organizationId);
    if (!organization) {
      return res.status(404).json({ message: 'Organization not found' });
    }

    const currentPlanConfig = PLAN_CONFIGS[organization.plan];
    const targetPlanConfig = PLAN_CONFIGS[plan];

    // Business Rule Check: If downgrading seats, verify current user count doesn't exceed target plan limit
    if (organization.seatsUsed > targetPlanConfig.seatLimit) {
      return res.status(400).json({
        message: `Cannot downgrade to ${plan}. Your organization has ${organization.seatsUsed} users, but the ${plan} plan only allows up to ${targetPlanConfig.seatLimit} users. Remove team members first.`
      });
    }

    // Update plan details
    organization.plan = plan;
    organization.seatLimit = targetPlanConfig.seatLimit;
    organization.storageLimit = targetPlanConfig.storageLimit;
    organization.apiCallsLimit = targetPlanConfig.apiCallsLimit;
    organization.subscriptionStatus = 'active';
    organization.billingCycleStart = new Date();
    organization.billingCycleEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // Reset cycle
    
    await organization.save();

    // Create an Invoice if the plan is paid ($ > 0)
    if (targetPlanConfig.price > 0) {
      const invoiceNum = 'INV-' + Math.floor(100000 + Math.random() * 900000);
      const invoice = new Invoice({
        organizationId: organization._id,
        invoiceNumber: invoiceNum,
        amount: targetPlanConfig.price,
        currency: 'USD',
        status: 'paid',
        billingReason: `Subscription upgrade to ${plan} plan`,
        date: new Date(),
      });
      await invoice.save();
    }

    res.json({
      message: `Successfully subscribed to the ${plan} plan!`,
      organization,
    });
  } catch (error) {
    console.error('Subscription change error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET api/billing/invoices
// @desc    Get billing history / invoices
router.get('/invoices', authenticate, requireRoles(['Owner', 'Billing Admin']), async (req, res) => {
  try {
    const invoices = await Invoice.find({ organizationId: req.user.organizationId }).sort({ date: -1 });
    res.json(invoices);
  } catch (error) {
    console.error('Fetch invoices error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ==========================================
// SIMULATOR ENDPOINTS (For testing and demo)
// ==========================================

// @route   POST api/billing/simulate/status
// @desc    Simulate payment status (active, past_due, canceled)
router.post('/simulate/status', authenticate, requireRoles(['Owner']), async (req, res) => {
  const { status } = req.body;
  if (!['active', 'past_due', 'canceled'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }

  try {
    const organization = await Organization.findById(req.user.organizationId);
    if (!organization) {
      return res.status(404).json({ message: 'Organization not found' });
    }

    organization.subscriptionStatus = status;
    await organization.save();

    // If status changed to past_due, create an unpaid invoice to show in history
    if (status === 'past_due') {
      const planPrice = PLAN_CONFIGS[organization.plan].price;
      if (planPrice > 0) {
        const invoiceNum = 'INV-' + Math.floor(100000 + Math.random() * 900000);
        const invoice = new Invoice({
          organizationId: organization._id,
          invoiceNumber: invoiceNum,
          amount: planPrice,
          currency: 'USD',
          status: 'open', // unpaid
          billingReason: `Automatic monthly renewal for ${organization.plan} (Failed payment)`,
          date: new Date(),
        });
        await invoice.save();
      }
    }

    res.json({
      message: `Subscription status simulated as '${status}' successfully!`,
      organization,
    });
  } catch (error) {
    console.error('Status simulation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST api/billing/simulate/pay-invoice/:invoiceId
// @desc    Simulate paying an open/failed invoice (restores subscription status to active)
router.post('/simulate/pay-invoice/:invoiceId', authenticate, requireRoles(['Owner', 'Billing Admin']), async (req, res) => {
  try {
    const invoice = await Invoice.findOne({ _id: req.params.invoiceId, organizationId: req.user.organizationId });
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    if (invoice.status === 'paid') {
      return res.status(400).json({ message: 'Invoice is already paid' });
    }

    invoice.status = 'paid';
    await invoice.save();

    // Restore organization status to active
    const organization = await Organization.findById(req.user.organizationId);
    if (organization && organization.subscriptionStatus === 'past_due') {
      organization.subscriptionStatus = 'active';
      await organization.save();
    }

    res.json({
      message: 'Invoice paid successfully! Subscription is now active.',
      invoice,
      organization,
    });
  } catch (error) {
    console.error('Pay invoice simulation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST api/billing/simulate/usage
// @desc    Simulate increases in API calls or storage usage
router.post('/simulate/usage', authenticate, requireRoles(['Owner']), async (req, res) => {
  const { storageAdd, apiCallsAdd } = req.body;

  try {
    const organization = await Organization.findById(req.user.organizationId);
    if (!organization) {
      return res.status(404).json({ message: 'Organization not found' });
    }

    if (storageAdd) {
      organization.storageUsed = parseFloat((organization.storageUsed + parseFloat(storageAdd)).toFixed(2));
    }
    if (apiCallsAdd) {
      organization.apiCallsUsed += parseInt(apiCallsAdd, 10);
    }

    await organization.save();

    res.json({
      message: 'Usage metrics updated successfully!',
      organization,
    });
  } catch (error) {
    console.error('Usage simulation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
