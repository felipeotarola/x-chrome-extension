# Creating Extension Icons

If you want to add custom icons to your extension, you'll need to create PNG files in the following sizes:

## Required Icon Sizes:
- **16x16 pixels** - Shows in the extension toolbar
- **48x48 pixels** - Shows in the extension management page  
- **128x128 pixels** - Shows in the Chrome Web Store

## Quick Way to Create Icons:

### Option 1: Online Icon Generators
- Use [favicon.io](https://favicon.io/favicon-generator/) to generate icons from text or emoji
- Use the 🤖 emoji or "AI" text
- Download and rename the files to `icon16.png`, `icon48.png`, `icon128.png`

### Option 2: Use Any Image Editor
- Create a simple design with the 🤖 emoji or "AI" text
- Export in the required sizes
- Save as PNG files

### Option 3: Use Existing Images
- Find a robot/AI themed icon online (make sure it's license-free)
- Resize to the required dimensions

## To Add Icons Back:
1. Place the PNG files in `public/icons/`
2. Update the manifest.json to include the icon references
3. Run `npm run build:extension`

For now, the extension works perfectly without custom icons - Chrome will show a default placeholder.