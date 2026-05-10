const form = document.querySelector('#naas-form');
const input = document.querySelector('#request-text');
const submitButton = document.querySelector('#submit-button');
const statusRow = document.querySelector('#status-row');
const shareRow = document.querySelector('#share-row');
const shareLink = document.querySelector('#share-link');
const copyUrlButton = document.querySelector('#copy-url-button');
const previewLinkButton = document.querySelector('#preview-link-button');
const shareXLink = document.querySelector('#share-x-link');
const shareFacebookLink = document.querySelector('#share-facebook-link');
const shareLinkedInLink = document.querySelector('#share-linkedin-link');
const shareEmailLink = document.querySelector('#share-email-link');
const shareWhatsAppLink = document.querySelector('#share-whatsapp-link');
const shareStatus = document.querySelector('#share-status');
const loading = document.querySelector('#loading');
const status = document.querySelector('#status');
const responseOutput = document.querySelector('#response');
const REQUEST_TIMEOUT_MS = 8000;
const TYPE_DELAY_MS = 45;
let currentController = null;
let isLoading = false;
let requestToken = 0;

function hasText() {
  return input.value.trim().length > 0;
}

function updateStatusVisibility() {
  statusRow.hidden = loading.hidden && status.textContent.length === 0;
}

function updateControls() {
  const hasRequest = hasText();
  const shareEnabled = !isLoading && hasRequest && !shareRow.hidden;

  submitButton.disabled = isLoading || !hasRequest;
  copyUrlButton.disabled = !shareEnabled;
  previewLinkButton.disabled = !shareEnabled;
}

function setLoading(loadingState) {
  loading.hidden = !loadingState;
  form.setAttribute('aria-busy', String(loadingState));
  updateControls();
  updateStatusVisibility();
}

function clearStatus() {
  status.textContent = '';
  status.classList.remove('error');
  updateStatusVisibility();
}

function showError(message) {
  status.textContent = message;
  status.classList.add('error');
  updateStatusVisibility();
}

function clearShareStatus() {
  shareStatus.textContent = '';
  shareStatus.classList.remove('error');
}

function showShareStatus(message) {
  shareStatus.textContent = message;
  shareStatus.classList.remove('error');
}

function showShareError(message) {
  shareStatus.textContent = message;
  shareStatus.classList.add('error');
}

function buildShareUrl(text) {
  const url = new URL(window.location.href);

  url.search = '';
  url.searchParams.set('request', text);
  return url.href;
}

function buildShareText(text) {
  return `NaaS says no to: ${text}`;
}

function setSocialLink(element, href) {
  element.href = href;
  element.setAttribute('aria-disabled', href ? 'false' : 'true');
}

function syncSocialLinks() {
  if (!hasText()) {
    for (const link of [
      shareXLink,
      shareFacebookLink,
      shareLinkedInLink,
      shareEmailLink,
      shareWhatsAppLink
    ]) {
      setSocialLink(link, '');
    }

    return;
  }

  const url = shareLink.value;
  const text = buildShareText(input.value);
  const encodedUrl = encodeURIComponent(url);
  const encodedText = encodeURIComponent(text);
  const encodedEmailBody = encodeURIComponent(`${text}\n\n${url}`);

  setSocialLink(shareXLink, `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`);
  setSocialLink(shareFacebookLink, `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`);
  setSocialLink(shareLinkedInLink, `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`);
  setSocialLink(shareEmailLink, `mailto:?subject=${encodeURIComponent('NaaS link')}&body=${encodedEmailBody}`);
  setSocialLink(shareWhatsAppLink, `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`);
}

function syncShareLink() {
  if (!hasText()) {
    shareLink.value = '';
    syncSocialLinks();
    updateControls();
    return;
  }

  shareLink.value = buildShareUrl(input.value);
  syncSocialLinks();
  updateControls();
}

function hideResult() {
  responseOutput.textContent = '';
  responseOutput.hidden = true;
  shareRow.hidden = true;
  clearShareStatus();
  syncShareLink();
}

function showResult(text) {
  responseOutput.textContent = text;
  responseOutput.hidden = false;
  shareRow.hidden = false;
  syncShareLink();
}

function wait(ms) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

input.addEventListener('input', () => {
  if (isLoading) {
    requestToken += 1;
    currentController?.abort();
    currentController = null;
    isLoading = false;
  }

  if (!hasText()) {
    clearStatus();
  }

  hideResult();
  setLoading(isLoading);
});

copyUrlButton.addEventListener('click', async () => {
  if (!hasText()) {
    return;
  }

  try {
    await navigator.clipboard.writeText(shareLink.value);
    showShareStatus('Link copied.');
  } catch {
    shareLink.focus();
    shareLink.select();
    showShareError('Copy failed. Select the link manually.');
  }
});

previewLinkButton.addEventListener('click', () => {
  if (!hasText()) {
    return;
  }

  window.location.href = shareLink.value;
});

for (const link of [
  shareXLink,
  shareFacebookLink,
  shareLinkedInLink,
  shareEmailLink,
  shareWhatsAppLink
]) {
  link.addEventListener('click', (event) => {
    if (link.getAttribute('aria-disabled') === 'true') {
      event.preventDefault();
    }
  });
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();

  if (!hasText()) {
    return;
  }

  const submittedText = input.value;
  currentController?.abort();
  const controller = new AbortController();
  currentController = controller;
  const token = requestToken + 1;
  let timedOut = false;
  requestToken = token;
  isLoading = true;
  setLoading(true);
  clearStatus();
  hideResult();

  const timeoutId = window.setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, REQUEST_TIMEOUT_MS);

  try {
    const result = await fetch('/api/no', {
      method: 'POST',
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        text: submittedText
      }),
      signal: controller.signal
    });

    if (!result.ok) {
      throw new Error(`Request failed: ${result.status}`);
    }

    const responseText = await result.text();

    if (token === requestToken && input.value === submittedText && hasText()) {
      showResult(responseText);
    }
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      if (timedOut && token === requestToken && hasText()) {
        showError('NaaS timed out. Try again.');
      }

      return;
    }

    if (token === requestToken) {
      showError('NaaS is unavailable. Try again.');
    }
  } finally {
    window.clearTimeout(timeoutId);

    if (token === requestToken) {
      currentController = null;
      isLoading = false;
      syncShareLink();
      setLoading(false);
    }
  }
});

async function autoplayRequest(text) {
  input.value = '';
  input.focus();

  for (const char of text) {
    input.value += char;
    input.dispatchEvent(new Event('input', { bubbles: true }));
    await wait(TYPE_DELAY_MS);
  }

  form.requestSubmit();
}

const requestParam = new URLSearchParams(window.location.search).get('request');

if (requestParam) {
  autoplayRequest(requestParam);
}
