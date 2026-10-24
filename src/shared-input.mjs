export function readSharedInput(hash) {
  if (!hash.startsWith('#shared=')) return null;
  try {
    const value = decodeURIComponent(hash.slice(8));
    return value.trim() && value.length <= 5000 ? value : null;
  } catch { return null; }
}
