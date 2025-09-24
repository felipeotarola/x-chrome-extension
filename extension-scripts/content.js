// Content script that will be executed when Ctrl+Shift+H is pressed
// This script finds tweets and adds AI help buttons to them

function generateAIHelp() {
  console.log('AI Helper activated! Looking for tweets...');
  
  // Remove any existing AI helper buttons to avoid duplicates
  const existingButtons = document.querySelectorAll('.ai-helper-button');
  existingButtons.forEach(button => button.remove());
  
  // Find all tweets on the page
  const tweets = document.querySelectorAll('[data-testid="tweet"]');
  console.log(`Found ${tweets.length} tweets`);
  
  if (tweets.length === 0) {
    // Show a notification if no tweets found
    showNotification('No tweets found on this page. Try navigating to a Twitter feed or conversation.');
    return;
  }
  
  let buttonsAdded = 0;
  
  tweets.forEach((tweet, index) => {
    try {
      // Skip if this tweet already has an AI helper button
      if (tweet.querySelector('.ai-helper-button')) {
        return;
      }
      
      // Get the tweet text
      const tweetTextElement = tweet.querySelector('[data-testid="tweetText"]');
      if (!tweetTextElement) {
        return;
      }
      
      const tweetText = tweetTextElement.textContent;
      
      // Create AI helper button
      const button = createAIButton(tweetText, tweet);
      
      // Find a good place to insert the button (near the reply/retweet/like buttons)
      const actionBar = tweet.querySelector('[role="group"]');
      if (actionBar) {
        actionBar.style.position = 'relative';
        actionBar.appendChild(button);
        buttonsAdded++;
      }
    } catch (error) {
      console.error('Error processing tweet:', error);
    }
  });
  
  showNotification(`Added AI help buttons to ${buttonsAdded} tweets. Click any button to get AI assistance!`);
}

function createAIButton(tweetText, tweetElement) {
  const button = document.createElement('button');
  button.className = 'ai-helper-button';
  button.innerHTML = '🤖 AI Help';
  
  // Apply styles directly to avoid shadow DOM issues
  button.style.cssText = `
    position: absolute !important;
    top: -35px !important;
    right: 0 !important;
    background: #1d9bf0 !important;
    color: white !important;
    border: none !important;
    border-radius: 15px !important;
    padding: 5px 10px !important;
    font-size: 12px !important;
    cursor: pointer !important;
    z-index: 9999 !important;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
    font-weight: 500 !important;
    transition: all 0.2s ease !important;
  `;
  
  // Add hover effect
  button.addEventListener('mouseenter', () => {
    button.style.background = '#1a8cd8 !important';
    button.style.transform = 'scale(1.05) !important';
  });
  
  button.addEventListener('mouseleave', () => {
    button.style.background = '#1d9bf0 !important';
    button.style.transform = 'scale(1) !important';
  });
  
  button.addEventListener('click', (e) => {
    e.stopPropagation();
    e.preventDefault();
    handleAIClick(tweetText, tweetElement, button);
  });
  
  return button;
}

function handleAIClick(tweetText, tweetElement, button) {
  // Disable the button temporarily
  button.innerHTML = '⏳ Generating...';
  button.disabled = true;
  
  // Get additional context
  const authorElement = tweetElement.querySelector('[data-testid="User-Name"]');
  const author = authorElement ? authorElement.textContent : 'Unknown';
  
  // Send message to background script to get AI response
  const message = {
    action: 'generateAIResponse',
    data: {
      tweetText: tweetText,
      author: author,
      context: 'Twitter conversation'
    }
  };
  
  chrome.runtime.sendMessage(message, (response) => {
    // Re-enable button
    button.innerHTML = '🤖 AI Help';
    button.disabled = false;
    
    if (response && response.success) {
      showAIResponse(response.data, tweetElement);
    } else {
      console.error('AI response error:', response?.error);
      showNotification('Sorry, there was an error generating the AI response. Please try again.');
    }
  });
}

function showAIResponse(aiResponse, tweetElement) {
  // Remove any existing response popup
  const existingPopup = document.querySelector('.ai-response-popup');
  if (existingPopup) {
    existingPopup.remove();
  }
  
  // Create response popup
  const popup = document.createElement('div');
  popup.className = 'ai-response-popup';
  popup.style.cssText = `
    position: fixed !important;
    top: 50% !important;
    left: 50% !important;
    transform: translate(-50%, -50%) !important;
    background: white !important;
    border: 1px solid #ccc !important;
    border-radius: 12px !important;
    padding: 20px !important;
    box-shadow: 0 4px 20px rgba(0,0,0,0.3) !important;
    z-index: 10000 !important;
    max-width: 500px !important;
    max-height: 400px !important;
    overflow-y: auto !important;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
  `;
  
  popup.innerHTML = `
    <div style="margin-bottom: 15px; font-weight: bold; color: #1d9bf0; font-size: 16px;">🤖 AI Assistant</div>
    <div style="margin-bottom: 20px; line-height: 1.5; white-space: pre-wrap; color: #333;">${aiResponse}</div>
    <div style="text-align: right;">
      <button class="copy-response" style="background: #1d9bf0; color: white; border: none; border-radius: 6px; padding: 8px 16px; margin-right: 10px; cursor: pointer; font-size: 14px;">Copy</button>
      <button class="close-response" style="background: #ccc; color: black; border: none; border-radius: 6px; padding: 8px 16px; cursor: pointer; font-size: 14px;">Close</button>
    </div>
  `;
  
  document.body.appendChild(popup);
  
  // Add event listeners
  popup.querySelector('.copy-response').addEventListener('click', () => {
    navigator.clipboard.writeText(aiResponse).then(() => {
      showNotification('AI response copied to clipboard!');
    });
  });
  
  popup.querySelector('.close-response').addEventListener('click', () => {
    popup.remove();
  });
  
  // Close popup when clicking outside
  setTimeout(() => {
    document.addEventListener('click', function closePopup(e) {
      if (!popup.contains(e.target)) {
        popup.remove();
        document.removeEventListener('click', closePopup);
      }
    });
  }, 100);
}

function showNotification(message) {
  // Remove any existing notification
  const existingNotification = document.querySelector('.ai-notification');
  if (existingNotification) {
    existingNotification.remove();
  }
  
  const notification = document.createElement('div');
  notification.className = 'ai-notification';
  notification.style.cssText = `
    position: fixed !important;
    top: 20px !important;
    right: 20px !important;
    background: #1d9bf0 !important;
    color: white !important;
    padding: 12px 20px !important;
    border-radius: 8px !important;
    z-index: 10001 !important;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
    font-size: 14px !important;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3) !important;
    max-width: 300px !important;
  `;
  notification.textContent = message;
  
  document.body.appendChild(notification);
  
  // Auto-remove after 4 seconds
  setTimeout(() => {
    if (notification.parentNode) {
      notification.remove();
    }
  }, 4000);
}

// Execute the main function
generateAIHelp();