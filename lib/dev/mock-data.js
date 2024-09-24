/**
 * Mock log data.
 *
 * @copyright © Nick Freear, 22-September-2024.
 */

export const LOG = [
  {
    reason: null,
    time: 1725498563000,
    timeISO: '2024-09-20T17:09:23.076Z',
    type: 'timer:start'
  }, {
    comment: {
      text: 'Wind down!',
      timeISO: '2024-09-20T17:30:01.322Z'
    },
    emoji: '⛵',
    emojiId: 'sailboat',
    reason: 'reset',
    time: 1725498563000 + (10 * 60 * 1000), // 10 minutes.
    timeISO: '2024-09-20T17:17:42.701Z',
    type: 'timer:stop'
  },

  {
    reason: null,
    time: 1725499075000,
    timeISO: '2024-09-21T13:17:55.349Z',
    type: 'timer:start'
  }, {
    comment: {
      text: 'A hot drink.',
      timeISO: '2024-09-21T13:30:01.322Z'
    },
    emoji: '☕',
    emojiId: 'hot_beverage',
    reason: 'reached zero',
    time: 1725499075000 + (15 * 60 * 1000), // 15 minutes.
    timeISO: '2024-09-21T13:27:55.454Z',
    type: 'timer:stop'
  },

  {
    reason: null,
    time: 1725827277000,
    timeISO: '2024-09-21T15:27:57.694Z',
    type: 'timer:start'
  }, {
    comment: {
      text: 'I need to focus.',
      timeISO: '2024-09-21T15:30:01.322Z'
    },
    emoji: '🫘',
    emojiId: 'beans',
    reason: 'reset',
    time: 1725827277000 + (20 * 60 * 1000), // 20 minutes.
    timeISO: '2024-09-21T15:33:35.213Z',
    type: 'timer:stop'
  },

  {
    reason: null,
    time: 1725827907000,
    timeISO: '2024-09-21T15:38:27.193Z',
    type: 'timer:start'
  }, {
    comment: {
      text: "I'm nearly done!",
      timeISO: '2024-09-21T15:34:08.071Z'
    },
    emoji: '🫘',
    emojiId: 'beans',
    reason: 'reached zero',
    time: 1725827907000 + (20 * 60 * 1000),
    timeISO: '2024-09-21T15:48:28.315Z',
    type: 'timer:stop'
  },

  {
    reason: null,
    time: 1726054410000,
    timeISO: '2024-09-22T08:36:59.426Z',
    type: 'timer:start'
  }, {
    comment: {
      text: 'Plan my day.',
      timeISO: '2024-09-22T08:36:59.426Z'
    },
    emoji: '⭐',
    emojiId: 'star',
    reason: 'reset',
    time: 1726054410000 + (15 * 60 * 1000), // 15 minutes.
    timeISO: '2024-09-22T08:51:59.426Z',
    type: 'timer:stop'
  },

  {
    reason: null,
    time: 1727025200500,
    timeISO: '2024-09-22T16:14:59.426Z',
    type: 'timer:start'
  }, {
    comment: {
      text: 'Take a breather!',
      timeISO: '2024-09-22T16:11:24.201Z'
    },
    emoji: '⛵',
    emojiId: 'sailboat',
    reason: 'reached zero',
    time: 1727025800500, // dur: 10 minutes.
    timeISO: '2024-09-22T16:25:00.701Z',
    type: 'timer:stop'
  }
];

// console.debug('Duration:', (1727025900701 - 1727025299426) / (1000 * 60) );
// console.debug('Dur 2:', (1727025800500 - 1727025200500) / (1000 * 60));

export default LOG;
