const Content = require('../models/content.model');

// @route   GET /api/content
// @desc    Get all content sections
// @access  Public
exports.getContentSections = async (req, res) => {
  try {
    const sections = await Content.find({ status: 'active' }).sort({ position: 1 });
    res.json(sections);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @route   POST /api/content
// @desc    Create a content section
// @access  Admin
exports.createContentSection = async (req, res) => {
  try {
    const { name, type, status, content, position, devices, scheduledDate } = req.body;

    const newSectionData = {
      name,
      type,
      status,
      content: JSON.parse(content), // content is sent as stringified JSON
      position,
      devices,
      scheduledDate,
    };

    if (req.file) {
      newSectionData.content.imageUrl = req.file.path;
    }

    const newSection = new Content(newSectionData);
    const section = await newSection.save();
    res.json(section);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};


// @route   PUT /api/content/:id
// @desc    Update a content section
// @access  Admin
exports.updateContentSection = async (req, res) => {
  try {
    let section = await Content.findById(req.params.id);
    if (!section) {
      return res.status(404).json({ msg: 'Content section not found' });
    }

    const { name, type, status, content, position, devices, scheduledDate } = req.body;

    const updateData = {
      name,
      type,
      status,
      content: JSON.parse(content),
      position,
      devices,
      scheduledDate,
      lastModified: Date.now(),
    };


    if (req.file) {
      if (!updateData.content) {
        updateData.content = {};
      }
      updateData.content.imageUrl = req.file.path;
    }

    section = await Content.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true }
    );

    res.json(section);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @route   DELETE /api/content/:id
// @desc    Delete a content section
// @access  Admin
exports.deleteContentSection = async (req, res) => {
  try {
    const section = await Content.findById(req.params.id);
    if (!section) {
      return res.status(404).json({ msg: 'Content section not found' });
    }

    await Content.findByIdAndRemove(req.params.id);
    res.json({ msg: 'Content section removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};