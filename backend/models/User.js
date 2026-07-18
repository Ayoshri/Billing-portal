import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { mockUsers } from './mockStore.js';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['Owner', 'Billing Admin', 'Member'],
    default: 'Member',
  },
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true,
  },
}, {
  timestamps: true,
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const MongooseUser = mongoose.model('User', userSchema);

class UserInstance {
  constructor(data) {
    this._id = data._id || 'mock_user_' + Math.random().toString(36).substring(2, 11);
    this.name = data.name;
    this.email = data.email.toLowerCase();
    this.password = data.password;
    this.role = data.role || 'Member';
    this.organizationId = data.organizationId;
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  async save() {
    this.updatedAt = new Date();
    
    // Hash password if not hashed (for mock we can do a simple check or always hash if length < 50)
    if (this.password && this.password.length < 50) {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
    }

    const index = mockUsers.findIndex(u => u._id.toString() === this._id.toString());
    if (index >= 0) {
      mockUsers[index] = this;
    } else {
      mockUsers.push(this);
    }
    return this;
  }

  async comparePassword(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
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

const UserWrapper = {
  create: function (data) {
    if (global.useMockDb) {
      return new UserInstance(data);
    }
    return new MongooseUser(data);
  },
  findOne: function (query) {
    if (global.useMockDb) {
      const user = mockUsers.find(u => u.email === query.email?.toLowerCase());
      if (user && !user.comparePassword) {
        user.comparePassword = async function(pass) {
          return bcrypt.compare(pass, user.password);
        };
        user.save = async function() {
          user.updatedAt = new Date();
          const idx = mockUsers.findIndex(u => u._id === user._id);
          if (idx >= 0) mockUsers[idx] = user;
          return user;
        };
      }
      return mockQuery(user);
    }
    return MongooseUser.findOne(query);
  },
  findById: function (id) {
    if (global.useMockDb) {
      const user = mockUsers.find(u => u._id.toString() === id.toString());
      if (user && !user.comparePassword) {
        user.comparePassword = async function(pass) {
          return bcrypt.compare(pass, user.password);
        };
        user.save = async function() {
          user.updatedAt = new Date();
          const idx = mockUsers.findIndex(u => u._id === user._id);
          if (idx >= 0) mockUsers[idx] = user;
          return user;
        };
      }
      return mockQuery(user);
    }
    return MongooseUser.findById(id);
  },
  find: function (query) {
    if (global.useMockDb) {
      const filtered = mockUsers.filter(u => u.organizationId.toString() === query.organizationId.toString());
      return mockQuery(filtered);
    }
    return MongooseUser.find(query);
  },
  deleteOne: async function (query) {
    if (global.useMockDb) {
      const index = mockUsers.findIndex(u => u._id.toString() === query._id.toString());
      if (index >= 0) {
        mockUsers.splice(index, 1);
      }
      return { deletedCount: 1 };
    }
    return MongooseUser.deleteOne(query);
  },
  deleteMany: async function (query) {
    if (global.useMockDb) {
      let count = 0;
      for (let i = mockUsers.length - 1; i >= 0; i--) {
        if (mockUsers[i].organizationId.toString() === query.organizationId.toString()) {
          mockUsers.splice(i, 1);
          count++;
        }
      }
      return { deletedCount: count };
    }
    return MongooseUser.deleteMany(query);
  }
};

function User(data) {
  return UserWrapper.create(data);
}

Object.assign(User, UserWrapper);

export default User;
export { MongooseUser };
