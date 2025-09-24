import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { originalTweet, currentText, apiKey, tone, customPrompt, currentFocus, responseLength } = await request.json();

    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key is required' },
        { status: 400 }
      );
    }

    // Build tone-specific instructions
    const toneInstructions: Record<string, string> = {
      'professional': 'Use professional, informative, and authoritative language with clear structure.',
      'friendly': 'Use warm, approachable, and conversational language showing genuine interest.',
      'enthusiastic': 'Use energetic, positive, and engaging language showing excitement.',
      'thoughtful': 'Use reflective, analytical, and insightful language with meaningful perspectives.',
      'casual': 'Use relaxed, informal, and easy-going natural everyday language.',
      'witty': 'Use clever, humorous, and playful language with appropriate wit and smart observations.'
    };

    const selectedTone = tone || 'professional';
    const toneInstruction = toneInstructions[selectedTone] || toneInstructions['professional'];

    // Build length-specific instructions
    const lengthInstructions: Record<string, string> = {
      'short': 'Keep the response brief and concise (1-2 sentences maximum).',
      'medium': 'Provide a moderate-length response (2-3 sentences).',
      'long': 'Give a comprehensive response (3-4 sentences with good detail).',
      'detailed': 'Provide a thorough, detailed response (4+ sentences with in-depth analysis).'
    };

    const selectedLength = responseLength || 'medium';
    const lengthInstruction = lengthInstructions[selectedLength] || lengthInstructions['medium'];

    // Build the base prompt
    let basePrompt = originalTweet 
      ? `You are a helpful AI assistant that helps craft engaging Twitter replies. 
         
         Original tweet: "${originalTweet}"
         Current draft: "${currentText || 'No draft yet'}"
         
         Generate a thoughtful, engaging reply that:
         - Is relevant to the original tweet
         - Adds value to the conversation
         - Is concise (under 280 characters)
         - Avoids controversial topics
         - ${toneInstruction}
         - ${lengthInstruction}
         
         Return only the tweet text, no explanations or quotes.`
      : `You are a helpful AI assistant that helps improve Twitter posts.
         
         Current draft: "${currentText || 'No draft yet'}"
         
         Help improve this tweet by making it:
         - More engaging and clear
         - Concise (under 280 characters)
         - Compelling and interesting
         - Appropriate for a general audience
         - ${toneInstruction}
         - ${lengthInstruction}
         
         Return only the improved tweet text, no explanations or quotes.`;

    // Add custom prompt if provided
    if (customPrompt) {
      basePrompt += `\n\nAdditional Instructions: ${customPrompt}`;
    }

    // Add current focus if provided
    if (currentFocus) {
      basePrompt += `\n\nToday's Focus: Keep in mind that today's focus is on "${currentFocus}". Try to incorporate this theme when relevant.`;
    }

    const prompt = basePrompt;

    // Determine max tokens based on response length
    const maxTokensMap: Record<string, number> = {
      'short': 60,      // 1-2 sentences
      'medium': 100,    // 2-3 sentences  
      'long': 150,      // 3-4 sentences
      'detailed': 200   // 4+ sentences
    };
    const maxTokens = maxTokensMap[selectedLength] || 100;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: maxTokens,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const suggestion = data.choices?.[0]?.message?.content?.trim() || 'Unable to generate suggestion';

    return NextResponse.json({ suggestion });
  } catch (error) {
    console.error('Error generating tweet:', error);
    return NextResponse.json(
      { error: 'Failed to generate tweet suggestion' },
      { status: 500 }
    );
  }
}