import TrackerItem from '../models/TrackerItem.js';

// @desc    Get user's tracker items (per-user isolation)
// @route   GET /api/trackers
// @access  Private
export async function getTrackerItems(req, res) {
  try {
    const { type } = req.query;
    const filter = { user: req.user.id };

    if (type && ['hackathon', 'job', 'internship'].includes(type)) {
      filter.type = type;
    }

    const items = await TrackerItem.find(filter).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: items.length,
      data: items
    });
  } catch (err) {
    console.error('Fetch Tracker Items Error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve tracker items.'
    });
  }
}

// @desc    Create a new tracker item for current user
// @route   POST /api/trackers
// @access  Private
export async function createTrackerItem(req, res) {
  try {
    const { 
      type, 
      name, 
      company, 
      link, 
      lastDateApply, 
      lastDateSubmission, 
      secondDate, 
      compensation,
      tags,
      mode,
      description
    } = req.body;

    if (!type || !name || !link || !lastDateApply) {
      return res.status(400).json({
        success: false,
        message: 'Please provide type, name, link, and lastDateApply.'
      });
    }

    const newItem = await TrackerItem.create({
      user: req.user.id,
      type,
      name,
      company: company || 'Tech Company',
      link,
      lastDateApply,
      lastDateSubmission: lastDateSubmission || null,
      secondDate: secondDate || null,
      compensation: compensation || 'Competitive',
      tags: tags || [],
      mode: mode || 'Online / Remote',
      description: description || '',
      status: 'unread',
      hasNewEmail: true,
      emailNotification: 'New entry added to your tracker.'
    });

    res.status(201).json({
      success: true,
      data: newItem
    });
  } catch (err) {
    console.error('Create Tracker Item Error:', err);
    res.status(500).json({
      success: false,
      message: err.message || 'Failed to create tracker item.'
    });
  }
}

// @desc    Update a tracker item (status: read/unread, dates, email alert)
// @route   PUT /api/trackers/:id
// @access  Private
export async function updateTrackerItem(req, res) {
  try {
    let item = await TrackerItem.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Tracker item not found.'
      });
    }

    // Verify ownership
    if (item.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to modify this item.'
      });
    }

    item = await TrackerItem.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: item
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to update tracker item.'
    });
  }
}

// @desc    Delete a tracker item
// @route   DELETE /api/trackers/:id
// @access  Private
export async function deleteTrackerItem(req, res) {
  try {
    const item = await TrackerItem.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Tracker item not found.'
      });
    }

    // Verify ownership
    if (item.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this item.'
      });
    }

    await item.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Item removed successfully.'
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete tracker item.'
    });
  }
}
