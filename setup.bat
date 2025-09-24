@echo off
echo Setting up AI Tweet Helper Chrome Extension...
echo.

echo 1. Installing dependencies...
call npm install

echo.
echo 2. Building extension...
call npm run build

echo.
echo 3. Setup complete!
echo.
echo Next steps:
echo 1. Open Chrome and go to chrome://extensions/
echo 2. Enable "Developer mode" (toggle in top right)
echo 3. Click "Load unpacked" and select the "extension" folder
echo 4. Click the extension icon and set up your OpenAI API key
echo.
echo The extension is now ready to use on Twitter/X!
pause