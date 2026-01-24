// scripts/undici-polyfill.js
try {
  const { File, FormData, Headers, Request, Response, fetch } = require('undici');
  globalThis.File = globalThis.File || File;
  globalThis.FormData = globalThis.FormData || FormData;
  globalThis.Headers = globalThis.Headers || Headers;
  globalThis.Request = globalThis.Request || Request;
  globalThis.Response = globalThis.Response || Response;
  globalThis.fetch = globalThis.fetch || fetch;
} catch (e) {
  // If undici is not installed separately, ignore
}