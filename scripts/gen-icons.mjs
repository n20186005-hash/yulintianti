// 產生 PWA 圖示（純 Node，零依賴）：public/icons/icon-192.png、icon-512.png、apple-touch-icon.png
// 設計：深海藍底 + 夕陽橘圓（落日）+ 兩道波浪（海岸）——呼應站點品牌色
import { deflateSync } from 'node:zlib';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

// ---------- 最小 PNG 編碼器（RGB 8bit，無濾波） ----------
const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

function encodePng(size, pixelAt) {
  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // color type: truecolor RGB
  const stride = 1 + size * 3;
  const raw = Buffer.alloc(size * stride);
  for (let y = 0; y < size; y++) {
    raw[y * stride] = 0; // filter: none
    for (let x = 0; x < size; x++) {
      const [r, g, b] = pixelAt(x, y);
      const o = y * stride + 1 + x * 3;
      raw[o] = r;
      raw[o + 1] = g;
      raw[o + 2] = b;
    }
  }
  const idat = deflateSync(raw);
  return Buffer.concat([sig, chunk('IHDR', ihdr), chunk('IDAT', idat), chunk('IEND', Buffer.alloc(0))]);
}

// ---------- 品牌色 ----------
const DEEP = [22, 59, 77]; // #163B4D
const SUNSET = [233, 154, 89]; // #E99A59
const COAST = [108, 154, 170]; // #6C9AAA
const SAND = [233, 223, 208]; // #E9DFD0

function draw(size) {
  const cx = size / 2;
  const sunCy = size * 0.56;
  const sunR = size * 0.26;
  const waves = [
    { base: size * 0.8, amp: size * 0.05, th: size * 0.032, color: COAST, freq: 2.4 },
    { base: size * 0.94, amp: size * 0.04, th: size * 0.028, color: SAND, freq: 2.0 },
  ];
  return (x, y) => {
    // 深海藍底（全幅，maskable 安全）
    let c = DEEP;
    // 夕陽橘圓（落日）
    const dx = x - cx;
    const dy = y - sunCy;
    if (dx * dx + dy * dy <= sunR * sunR) c = SUNSET;
    // 兩道波浪
    for (const w of waves) {
      const wy = w.base + w.amp * Math.sin(((x / size) * w.freq - 0.4) * Math.PI * 2);
      if (Math.abs(y - wy) <= w.th) c = w.color;
    }
    return c;
  };
}

mkdirSync(join(root, 'public', 'icons'), { recursive: true });
for (const size of [192, 512, 180]) {
  const png = encodePng(size, draw(size));
  const name = size === 180 ? 'apple-touch-icon.png' : `icon-${size}.png`;
  writeFileSync(join(root, 'public', 'icons', name), png);
  console.log(`已產生 public/icons/${name}（${png.length} bytes）`);
}
