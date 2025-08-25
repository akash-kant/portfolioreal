const Resource = require('../models/Resource');

// @desc    Get all resources
// @route   GET /api/resources
// @access  Public
const getResources = async (req, res) => {
  try {
    let query = Resource.find({ isActive: true });

    // Filtering
    const { category, type, difficulty, minPrice, maxPrice, featured } = req.query;
    
    if (category) {
      query = query.where('category').equals(category);
    }
    
    if (type) {
      query = query.where('type').equals(type);
    }
    
    if (difficulty) {
      query = query.where('difficulty').equals(difficulty);
    }
    
    if (minPrice || maxPrice) {
      const priceFilter = {};
      if (minPrice) priceFilter.$gte = parseInt(minPrice);
      if (maxPrice) priceFilter.$lte = parseInt(maxPrice);
      query = query.where('price').equals(priceFilter);
    }
    
    if (featured) {
      query = query.where('isFeatured').equals(featured === 'true');
    }

    // Sorting
    const sortBy = req.query.sort || '-createdAt';
    query = query.sort(sortBy);

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 12;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Resource.countDocuments(query.getQuery());

    query = query.skip(startIndex).limit(limit);

    const resources = await query;

    // Pagination result
    const pagination = {};

    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit
      };
    }

    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit
      };
    }

    res.status(200).json({
      success: true,
      count: resources.length,
      total,
      pagination,
      data: resources
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Get single resource
// @route   GET /api/resources/:id
// @access  Public
const getResource = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found'
      });
    }

    res.status(200).json({
      success: true,
      data: resource
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Create new resource
// @route   POST /api/resources
// @access  Private (Admin)
const createResource = async (req, res) => {
  try {
    // Handle file uploads
    if (req.files) {
      if (req.files.document && req.files.document[0]) {
        req.body.file = {
          url: req.files.document[0].path,
          size: req.files.document[0].size,
          format: req.files.document[0].mimetype
        };
      }
      
      if (req.files.images) {
        req.body.preview = {
          images: req.files.images.map(file => file.path),
          description: req.body.previewDescription
        };
      }
    }

    const resource = await Resource.create(req.body);

    res.status(201).json({
      success: true,
      data: resource
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Update resource
// @route   PUT /api/resources/:id
// @access  Private (Admin)
const updateResource = async (req, res) => {
  try {
    let resource = await Resource.findById(req.params.id);

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found'
      });
    }

    // Handle file uploads
    if (req.files) {
      if (req.files.document && req.files.document[0]) {
        req.body.file = {
          url: req.files.document[0].path,
          size: req.files.document[0].size,
          format: req.files.document[0].mimetype
        };
      }
      
      if (req.files.images) {
        req.body.preview = {
          images: req.files.images.map(file => file.path),
          description: req.body.previewDescription
        };
      }
    }

    resource = await Resource.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: resource
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Delete resource
// @route   DELETE /api/resources/:id
// @access  Private (Admin)
const deleteResource = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found'
      });
    }

    await resource.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Resource deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Add rating to resource
// @route   POST /api/resources/:id/rating
// @access  Private
const addRating = async (req, res) => {
  try {
    const { rating, review } = req.body;
    const resource = await Resource.findById(req.params.id);

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found'
      });
    }

    // Check if user already rated
    const existingRating = resource.ratings.find(
      r => r.user.toString() === req.user.id
    );

    if (existingRating) {
      existingRating.rating = rating;
      existingRating.review = review;
    } else {
      resource.ratings.push({
        user: req.user.id,
        rating,
        review
      });
    }

    resource.calculateAverageRating();
    await resource.save();

    res.status(200).json({
      success: true,
      data: resource
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

module.exports = {
  getResources,
  getResource,
  createResource,
  updateResource,
  deleteResource,
  addRating
};