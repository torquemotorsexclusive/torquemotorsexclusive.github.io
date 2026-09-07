/* ============================================================
   TORQUE — Meta Pixel
   Set META_PIXEL_ID to the pixel from Torque's Events Manager.
   Until it is set, nothing loads and every helper is a no-op.

   What fires:
     every page        -> PageView
     bike pages        -> ViewContent  (content_ids = the bike's Firestore
                          id, the same id used in /feeds/facebook-catalog.csv,
                          so Meta can match the page to the catalog item)
     WhatsApp buttons  -> Lead
   ============================================================ */
const META_PIXEL_ID = '';
const META_CURRENCY = 'PKR';

(function () {
  if (!META_PIXEL_ID) return;
  /* Meta's standard base code */
  !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
  n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
  n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
  t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
  document,'script','https://connect.facebook.net/en_US/fbevents.js');
  fbq('init', META_PIXEL_ID);
  fbq('track', 'PageView');
})();

/* Call once the bike is known. Works for both the static /bike/<slug>
   pages and the dynamic bike.html?id= fallback. */
function torqueTrackViewContent(bike) {
  if (!window.fbq || !bike || !bike.id) return;
  fbq('track', 'ViewContent', {
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
  if (!window.fbq) return;
  fbq('track', 'Lead', { content_name: label || 'WhatsApp enquiry' });
}
