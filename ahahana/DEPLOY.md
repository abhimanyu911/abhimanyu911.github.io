# Deploying to abhimanyu911.github.io

Three files, no build step: `index.html`, `styles.css`, `script.js`.
They must sit in the same folder — the HTML links to the other two by relative path.

## Deploy into a private-ish subfolder

```bash
git clone https://github.com/abhimanyu911/abhimanyu911.github.io.git
cd abhimanyu911.github.io

# pick any folder name — something unguessable is better than "friday"
mkdir -p q7m2
cp /path/to/index.html /path/to/styles.css /path/to/script.js q7m2/

git add q7m2
git commit -m "Add page"
git push
```

Live at `https://abhimanyu911.github.io/q7m2/` in about a minute.
That exact URL is the only way in.

## Keeping it off your homepage

Three separate things keep it hidden. All are already handled:

1. **No nav entry.** Jekyll only adds a file to your site's nav if it has YAML
   front matter (the `---` block at the top). `index.html` deliberately has none,
   so Jekyll treats it as a static file to copy across, not a page to list.
   Nothing you do in the repo root changes.
2. **No search results.** `<meta name="robots" content="noindex, nofollow">` is
   in the `<head>`, so Google won't index it.
3. **No links pointing at it.** Don't add one to your homepage and nobody finds it.

Before you push, worth a 10-second check:

```bash
grep -rn "site.pages\|site.static_files" _includes/ _layouts/ 2>/dev/null
```

If that prints nothing, you're fine. If your theme loops over `site.static_files`
anywhere in the nav (rare), rename the folder to start with an underscore —
`_q7m2` — and Jekyll ignores it entirely.

Do **not** put the folder in `exclude:` in `_config.yml`. That stops it being
published at all, which is the opposite of what you want.

## If Pages isn't switched on

Repo → Settings → Pages → Source: "Deploy from a branch" → `main`, folder `/ (root)`.

## Editing

- Venue names, blurbs, handwritten teal notes: plain text in `index.html`.
- Colors: the `:root` block at the top of `styles.css`.
- The running tally messages: the `lines` array in `script.js`.
