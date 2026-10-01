import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  buildShareText,
  buildShareUrl,
  buildSocialShareLinks
} from '../public/share-utils.js';

const baseHref = 'https://example.test/?existing=1#fragment';

test('buildShareUrl replaces query params with request text', () => {
  assert.equal(
    buildShareUrl(baseHref, 'Can I have a pony?'),
    'https://example.test/?request=Can+I+have+a+pony%3F#fragment'
  );
});

test('buildShareText prefixes the request', () => {
  assert.equal(buildShareText('Can I have a pony?'), 'NaaS says no to: Can I have a pony?');
});

test('buildSocialShareLinks returns encoded provider URLs', () => {
  const links = buildSocialShareLinks(baseHref, 'Can I?');

  assert.equal(links.url, 'https://example.test/?request=Can+I%3F#fragment');
  assert.match(links.x, /^https:\/\/twitter\.com\/intent\/tweet\?/);
  assert.match(links.facebook, /^https:\/\/www\.facebook\.com\/sharer\/sharer\.php\?u=/);
  assert.match(links.linkedIn, /^https:\/\/www\.linkedin\.com\/sharing\/share-offsite\/\?url=/);
  assert.match(links.email, /^mailto:\?subject=NaaS(%20|\+)link&body=/);
  assert.match(links.whatsApp, /^https:\/\/wa\.me\/\?text=/);
});
