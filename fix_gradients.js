const fs = require('fs');
const path = require('path');

// Gradient replacements
const replacements = [
  // Gradient backgrounds
  { regex: /bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500/g, replacement: 'text-white' },
  { regex: /bg-gradient-to-r from-blue-400 to-purple-400/g, replacement: 'text-white' },
  { regex: /bg-gradient-to-r from-purple-500 to-pink-500/g, replacement: 'bg-black' },
  { regex: /bg-gradient-to-r from-blue-600 to-purple-600/g, replacement: 'bg-black' },
  { regex: /bg-gradient-to-r from-orange-600 to-red-600/g, replacement: 'bg-gray-700' },
  { regex: /bg-gradient-to-r from-purple-600 to-pink-600/g, replacement: 'bg-black' },
  { regex: /bg-gradient-to-r from-blue-500 to-purple-500/g, replacement: 'bg-gray-800' },
  { regex: /bg-gradient-to-r from-purple-500/g, replacement: 'bg-gray-800' },
  { regex: /bg-gradient-to-br from-gray-800 to-gray-900/g, replacement: 'bg-gray-800' },
  { regex: /bg-gradient-to-br from-black via-gray-950 to-black/g, replacement: 'bg-black' },
  { regex: /bg-gradient-to-b from-black via-gray-900 to-black/g, replacement: 'bg-black' },
  { regex: /bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900/g, replacement: 'bg-black' },
  { regex: /bg-gradient-to-r from-purple-900\/50 to-pink-900\/50/g, replacement: 'bg-gray-800' },
  { regex: /bg-gradient-to-r from-purple-500\/20 to-pink-500\/20/g, replacement: 'bg-gray-800' },
  { regex: /bg-gradient-to-br from-purple-900\/20 to-pink-900\/20/g, replacement: 'bg-gray-800' },
  { regex: /bg-gradient-to-br from-purple-900\/30 to-pink-900\/30/g, replacement: 'bg-gray-800' },
  { regex: /bg-gradient-to-r from-blue-500\/20 to-purple-500\/20/g, replacement: 'bg-gray-800' },
  { regex: /bg-gradient-to-r from-purple-600\/20 to-pink-600\/20/g, replacement: 'bg-gray-800' },
  { regex: /bg-gradient-to-br from-purple-900\/60 to-pink-900\/60/g, replacement: 'bg-gray-800' },
  { regex: /bg-gradient-to-r from-blue-900\/50 to-purple-900\/50/g, replacement: 'bg-gray-800' },
  { regex: /absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur-lg opacity-75/g, replacement: 'hidden' },
  { regex: /bg-gradient-to-tr from-blue-500 to-purple-500/g, replacement: 'bg-gray-700' },
  
  // Text gradient clip
  { regex: /bg-clip-text text-transparent/g, replacement: '' },
  
  // Hover states
  { regex: /hover:border-purple-500/g, replacement: 'hover:border-gray-500' },
  { regex: /hover:from-purple-600/g, replacement: 'hover:bg-gray-700' },
  { regex: /hover:to-pink-600/g, replacement: '' },
  { regex: /hover:from-purple-700/g, replacement: 'hover:bg-gray-700' },
  { regex: /hover:to-pink-700/g, replacement: '' },
  { regex: /hover:from-orange-700/g, replacement: 'hover:bg-gray-600' },
  { regex: /hover:to-red-700/g, replacement: '' },
  { regex: /hover:from-blue-700/g, replacement: 'hover:bg-gray-700' },
  { regex: /hover:from-blue-600/g, replacement: 'hover:bg-gray-700' },
];

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
      walkDir(filePath);
    } else if ((file.endsWith('.tsx') || file.endsWith('.ts')) && !file.endsWith('.test.ts')) {
      try {
        let content = fs.readFileSync(filePath, 'utf8');
        let modified = false;
        
        replacements.forEach(({ regex, replacement }) => {
          if (regex.test(content)) {
            content = content.replace(regex, replacement);
            modified = true;
          }
        });
        
        if (modified) {
          fs.writeFileSync(filePath, content, 'utf8');
          console.log(`✓ Fixed: ${filePath}`);
        }
      } catch (err) {
        console.error(`Error processing ${filePath}:`, err.message);
      }
    }
  });
}

console.log('Starting gradient fixes...\n');
walkDir('app');
walkDir('components');
console.log('\nGradient fixes complete!');
