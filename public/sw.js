// No message persistence or network forwarding. POST shares are handled on-device.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', event => event.waitUntil(self.clients.claim()));
self.addEventListener('fetch', event => {
  const shareUrl = new URL('share', self.registration.scope);
  const incoming = new URL(event.request.url);
  if (event.request.method !== 'POST' || incoming.href !== shareUrl.href) return;
  event.respondWith((async () => {
    try {
      const form = await event.request.formData();
      const text = ['title', 'text', 'url'].map(k => form.get(k)).filter(v => typeof v === 'string').join('\n');
      // Fragment is never sent in an HTTP request; the app removes it immediately.
      const target = new URL('./', self.registration.scope);
      target.hash = text.length <= 5000 ? 'shared=' + encodeURIComponent(text) : 'share-error';
      return Response.redirect(target.href, 303);
    } catch { return Response.redirect(new URL('./#share-error', self.registration.scope).href, 303); }
  })());
});
