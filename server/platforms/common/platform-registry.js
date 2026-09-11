export class PlatformRegistry {
  constructor(providers = []) {
    this.providers = providers;
  }

  findByUrl(url) {
    return this.providers.find(provider => provider.supports(url)) || null;
  }

  supports(url) {
    return this.findByUrl(url) !== null;
  }
}
