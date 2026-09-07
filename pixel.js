/* ============================================================
   TORQUE — Meta Pixel
   The Pixel ID is NOT in this file. It lives in the admin dashboard
   (Integrations tab -> Firestore settings/main.metaPixelId). data.js
   reads it with the other site settings and calls torqueInitPixel().
   Until an ID is saved nothing loads. Events fired before init are
   queued and flushed, so ViewContent on a bike page is never lost.

   What fires:
     every page        -> PageView
     bike pages        -> ViewContent  (content_ids = the bike's Firestore
                          id, the same id used in /feeds/facebook-catalog.csv,
                          so Meta can match the page to the catalog item)
     WhatsApp buttons  -> Lead
   ============================================================ */
const META_CURRENCY = 'PKR';
let _pixelReady = false;
const _pixelQueue = [];

function torqueInitPixel(id) {
  id = String(id || '').replace(/\D/g, '');
  if (!id || _pixelReady) return;
  /* Meta's standard base code */
  !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
  n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
  n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
  t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
  document,'script','https://connect.facebook.net/en_US/fbevents.js');
  fbq('init', id);
  fbq('track', 'PageView');
  _pixelReady = true;
  while (_pixelQueue.length) fbq.apply(null, _pixelQueue.shift());
}

function _pixelTrack() {
  const args = Array.from(arguments);
  if (_pixelReady) fbq.apply(null, args); else _pixelQueue.push(args);
}

/* Call once the bike is known. Works for both the static /bike/<slug>
   pages and the dynamic bike.html?id= fallback. */
function torqueTrackViewContent(bike) {
  if (!bike || !bike.id) return;
  _pixelTrack('track', 'ViewContent', {
    content_ids: [bike.id],
    content_type: 'product',
    content_name: `${bike.year ? bike.year + ' ' : ''}${bike.name || ''}`.trim(),
    content_category: bike.brand || undefined,
    value: Number(bike.price) || 0,
    currency: META_CURRENCY
  });
}

/* A WhatsApp enquiry is the conversion for this site. */
function torqueTrackLead(label) {
  _pixelTrack('track', 'Lead', { content_name: label || 'WhatsApp enquiry' });
}
