const mongoose = require('mongoose');

const componentSchema = new mongoose.Schema({
  // Unique identifier
  componentId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  
  // Component metadata
  name: {
    type: String,
    required: true,
    trim: true
  },
  
  description: {
    type: String,
    required: true
  },
  
  category: {
    type: String,
    required: true,
    enum: ['ui-component', 'pattern', 'library', 'framework', 'tool', 'best-practice']
  },
  
  tags: [{
    type: String,
    trim: true
  }],
  
  // Source information
  source: {
    name: {
      type: String,
      required: true,
      enum: ['github-trending', 'dev-to', 'css-tricks', 'smashing-magazine', 'manual']
    },
    url: {
      type: String,
      required: true
    },
    fetchedAt: {
      type: Date,
      default: Date.now
    }
  },
  
  // Repository/project information
  repository: {
    url: String,
    stars: Number,
    forks: Number,
    lastUpdated: Date
  },
  
  // Verification and approval
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'archived'],
    default: 'pending',
    index: true
  },
  
  isTrusted: {
    type: Boolean,
    default: false
  },
  
  verifiedBy: {
    type: String,
    default: null
  },
  
  verifiedAt: {
    type: Date,
    default: null
  },
  
  // Popularity metrics
  popularity: {
    score: {
      type: Number,
      default: 0
    },
    views: {
      type: Number,
      default: 0
    },
    lastCalculated: {
      type: Date,
      default: Date.now
    }
  },
  
  // Deduplication
  isDuplicate: {
    type: Boolean,
    default: false
  },
  
  duplicateOf: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Component',
    default: null
  },
  
  // Metadata
  createdAt: {
    type: Date,
    default: Date.now
  },
  
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes for efficient querying
componentSchema.index({ status: 1, isTrusted: 1 });
componentSchema.index({ category: 1, status: 1 });
componentSchema.index({ 'popularity.score': -1 });
componentSchema.index({ createdAt: -1 });
componentSchema.index({ name: 'text', description: 'text', tags: 'text' });

// Pre-save middleware to update timestamps
componentSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Component', componentSchema);
