// Popup JavaScript for AI Tweet Helper Extension

// Elements
const settingsToggle = document.getElementById('settingsToggle');
const mainView = document.getElementById('mainView');
const settingsView = document.getElementById('settingsView');
const statusBadge = document.getElementById('statusBadge');
const saveBtn = document.getElementById('saveBtn');
const testBtn = document.getElementById('testBtn');
const backBtn = document.getElementById('backBtn');
const messageDiv = document.getElementById('message');

// Event listeners
function initializeEventListeners() {
    if (settingsToggle) settingsToggle.addEventListener('click', showSettings);
    if (backBtn) backBtn.addEventListener('click', showMain);
    if (saveBtn) saveBtn.addEventListener('click', saveSettings);
    if (testBtn) testBtn.addEventListener('click', testAPI);
}

function showSettings() {
    if (mainView) mainView.style.display = 'none';
    if (settingsView) settingsView.style.display = 'block';
    loadSettings();
}

function showMain() {
    if (settingsView) settingsView.style.display = 'none';
    if (mainView) mainView.style.display = 'block';
    updateStatus();
}

function loadSettings() {
    chrome.storage.sync.get(['apiKey', 'model', 'enabled'], (result) => {
        const apiKeyInput = document.getElementById('apiKey');
        const modelSelect = document.getElementById('model');
        const enabledCheckbox = document.getElementById('enabled');
        
        if (apiKeyInput) apiKeyInput.value = result.apiKey || '';
        if (modelSelect) modelSelect.value = result.model || 'gpt-3.5-turbo';
        if (enabledCheckbox) enabledCheckbox.checked = result.enabled !== false;
    });
}

function saveSettings() {
    const apiKeyInput = document.getElementById('apiKey');
    const modelSelect = document.getElementById('model');
    const enabledCheckbox = document.getElementById('enabled');
    
    if (!apiKeyInput || !modelSelect || !enabledCheckbox) return;
    
    const apiKey = apiKeyInput.value.trim();
    const model = modelSelect.value;
    const enabled = enabledCheckbox.checked;

    if (!apiKey || !apiKey.startsWith('sk-')) {
        showMessage('Please enter a valid OpenAI API key', 'error');
        return;
    }

    chrome.storage.sync.set({ apiKey, model, enabled }, () => {
        showMessage('Settings saved successfully!', 'success');
        setTimeout(showMain, 1500);
    });
}

async function testAPI() {
    const apiKeyInput = document.getElementById('apiKey');
    if (!apiKeyInput) return;
    
    const apiKey = apiKeyInput.value.trim();
    if (!apiKey) {
        showMessage('Please enter your API key first', 'error');
        return;
    }

    showMessage('Testing API connection...', 'info');
    
    try {
        const response = await fetch('https://api.openai.com/v1/models', {
            headers: { 'Authorization': `Bearer ${apiKey}` }
        });

        if (response.ok) {
            showMessage('✅ API key is valid!', 'success');
        } else {
            showMessage('❌ Invalid API key', 'error');
        }
    } catch (error) {
        showMessage('❌ Connection failed', 'error');
        console.error('API test error:', error);
    }
}

function showMessage(text, type) {
    if (!messageDiv) return;
    
    messageDiv.textContent = text;
    messageDiv.style.display = 'block';
    messageDiv.style.background = type === 'success' ? '#d4edda' : 
                                type === 'error' ? '#f8d7da' : '#d1ecf1';
    messageDiv.style.color = type === 'success' ? '#155724' : 
                           type === 'error' ? '#721c24' : '#0c5460';
}

function updateStatus() {
    chrome.storage.sync.get(['apiKey', 'enabled'], (result) => {
        if (!statusBadge) return;
        
        const hasKey = result.apiKey && result.apiKey.length > 0;
        const isEnabled = result.enabled !== false;
        
        if (hasKey && isEnabled) {
            statusBadge.innerHTML = '✅ Ready to use';
            statusBadge.style.color = 'green';
        } else if (!hasKey) {
            statusBadge.innerHTML = '⚠️ No API key set';
            statusBadge.style.color = 'orange';
        } else {
            statusBadge.innerHTML = '⏸️ Disabled';
            statusBadge.style.color = 'red';
        }
    });
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initializeEventListeners();
    updateStatus();
});