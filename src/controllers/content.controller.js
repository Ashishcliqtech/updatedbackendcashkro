const ContentSection = require('../models/content.model');
const logger = require('../utils/logger');

// @route   GET /api/content
// @desc    Get all content sections (can filter by page and status)
// @access  Public
exports.getAllContent = async (req, res) => {
  try {
    const { page, status } = req.query;
    const query = {};
    if (page) query.page = page;
    if (status) query.status = status;
    else query.status = 'published'; // Default to published for public view

    const content = await ContentSection.find(query).sort({ updatedAt: -1 });
    res.json(content);
  } catch (err) {
    logger.error('Error in getAllContent:', { error: err.message, stack: err.stack });
    res.status(500).send('Server Error');
  }
};

// @route   GET /api/content/:slug
// @desc    Get a single content section by slug
// @access  Public
exports.getContentBySlug = async (req, res) => {
  try {
    const content = await ContentSection.findOne({ slug: req.params.slug, status: 'published' });
    if (!content) {
      return res.status(404).json({ msg: 'Content not found' });
    }
    res.json(content);
  } catch (err) {
    logger.error('Error in getContentBySlug:', { error: err.message, stack: err.stack });
    res.status(500).send('Server Error');
  }
};


// @route   POST /api/admin/content
// @desc    Create a new content section
// @access  Admin
exports.createContent = async (req, res) => {
  const { title, slug, content, page, contentType, status } = req.body;
  
  if (!title || !slug || !content || !page || !contentType) {
    return res.status(400).json({ msg: 'Please provide all required fields' });
  }

  try {
    let section = await ContentSection.findOne({ slug });
    if (section) {
        return res.status(400).json({ msg: 'Content with this slug already exists' });
    }

    const newContentSection = new ContentSection({
      title,
      slug,
      content: JSON.parse(content), // Content is sent as a stringified JSON
      page,
      contentType,
      status,
      imageUrl: req.file ? req.file.path : undefined,
    });

    const savedContent = await newContentSection.save();
    res.status(201).json(savedContent);
  } catch (err) {
    logger.error('Error in createContent:', { error: err.message, stack: err.stack });
    res.status(500).send('Server Error');
  }
};

// @route   PUT /api/admin/content/:id
// @desc    Update a content section
// @access  Admin
// @route   PUT /api/admin/content/:id
// @desc    Update a content section
// @access  Admin
exports.updateContent = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, slug, page, contentType, status, content } = req.body;

    // Check if a different content section already uses the new slug
    if (slug) {
      const existingContent = await ContentSection.findOne({ slug, _id: { $ne: id } });
      if (existingContent) {
        return res.status(400).json({ msg: 'Content with this slug already exists' });
      }
    }

    const updatedData = {
      title,
      slug,
      page,
      contentType,
      status,
    };

    // The 'content' field might be a JSON string, so parse it.
    if (content) {
        try {
            updatedData.content = JSON.parse(content);
        } catch (e) {
            // If it's not a valid JSON string, use it as is.
            updatedData.content = content;
        }
    }


    // Handle file upload if a new image is provided
    if (req.file) {
      // Assuming you have cloudinary setup
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'content',
      });
      updatedData.imageUrl = result.secure_url;
    }

    // Remove undefined fields so they don't overwrite existing data
    Object.keys(updatedData).forEach(key => updatedData[key] === undefined && delete updatedData[key]);


    const updatedContent = await ContentSection.findByIdAndUpdate(
      id,
      { $set: updatedData }, // Use $set to prevent overwriting the whole document
      { new: true }
    );

    if (!updatedContent) {
      return res.status(404).json({ msg: 'Content not found' });
    }

    res.status(200).json(updatedContent);
  } catch (error) {
    logger.error(`Error updating content: ${error.message}`);
    res.status(500).json({ msg: 'Server error' });
  }
};


// @route   DELETE /api/admin/content/:id
// @desc    Delete a content section
// @access  Admin
exports.deleteContent = async (req, res) => {
  try {
    const section = await ContentSection.findById(req.params.id);
    if (!section) {
      return res.status(404).json({ msg: 'Content section not found' });
    }
    await section.deleteOne();
    res.json({ msg: 'Content section removed' });
  } catch (err) {
    logger.error('Error in deleteContent:', { error: err.message, stack: err.stack });
    res.status(500).send('Server Error');
  }
};
