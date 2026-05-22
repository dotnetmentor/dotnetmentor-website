# AGENTS.md

## Cursor Cloud specific instructions

This is a Jekyll (Ruby) static site for a Swedish IT consulting company (dotnetmentor.se). It uses GitHub Pages with the `github-pages` gem.

### Running the dev server

```
bundle exec jekyll serve
```

Site is served at `http://localhost:4000` (binds to `0.0.0.0` per `_config.yml`).

### Build

```
bundle exec jekyll build
```

Output goes to `_site/`.

### Known warnings (safe to ignore)

- **Deprecation**: `'gems'` config option renamed to `'plugins'` — cosmetic warning, does not affect functionality.
- **Liquid Warning** on `index.html` line 146 — pre-existing syntax quirk, site renders correctly.
- **GitHub Metadata** warning about `site.name` vs `site.title` — informational only.
- **Sass end-of-life** notice — the `github-pages` gem still bundles Ruby Sass; no action needed.

### Notes

- There is no linter or test suite configured in this repository.
- The `cv-generator/` subdirectory is a separate sub-project with its own `index.md`; it is built as part of the main Jekyll site.
- Ruby 3.2+ requires the `webrick` gem (already in `Gemfile`).
- Gems are installed system-wide with `sudo bundle install` (or configure a local gem path if preferred).
