const Project = require('../models/Project');

// @desc    Get all projects
// @route   GET /api/projects
// @access  Public
const getProjects = async (req, res) => {
    try {
        let query = Project.find({ isPublic: true });

        // Filtering
        const { category, technology, status, featured } = req.query;

        if (category) {
            query = query.where('category').equals(category);
        }

        if (technology) {
            query = query.where('technologies').in([technology]);
        }

        if (status) {
            query = query.where('status').equals(status);
        }

        if (featured) {
            query = query.where('isFeatured').equals(featured === 'true');
        }

        // Sorting
        const sortBy = req.query.sort || '-order -createdAt';
        query = query.sort(sortBy);

        // Pagination
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 12;
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        // Corrected line
        const total = await Project.countDocuments(query.getFilter());
        query = query.skip(startIndex).limit(limit);

        const projects = await query;

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
            count: projects.length,
            total,
            pagination,
            data: projects
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
};

// @desc    Get single project
// @route   GET /api/projects/:id
// @access  Public
const getProject = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);

        if (!project) {
            return res.status(404).json({
                success: false,
                message: 'Project not found'
            });
        }

        // Increment views
        project.views += 1;
        await project.save({ validateBeforeSave: false });

        res.status(200).json({
            success: true,
            data: project
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
};

// @desc    Create new project
// @route   POST /api/projects
// @access  Private (Admin)
const createProject = async (req, res) => {
    try {
        // Handle image uploads
        if (req.files && req.files.length > 0) {
            req.body.images = req.files.map(file => file.path);
        }

        const project = await Project.create(req.body);

        res.status(201).json({
            success: true,
            data: project
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
};

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private (Admin)
const updateProject = async (req, res) => {
    try {
        let project = await Project.findById(req.params.id);

        if (!project) {
            return res.status(404).json({
                success: false,
                message: 'Project not found'
            });
        }

        // Handle image uploads
        if (req.files && req.files.length > 0) {
            req.body.images = req.files.map(file => file.path);
        }

        project = await Project.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            success: true,
            data: project
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
};

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private (Admin)
const deleteProject = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);

        if (!project) {
            return res.status(404).json({
                success: false,
                message: 'Project not found'
            });
        }

        await project.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Project deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
};

// @desc    Like/Unlike project
// @route   PUT /api/projects/:id/like
// @access  Private
const toggleLike = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);

        if (!project) {
            return res.status(404).json({
                success: false,
                message: 'Project not found'
            });
        }

        const isLiked = project.likes.includes(req.user.id);

        if (isLiked) {
            project.likes = project.likes.filter(like => like.toString() !== req.user.id);
        } else {
            project.likes.push(req.user.id);
        }

        await project.save();

        res.status(200).json({
            success: true,
            data: {
                likes: project.likes.length,
                isLiked: !isLiked
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
};

module.exports = {
    getProjects,
    getProject,
    createProject,
    updateProject,
    deleteProject,
    toggleLike
};