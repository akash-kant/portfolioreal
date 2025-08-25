const Resource = require('../models/Resource');

const getResources = async (req, res) => {
  try {
    let query = Resource.find({ isActive: true });

    const { category, type, difficulty, minPrice, maxPrice, featured, sort, page, limit } = req.query;

    if (category) query = query.where('category').equals(category);
    if (type) query = query.where('type').equals(type);
    if (difficulty) query = query.where('difficulty').equals(difficulty);
    if (featured) query = query.where('isFeatured').equals(featured === 'true');

    if (minPrice || maxPrice) {
      const priceFilter = {};
      if (minPrice) priceFilter.$gte = parseInt(minPrice, 10);
      if (maxPrice) priceFilter.$lte = parseInt(maxPrice, 10);
      query = query.where('price').gte(priceFilter.$gte || 0);
      if (priceFilter.$lte !== undefined) query = query.lte(priceFilter.$lte);
    }

    query = query.sort(sort || '-createdAt');

    const pg = parseInt(page, 10) || 1;
    const lim = parseInt(limit, 10) || 12;
    const skip = (pg - 1) * lim;

    const total = await Resource.countDocuments(query.getQuery());
    const resources = await query.skip(skip).limit(lim);

    const pagination = {};
    if (skip + resources.length < total) pagination.next = { page: pg + 1, limit: lim };
    if (skip > 0) pagination.prev = { page: pg - 1, limit: lim };

    res.status(200).json({ success: true, count: resources.length, total, pagination, data: resources });
  } catch {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

const getResource = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) return res.status(404).json({ success: false, message: 'Resource not found' });
    res.status(200).json({ success: true, data: resource });
  } catch {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

const createResource = async (req, res) => {
  try {
    if (req.files) {
      if (req.files.document) {
        req.body.file = {
          url: req.files.document.path,
          size: req.files.document.size,
          format: req.files.document.mimetype,
        };
      }
      if (req.files.images) {
        req.body.preview = {
          images: req.files.images.map((f) => f.path),
          description: req.body.previewDescription,
        };
      }
    }
    const resource = await Resource.create(req.body);
    res.status(201).json({ success: true, data: resource });
  } catch {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

const updateResource = async (req, res) => {
  try {
    let resource = await Resource.findById(req.params.id);
    if (!resource) return res.status(404).json({ success: false, message: 'Resource not found' });

    if (req.files) {
      if (req.files.document) {
        req.body.file = {
          url: req.files.document.path,
          size: req.files.document.size,
          format: req.files.document.mimetype,
        };
      }
      if (req.files.images) {
        req.body.preview = {
          images: req.files.images.map((f) => f.path),
          description: req.body.previewDescription,
        };
      }
    }

    resource = await Resource.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.status(200).json({ success: true, data: resource });
  } catch {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

const deleteResource = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) return res.status(404).json({ success: false, message: 'Resource not found' });
    await resource.deleteOne();
    res.status(200).json({ success: true, message: 'Resource deleted successfully' });
  } catch {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

const addRating = async (req, res) => {
  try {
    const { rating, review } = req.body;
    const resource = await Resource.findById(req.params.id);
    if (!resource) return res.status(404).json({ success: false, message: 'Resource not found' });

    const existing = resource.ratings.find((r) => r.user.toString() === req.user.id);
    if (existing) {
      existing.rating = rating;
      existing.review = review;
    } else {
      resource.ratings.push({ user: req.user.id, rating, review });
    }
    resource.calculateAverageRating();
    await resource.save();

    res.status(200).json({ success: true, data: resource });
  } catch {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

module.exports = { getResources, getResource, createResource, updateResource, deleteResource, addRating };
