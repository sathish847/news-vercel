const mongoose = require('mongoose');

const miniNewsSchema = new mongoose.Schema({
  page: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  thumb: {
    filename: {
      type: String,
      trim: true
    },
    originalName: {
      type: String,
      trim: true
    },
    mimetype: {
      type: String,
      trim: true
    },
    size: {
      type: Number
    },
    data: {
      type: Buffer
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  },
  tag: {
    type: String,
    required: true,
    trim: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  excerpt: {
    type: String,
    required: true,
    trim: true
  },
  date: {
    type: String,
    required: true,
    trim: true
  },
  time: {
    type: String,
    required: true,
    trim: true
  },
  paragraphs: [{
    type: String,
    trim: true
  }],
  // images: [{
  //   filename: {
  //     type: String,
  //     trim: true
  //   },
  //   originalName: {
  //     type: String,
  //     trim: true
  //   },
  //   mimetype: {
  //     type: String,
  //     trim: true
  //   },
  //   size: {
  //     type: Number
  //   },
  //   data: {
  //     type: Buffer
  //   },
  //   uploadedAt: {
  //     type: Date,
  //     default: Date.now
  //   }
  // }],
  videoUrl: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
miniNewsSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Update the updatedAt field before updating
miniNewsSchema.pre('findOneAndUpdate', function(next) {
  this.set({ updatedAt: Date.now() });
  next();
});

// Index for better query performance
miniNewsSchema.index({ category: 1, isActive: 1, createdAt: -1 });
miniNewsSchema.index({ isActive: 1, createdAt: -1 }); // Optimized for getAllMiniNews query
miniNewsSchema.index({ slug: 1 });

module.exports = mongoose.model('MiniNews', miniNewsSchema);
