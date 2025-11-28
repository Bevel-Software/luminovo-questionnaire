const express = require('express');
const router = express.Router();
const { supabase } = require('../config/supabase');

// Test endpoint to get embed configuration
router.get('/:token', async (req, res) => {
  try {
    const { token } = req.params;
    
    // For now, just return a test response
    // Later we'll decode the JWT token and fetch real data
    res.json({
      message: 'Embed endpoint working',
      token: token,
      videoId: 'efHYzQwahtw', // Your current video ID
      questions: [
        {
          id: 'test_question',
          timestamp: 30,
          type: 'text',
          data: {
            question: 'This is a test question from the API'
          }
        }
      ]
    });
  } catch (error) {
    console.error('Embed error:', error);
    res.status(500).json({ error: 'Failed to load embed configuration' });
  }
});

// Test endpoint to submit responses
router.post('/:token/responses', async (req, res) => {
  try {
    const { token } = req.params;
    const { sessionId, answers } = req.body;
    
    console.log('Received response submission:', {
      token,
      sessionId,
      answersCount: answers?.length || 0
    });
    
    // For now, just return success
    // Later we'll save to Supabase
    res.json({ 
      success: true,
      message: 'Response saved successfully',
      sessionId 
    });
  } catch (error) {
    console.error('Response submission error:', error);
    res.status(500).json({ error: 'Failed to save response' });
  }
});

module.exports = router;
