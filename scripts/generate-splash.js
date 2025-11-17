// Script to generate splash screens
// Run: node scripts/generate-splash.js

const fs = require('fs');
const path = require('path');

const sizes = [
  { width: 2048, height: 2732, name: 'splash-2048x2732.png' },
  { width: 1668, height: 2388, name: 'splash-1668x2388.png' },
  { width: 1536, height: 2048, name: 'splash-1536x2048.png' },
  { width: 1284, height: 2778, name: 'splash-1284x2778.png' },
  { width: 1170, height: 2532, name: 'splash-1170x2532.png' },
  { width: 1125, height: 2436, name: 'splash-1125x2436.png' },
  { width: 828, height: 1792, name: 'splash-828x1792.png' },
  { width: 750, height: 1334, name: 'splash-750x1334.png' },
];

console.log('📱 iOS Splash Screen Sizes:');
sizes.forEach(size => {
  console.log(`${size.name}: ${size.width}x${size.height}`);
});

console.log('\n✨ Use https://www.appicon.co/#app-icon to generate all splash screens');
console.log('Or use Figma/Photoshop with these dimensions');