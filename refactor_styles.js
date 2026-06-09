const fs = require('fs');

let content = fs.readFileSync('build.js', 'utf8');

// Replacements map
const replacements = [
    { regex: /color:\s*#fff(?:fff)?/g, replacement: 'color: var(--text-bright)' },
    { regex: /background:\s*rgba\(255,\s*255,\s*255,\s*0\.03\)/g, replacement: 'background: var(--card-bg)' },
    { regex: /rgba\(255,\s*255,\s*255,\s*0\.05\)/g, replacement: 'var(--border-dim)' },
    { regex: /rgba\(255,\s*255,\s*255,\s*0\.1\)/g, replacement: 'var(--border-med)' },
    { regex: /rgba\(0,\s*0,\s*0,\s*0\.2\)/g, replacement: 'var(--bg-dark-overlay)' }
];

replacements.forEach(r => {
    content = content.replace(r.regex, r.replacement);
});

// Update CSS Variables in the stylesheet block
const cssVarRegex = /:root\s*\{([^}]+)\}/;
const newVars = `:root {
        --primary: #3b82f6;
        --success: #10b981;
        --warning: #f59e0b;
        --danger: #ef4444;
        --bg-dark: #0b0e14;
        --glass-bg: rgba(15, 23, 42, 0.7);
        --glass-border: rgba(255, 255, 255, 0.08);
        --text-main: #f8fafc;
        --text-muted: #94a3b8;
        --text-bright: #ffffff;
        --card-bg: rgba(255, 255, 255, 0.03);
        --border-dim: rgba(255, 255, 255, 0.05);
        --border-med: rgba(255, 255, 255, 0.1);
        --bg-dark-overlay: rgba(0, 0, 0, 0.2);
    }
    
    [data-theme="light"] {
        --bg-dark: #f0f4f8;
        --glass-bg: rgba(255, 255, 255, 0.85);
        --glass-border: rgba(0, 0, 0, 0.1);
        --text-main: #1e293b;
        --text-muted: #64748b;
        --text-bright: #0f172a;
        --card-bg: rgba(0, 0, 0, 0.03);
        --border-dim: rgba(0, 0, 0, 0.05);
        --border-med: rgba(0, 0, 0, 0.1);
        --bg-dark-overlay: rgba(255, 255, 255, 0.6);
    }`;

content = content.replace(cssVarRegex, newVars);

fs.writeFileSync('build.js', content);
console.log('Successfully refactored inline styles to CSS variables in build.js');
