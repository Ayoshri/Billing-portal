import mongoose from 'mongoose';
import { mockOrganizations } from './mockStore.js';

const organizationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  plan: {
    type: String,
    enum: ['Free', 'Starter', 'Pro', 'Enterprise'],
    default: 'Free',
  },
  subscriptionStatus: {
    type: String,
    enum: ['active', 'past_due', 'canceled'],
    default: 'active',
  },
  billingCycleStart: {
    type: Date,
    default: Date.now,
  },
  billingCycleEnd: {
    type: Date,
    default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  },
  stripeCustomerId: {
    type: String,
    default: () => 'cus_mock_' + Math.random().toString(36).substring(2, 11),
  },
  stripeSubscriptionId: {
    type: String,
    default: () => 'sub_mock_' + Math.random().toString(36).substring(2, 11),
  },
  seatLimit: {
    type: Number,
    default: 5,
  },
  storageLimit: {
    type: Number,
    default: 2,
  },
  apiCallsLimit: {
    type: Number,
    default: 1000,
  },
  seatsUsed: {
    type: Number,
    default: 1,
  },
  storageUsed: {
    type: Number,
    default: 0.15,
  },
  apiCallsUsed: {
    type: Number,
    default: 85,
  },
}, {
  timestamps: true,
});

const MongooseOrganization = mongoose.model('Organization', organizationSchema);

class OrganizationInstance {
  constructor(data) {
    this._id = data._id || 'mock_org_' + Math.random().toString(36).substring(2, 11);
    this.name = data.name;
    this.plan = data.plan || 'Free';
    this.subscriptionStatus = data.subscriptionStatus || 'active';
    this.billingCycleStart = data.billingCycleStart || new Date();
    this.billingCycleEnd = data.billingCycleEnd || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    this.stripeCustomerId = data.stripeCustomerId || 'cus_mock_' + Math.random().toString(36).substring(2, 11);
    this.stripeSubscriptionId = data.stripeSubscriptionId || 'sub_mock_' + Math.random().toString(36).substring(2, 11);
    this.seatLimit = data.seatLimit || 5;
    this.storageLimit = data.storageLimit || 2;
    this.apiCallsLimit = data.apiCallsLimit || 1000;
    this.seatsUsed = data.seatsUsed || 1;
    this.storageUsed = data.storageUsed || 0.15;
    this.apiCallsUsed = data.apiCallsUsed || 85;
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  async save() {
    this.updatedAt = new Date();
    const index = mockOrganizations.findIndex(o => o._id.toString() === this._id.toString());
    if (index >= 0) {
      mockOrganizations[index] = this;
    } else {
      mockOrganizations.push(this);
    }
    return this;
  }
}

const mockQuery = (data) => {
  const query = {
    then: function(resolve, reject) {
      return Promise.resolve(data).then(resolve, reject);
    },
    select: function() { return query; },
    sort: function() { return query; },
    populate: function() { return query; },
    exec: async function() { return data; }
  };
  return query;
};

const OrganizationWrapper = {
  create: function (data) {
    if (global.useMockDb) {
      return new OrganizationInstance(data);
    }
    return new MongooseOrganization(data);
  },
  findById: function (id) {
    if (global.useMockDb) {
      const org = mockOrganizations.find(o => o._id.toString() === id.toString());
      if (org && !org.save) {
        org.save = async function() {
          org.updatedAt = new Date();
          const idx = mockOrganizations.findIndex(o => o._id === org._id);
          if (idx >= 0) mockOrganizations[idx] = org;
          return org;
        };
      }
      return mockQuery(org);
    }
    return MongooseOrganization.findById(id);
  },
  findOne: function (query) {
    if (global.useMockDb) {
      const org = mockOrganizations.find(o => o.name === query.name);
      if (org && !org.save) {
        org.save = async function() {
          org.updatedAt = new Date();
          const idx = mockOrganizations.findIndex(o => o._id === org._id);
          if (idx >= 0) mockOrganizations[idx] = org;
          return org;
        };
      }
      return mockQuery(org);
    }
    return MongooseOrganization.findOne(query);
  },
  deleteOne: async function (query) {
    if (global.useMockDb) {
      const index = mockOrganizations.findIndex(o => o._id.toString() === query._id.toString());
      if (index >= 0) {
        mockOrganizations.splice(index, 1);
      }
      return { deletedCount: 1 };
    }
    return MongooseOrganization.deleteOne(query);
  }
};

function Organization(data) {
  return OrganizationWrapper.create(data);
}

Object.assign(Organization, OrganizationWrapper);

export default Organization;
export { MongooseOrganization };
