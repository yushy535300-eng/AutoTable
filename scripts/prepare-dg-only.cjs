#!/usr/bin/env node
'use strict';
// Only generated/public MT assets are removed; archived source and all DG files stay intact.
const fs = require('node:fs');
const path = require('node:path');
const publicDir = path.resolve(__dirname, '../public');
let removed = 0;
if (fs.existsSync(publicDir)) {
  for (const name of fs.readdirSync(publicDir)) {
    if (!/^mt-[^/]+\.(?:js|json)$/i.test(name)) continue;
    const file = path.join(publicDir, name);
    if (!fs.lstatSync(file).isFile()) continue;
    fs.unlinkSync(file);
    removed++;
  }
}
console.log(`[DG-only build] removed ${removed} old MT public assets; archived source retained.`);
