const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'client/src/pages/Landing.jsx');
let content = fs.readFileSync(filePath, 'utf8');

const replacements = [
    ["background: '#050507'", "background: 'var(--bg-primary)'"],
    ["color: '#FFFFFF'", "color: 'var(--text-primary)'"],
    ["color: '#A8B3CF'", "color: 'var(--text-secondary)'"],
    ["background: '#0D0D12'", "background: 'var(--bg-card)'"],
    ["background: '#15151D'", "background: 'var(--bg-secondary)'"],
    ["background: scrolled ? 'rgba(5, 5, 7, 0.85)'", "background: scrolled ? 'var(--navbar-bg)'"],
    ["borderBottom: scrolled ? '1px solid rgba(255,255,255,0.06)'", "borderBottom: scrolled ? '1px solid var(--border-color)'"],
    ["border: '1px solid rgba(255,255,255,0.06)'", "border: '1px solid var(--border-color)'"],
    ["border: '1px solid rgba(255,255,255,0.08)'", "border: '1px solid var(--border-color)'"],
    ["borderTop: '1px solid rgba(255,255,255,0.04)'", "borderTop: '1px solid var(--border-color)'"],
    ["borderBottom: '1px solid rgba(255,255,255,0.04)'", "borderBottom: '1px solid var(--border-color)'"],
    ["background: 'rgba(10,10,15,0.4)'", "background: 'var(--bg-tertiary)'"],
    ["background: 'rgba(255,255,255,0.03)'", "background: 'var(--bg-input)'"],
    ["e.currentTarget.style.background = 'rgba(255,255,255,0.06)'", "e.currentTarget.style.background = 'var(--bg-input-focus)'"],
    ["e.currentTarget.style.background = 'rgba(255,255,255,0.03)'", "e.currentTarget.style.background = 'var(--bg-input)'"]
];

replacements.forEach(([oldStr, newStr]) => {
    content = content.split(oldStr).join(newStr);
});

fs.writeFileSync(filePath, content, 'utf8');
console.log('Fixed Landing colors');
