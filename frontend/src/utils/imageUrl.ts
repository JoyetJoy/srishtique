export const getImageUrl = (path?: string | null): string => {
  if (!path) return '';
  // If it's already a full URL or a local absolute path (from seed), use it as is
  if (path.startsWith('http') || path.startsWith('/') || path.startsWith('data:')) {
    return path;
  }
  // Otherwise, prepend the CDN URL
  const cdn = import.meta.env.VITE_CDN_URL || '';
  return `${cdn}/${path}`;
};
