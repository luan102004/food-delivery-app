'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Listen for install prompt
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Show prompt after 3 seconds
      setTimeout(() => {
        setShowInstallPrompt(true);
      }, 3000);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Listen for app installed
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setShowInstallPrompt(false);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    }

    setDeferredPrompt(null);
    setShowInstallPrompt(false);
  };

  const handleDismiss = () => {
    setShowInstallPrompt(false);
    // Don't show again for 7 days
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
  };

  // Don't show if already installed or dismissed recently
  useEffect(() => {
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    if (dismissed) {
      const dismissedTime = parseInt(dismissed);
      const daysSinceDismissed = (Date.now() - dismissedTime) / (1000 * 60 * 60 * 24);
      if (daysSinceDismissed < 7) {
        setShowInstallPrompt(false);
      }
    }
  }, []);

  if (isInstalled || !showInstallPrompt) return null;

  return (
    <AnimatePresence>
      {showInstallPrompt && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-20 left-4 right-4 z-50 md:left-auto md:right-4 md:w-96"
        >
          <div className="bg-gradient-to-br from-purple-600 via-pink-600 to-red-600 rounded-2xl shadow-2xl p-6 text-white">
            <button
              onClick={handleDismiss}
              className="absolute top-2 right-2 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
            >
              ✕
            </button>

            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-3xl">
                🍔
              </div>
              <div>
                <h3 className="font-bold text-lg">Cài đặt ứng dụng</h3>
                <p className="text-sm opacity-90">Trải nghiệm tốt hơn trên điện thoại</p>
              </div>
            </div>

            <div className="space-y-2 mb-4 text-sm">
              <div className="flex items-center gap-2">
                <span>✅</span>
                <span>Truy cập nhanh hơn</span>
              </div>
              <div className="flex items-center gap-2">
                <span>✅</span>
                <span>Hoạt động offline</span>
              </div>
              <div className="flex items-center gap-2">
                <span>✅</span>
                <span>Nhận thông báo realtime</span>
              </div>
            </div>

            <div className="flex gap-2">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleInstallClick}
                className="flex-1 bg-white text-purple-600 py-3 rounded-xl font-bold hover:bg-gray-100 transition-colors"
              >
                Cài đặt ngay
              </motion.button>
              <button
                onClick={handleDismiss}
                className="px-4 py-3 bg-white/20 rounded-xl font-semibold hover:bg-white/30 transition-colors"
              >
                Để sau
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}