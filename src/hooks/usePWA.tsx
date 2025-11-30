import { useEffect, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const usePWA = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);

  useEffect(() => {
    // Update icons based on color scheme
    const updateIcons = (isDark: boolean) => {
      const favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
      const appleTouchIcon = document.querySelector('link[rel="apple-touch-icon"]') as HTMLLinkElement;
      
      if (favicon) {
        favicon.href = isDark ? '/icon-192-dark.png' : '/icon-192.png';
      }
      if (appleTouchIcon) {
        appleTouchIcon.href = isDark ? '/icon-192-dark.png' : '/icon-192.png';
      }
    };

    // Check initial color scheme
    const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
    updateIcons(darkModeQuery.matches);

    // Listen for changes in color scheme
    const handleColorSchemeChange = (e: MediaQueryListEvent) => {
      updateIcons(e.matches);
    };
    
    darkModeQuery.addEventListener('change', handleColorSchemeChange);

    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('Service Worker registered:', registration);
        })
        .catch((error) => {
          console.error('Service Worker registration failed:', error);
        });
    }

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Check if we should show the prompt
      const sessionCount = parseInt(localStorage.getItem('sessionCount') || '0', 10);
      const hasLockedPlan = localStorage.getItem('hasLockedPlan') === 'true';
      
      if (hasLockedPlan || sessionCount >= 2) {
        setShowInstallPrompt(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Track sessions
    const sessionCount = parseInt(localStorage.getItem('sessionCount') || '0', 10);
    localStorage.setItem('sessionCount', (sessionCount + 1).toString());

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      darkModeQuery.removeEventListener('change', handleColorSchemeChange);
    };
  }, []);

  const installApp = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    }
    
    setDeferredPrompt(null);
    setShowInstallPrompt(false);
  };

  const dismissPrompt = () => {
    setShowInstallPrompt(false);
  };

  const markPlanLocked = () => {
    localStorage.setItem('hasLockedPlan', 'true');
    const sessionCount = parseInt(localStorage.getItem('sessionCount') || '0', 10);
    if (sessionCount >= 1 && deferredPrompt) {
      setShowInstallPrompt(true);
    }
  };

  return {
    showInstallPrompt,
    installApp,
    dismissPrompt,
    markPlanLocked,
  };
};
