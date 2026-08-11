// Utility helper to generate safe, browser-compatible URLs for uploaded files
export function getSafeFileUrl(filePath) {
  if (!filePath) return '';
  const normalized = filePath.replace(/\\/g, '/');
  return normalized
    .split('/')
    .map(segment => encodeURIComponent(segment))
    .join('/');
}
