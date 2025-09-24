import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { originalTweet, currentText, apiKey } = await request.json();

    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key is required' },
        { status: 400 }
      );
    }

    // For now, we'll use OpenAI's REST API directly
    const prompt = originalTweet 
      ? `You are a helpful AI assistant that helps craft engaging Twitter replies. 
         
         Original tweet: "${originalTweet}"
         Current draft: "${currentText || 'No draft yet'}"
         
         Generate a thoughtful, engaging reply that:
         - Is relevant to the original tweet
         - Adds value to the conversation
         - Is concise (under 280 characters)
         - Has a friendly, conversational tone
         - Avoids controversial topics
         
         Return only the tweet text, no explanations or quotes.`
      : `You are a helpful AI assistant that helps improve Twitter posts.
         
         Current draft: "${currentText || 'No draft yet'}"
         
         Help improve this tweet by making it:
         - More engaging and clear
         - Concise (under 280 characters)
         - Compelling and interesting
         - Appropriate for a general audience
         
         Return only the improved tweet text, no explanations or quotes.`;

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
        max_tokens: 100,
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