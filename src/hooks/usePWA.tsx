import { useEffect, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const usePWA = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);

  useEffect(() => {
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
