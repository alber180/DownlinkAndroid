import { PlatformProvider } from '../common/platform-provider.js';
import { TWITCH_URL_PATTERNS } from '../../../shared/platform-patterns.js';

export class TwitchProvider extends PlatformProvider {
  constructor() {
    super({ name: 'twitch', patterns: TWITCH_URL_PATTERNS });
  }
}
