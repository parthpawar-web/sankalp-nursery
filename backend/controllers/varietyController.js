import Variety from '../models/varietyModel.js';

/**
 * @desc    FETCH all cabbage varieties
 * @route   GET /api/varieties
 * @access  Public
 */
export const getVarieties = async (req, res) => {
  try {
    const varieties = await Variety.find({});
    res.json({ success: true, count: varieties.length, data: varieties });
  } catch (error) {
    res.status(500).json({ success: false, message: `Failed to fetch varieties: ${error.message}` });
  }
};

/**
 * @desc    FETCH single variety by ID
 * @route   GET /api/varieties/:id
 * @access  Public
 */
export const getVarietyById = async (req, res) => {
  try {
    const variety = await Variety.findById(req.params.id);
    if (variety) {
      res.json({ success: true, data: variety });
    } else {
      res.status(404).json({ success: false, message: 'Plant variety not found in our database' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: `Fetch error: ${error.message}` });
  }
};

/**
 * @desc    CREATE a new variety (Nursery Management)
 * @route   POST /api/varieties
 * @access  Private/Admin
 */
export const createVariety = async (req, res) => {
  try {
    const variety = await Variety.create(req.body);
    res.status(201).json({ success: true, message: 'Variety added successfully!', data: variety });
  } catch (error) {
    res.status(400).json({ success: false, message: `Creation failed: ${error.message}` });
  }
};

/**
 * @desc    UPDATE a variety
 * @route   PUT /api/varieties/:id
 * @access  Private/Admin
 */
export const updateVariety = async (req, res) => {
  try {
    // { new: true } tells Mongoose to return the UPDATED document rather than the original one
    // { runValidators: true } ensures the new data still follows our Schema rules
    const variety = await Variety.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (variety) {
      res.json({ success: true, message: 'Variety updated!', data: variety });
    } else {
      res.status(404).json({ success: false, message: 'Variety not found' });
    }
  } catch (error) {
    res.status(400).json({ success: false, message: `Update failed: ${error.message}` });
  }
};

/**
 * @desc    DELETE a variety
 * @route   DELETE /api/varieties/:id
 * @access  Private/Admin
 */
export const deleteVariety = async (req, res) => {
  try {
    const variety = await Variety.findByIdAndDelete(req.params.id);
    if (variety) {
      res.json({ success: true, message: 'Variety successfully removed from catalog' });
    } else {
      res.status(404).json({ success: false, message: 'Variety not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: `Deletion error: ${error.message}` });
  }
};

/**
 * @desc    CREATE a new review
 * @route   POST /api/varieties/:id/reviews
 * @access  Private
 */
export const createVarietyReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const variety = await Variety.findById(req.params.id);

    if (variety) {
      // Check if already reviewed securely by user token
      const alreadyReviewed = variety.reviews.find(
        (r) => r.user.toString() === req.user._id.toString()
      );

      if (alreadyReviewed) {
        return res.status(400).json({ success: false, message: 'You have already reviewed this variety' });
      }

      const review = {
        name: req.user.name,
        rating: Number(rating),
        comment,
        user: req.user._id,
      };

      variety.reviews.push(review);
      variety.numReviews = variety.reviews.length;
      
      // Calculate dynamic average rating out of 5
      variety.rating =
        variety.reviews.reduce((acc, item) => item.rating + acc, 0) /
        variety.reviews.length;

      await variety.save();
      res.status(201).json({ success: true, message: 'Review added successfully!' });
    } else {
      res.status(404).json({ success: false, message: 'Variety not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: `Review submission failed: ${error.message}` });
  }
};
