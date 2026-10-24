// @ts-check
import { defineConfig } from 'astro/config';

// packages.bielu.pl is a subdomain bound by public/CNAME, so no `base` path is needed.
export default defineConfig({
  site: 'https://packages.bielu.pl',
  trailingSlash: 'ignore',
});
