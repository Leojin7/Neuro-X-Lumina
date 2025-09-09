const fs = require('fs');
const path = require('path');
// Function to remove comments from file content
function removeComments(content) {
  // Remove single-line comments (//...)
  content = content.replace(/\/\*[\s\S]*?\*\/|([^\\:]\/\/).*?$/gm, '');
  // Remove multi-line comments ()
  content = content.replace(/\/\*[\s\S]*?\*\//g, '');
  // Remove empty lines left after comment removal
  content = content.replace(/^\s*[\r\n]/gm, '');
  return content;
}
// Function to process all files in a directory
function processDirectory(directory) {
  const files = fs.readdirSync(directory);
  files.forEach(file => {
    const fullPath = path.join(directory, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      // Skip node_modules and .git directories
      if (file === 'node_modules' || file === '.git' || file === '.next' || file === 'dist' || file === 'build') {
        return;
      }
      processDirectory(fullPath);
    } else if (/\.(js|jsx|ts|tsx)$/.test(file)) {
      try {
        let content = fs.readFileSync(fullPath, 'utf8');
        const newContent = removeComments(content);
        if (content !== newContent) {
          fs.writeFileSync(fullPath, newContent, 'utf8');
          console.log(`Processed: ${fullPath}`);
        }
      } catch (error) {
        console.error(`Error processing ${fullPath}:`, error);
      }
    }
  });
}
// Start processing from the current directory
const rootDir = __dirname;
console.log('Starting to remove comments from files...');
processDirectory(rootDir);
console.log('Comment removal complete!');
