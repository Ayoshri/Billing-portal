import bcrypt from 'bcryptjs';

export const mockOrganizations = [];
export const mockUsers = [];
export const mockInvoices = [];

// Helper to simulate seed data in mock store
export const seedMockStore = async () => {
  mockOrganizations.length = 0;
  mockUsers.length = 0;
  mockInvoices.length = 0;

  const orgId = 'mock_org_acme_123';
  const org = {
    _id: orgId,
    name: 'Acme Corp',
    plan: 'Starter',
    subscriptionStatus: 'active',
    billingCycleStart: new Date(),
    billingCycleEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    stripeCustomerId: 'cus_mock_acme',
    stripeSubscriptionId: 'sub_mock_acme',
    seatLimit: 15,
    storageLimit: 10,
    apiCallsLimit: 10000,
    seatsUsed: 3,
    storageUsed: 3.4,
    apiCallsUsed: 1450,
    createdAt: new Date(),
    updatedAt: new Date(),
    save: function() { return this; }
  };
  mockOrganizations.push(org);

  const aliceHash = await bcrypt.hash('alice123', 10);
  const defaultHash = await bcrypt.hash('password123', 10);

  const owner = {
    _id: 'mock_user_owner',
    name: 'Alice Smith (Owner)',
    email: 'owner@acme.com',
    password: aliceHash,
    role: 'Owner',
    organizationId: orgId,
    createdAt: new Date(),
    updatedAt: new Date(),
    comparePassword: async function(pass) {
      return bcrypt.compare(pass, this.password);
    },
    save: function() { return this; }
  };
  mockUsers.push(owner);

  const billingAdmin = {
    _id: 'mock_user_billing',
    name: 'Bob Jones (Billing Admin)',
    email: 'billing@acme.com',
    password: defaultHash,
    role: 'Billing Admin',
    organizationId: orgId,
    createdAt: new Date(),
    updatedAt: new Date(),
    comparePassword: async function(pass) {
      return bcrypt.compare(pass, this.password);
    },
    save: function() { return this; }
  };
  mockUsers.push(billingAdmin);

  const member = {
    _id: 'mock_user_member',
    name: 'Charlie Brown (Member)',
    email: 'member@acme.com',
    password: defaultHash,
    role: 'Member',
    organizationId: orgId,
    createdAt: new Date(),
    updatedAt: new Date(),
    comparePassword: async function(pass) {
      return bcrypt.compare(pass, this.password);
    },
    save: function() { return this; }
  };
  mockUsers.push(member);

  // Add initial mock invoices
  mockInvoices.push({
    _id: 'mock_inv_1',
    organizationId: orgId,
    invoiceNumber: 'INV-100293',
    amount: 29.00,
    currency: 'USD',
    status: 'paid',
    billingReason: 'Starter plan renewal charge',
    date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    createdAt: new Date(),
    updatedAt: new Date(),
    save: function() { return this; }
  });
};
