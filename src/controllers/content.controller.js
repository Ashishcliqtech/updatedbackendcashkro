const ContentSection = require('../models/content.model');
const logger = require('../utils/logger');

// @route   GET /api/content
// @desc    Get all content sections (can filter by page)
// @access  Public
exports.getAllContent = async (req, res) => {
  try {
    const { page } = req.query;
    const query = page ? { page } : {};
    const content = await ContentSection.find(query);
    res.json(content);
  } catch (err) {
    logger.error('Error in getAllContent:', { error: err.message, stack: err.stack });
    res.status(500).send('Server Error');
  }
};

// @route   POST /api/content
// @desc    Create a new content section
// @access  Admin
exports.createContent = async (req, res) => {
  const { title, content, page } = req.body;
  try {
    const newContentSection = new ContentSection({
      title,
      content,
      page,
      imageUrl: req.file ? req.file.path : undefined,
    });
    const savedContent = await newContentSection.save();
    res.status(201).json(savedContent);
  } catch (err) {
    logger.error('Error in createContent:', { error: err.message, stack: err.stack });
    res.status(500).send('Server Error');
  }
};

// @route   PUT /api/content/:id
// @desc    Update a content section
// @access  Admin
exports.updateContent = async (req, res) => {
  const { title, content, page } = req.body;
  try {
    let section = await ContentSection.findById(req.params.id);
    if (!section) {
      return res.status(404).json({ msg: 'Content section not found' });
    }
    
    const updateData = { title, content, page };
    if (req.file) {
        updateData.imageUrl = req.file.path;
    }

    section = await ContentSection.findByIdAndUpdate(
        req.params.id,
        { $set: updateData },
        { new: true }
    );
    res.json(section);
  } catch (err) {
    logger.error('Error in updateContent:', { error: err.message, stack: err.stack });
    res.status(500).send('Server Error');
  }
};

// @route   DELETE /api/content/:id
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

