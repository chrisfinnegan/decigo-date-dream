// Analytics wrapper for Mixpanel
interface EventProperties {
  [key: string]: any;
}

class Analytics {
  private initialized = false;
  private mixpanel: any = null;

  async init() {
    if (this.initialized) return;
    
    const token = import.meta.env.VITE_MIXPANEL_TOKEN;
    if (!token) {
      console.warn('Mixpanel token not found');
      return;
    }

    try {
      // Dynamically import Mixpanel
      const { default: mixpanel } = await import('mixpanel-browser');
      mixpanel.init(token, {
        track_pageview: true,
        persistence: 'localStorage'
      });
      this.mixpanel = mixpanel;
      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize Mixpanel:', error);
    }
  }

  track(eventName: string, properties?: EventProperties) {
    if (!this.initialized || !this.mixpanel) {
      console.log('[Analytics]', eventName, properties);
      return;
    }
    this.mixpanel.track(eventName, properties);
  }

  identify(userId: string) {
    if (!this.initialized || !this.mixpanel) return;
    this.mixpanel.identify(userId);
  }

  setUserProperties(properties: EventProperties) {
    if (!this.initialized || !this.mixpanel) return;
    this.mixpanel.people.set(properties);
  }

  // Specific event trackers
  trackLPView() {
    this.track('lp_view');
  }

  trackIntakeStart() {
    this.track('intake_start');
  }

  trackIntakeComplete(properties: EventProperties) {
    this.track('intake_complete', properties);
  }

  trackOptionsShown(mode: 'top3' | 'full20', properties?: EventProperties) {
    this.track(mode === 'top3' ? 'options_shown_3' : 'options_shown_list', properties);
  }

  trackVoteCast(properties: EventProperties) {
    this.track('vote_cast', properties);
  }

  trackLockReached(properties: EventProperties) {
    this.track('lock_reached', properties);
  }

  trackCalendarAdded(properties: EventProperties) {
    this.track('calendar_added', properties);
  }

  trackMapOpen(properties: EventProperties) {
    this.track('map_open', properties);
  }

  trackInviteStepShown(properties: EventProperties) {
    this.track('invite_step_shown', properties);
  }

  trackContactAdded(properties: EventProperties) {
    this.track('contact_added', properties);
  }

  trackInviteSent(properties: EventProperties) {
    this.track('invite_sent', properties);
  }
}

export const analytics = new Analytics();
