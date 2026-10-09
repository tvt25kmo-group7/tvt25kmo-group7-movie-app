# Movie Web Application - Presentation

A single-file HTML presentation (`index.html`). It has no build step or project
dependencies. Screenshot files are loaded from `assets/screenshots/`.

## Run it locally

From the `Movie-app` project folder, start a static server in the presentation
folder:

```powershell
cd .\Presentation
python -m http.server 8080
```

Open <http://localhost:8080/index.html>. Stop the server with `Ctrl+C`.

## Controls

| Input                      | Action                                                  |
| -------------------------- | ------------------------------------------------------- |
| `→`, `PageDown` or `Space` | Next slide                                              |
| `←` or `PageUp`            | Previous slide                                          |
| `Home` or the `⌂` button   | First slide                                             |
| `End`                      | Last slide                                              |
| `F` or the `⛶` button      | Toggle fullscreen                                       |
| `?`                        | Open keyboard help                                      |
| `Esc`                      | Close keyboard help                                     |
| Swipe left / right         | Next / previous slide on touch screens                  |
| Carousel buttons           | Previous/next screenshot, or pause/resume the slideshow |

The current slide is reflected in the URL hash. To link directly to a slide,
append a hash such as `#slide-9` to the presentation URL.

## Editing the presentation

- Each slide is a `<section class="slide">` block in `index.html`.
- Replace the highlighted template prompts with the team's final content.
- Keep screenshots in `assets/screenshots/` and replace the files using these
  names:
  - `search.webp`
  - `details.webp`
  - `group.webp`
  - `profile-reviewed.webp`
  - `profile-favorites.webp`
  - `profile-groups.webp`
- Missing screenshots show a visible placeholder in the presentation.
- The slideshow respects the system's reduced-motion preference. The profile
  carousel can also be controlled with its on-screen buttons.
- Use the browser's Print command to save a PDF handout.

### AI assistance

AI tools supported presentation planning, language review, code review and
debugging. The team reviewed and accepted the final structure, content and
implementation.
