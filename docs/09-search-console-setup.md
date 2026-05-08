# Search Console & Sitemap Submission

> Five-minute checklist to register the site with Google + Bing and tell each
> platform where the sitemap lives. Done once per domain.

## 1. Google Search Console

1. Go to **https://search.google.com/search-console**
2. Click **Add property** → choose **URL prefix** type
3. Enter `https://pharmaguide.io` (or the Vercel preview URL while waiting for
   the apex domain — re-verify the apex once it ships)
4. Pick **HTML tag** as the verification method
5. GSC gives you a meta tag like:
   ```
   <meta name="google-site-verification" content="XYZ_VERIFICATION_TOKEN" />
   ```
   Copy ONLY the `content` value — that's `XYZ_VERIFICATION_TOKEN` above.
6. Add it to local `.env`:
   ```
   NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=XYZ_VERIFICATION_TOKEN
   ```
7. Add it to Vercel → Settings → Environment Variables (Production + Preview)
8. Redeploy via Vercel (env changes don't auto-trigger). Once live,
   click **Verify** in GSC. Should be green within 30s.

### Submit the sitemap

After verification:
1. GSC → left sidebar → **Sitemaps**
2. Add new sitemap: `sitemap.xml` (just the path — GSC prepends the domain)
3. Submit. Status should flip to **Success** within an hour.

The sitemap currently lists 8 routes:
`/`, `/features`, `/methodology`, `/faq`, `/privacy`, `/terms`,
`/hipaa`, `/accessibility`.

### What to watch for in GSC after a week

- **Coverage** report — should show 8 indexed pages
- **Enhancements** → **FAQ rich result** — `/faq` should be eligible
- **Enhancements** → **Breadcrumbs** — every page should appear
- **Enhancements** → **HowTo** — `/methodology` should be eligible
- Crawled but not indexed pages → check why, usually fixable

## 2. Bing Webmaster Tools

Bing accounts for ~5–10% of US search but is also where ChatGPT and Copilot
pull citations from — worth setting up.

1. Go to **https://www.bing.com/webmasters**
2. Add the site, verify via Meta tag method
3. Copy the verification token, set as:
   ```
   NEXT_PUBLIC_BING_SITE_VERIFICATION=
   ```
4. Same routine — local `.env` + Vercel env + redeploy + click **Verify**
5. Submit sitemap: `https://pharmaguide.io/sitemap.xml`

## 3. Yandex (optional)

Skip unless you care about Russian-language search. Same routine, env var:
`NEXT_PUBLIC_YANDEX_SITE_VERIFICATION`

## 4. Cross-check

Run these from the live deploy URL to confirm everything is in place:

```bash
# Sitemap is reachable + valid
curl -sI https://pharmaguide.io/sitemap.xml | grep -i "content-type"
# → content-type: application/xml

# robots.txt points at the sitemap
curl -s https://pharmaguide.io/robots.txt | grep -i sitemap
# → Sitemap: https://pharmaguide.io/sitemap.xml

# Verification meta tags are emitted (only when env vars are set)
curl -s https://pharmaguide.io | grep -E "google-site-verification|msvalidate"
```

## 5. Indexed-page targets (week 1 goal)

| Page | Priority in sitemap | Goal |
|---|---|---|
| `/` | 1.0 | Indexed within 24h |
| `/features` | 0.95 | Indexed within 48h |
| `/methodology` | 0.9 | Indexed within 48h |
| `/faq` | 0.7 | Indexed within 1 week, FAQ rich result eligible |
| `/privacy`, `/terms` | 0.5 | Indexed within 1 week |
| `/hipaa`, `/accessibility` | 0.4 | Indexed within 2 weeks |
