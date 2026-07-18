import mongoose from 'mongoose';
import { mockInvoices } from './mockStore.js';

const invoiceSchema = new mongoose.Schema({
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true,
  },
  invoiceNumber: {
    type: String,
    required: true,
    unique: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  currency: {
    type: String,
    default: 'USD',
  },
  status: {
    type: String,
    enum: ['paid', 'open', 'void', 'uncollectible'],
    default: 'paid',
  },
  billingReason: {
    type: String,
    default: 'Subscription creation',
  },
  date: {
    type: Date,
    default: Date.now,
  },
  pdfUrl: {
    type: String,
  },
}, {
  timestamps: true,
});

const MongooseInvoice = mongoose.model('Invoice', invoiceSchema);

class InvoiceInstance {
  constructor(data) {
    this._id = data._id || 'mock_inv_' + Math.random().toString(36).substring(2, 11);
    this.organizationId = data.organizationId;
    this.invoiceNumber = data.invoiceNumber;
    this.amount = data.amount;
    this.currency = data.currency || 'USD';
    this.status = data.status || 'paid';
    this.billingReason = data.billingReason || 'Subscription charge';
    this.date = data.date || new Date();
    this.pdfUrl = data.pdfUrl || '';
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  async save() {
    this.updatedAt = new Date();
    const index = mockInvoices.findIndex(i => i._id.toString() === this._id.toString());
    if (index >= 0) {
      mockInvoices[index] = this;
    } else {
      mockInvoices.push(this);
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

const InvoiceWrapper = {
  create: function (data) {
    if (global.useMockDb) {
      return new InvoiceInstance(data);
    }
    return new MongooseInvoice(data);
  },
  find: function (query) {
    if (global.useMockDb) {
      let filtered = mockInvoices.filter(i => i.organizationId.toString() === query.organizationId.toString());
      // For sorting by date descending
      filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
      return mockQuery(filtered);
    }
    return MongooseInvoice.find(query);
  },
  findOne: function (query) {
    if (global.useMockDb) {
      const inv = mockInvoices.find(i => i._id.toString() === query._id.toString() && i.organizationId.toString() === query.organizationId.toString());
      if (inv && !inv.save) {
        inv.save = async function() {
          inv.updatedAt = new Date();
          const idx = mockInvoices.findIndex(i => i._id === inv._id);
          if (idx >= 0) mockInvoices[idx] = inv;
          return inv;
        };
      }
      return mockQuery(inv);
    }
    return MongooseInvoice.findOne(query);
  }
};

function Invoice(data) {
  return InvoiceWrapper.create(data);
}

Object.assign(Invoice, InvoiceWrapper);

export default Invoice;
export { MongooseInvoice };
