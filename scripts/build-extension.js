const fs = require('fs-extra');
const path = require('path');

async function buildExtension() {
  const distDir = path.join(__dirname, '..', 'dist');
  const extensionDir = path.join(__dirname, '..', 'extension');
  
  // Create extension directory
  await fs.ensureDir(extensionDir);
  
  // Copy Next.js build output
  if (await fs.pathExists(distDir)) {
    await fs.copy(distDir, extensionDir);
  }
  
  // Rename _next to next-static to avoid Chrome extension restrictions
  const nextDir = path.join(extensionDir, '_next');
  const nextStaticDir = path.join(extensionDir, 'next-static');
  
  if (await fs.pathExists(nextDir)) {
    // Remove existing next-static if it exists
    if (await fs.pathExists(nextStaticDir)) {
      await fs.remove(nextStaticDir);
    }
    await fs.move(nextDir, nextStaticDir);
    console.log('Renamed _next to next-static');
  }
  
  // Update all HTML files to reference next-static instead of _next
  await updateHtmlReferences(extensionDir);
  
  // Copy manifest and other extension files
  await fs.copy(
    path.join(__dirname, '..', 'public', 'manifest.json'),
    path.join(extensionDir, 'manifest.json')
  );
  
  // Copy popup JavaScript file
  if (await fs.pathExists(path.join(__dirname, '..', 'public', 'popup.js'))) {
    await fs.copy(
      path.join(__dirname, '..', 'public', 'popup.js'),
      path.join(extensionDir, 'popup.js')
    );
  }
  
  // Copy clean popup HTML file
  if (await fs.pathExists(path.join(__dirname, '..', 'public', 'popup-clean.html'))) {
    await fs.copy(
      path.join(__dirname, '..', 'public', 'popup-clean.html'),
      path.join(extensionDir, 'popup-clean.html')
    );
  }
  
  // Copy icons
  if (await fs.pathExists(path.join(__dirname, '..', 'public', 'icons'))) {
    await fs.copy(
      path.join(__dirname, '..', 'public', 'icons'),
      path.join(extensionDir, 'icons')
    );
  }
  
  // Copy extension scripts
  const extensionScriptsDir = path.join(__dirname, '..', 'extension-scripts');
  if (await fs.pathExists(extensionScriptsDir)) {
    const files = await fs.readdir(extensionScriptsDir);
    for (const file of files) {
      await fs.copy(
        path.join(extensionScriptsDir, file),
        path.join(extensionDir, file)
      );
    }
  }
  
  console.log('Extension built successfully in ./extension directory');
}

async function updateHtmlReferences(dir) {
  const files = await fs.readdir(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = await fs.stat(filePath);
    
    if (stat.isDirectory()) {
      await updateHtmlReferences(filePath);
    } else if (file.endsWith('.html')) {
      let content = await fs.readFile(filePath, 'utf8');
      content = content.replace(/_next\//g, 'next-static/');
      await fs.writeFile(filePath, content);
    }
  }
}

buildExtension().catch(console.error);