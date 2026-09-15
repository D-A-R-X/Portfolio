/* Image assets served from /public/img — decoded from the base64 blobs that
   previously lived inline in App.jsx, so they stay out of the JS bundle and
   get cached by the browser like any other static file. */
export const PHOTO_B64 = "/img/surya.jpg";

export const CERT_IMAGES = {
  Oracle:  "/img/cert-oracle.jpg",
  NxtWave: "/img/cert-nxtwave.jpg",
  Google:  "/img/cert-google.jpg",
};
