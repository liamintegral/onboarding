const express = require('express');
const { body, validationResult } = require('express-validator');
const database = require('../database/supabase');
const { authenticateClient, logActivity } = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');
const router = express.Router();

// AI service integration
const OpenAI = require('openai');
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Create or get chat session
router.post('/session', [
  authenticateClient,
  body('platformContext').optional().trim(),
  body('currentStep').optional().trim(),
  logActivity('create_chat_session', 'chat_session')
], async (req, res) => {
  try {
    const { platformContext, currentStep } = req.body;
    const sessionId = uuidv4();

    // Create new chat session
    const result = await database.run(
      `INSERT INTO chat_sessions (client_id, session_id, platform_context, current_step, messages)
       VALUES ($1, $2, $3, $4, $5)`,
      [req.client.id, sessionId, platformContext, currentStep, JSON.stringify([])]
    );

    res.json({
      sessionId,
      platformContext,
      currentStep,
      messages: []
    });

  } catch (error) {
    console.error('Create chat session error:', error);
    res.status(500).json({ error: { message: 'Failed to create chat session' } });
  }
});

// Get chat session
router.get('/session/:sessionId', authenticateClient, async (req, res) => {
  try {
    const { sessionId } = req.params;

    const session = await database.get(
      'SELECT * FROM chat_sessions WHERE session_id = $1 AND client_id = $2',
      [sessionId, req.client.id]
    );

    if (!session) {
      return res.status(404).json({ error: { message: 'Chat session not found' } });
    }

    res.json({
      sessionId: session.session_id,
      platformContext: session.platform_context,
      currentStep: session.current_step,
      messages: JSON.parse(session.messages || '[]'),
      createdAt: session.created_at,
      updatedAt: session.updated_at
    });

  } catch (error) {
    console.error('Get chat session error:', error);
    res.status(500).json({ error: { message: 'Failed to get chat session' } });
  }
});

// Send message to AI assistant
router.post('/message', [
  authenticateClient,
  body('sessionId').notEmpty().withMessage('Session ID is required'),
  body('message').trim().isLength({ min: 1 }).withMessage('Message is required'),
  body('platformContext').optional().trim(),
  body('currentStep').optional().trim(),
  logActivity('send_chat_message', 'chat_session')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: { message: 'Validation failed', details: errors.array() } });
    }

    const { sessionId, message, platformContext, currentStep } = req.body;

    // Get or create chat session
    let session = await database.get(
      'SELECT * FROM chat_sessions WHERE session_id = $1 AND client_id = $2',
      [sessionId, req.client.id]
    );

    if (!session) {
      // Create new session if it doesn't exist
      await database.run(
        `INSERT INTO chat_sessions (client_id, session_id, platform_context, current_step, messages)
         VALUES ($1, $2, $3, $4, $5)`,
        [req.client.id, sessionId, platformContext, currentStep, JSON.stringify([])]
      );
      session = { messages: '[]', platform_context: platformContext, current_step: currentStep };
    }

    const messages = JSON.parse(session.messages || '[]');
    
    // Add user message
    const userMessage = {
      id: uuidv4(),
      role: 'user',
      content: message,
      timestamp: new Date().toISOString(),
      platformContext,
      currentStep
    };
    messages.push(userMessage);

    // Get client details for context
    const client = await database.get('SELECT * FROM clients WHERE id = $1', [req.client.id]);

    // Get platform connection details if platform context is provided
    let platformDetails = null;
    if (platformContext) {
      platformDetails = await database.get(`
        SELECT 
          pc.*,
          pt.name as platform_name,
          pt.display_name as platform_display_name,
          pt.setup_steps,
          pt.validation_criteria
        FROM platform_connections pc
        JOIN platform_types pt ON pc.platform_type_id = pt.id
        WHERE pt.name = $1 AND pc.client_id = $2
      `, [platformContext, req.client.id]);
    }

    // Prepare AI context
    const systemPrompt = buildSystemPrompt(client, platformDetails, currentStep);
    const conversationHistory = messages.slice(-10).map(msg => ({
      role: msg.role,
      content: msg.content
    }));

    // Get AI response
    let aiResponse;
    try {
      if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your_openai_api_key_here') {
        const completion = await openai.chat.completions.create({
          model: "gpt-4",
          messages: [
            { role: "system", content: systemPrompt },
            ...conversationHistory
          ],
          max_tokens: 500,
          temperature: 0.7,
        });
        aiResponse = completion.choices[0].message.content;
      } else {
        // Fallback response when API key is not configured
        aiResponse = generateFallbackResponse(message, platformContext, currentStep);
      }
    } catch (aiError) {
      console.error('AI API error:', aiError);
      aiResponse = generateFallbackResponse(message, platformContext, currentStep);
    }

    // Add AI response
    const assistantMessage = {
      id: uuidv4(),
      role: 'assistant',
      content: aiResponse,
      timestamp: new Date().toISOString(),
      platformContext,
      currentStep
    };
    messages.push(assistantMessage);

    // Update session in database
    await database.run(
      `UPDATE chat_sessions 
       SET messages = $1, platform_context = $2, current_step = $3, updated_at = NOW()
       WHERE session_id = $4 AND client_id = $5`,
      [JSON.stringify(messages), platformContext, currentStep, sessionId, req.client.id]
    );

    // Emit real-time response
    const io = req.app.get('io');
    io.to(`client-${req.client.id}`).emit('ai-response', {
      sessionId,
      message: assistantMessage
    });

    res.json({
      message: assistantMessage,
      sessionId
    });

  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ error: { message: 'Failed to send message' } });
  }
});

// Get chat history for a session
router.get('/history/:sessionId', authenticateClient, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;

    const session = await database.get(
      'SELECT * FROM chat_sessions WHERE session_id = $1 AND client_id = $2',
      [sessionId, req.client.id]
    );

    if (!session) {
      return res.status(404).json({ error: { message: 'Chat session not found' } });
    }

    const allMessages = JSON.parse(session.messages || '[]');
    const totalMessages = allMessages.length;
    const startIndex = Math.max(0, totalMessages - (page * limit));
    const endIndex = totalMessages - ((page - 1) * limit);
    const messages = allMessages.slice(startIndex, endIndex);

    res.json({
      messages,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalMessages / limit),
        totalMessages,
        hasNext: startIndex > 0,
        hasPrev: endIndex < totalMessages
      },
      sessionInfo: {
        sessionId: session.session_id,
        platformContext: session.platform_context,
        currentStep: session.current_step,
        createdAt: session.created_at,
        updatedAt: session.updated_at
      }
    });

  } catch (error) {
    console.error('Get chat history error:', error);
    res.status(500).json({ error: { message: 'Failed to get chat history' } });
  }
});

// Update chat context
router.put('/session/:sessionId/context', [
  authenticateClient,
  body('platformContext').optional().trim(),
  body('currentStep').optional().trim(),
  logActivity('update_chat_context', 'chat_session')
], async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { platformContext, currentStep } = req.body;

    const session = await database.get(
      'SELECT * FROM chat_sessions WHERE session_id = $1 AND client_id = $2',
      [sessionId, req.client.id]
    );

    if (!session) {
      return res.status(404).json({ error: { message: 'Chat session not found' } });
    }

    await database.run(
      `UPDATE chat_sessions 
       SET platform_context = $1, current_step = $2, updated_at = NOW()
       WHERE session_id = $3 AND client_id = $4`,
      [platformContext, currentStep, sessionId, req.client.id]
    );

    res.json({
      message: 'Chat context updated successfully',
      sessionId,
      platformContext,
      currentStep
    });

  } catch (error) {
    console.error('Update chat context error:', error);
    res.status(500).json({ error: { message: 'Failed to update chat context' } });
  }
});

// Helper function to build system prompt
function buildSystemPrompt(client, platformDetails, currentStep) {
  let prompt = `You are a helpful AI assistant for a digital marketing agency's client onboarding system. 

Client Information:
- Company: ${client.company_name}
- Contact: ${client.contact_name}
- Industry: ${client.industry || 'Not specified'}
- Website: ${client.website || 'Not provided'}

Your role is to help clients navigate the technical process of granting access to their various marketing platforms (Google Analytics, Facebook Business Manager, TikTok Ads, LinkedIn, etc.).

Guidelines:
1. Be friendly, patient, and encouraging
2. Provide clear, step-by-step instructions
3. Acknowledge that technical processes can be confusing
4. Offer to break down complex steps into smaller parts
5. Suggest alternatives if the client encounters issues
6. Always prioritize security and best practices
7. Escalate to human support when needed

`;

  if (platformDetails) {
    const setupSteps = JSON.parse(platformDetails.setup_steps || '[]');
    prompt += `
Current Platform: ${platformDetails.platform_display_name}
Platform Status: ${platformDetails.status}
Progress: ${platformDetails.progress_percentage}%

Setup Steps for this platform:
${setupSteps.map((step, index) => `${index + 1}. ${step}`).join('\n')}

`;
  }

  if (currentStep) {
    prompt += `Current Step: ${currentStep}\n`;
  }

  prompt += `
Respond in a conversational, helpful tone. Keep responses concise but thorough. If the client seems stuck, offer to walk them through the process step by step.`;

  return prompt;
}

// Helper function for fallback responses when AI is not available
function generateFallbackResponse(message, platformContext, currentStep) {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('help') || lowerMessage.includes('stuck') || lowerMessage.includes('problem')) {
    return "I'm here to help! It sounds like you might be experiencing some difficulties. Can you tell me more about what specific step you're having trouble with? I can walk you through it step by step.";
  }
  
  if (lowerMessage.includes('google') && lowerMessage.includes('analytics')) {
    return "For Google Analytics access, you'll need to go to your Google Analytics account, navigate to Admin → User Management, and add our team email with 'Edit' permissions. Would you like me to walk you through this process step by step?";
  }
  
  if (lowerMessage.includes('facebook') || lowerMessage.includes('meta')) {
    return "For Facebook Business Manager access, you'll need to go to business.facebook.com, navigate to Business Settings → People, and add our team member with appropriate permissions. I can guide you through each step if you'd like.";
  }
  
  if (lowerMessage.includes('done') || lowerMessage.includes('completed') || lowerMessage.includes('finished')) {
    return "Great work! It sounds like you've completed that step. Let me know if you need help with the next platform or if you'd like me to verify that everything is set up correctly.";
  }
  
  if (lowerMessage.includes('error') || lowerMessage.includes('not working') || lowerMessage.includes('failed')) {
    return "I understand you're encountering an issue. Don't worry, this is common and we can work through it together. Can you describe exactly what happened when you tried the step? I'll help you troubleshoot.";
  }
  
  return "Thank you for your message! I'm here to help you with setting up access to your marketing platforms. If you have any questions about the setup process or need guidance on any specific step, please let me know and I'll be happy to assist you.";
}

module.exports = router;