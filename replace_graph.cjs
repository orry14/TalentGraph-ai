const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'client', 'src', 'components', 'OrgTwinWorkspace.tsx');
let content = fs.readFileSync(filePath, 'utf8');

const replacements = [
  // 1. Remove cosmic background and use off-white grid
  [/<Background color="#1e293b" gap=\{20\} size=\{1\} \/>/g, '<Background color="var(--border)" gap={20} size={1} />'],
  [/<Background color="#1e293b"/g, '<Background color="var(--border)"'],

  // 2. Node colors in MiniMap
  [/if \(node\.id\.startsWith\('sim'\)\) return '#ea580c';/g, "if (node.id.startsWith('sim')) return 'var(--danger)';"],
  [/if \(node\.id\.startsWith\('skill'\)\) return '#8b5cf6';/g, "if (node.id.startsWith('skill')) return 'var(--success)';"],
  [/if \(node\.id\.startsWith\('proj'\)\) return '#10b981';/g, "if (node.id.startsWith('proj')) return 'var(--brand)';"],
  [/return '#3b82f6';/g, "return 'var(--brand)';"],
  [/maskColor="rgba\(3, 7, 18, 0\.7\)"/g, 'maskColor="rgba(255, 255, 255, 0.7)"'],
  [/background: 'rgba\(15, 23, 42, 0\.9\)'/g, "background: 'var(--surface-card)'"],
  [/border: '1px solid rgba\(255, 255, 255, 0\.08\)'/g, "border: '1px solid var(--border)'"],

  // 3. Node Styles (twinGraph, kgGraph, skillsGraph)
  [/background: 'rgba\(15, 23, 42, 0\.95\)'/g, "background: 'var(--surface-card)'"],
  [/color: '#f8fafc'/g, "color: 'var(--text-primary)'"],
  // High risk / broken link red -> danger
  [/rgba\(239, 68, 68, 0\.8\)/g, 'var(--danger)'],
  [/0 0 15px rgba\(239, 68, 68, 0\.25\)/g, '0 0 0 4px var(--danger-tint)'], // subtle danger halo
  // Normal border / shadow
  [/rgba\(59, 130, 246, 0\.4\)/g, 'var(--border-strong)'],
  [/0 4px 15px rgba\(59, 130, 246, 0\.08\)/g, 'var(--shadow-card)'],
  [/rgba\(139, 92, 246, 0\.4\)/g, 'var(--success)'], // Skill node border -> success
  [/rgba\(139, 92, 246, 0\.05\)/g, 'var(--shadow-card)'], // Skill node shadow
  [/rgba\(16, 185, 129, 0\.4\)/g, 'var(--brand)'], // Project node border -> brand
  [/rgba\(16, 185, 129, 0\.05\)/g, 'var(--shadow-card)'], // Project node shadow
  [/rgba\(245, 158, 11, 0\.4\)/g, 'var(--ai-accent)'], // Client node border
  [/rgba\(245, 158, 11, 0\.05\)/g, 'var(--shadow-card)'],
  
  // Edge styles
  [/'#ef4444'/g, "'var(--danger)'"],
  [/stroke: 'rgba\(255, 255, 255, 0\.15\)'/g, "stroke: 'var(--border-strong)'"],
  [/stroke: 'rgba\(255, 255, 255, 0\.1\)'/g, "stroke: 'var(--border-strong)'"],

  // Labels and typography within nodes
  [/text-slate-100/g, 'text-text-primary'],
  [/text-slate-200/g, 'text-text-primary'],
  [/text-slate-300/g, 'text-text-primary'],
  [/text-slate-400/g, 'text-text-secondary'],
  [/text-slate-500/g, 'text-text-muted'],
  [/text-slate-600/g, 'text-text-muted'],
  [/text-slate-800/g, 'text-border'],
  [/text-blue-400/g, 'text-brand'],
  [/text-orange-400/g, 'text-ai-accent'],
  [/text-indigo-400/g, 'text-brand'],

  // Background and borders of side panels
  [/bg-slate-950\/80/g, 'bg-surface-card'],
  [/bg-slate-950/g, 'bg-surface-sunken'],
  [/bg-slate-900/g, 'bg-surface-card'],
  [/border-slate-800/g, 'border-border'],
  [/border-slate-900/g, 'border-border'],
  [/glass-panel/g, 'bg-surface-sunken'],
  [/border-blue-500\/10/g, 'border-border'],
  [/bg-blue-600/g, 'bg-brand'],
  [/bg-blue-500\/5/g, 'bg-brand-tint'],
  [/border-blue-500\/20/g, 'border-brand/20'],
  [/bg-orange-500\/10/g, 'bg-ai-tint'],
  [/border-orange-500\/20/g, 'border-ai-accent/20'],
  [/bg-emerald-500\/10/g, 'bg-success-tint'],
  [/border-emerald-500\/20/g, 'border-success/20'],
  [/text-emerald-400/g, 'text-success'],
  [/bg-red-600\/20/g, 'bg-danger-tint'],
  [/border-red-500\/30/g, 'border-danger/20'],
  [/text-red-400/g, 'text-danger'],
  [/bg-blue-600\/20/g, 'bg-brand-tint'],
  [/border-blue-500\/30/g, 'border-brand/20'],
  [/bg-orange-600\/20/g, 'bg-ai-tint'],
  [/border-orange-500\/30/g, 'border-ai-accent/20'],
  [/bg-indigo-600/g, 'bg-brand'],
  [/hover:bg-indigo-500/g, 'hover:bg-brand-hover'],

  // Specific graph viewport border
  [/glass-panel rounded-3xl overflow-hidden relative border border-slate-900/g, 'bg-surface-sunken rounded-md overflow-hidden relative border border-border shadow-inner'],
];

replacements.forEach(([pattern, replacement]) => {
  content = content.replace(pattern, replacement);
});

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully updated OrgTwinWorkspace.tsx styles');
