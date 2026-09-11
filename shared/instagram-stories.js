const RESERVED_ROUTES = [
  'about', 'accounts', 'ads', 'api', 'challenge', 'developer', 'direct', 'directory',
  'download', 'emails', 'explore', 'graphql', 'highlights', 'legal', 'login', 'logout', 'nametag',
  'oauth', 'p', 'press', 'privacy', 'reel', 'reels', 'settings', 'share', 'stories',
  'signup', 'terms', 'tv', 'web',
].join('|');
const USERNAME = `(?!(?:${RESERVED_ROUTES}|\\.+)(?:[/?#]|$))[a-z0-9_.]{1,30}`;
const INSTAGRAM_PREFIX = '(?:https?://)?(?:www\\.)?instagram\\.com/';
const URL_END = '/?(?:[?#][^\\s]*)?$';

export const INSTAGRAM_STORY_URL_PATTERNS = [
  new RegExp(`^@${USERNAME}$`, 'i'),
  new RegExp(`^${INSTAGRAM_PREFIX}${USERNAME}${URL_END}`, 'i'),
  new RegExp(`^${INSTAGRAM_PREFIX}stories/${USERNAME}(?:/[0-9]+)?${URL_END}`, 'i'),
  new RegExp(`^${INSTAGRAM_PREFIX}stories/highlights/[0-9]+${URL_END}`, 'i'),
];

/** Identify stories without accepting arbitrary hosts or other Instagram routes. */
export function getInstagramStorySource(value) {
  if (typeof value !== 'string') return null;
  const input = value.trim();
  if (!INSTAGRAM_STORY_URL_PATTERNS.some(pattern => pattern.test(input))) return null;

  if (input.startsWith('@')) return userStories(input.slice(1));

  const parsed = new URL(/^https?:\/\//i.test(input) ? input : `https://${input}`);
  const segments = parsed.pathname.split('/').filter(Boolean);
  if (segments.length === 1) return userStories(segments[0]);
  if (segments[1].toLowerCase() === 'highlights') {
    return {
      kind: 'highlight', username: null, storyId: segments[2],
      url: `https://www.instagram.com/stories/highlights/${segments[2]}/`,
    };
  }

  const username = segments[1].toLowerCase();
  if (!segments[2]) return userStories(username);
  return {
    kind: 'story', username, storyId: segments[2],
    url: `https://www.instagram.com/stories/${username}/${segments[2]}/`,
  };
}

function userStories(value) {
  const username = value.toLowerCase();
  return {
    kind: 'user', username, storyId: null,
    url: `https://www.instagram.com/stories/${username}/`,
  };
}

/** yt-dlp identifies story videos by shortcode, independently of playlist order. */
export function isValidInstagramStoryVideoId(value) {
  return typeof value === 'string' && /^[A-Za-z0-9_-]{1,64}$/.test(value);
}
