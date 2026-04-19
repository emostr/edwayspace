const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

function generateIcon(size) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#0a0a0a';
  const r = size * 0.15;
  ctx.beginPath();
  ctx.moveTo(r, 0);
  ctx.lineTo(size - r, 0);
  ctx.quadraticCurveTo(size, 0, size, r);
  ctx.lineTo(size, size - r);
  ctx.quadraticCurveTo(size, size, size - r, size);
  ctx.lineTo(r, size);
  ctx.quadraticCurveTo(0, size, 0, size - r);
  ctx.lineTo(0, r);
  ctx.quadraticCurveTo(0, 0, r, 0);
  ctx.closePath();
  ctx.fill();

  const fontSize = Math.floor(size * 0.58);
  ctx.font = `700 ${fontSize}px system-ui, -apple-system, sans-serif`;
  ctx.textBaseline = 'middle';

  ctx.fillStyle = '#ffffff';
  ctx.fillText('e', size * 0.12, size * 0.53);

  ctx.fillStyle = '#0078d4';
  ctx.fillText('.', size * 0.58, size * 0.53);

  return canvas.toBuffer('image/png');
}

const outDir = path.join(__dirname, '../public/icons');

fs.writeFileSync(path.join(outDir, 'icon-192.png'), generateIcon(192));
fs.writeFileSync(path.join(outDir, 'icon-512.png'), generateIcon(512));

console.log('Icons generated: icon-192.png, icon-512.png');
