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

  // Parse structured response if it contains Analysis and Response sections
  let formattedContent = aiResponse;
  if (aiResponse.includes('**Analysis:**') && aiResponse.includes('**Response:**')) {
    const parts = aiResponse.split('**Response:**');
    const analysisSection = parts[0].replace('**Analysis:**', '').trim();
    const responseSection = parts[1].trim();
    
    formattedContent = `
      <div style="margin-bottom: 20px;">
        <div style="font-weight: bold; color: #1d9bf0; margin-bottom: 8px; font-size: 14px;">📊 Analysis:</div>
        <div style="line-height: 1.5; color: #333; background: #f8f9fa; padding: 12px; border-radius: 8px; border-left: 3px solid #1d9bf0;">${analysisSection}</div>
      </div>
      <div style="margin-bottom: 20px;">
        <div style="font-weight: bold; color: #10a37f; margin-bottom: 8px; font-size: 14px;">💬 Response:</div>
        <div style="line-height: 1.5; color: #333; background: #f0fdf4; padding: 12px; border-radius: 8px; border-left: 3px solid #10a37f;">${responseSection}</div>
      </div>
    `;
  } else {
    formattedContent = `<div style="margin-bottom: 20px; line-height: 1.5; color: #333;">${aiResponse}</div>`;
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
    border: 1px solid #e1e8ed !important;
    border-radius: 16px !important;
    padding: 24px !important;
    box-shadow: 0 8px 32px rgba(0,0,0,0.12) !important;
    z-index: 10000 !important;
    max-width: 550px !important;
    max-height: 500px !important;
    overflow-y: auto !important;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
  `;
  
  popup.innerHTML = `
    <div style="margin-bottom: 20px; font-weight: bold; color: #1d9bf0; font-size: 18px; display: flex; align-items: center; gap: 8px;">
      🤖 AI Assistant
    </div>
    ${formattedContent}
    <div style="display: flex; gap: 12px; justify-content: flex-end; border-top: 1px solid #e1e8ed; padding-top: 16px; margin-top: 16px;">
      <button class="copy-response" style="background: #1d9bf0; color: white; border: none; border-radius: 8px; padding: 10px 20px; cursor: pointer; font-size: 14px; font-weight: 500; transition: background 0.2s;">Copy Response</button>
      <button class="copy-analysis" style="background: #10a37f; color: white; border: none; border-radius: 8px; padding: 10px 20px; cursor: pointer; font-size: 14px; font-weight: 500; transition: background 0.2s; display: none;">Copy Analysis</button>
      <button class="close-response" style="background: #f1f3f4; color: #5f6368; border: none; border-radius: 8px; padding: 10px 20px; cursor: pointer; font-size: 14px; font-weight: 500; transition: background 0.2s;">Close</button>
    </div>
  `;
  
  document.body.appendChild(popup);
  
  // Add event listeners
  const copyResponseBtn = popup.querySelector('.copy-response');
  const copyAnalysisBtn = popup.querySelector('.copy-analysis');
  const closeBtn = popup.querySelector('.close-response');
  
  // If we have structured content, show the copy analysis button and handle separate copying
  if (aiResponse.includes('**Analysis:**') && aiResponse.includes('**Response:**')) {
    const parts = aiResponse.split('**Response:**');
    const analysisText = parts[0].replace('**Analysis:**', '').trim();
    const responseText = parts[1].trim();
    
    copyAnalysisBtn.style.display = 'block';
    
    copyResponseBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(responseText).then(() => {
        showNotification('Response copied to clipboard!');
      });
    });
    
    copyAnalysisBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(analysisText).then(() => {
        showNotification('Analysis copied to clipboard!');
      });
    });
  } else {
    copyResponseBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(aiResponse).then(() => {
        showNotification('AI response copied to clipboard!');
      });
    });
  }
  
  closeBtn.addEventListener('click', () => {
    popup.remove();
  });
  
  // Add hover effects
  copyResponseBtn.addEventListener('mouseenter', () => {
    copyResponseBtn.style.background = '#1a8cd8';
  });
  copyResponseBtn.addEventListener('mouseleave', () => {
    copyResponseBtn.style.background = '#1d9bf0';
  });
  
  if (copyAnalysisBtn.style.display === 'block') {
    copyAnalysisBtn.addEventListener('mouseenter', () => {
      copyAnalysisBtn.style.background = '#0f9970';
    });
    copyAnalysisBtn.addEventListener('mouseleave', () => {
      copyAnalysisBtn.style.background = '#10a37f';
    });
  }
  
  closeBtn.addEventListener('mouseenter', () => {
    closeBtn.style.background = '#e8eaed';
  });
  closeBtn.addEventListener('mouseleave', () => {
    closeBtn.style.background = '#f1f3f4';
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