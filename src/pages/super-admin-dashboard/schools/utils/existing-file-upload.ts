const getFileBaseUrl = (): string => {
  if (import.meta.env.DEV) return '/remote-files';
  const apiBase =
    (import.meta.env.VITE_API_BASE_URL as string | undefined) || 'https://gradexpro.runasp.net/api';
  return apiBase.replace(/\/?api\/?$/i, '').replace(/\/+$/, '');
};

export const buildFileUrl = (path: string): string => {
  const base = getFileBaseUrl();
  if (/^https?:\/\//i.test(path)) {
    return import.meta.env.DEV ? path.replace(/^https?:\/\/[^/]+/i, base) : path;
  }
  return `${base}/${path.replace(/^\/+/, '')}`;
};

export const fetchExistingFileAsUpload = async (path?: string | null): Promise<File | null> => {
  if (!path || !path.trim()) return null;

  try {
    const response = await fetch(buildFileUrl(path));
    if (!response.ok) return null;

    const blob = await response.blob();
    if (!blob || blob.size === 0) return null;

    const name = path.split('/').pop() || 'file';
    return new File([blob], name, { type: blob.type || 'application/octet-stream' });
  } catch {
    return null;
  }
};
