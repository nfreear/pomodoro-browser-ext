/**
 *
 * @see https://codepen.io/nfreear/pen/abgRwdY
 * @see https://emojipedia.org/evergreen-tree#technical
 */

const emojiSvgJs = './emoji-svg.js';

export const EMOJI = [
  {
    name: 'Tree',
    phrase: 'Grow a tree!',
    emoji: '🌲',
    code: 'evergreen_tree', // Shortcode: `:evergreen_tree:`
    codepoint: 'U+1F332'
  }, {
    name: 'Bean',
    phrase: 'Collect a bean!',
    emoji: '🫘',
    code: 'beans',
    codepoint: 'U+1FAD8'
  }, {
    name: 'Chocolate',
    phrase: 'Eat chocolate!',
    emoji: '🍫',
    code: 'chocolate_bar',
    codepoint: 'U+1F36B'
  }, {
    name: 'Hot drink',
    phrase: 'Have a hot drink!',
    emoji: '☕',
    code: 'hot_beverage',
    codepoint: 'U+2615'
  }, /* {
    name: 'Yarn',
    phrase: 'Do crafts!',
    emoji: '🧶',
    code: 'yarn',
    codepoint: 'U+1F9F6'
  }, */ {
    name: 'Star',
    phrase: 'Collect a star!',
    emoji: '⭐',
    code: 'star',
    codepoint: 'U+2B50'
  }, {
    name: 'Walking',
    phrase: 'Take a break!',
    emoji: '🚶',
    code: 'person_walking',
    codepoint: 'U+1F6B6'
  }
];

const APP_ICONS = [
  {
    name: 'Cog', // Settings/ Options.
    emoji: '⚙️',
    code: 'gear'
  }, {
    name: 'Timer',
    emoji: '⏱️',
    code: 'stopwatch',
    codepoint: 'U+23F1 U+FE0F'
  }
];

export class Icons {
  get emoji () { return EMOJI; }
  get appIcons () { return APP_ICONS; }

  get default () { return this.find('evergreen_tree'); }
  get cog () { return this.findAppIcon('gear'); }
  get timer () { return this.findAppIcon('stopwatch'); }

  getSelectOptions () {
    return this.emoji.map((it) => {
      const { code, emoji, name } = it;
      return `<option value="${code}" data-emoji="${emoji}">${emoji} ${name}</option>`;
    });
  }

  find (byCode) {
    return this.emoji.find((it) => it.code === byCode);
  }

  findAppIcon (byCode) {
    return this.appIcons.find(it => it.code === byCode);
  }

  findEmojiSVG (byId) {
    const found = this._SVG.find(it => it.id === byId);
    if (!found) {
      // throw new Error(`SVG emoji not found: "${byId}"`);
      console.error(`Error: SVG emoji not found: "${byId}"`);
      return `<div class="error">Error: SVG emoji not found: "<tt>${byId}</tt>"</div>`;
    }
    const { name } = this.find(byId);
    return `<span role="img" aria-label="${name}">
      <span class="emoji-svg" aria-hidden="true" data-emoji-id="${byId}">
        ${found.svg}
      </span>
    </span>`;
  }

  async importEmojiSVG () {
    const { default: SVG } = await import(emojiSvgJs);
    this._SVG = SVG;
    console.debug('SVG:', SVG);
    return SVG;
  }
}

export default Icons;
