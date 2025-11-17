const MiniNews = require('../models/MiniNews');
const multer = require('multer');

// Configure multer for memory storage (to store files in MongoDB)
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit per file
    files: 1 // Maximum 1 file (thumb only)
  },
  fileFilter: (req, file, cb) => {
    // Check if file is an image
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Export multer middleware for use in routes
const uploadFields = upload.any();

// Get all mini news articles with pagination
const getAllMiniNews = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20; // Default 20 items per page
    const skip = (page - 1) * limit;

    // Add timeout and lean() for better performance
    const miniNews = await MiniNews.find({ isActive: true })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .maxTimeMS(8000) // 8 second timeout for Vercel
      .lean(); // Use lean() for better performance

    const total = await MiniNews.countDocuments({ isActive: true });

    res.json({
      success: true,
      count: miniNews.length,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      data: miniNews
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Get all deleted mini news articles
const getDeletedMiniNews = async (req, res) => {
  try {
    const miniNews = await MiniNews.find({ isActive: false })
      .sort({ updatedAt: -1 });
    res.json({
      success: true,
      count: miniNews.length,
      data: miniNews
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Get single mini news article
const getMiniNews = async (req, res) => {
  try {
    const miniNews = await MiniNews.findById(req.params.id);
    if (!miniNews) {
      return res.status(404).json({
        success: false,
        message: 'MiniNews article not found'
      });
    }
    res.json({
      success: true,
      data: miniNews
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Get mini news by category with pagination
const getMiniNewsByCategory = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const miniNews = await MiniNews.find({
      category: req.params.categoryId,
      isActive: true
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .maxTimeMS(8000)
      .lean();

    const total = await MiniNews.countDocuments({
      category: req.params.categoryId,
      isActive: true
    });

    res.json({
      success: true,
      count: miniNews.length,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      data: miniNews
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Get mini news by slug
const getMiniNewsBySlug = async (req, res) => {
  try {
    const miniNews = await MiniNews.findOne({
      slug: req.params.slug,
      isActive: true
    });
    if (!miniNews) {
      return res.status(404).json({
        success: false,
        message: 'MiniNews article not found'
      });
    }
    res.json({
      success: true,
      data: miniNews
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Create mini news article
const createMiniNews = async (req, res) => {
  try {
    const {
      page,
      category,
      slug,
      tag,
      title,
      excerpt,
      date,
      time,
      paragraphs,
      videoUrl
    } = req.body;

    // Check if slug already exists
    const existingMiniNews = await MiniNews.findOne({ slug });
    if (existingMiniNews) {
      return res.status(400).json({
        success: false,
        message: 'MiniNews article with this slug already exists'
      });
    }

    // Process uploaded files - only thumb
    let processedThumb = null;

    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        if (file.fieldname === 'thumb') {
          // Process thumbnail
          processedThumb = {
            filename: file.filename || `${Date.now()}-thumb-${file.originalname}`,
            originalName: file.originalname,
            mimetype: file.mimetype,
            size: file.size,
            data: file.buffer,
            uploadedAt: new Date()
          };
        }
      });
    }

    const miniNews = new MiniNews({
      page,
      category,
      slug,
      thumb: processedThumb,
      tag,
      title,
      excerpt,
      date,
      time,
      paragraphs: paragraphs ? (Array.isArray(paragraphs) ? paragraphs : [paragraphs]) : [],
      videoUrl
    });

    await miniNews.save();

    res.status(201).json({
      success: true,
      message: 'MiniNews article created successfully',
      data: miniNews
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'MiniNews article with this slug already exists'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Update mini news article (supports partial updates - only provided fields are updated)
const updateMiniNews = async (req, res) => {
  try {
    const allowedFields = [
      'page', 'category', 'slug', 'thumb', 'tag', 'title',
      'excerpt', 'date', 'time', 'paragraphs', 'videoUrl', 'isActive'
    ];

    // Build update object with only provided fields
    const updateData = {};
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    // If no valid fields provided, return error
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid fields provided for update'
      });
    }

    const miniNews = await MiniNews.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!miniNews) {
      return res.status(404).json({
        success: false,
        message: 'MiniNews article not found'
      });
    }

    res.json({
      success: true,
      message: 'MiniNews article updated successfully',
      data: miniNews
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'MiniNews article with this slug already exists'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Delete mini news article (soft delete by setting isActive to false)
const deleteMiniNews = async (req, res) => {
  try {
    const miniNews = await MiniNews.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!miniNews) {
      return res.status(404).json({
        success: false,
        message: 'MiniNews article not found'
      });
    }

    res.json({
      success: true,
      message: 'MiniNews article deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Hard delete mini news article (permanent deletion)
const hardDeleteMiniNews = async (req, res) => {
  try {
    const miniNews = await MiniNews.findByIdAndDelete(req.params.id);

    if (!miniNews) {
      return res.status(404).json({
        success: false,
        message: 'MiniNews article not found'
      });
    }

    res.json({
      success: true,
      message: 'MiniNews article permanently deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Get thumbnail by mini news ID
const getMiniNewsThumb = async (req, res) => {
  try {
    const { id } = req.params;
    const miniNews = await MiniNews.findById(id);

    if (!miniNews || !miniNews.thumb) {
      return res.status(404).json({
        success: false,
        message: 'Thumbnail not found'
      });
    }

    const thumb = miniNews.thumb;

    // Set appropriate headers
    res.set({
      'Content-Type': thumb.mimetype,
      'Content-Length': thumb.size,
      'Content-Disposition': `inline; filename="${thumb.originalName}"`
    });

    // Send the thumbnail buffer
    res.send(thumb.data);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

module.exports = {
  getAllMiniNews,
  getDeletedMiniNews,
  getMiniNews,
  getMiniNewsByCategory,
  getMiniNewsBySlug,
  createMiniNews,
  updateMiniNews,
  deleteMiniNews,
  hardDeleteMiniNews,
  getMiniNewsThumb,
  uploadFields
};
