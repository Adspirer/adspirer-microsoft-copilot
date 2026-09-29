import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { PNG } from 'pngjs';
import { root, verifySources } from './lib.mjs';

verifySources();
const source = PNG.sync.read(readFileSync(resolve(root, 'assets/adspirer-icon.png')));
const color = new PNG({ width: 192, height: 192 });
const offsetX = Math.floor((192-source.width)/2);
const offsetY = Math.floor((192-source.height)/2);
for (let y=0;y<192;y++) for (let x=0;x<192;x++) {
  const out = (y*192+x)*4;
  const sx=x-offsetX, sy=y-offsetY;
  const inside=sx>=0 && sy>=0 && sx<source.width && sy<source.height;
  const src=(sy*source.width+sx)*4;
  const alpha=inside ? source.data[src+3]/255 : 0;
  for (let c=0;c<3;c++) color.data[out+c]=Math.round((inside ? source.data[src+c] : 0)*alpha);
  color.data[out+3]=255;
}
const outline = new PNG({ width: 32, height: 32 });
for (let y=0;y<32;y++) for (let x=0;x<32;x++) {
  const out=(y*32+x)*4;
  let alpha=0;
  // The Cursor PNG has an opaque black matte. Key that matte out of the
  // monochrome export, then supersample the original mark's silhouette.
  for(let sy=0;sy<8;sy++) for(let sx=0;sx<8;sx++) {
    const px=Math.min(source.width-1,Math.floor((x+(sx+0.5)/8)*source.width/32));
    const py=Math.min(source.height-1,Math.floor((y+(sy+0.5)/8)*source.height/32));
    const src=(py*source.width+px)*4;
    const coverage=Math.min(1,Math.max(source.data[src],source.data[src+1],source.data[src+2])/32);
    alpha+=source.data[src+3]*coverage;
  }
  outline.data[out]=outline.data[out+1]=outline.data[out+2]=255;
  outline.data[out+3]=Math.round(alpha/64);
}
for(const [name,png] of [['color.png',color],['outline.png',outline]])
  writeFileSync(resolve(root,'agent/appPackage',name),PNG.sync.write(png));
console.log('Generated Microsoft icons from the pinned Cursor brand asset.');
