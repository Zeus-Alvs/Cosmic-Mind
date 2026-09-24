const fs = require('fs');
const path = require('path');

const emojiMap = {
  '⚠️': 'AlertTriangle',
  '✔': 'Check',
  '★': 'Star',
  '▶': 'ChevronRight',
  '◀': 'ChevronLeft'
};

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  let usedIcons = new Set();
  
  for (const [emoji, component] of Object.entries(emojiMap)) {
    if (content.includes(emoji)) {
      usedIcons.add(component);
      let regex = new RegExp(emoji, 'g');
      content = content.replace(regex, `<${component} className="w-5 h-5 inline-block" />`);
    }
  }

  if (usedIcons.size > 0) {
    const importStatement = `import { ${Array.from(usedIcons).join(', ')} } from 'lucide-react';\n`;
    content = content.replace(/("use client";|'use client';)/, `$1\n${importStatement}`);
  }
  
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated emojis in: ${filePath}`);
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

walkDir(path.join(__dirname, 'src', 'app'));
