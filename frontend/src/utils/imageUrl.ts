export const getImageUrl = (path?: string | null, thumbnail: boolean = false): string => {
  if (!path) return '';
  // If it's already a full URL or a local absolute path (from seed), use it as is
  if (path.startsWith('http') || path.startsWith('/') || path.startsWith('data:')) {
    return path;
  }
  
  let finalPath = path;
  if (thumbnail) {
    finalPath = finalPath.replace(/\.(webp|png|jpe?g)$/i, '-thumb.webp');
  }
  
  // Otherwise, prepend the CDN URL
  const cdn = import.meta.env.VITE_CDN_URL || '';
  return `${cdn}/${finalPath}`;
};
