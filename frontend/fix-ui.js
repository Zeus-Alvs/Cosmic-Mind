const fs = require('fs');
const path = require('path');

const emojiMap = {
  '👑': 'Crown',
  '🪐': 'Globe',
  '⚡': 'Zap',
  '🎨': 'Palette',
  '✨': 'Sparkles',
  '💫': 'Star',
  '🛡️': 'Shield',
  '👾': 'Ghost',
  '📡': 'Radio',
  '🎮': 'Gamepad2',
  '🧠': 'Brain',
  '📊': 'BarChart',
  '📧': 'Mail',
  '🐙': 'Github',
  '🌙': 'Moon',
  '👋': 'Hand',
  '☰': 'Menu'
};

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  // 1. Remove Emojis and add lucide-react imports
  let usedIcons = new Set();
  
  // page.tsx has emojis in strings like icon: "👑"
  // we can change it to icon: <Crown className="w-5 h-5" />
  // but wait, if it's inside an object, it might need to be rendered.
  // In page.tsx: `icon: "👑"` -> `icon: <Crown className="w-5 h-5" />`
  // And the renderer: `{member.icon}` -> this will render the component if it's JSX.
  // Wait, `page.tsx` is a client component, we can use JSX in objects.

  // Let's manually replace emojis
  for (const [emoji, component] of Object.entries(emojiMap)) {
    if (content.includes(emoji)) {
      usedIcons.add(component);
      // Replace emoji with component.
      // If it's inside quotes like "👑", we might want to replace the whole string if we can, 
      // but just replacing the emoji with `<${component} className="w-5 h-5 inline-block" />` 
      // inside a string will break if it's not a JSX context.
      // Actually, regex to replace `"👑"` with `<Crown className="w-5 h-5 inline-block" />`
      let regexStr = `"${emoji}"|'${emoji}'|\`${emoji}\``;
      let regex = new RegExp(regexStr, 'g');
      content = content.replace(regex, `<${component} className="w-5 h-5 inline-block" />`);
      
      // Also replace raw emoji outside quotes (e.g., in JSX text)
      let regexRaw = new RegExp(emoji, 'g');
      content = content.replace(regexRaw, `<${component} className="w-5 h-5 inline-block" />`);
    }
  }

  // Inject import if usedIcons is not empty
  if (usedIcons.size > 0) {
    const importStatement = `import { ${Array.from(usedIcons).join(', ')} } from 'lucide-react';\n`;
    // Add after the last import, or at the top after "use client"
    if (content.includes('from "lucide-react";') || content.includes("from 'lucide-react';")) {
       // It's tricky to merge, let's just add a new import line, JS allows multiple imports from same module
       content = content.replace(/("use client";|'use client';)/, `$1\n${importStatement}`);
    } else {
       content = content.replace(/("use client";|'use client';)/, `$1\n${importStatement}`);
    }
  }

  // 2. Fix Purple colors -> Cyan/Blue
  content = content.replace(/purple/g, 'cyan');
  content = content.replace(/#AC57EB/g, '#4078A4');
  content = content.replace(/rgba\(160,80,255,/g, 'rgba(64,120,164,');
  content = content.replace(/rgba\(180,80,255,/g, 'rgba(64,120,164,');
  content = content.replace(/rgba\(80, 60, 180,/g, 'rgba(64,120,164,');
  content = content.replace(/rgba\(120, 100, 220,/g, 'rgba(64,120,164,');
  content = content.replace(/rgba\(100, 80, 200,/g, 'rgba(64,120,164,');
  content = content.replace(/rgba\(80, 30, 160,/g, 'rgba(64,120,164,');
  content = content.replace(/rgba\(130, 60, 220,/g, 'rgba(64,120,164,');

  // 3. Fix Gradients (Rule: NEVER use gradients unless explicitly requested)
  // bg-gradient-to-r, bg-gradient-to-br, bg-gradient-to-tr, bg-gradient-to-b
  content = content.replace(/bg-gradient-to-[a-z]{1,2}/g, 'bg-[#4078A4]');
  // Remove from-... via-... to-...
  content = content.replace(/from-\[[^\]]+\]|from-[a-z]+-\d+/g, '');
  content = content.replace(/via-\[[^\]]+\]|via-[a-z]+-\d+/g, '');
  content = content.replace(/to-\[[^\]]+\]|to-[a-z]+-\d+/g, '');

  // 4. Fix Fonts
  content = content.replace(/'Cormorant Garamond', serif/g, "'Raleway', sans-serif");
  
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated: ${filePath}`);
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
