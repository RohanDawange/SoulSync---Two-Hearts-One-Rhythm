export function isValidYouTubeUrl(url: string): boolean {
  const pattern = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;
  return pattern.test(url);
}

export function isValidSpotifyUrl(url: string): boolean {
  const pattern = /^(https?:\/\/)?(open\.)?spotify\.com\/track\/[a-zA-Z0-9]+/;
  return pattern.test(url);
}

export function isValidSoundCloudUrl(url: string): boolean {
  const pattern = /^(https?:\/\/)?(www\.)?soundcloud\.com\/[a-zA-Z0-9_-]+\/[a-zA-Z0-9_-]+/;
  return pattern.test(url);
}

export function isValidEmail(email: string): boolean {
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return pattern.test(email);
}

export function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

export function extractSpotifyId(url: string): string | null {
  const match = url.match(/spotify\.com\/track\/([a-zA-Z0-9]+)/);
  return match ? match[1] : null;
}

export function sanitizeInput(input: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  };
  const reg = /[&<>"'\/]/g;
  return input.trim().replace(reg, (match) => map[match]);
}

export function getEmbedUrl(source: string, url: string): string {
  switch (source) {
    case 'youtube': {
      const id = extractYouTubeId(url);
      return id ? `https://www.youtube.com/embed/${id}?autoplay=1&enablejsapi=1` : '';
    }
    case 'spotify': {
      const id = extractSpotifyId(url);
      return id ? `https://open.spotify.com/embed/track/${id}` : '';
    }
    case 'soundcloud': {
      return `https://w.soundcloud.com/player/?url=${encodeURIComponent(url)}&auto_play=true`;
    }
    default:
      return '';
  }
}
