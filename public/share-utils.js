export function buildShareUrl(baseHref, text) {
  const url = new URL(baseHref);

  url.search = '';
  url.searchParams.set('request', text);
  return url.href;
}

export function buildShareText(text) {
  return `NaaS says no to: ${text}`;
}

export function buildSocialShareLinks(baseHref, text) {
  const url = buildShareUrl(baseHref, text);
  const shareText = buildShareText(text);
  const encodedUrl = encodeURIComponent(url);
  const encodedText = encodeURIComponent(shareText);
  const encodedEmailBody = encodeURIComponent(`${shareText}\n\n${url}`);

  return {
    url,
    x: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    linkedIn: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    email: `mailto:?subject=${encodeURIComponent('NaaS link')}&body=${encodedEmailBody}`,
    whatsApp: `https://wa.me/?text=${encodeURIComponent(`${shareText} ${url}`)}`
  };
}
