const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'client', 'src', 'pages', 'Projects.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// The prompt specifically asks:
// 1. Switch table to a standard data-grid look (plain rows, hover states, proper column alignment).
// 2. Map "High Risk" and "Critical" tags to flat `--danger-tint` with `--danger` text.

const replacements = [
  // Typography
  [/text-slate-[123]00/g, 'text-text-primary'],
  [/text-slate-[45]00/g, 'text-text-secondary'],
  [/text-slate-[67]00/g, 'text-text-muted'],
  
  // Backgrounds & Borders
  [/bg-slate-950\/40/g, 'bg-surface-sunken'],
  [/bg-slate-950/g, 'bg-surface-sunken'],
  [/bg-slate-900\/50/g, 'bg-surface-sunken'],
  [/bg-slate-900\/40/g, 'bg-surface-sunken'],
  [/bg-slate-900\/25/g, 'bg-surface-card hover:bg-surface-sunken'],
  [/bg-slate-900/g, 'bg-surface-card'],
  [/bg-slate-800/g, 'bg-surface-sunken'],
  [/border-slate-900\/50/g, 'border-border'],
  [/border-slate-900/g, 'border-border'],
  [/border-slate-800\/60/g, 'border-border'],
  [/border-slate-800/g, 'border-border'],
  [/border-slate-700/g, 'border-border-strong'],
  
  // Brand colors
  [/text-blue-[45]00/g, 'text-brand'],
  [/bg-blue-600\/10/g, 'bg-brand-tint'],
  [/bg-blue-600\/5/g, 'bg-brand-tint'],
  [/bg-blue-600/g, 'bg-brand text-white'],
  [/bg-blue-500\/10/g, 'bg-brand-tint'],
  [/bg-blue-500\/15/g, 'bg-brand-tint'],
  [/border-blue-500\/20/g, 'border-brand/20'],
  [/border-blue-500\/25/g, 'border-brand/20'],
  [/border-blue-500\/10/g, 'border-brand/20'],
  [/hover:text-blue-400/g, 'hover:text-brand'],
  [/hover:bg-blue-500/g, 'hover:bg-brand-hover'],

  // High Risk & Critical tags mapping in health score (line 492-493)
  [/bg-orange-500\/10 text-orange-400 border-orange-500\/20/g, 'bg-danger-tint text-danger border-danger/20'],
  [/bg-red-500\/10 text-red-400 border-red-500\/20/g, 'bg-danger-tint text-danger border-danger/20'],
  [/text-orange-500 border-orange-500\/20/g, 'text-danger border-danger/20'],
  [/text-red-500 border-red-500\/20/g, 'text-danger border-danger/20'],

  // Data grid table look
  [/divide-y divide-slate-900\/50/g, 'divide-y divide-border'],
  [/border-b border-slate-900/g, 'border-b border-border'],
  [/<table className="w-full text-left border-collapse">/g, '<table className="w-full text-left border-collapse border border-border bg-surface-card rounded-md overflow-hidden shadow-card">'],
  [/<thead[^>]*>/g, '<thead className="bg-surface-sunken">'],
  [/<th className="pb-3/g, '<th className="p-3 text-text-secondary'],
  [/<td className="py-4/g, '<td className="p-3'],

  // Shadows
  [/shadow-\[0_4px_15px_rgba\(59,130,246,0\.25\)\]/g, 'shadow-card'],
];

replacements.forEach(([pattern, replacement]) => {
  content = content.replace(pattern, replacement);
});

// Write it back
fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully updated Projects.tsx styles');
