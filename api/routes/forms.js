const express = require('express');
const router = express.Router();
const { supabase } = require('../config/supabase');

// Get all forms for the authenticated user
router.get('/', async (req, res) => {
  try {
    // For now, return test data
    // Later we'll implement authentication and fetch from Supabase
    res.json({
      forms: [
        {
          id: 'test-form-1',
          title: 'Test Form 1',
          youtube_video_id: 'efHYzQwahtw',
          is_published: true,
          created_at: new Date().toISOString()
        }
      ]
    });
  } catch (error) {
    console.error('Forms error:', error);
    res.status(500).json({ error: 'Failed to fetch forms' });
  }
});

// Create a new form
router.post('/', async (req, res) => {
  try {
    const { title, youtube_video_id } = req.body;
    
    console.log('Creating form:', { title, youtube_video_id });
    
    // For now, return mock response
    res.json({
      success: true,
      form: {
        id: 'new-form-' + Date.now(),
        title,
        youtube_video_id,
        is_published: false,
        created_at: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Create form error:', error);
    res.status(500).json({ error: 'Failed to create form' });
  }
});

module.exports = router;
