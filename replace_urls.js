const fs = require('fs');
const path = require('path');

function walk(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    const dirPath = path.join(dir, f);
    const isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walk(dirPath, callback) : callback(path.join(dir, f));
  });
}

walk(path.join(__dirname, 'frontend/src'), (filePath) => {
  if (filePath.endsWith('.jsx')) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Check if the file contains localhost:5000
    if (content.includes('http://localhost:5000')) {
      // Add import at the top
      if (!content.includes('import { API_BASE_URL }')) {
        // Find relative path to config.js
        const relativePath = path.relative(path.dirname(filePath), path.join(__dirname, 'frontend/src/config.js')).replace(/\\/g, '/');
        const importPath = relativePath.startsWith('.') ? relativePath : `./${relativePath}`;
        
        // Insert import statement after other imports
        const lines = content.split('\n');
        const lastImportIndex = lines.findLastIndex(line => line.startsWith('import '));
        if (lastImportIndex !== -1) {
          lines.splice(lastImportIndex + 1, 0, `import { API_BASE_URL } from '${importPath.replace('.js', '')}';`);
        } else {
          lines.unshift(`import { API_BASE_URL } from '${importPath.replace('.js', '')}';`);
        }
        content = lines.join('\n');
      }

      // Replace literal string 'http://localhost:5000/...' with `${API_BASE_URL}/...`
      content = content.replace(/'http:\/\/localhost:5000([^']*)'/g, '`${API_BASE_URL}$1`');
      content = content.replace(/"http:\/\/localhost:5000([^"]*)"/g, '`${API_BASE_URL}$1`');
      
      // Replace template literals `http://localhost:5000/...` with `${API_BASE_URL}/...`
      content = content.replace(/`http:\/\/localhost:5000([^`]*)`/g, '`${API_BASE_URL}$1`');

      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Updated ${filePath}`);
    }
  }
});
