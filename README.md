# Independent Bookstore Events Page (ENG-18072)

A simple events page for an independent bookstore. Floor staff can see upcoming events, search them, RSVP, and add new events. Built with plain HTML, CSS and a little vanilla JavaScript. No frameworks or libraries.

## Files

- `index.html` - page structure (semantic HTML5)
- `style.css` - all styling (vanilla CSS, blue shades of one colour)
- `script.js` - page logic (loading, search, form validation, RSVP)
- `screenshot.png` - full page screenshot
- `screenshot-errors-and-empty.png` - form errors and "No data found" state
- `PROMPTS.md`, `links.txt`

## How to run

Open `index.html` in any browser. No install or build step is needed.

## Requirements checklist

| Requirement | How it is done |
|---|---|
| Access the page clearly | Header, main, footer, clear headings, skip link |
| Responds immediately | Search and filter update on every keystroke |
| Consistent data | Every event has the same fields and is cleaned before saving |
| Empty state | "No data found" message with a Clear filters button |
| Bad connectivity | Spinner while events load and while saving. If offline, an error message with a Try again button is shown. The page does not crash |
| Invalid inputs | Form submit is blocked, bad fields get a red border and an error message under them, focus goes to the first bad field |
| Accessibility | Labels on all inputs, `aria-label` on RSVP buttons, `aria-invalid` and `aria-describedby` on fields, `aria-live` for status messages, visible focus outline, keyboard friendly, `lang` and viewport set |
| Telemetry | `[Analytics] User interacted with Independent Bookstore Events Page - ...` is logged in the console when an event is added or an RSVP is changed |
| Security | `sanitize()` removes HTML tags and escapes `& < > " '` before data is stored in state |
| Design | One colour (blue) in different shades, spacing in 8px / 16px / 32px steps |

## Design note

All colours are shades of one blue colour defined as CSS variables at the top of `style.css`. The only extra colour is one error red (`#b00020`) used for invalid form fields, because the TRD asks for fields to be highlighted in red.

## How to test the edge cases

1. **Empty state**: type `zzzz` in the search box.
2. **Invalid input**: click "Add event" with an empty form, or use a past date.
3. **Slow / offline**: open DevTools, Network tab, choose "Slow 3G" or "Offline", then reload the page or add an event.
4. **XSS**: enter `<script>alert(1)</script>Test` as the title. The tag is removed and no alert runs.
5. **Analytics**: open the Console and click RSVP or add an event.
6. **Keyboard**: use Tab, Shift+Tab, Enter and Space to use the whole page.

## Deploy

1. Create a new repository on your personal GitHub and upload these files.
2. On Netlify or Vercel, import the repository. No build command is needed. The publish directory is the root folder.
3. Paste both links in `links.txt`.

## Notes

- Events are kept in memory only, so they reset when the page is refreshed. Data comes from a small fake loader that simulates a server delay.
- No API keys or personal data are used.
