/**
 * Build the `lib/emoji-svg.js` JavaScript from SVG files in the `noto-emoji` Git repo.
 *
 * @copyright © Nick Freear and contributors, 07-Sep-2024.
 * @see https://github.com/googlefonts/noto-emoji
 */

const fs = require('fs').promises;
const { resolve } = require('path');
const { EMOJI } = require('../lib/Icons.js');

const outputJsPath = resolve(__dirname, '..', 'lib', 'emoji-svg.js');

const SVG = EMOJI.map(async (it, idx) => {
  const xml = await fs.readFile(svgFilePath(it.codepoint), 'utf8');

  const svg = trimSvgXml(xml);

  return { id: it.code, svg };
});

console.log('SVG emoji count:', SVG.length);

Promise.all(SVG).then((svgData) => {
  const svgJson = JSON.stringify(svgData, null, 2);

  return fs.writeFile(outputJsPath, jsFileTemplate(svgJson));
})
  .then(() => console.log('File emoji-svg.js written OK.'));

/*
  Utility functions.
*/

function trimSvgXml (xml) {
  return xml.replace(/<\?xml[^>]+\?>\n/, '').replace(/<!--[^>]+-->\n/, '')
    .replace(' xmlns:xlink="http://www.w3.org/1999/xlink"', '')
    .replace(/ version="\d.\d"/, '').replace(/ id="Layer_\d"/, '')
    .replace(/\t/g, '').replace(/\n/g, '');
}

function codePoint (codepoint) {
  return codepoint.replace('U+', '').toLowerCase();
}

function svgFileName (codepoint) {
  return `emoji_u${codePoint(codepoint)}.svg`;
}

function svgFilePath (codepoint) {
  return resolve(__dirname, '..', 'noto-emoji', 'svg', svgFileName(codepoint));
}

function jsFileTemplate (jsonSvgData) {
  return `/* Auto-generated. */

/* eslint-disable quotes, quote-props */

export const SVG = ${jsonSvgData};

export default SVG;

/* eslint-enable */
`;
}
