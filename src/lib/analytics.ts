// Analytics wrapper for Mixpanel (using HTTP API to avoid React conflicts)
interface EventProperties {
  [key: string]: any;
}

class Analytics {
  private token: string | null = null;
  private distinctId: string;

  constructor() {
    // Get or create distinct ID
    this.distinctId = localStorage.getItem('analytics_id') || crypto.randomUUID();
    localStorage.setItem('analytics_id', this.distinctId);
  }

  init() {
    const token = import.meta.env.VITE_MIXPANEL_TOKEN;
    if (!token) {
      console.warn('Mixpanel token not found - analytics will log to console only');
      return;
    }
    this.token = token;
  }

  track(eventName: string, properties?: EventProperties) {
    const eventData = {
      event: eventName,
      properties: {
        distinct_id: this.distinctId,
        time: Date.now(),
        ...properties,
      },
    };

    // Log to console for debugging
    console.log('[Analytics]', eventName, properties);

    // Send to Mixpanel if token is available
    if (this.token) {
      try {
        const encodedData = btoa(JSON.stringify(eventData));
        fetch(`https://api.mixpanel.com/track?data=${encodedData}&ip=1`, {
          method: 'GET',
        }).catch(err => console.error('Analytics error:', err));
      } catch (error) {
        console.error('Failed to send analytics:', error);
      }
    }
  }

  identify(userId: string) {
    this.distinctId = userId;
    localStorage.setItem('analytics_id', userId);
  }

  setUserProperties(properties: EventProperties) {
    // Store user properties via Mixpanel People API if needed
    console.log('[Analytics] User properties:', properties);
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

  trackSharecardImpression(properties: EventProperties) {
    this.track('sharecard_impression', properties);
  }

  trackSharecardClick(properties: EventProperties) {
    this.track('sharecard_click', properties);
  }

  trackSharecardToVote(properties: EventProperties) {
    this.track('sharecard_to_vote', properties);
  }
}

export const analytics = new Analytics();
