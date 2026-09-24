const fs = require('fs');
const path = require('path');

const targetStr = '<div className="fixed top-0 left-0 md:left-64 right-0 h-1.5 bg-[#4078A4] z-50" />';

// variations we want to catch (regex)
const regex1 = /<div\s+className="fixed\s+top-0\s+left-0\s+(md:left-0\s+)?md:left-64\s+right-0\s+h-\d\s+bg-\[#4078A4\]\s*z-50"\s*\/>/g;
const regex2 = /<div\s+className="\s*fixed\s+top-0\s+h-\d\s+z-50\s*left-0\s+right-0\s+md:left-64\s*bg-\[#4078A4\]\s*"\s*\/>/g;

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  content = content.replace(regex1, targetStr);
  content = content.replace(regex2, targetStr);
  
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated top line in: ${filePath}`);
  }
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walkDir(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      processFile(fullPath);
    }
  }
}

walkDir(path.join(__dirname, 'src', 'app', '(dashboard)'));
