// Background script for Chrome extension
chrome.runtime.onInstalled.addListener(() => {
  console.log('AI Tweet Helper extension installed');
});

// Listen for keyboard shortcut
chrome.commands.onCommand.addListener((command) => {
  if (command === 'generate_ai_help') {
    console.log('AI Help shortcut activated');
    
    // Execute content script on the active tab
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.scripting.executeScript({
          target: { tabId: tabs[0].id },
          files: ['content.js']
        });
      }
    });
  }
});

// Listen for messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'generateAIResponse') {
    // Handle AI response generation request
    handleTweetGeneration(request.data)
      .then(response => sendResponse({ success: true, data: response }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true; // Keep message channel open for async response
  }
});

async function handleTweetGeneration(data) {
  try {
    // Get API key and settings from storage
    const storage = await chrome.storage.sync.get(['apiKey', 'model', 'enabled', 'tone', 'customPrompt', 'currentFocus', 'responseLength']);
    const apiKey = storage.apiKey;
    const model = storage.model || 'gpt-3.5-turbo';
    const enabled = storage.enabled !== false;
    const tone = storage.tone || 'professional';
    const customPrompt = storage.customPrompt || '';
    const currentFocus = storage.currentFocus || '';
    const responseLength = storage.responseLength || 'medium';

    if (!enabled) {
      throw new Error('AI Helper is disabled. Enable it in the extension popup.');
    }

    if (!apiKey) {
      throw new Error('Please set your OpenAI API key in the extension popup');
    }

    // Build tone-specific instructions
    const toneInstructions = {
      'professional': 'Be professional, informative, and authoritative. Use clear, well-structured language.',
      'friendly': 'Be warm, approachable, and conversational. Use friendly language and show genuine interest.',
      'enthusiastic': 'Be energetic, positive, and engaging. Show excitement and passion for the topic.',
      'thoughtful': 'Be reflective, analytical, and insightful. Provide deep thinking and meaningful perspectives.',
      'casual': 'Be relaxed, informal, and easy-going. Use natural, everyday language.',
      'witty': 'Be clever, humorous, and playful. Include appropriate wit and smart observations.'
    };

    // Build length-specific instructions
    const lengthInstructions = {
      'short': 'Keep responses brief and concise (1-2 sentences maximum).',
      'medium': 'Provide moderate-length responses (2-3 sentences).',
      'long': 'Give comprehensive responses (3-4 sentences with good detail).',
      'detailed': 'Provide thorough, detailed responses (4+ sentences with in-depth analysis).'
    };

    // Build the system prompt
    let systemPrompt = `You are a helpful AI assistant that analyzes tweets and provides insightful responses. When given a tweet, provide thoughtful analysis, context, or a helpful response. Be engaging, informative, and concise. Avoid controversial topics.

Tone: ${toneInstructions[tone]}

Length: ${lengthInstructions[responseLength]}`;

    // Add custom prompt if provided
    if (customPrompt) {
      systemPrompt += `\n\nAdditional Instructions: ${customPrompt}`;
    }

    // Add current focus if provided
    if (currentFocus) {
      systemPrompt += `\n\nToday's Focus: Keep in mind that today's focus is on "${currentFocus}". Try to relate responses to this theme when relevant.`;
    }

    // Build the user prompt
    let userPrompt = `Please analyze this tweet and provide helpful insights or a thoughtful response:\n\nTweet by ${data.author}: "${data.tweetText}"\n\nProvide analysis, context, or suggest a good response.`;

    if (currentFocus) {
      userPrompt += `\n\nRemember to consider today's focus on "${currentFocus}" if it's relevant to this tweet.`;
    }

    // Debug log to check what we're sending
    console.log('AI Settings being used:', { tone, customPrompt, currentFocus, responseLength });
    console.log('System prompt:', systemPrompt);
    console.log('User prompt:', userPrompt);

    // Determine max tokens based on response length
    const maxTokensMap = {
      'short': 80,      // 1-2 sentences
      'medium': 150,    // 2-3 sentences
      'long': 250,      // 3-4 sentences
      'detailed': 400   // 4+ sentences
    };
    const maxTokens = maxTokensMap[responseLength] || 150;

    console.log('Using max_tokens:', maxTokens);

    // Call OpenAI API directly
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: model,
        messages: [{
          role: 'system',
          content: systemPrompt
        }, {
          role: 'user',
          content: userPrompt
        }],
        max_tokens: maxTokens,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`API Error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
    }

    const result = await response.json();
    const aiResponse = result.choices[0]?.message?.content?.trim() || 'Could not generate response';
    
    return aiResponse;
  } catch (error) {
    console.error('Error in handleTweetGeneration:', error);
    
    // Fallback responses based on tweet content
    const fallbackResponses = [
      "This tweet raises some interesting points worth discussing further. What are your thoughts on this topic?",
      "Thanks for sharing this perspective! It's always valuable to see different viewpoints on important issues.",
      "This is a thought-provoking post. It reminds me of the broader conversation about how we approach these topics.",
      "Interesting observation! This connects to some larger trends we're seeing in this space.",
      "Great point! This highlights an important aspect that often gets overlooked in discussions about this topic.",
      "This tweet brings up some valuable insights. It's worth considering the implications of this perspective.",
      "Thanks for bringing attention to this! It's an important topic that deserves more discussion.",
      "This is a compelling take on the subject. It adds a new dimension to how we might think about this issue."
    ];
    
    const randomResponse = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
    return randomResponse;
  }
}