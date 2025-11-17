// Service Worker Registration Helper
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        console.log('SW registered: ', registration);
      })
      .catch((registrationError) => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}

// Handle offline/online status
window.addEventListener('online', () => {
  console.log('App is online');
  document.body.classList.remove('offline');
});

window.addEventListener('offline', () => {
  console.log('App is offline');
  document.body.classList.add('offline');
});