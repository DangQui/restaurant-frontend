/**
 * CDN Configuration với Subresource Integrity (SRI)
 *
 * Mỗi CDN resource phải có:
 * - url: URL của resource
 * - integrity: Hash SRI (SHA-384)
 * - crossorigin: "anonymous" (bắt buộc cho SRI)
 *
 * Để tính hash SRI, chạy:
 *   node scripts/calculate-sri-hash.js <URL>
 *
 * Hoặc sử dụng công cụ online: https://www.srihash.org/
 */

export const CDN_CONFIG = {
  googleFonts: {
    url: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Playfair+Display:wght@500;600;700&display=swap",
    integrity:
      "sha384-S3VzJTjbQV9QubZkWFnvzSm+7oj7AfwPOxLiTLib3utxL/Z1WLi/g/1DzF+lin9q", // Thay thế bằng hash thực tế
    crossorigin: "anonymous",
  },
};

/**
 * Helper function để tạo <link> tag với SRI
 * @param {Object} config - CDN config object
 * @returns {Object} Attributes object cho <link> tag
 */
export const createCDNLink = (config) => {
  return {
    rel: "stylesheet",
    href: config.url,
    integrity: config.integrity,
    crossorigin: config.crossorigin,
  };
};

/**
 * Helper function để tạo <script> tag với SRI
 * @param {Object} config - CDN config object
 * @returns {Object} Attributes object cho <script> tag
 */
export const createCDNScript = (config) => {
  return {
    src: config.url,
    integrity: config.integrity,
    crossorigin: config.crossorigin,
  };
};
