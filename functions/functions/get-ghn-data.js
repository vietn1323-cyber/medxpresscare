/**
 * Proxy alias for Cloudflare Pages Functions: /functions/get-ghn-data
 * Re-exports the root /functions/get-ghn-data.js handler
 */
export * from '../get-ghn-data.js';
export { onRequest, onRequestOptions, handleGhnDataRequest } from '../get-ghn-data.js';
