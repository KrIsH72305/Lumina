const fs = require('fs');
const path = require('path');

function walk(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const stat = fs.statSync(path.join(dir, file));
    if (stat.isDirectory()) {
      if (file !== 'node_modules' && file !== '.next') {
        walk(path.join(dir, file), fileList);
      }
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      fileList.push(path.join(dir, file));
    }
  }
  return fileList;
}

const targetDirs = [
  path.join(__dirname, '../src/app'),
  path.join(__dirname, '../src/components/employee'),
  path.join(__dirname, '../src/components/manager'),
  path.join(__dirname, '../src/components/admin')
];

let files = [];
for (const dir of targetDirs) {
  if (fs.existsSync(dir)) {
    files = files.concat(walk(dir));
  }
}

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;
  
  content = content.replace(/\bbg-slate-50\/50\b(?!\s+dark:bg-slate-950\/50)/g, 'bg-slate-50/50 dark:bg-slate-950/50');
  content = content.replace(/\bbg-slate-50\b(?!\/)(?!\s+dark:bg-slate-950)/g, 'bg-slate-50 dark:bg-slate-950');
  content = content.replace(/\btext-slate-900\b(?!\s+dark:text-slate-100)/g, 'text-slate-900 dark:text-slate-100');
  content = content.replace(/\btext-slate-800\b(?!\s+dark:text-slate-200)/g, 'text-slate-800 dark:text-slate-200');
  content = content.replace(/\btext-slate-700\b(?!\s+dark:text-slate-300)/g, 'text-slate-700 dark:text-slate-300');
  content = content.replace(/\btext-slate-600\b(?!\s+dark:text-slate-400)/g, 'text-slate-600 dark:text-slate-400');
  content = content.replace(/\bbg-white\b(?!\/)(?!\s+dark:bg-slate-900)(?!\s+dark:bg-slate-950)/g, 'bg-white dark:bg-slate-900');
  content = content.replace(/\bborder-slate-200\b(?!\s+dark:border-slate-800)/g, 'border-slate-200 dark:border-slate-800');
  content = content.replace(/\bborder-slate-100\b(?!\s+dark:border-slate-800)/g, 'border-slate-100 dark:border-slate-800');
  content = content.replace(/\bbg-slate-100\b(?!\/)(?!\s+dark:bg-slate-800)/g, 'bg-slate-100 dark:bg-slate-800');
  content = content.replace(/\bbg-slate-50\b/g, 'bg-slate-50 dark:bg-slate-950'); // Safe fallback if previous failed
  
  // Cleanup duplicates that might have happened
  content = content.replace(/dark:bg-slate-950 dark:bg-slate-950/g, 'dark:bg-slate-950');
  content = content.replace(/dark:bg-slate-900 dark:bg-slate-900/g, 'dark:bg-slate-900');
  
  if (content !== originalContent) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated ${file}`);
  }
}
console.log('Done.');
