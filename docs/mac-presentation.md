# Mac Presentation Mode

## What this mode does

- Builds a static export of the site into `presentation-out/`
- Keeps the main branded site intact
- Removes the live API dependency during export
- Lets the waitlist fall back to local device capture so the presentation build still works

## Best Mac workflow

### Option A: Build on the Mac

1. Install Node.js on the Mac
2. Open Terminal in the project folder
3. Run:

```bash
npm install
npm run presentation:build
node out/serve-presentation.mjs --open
```

or:

```bash
node presentation-out/serve-presentation.mjs --open
```

This opens the static presentation version in the browser at:

`http://localhost:4173`

### Option B: Build elsewhere, present on the Mac

1. Run `npm run presentation:build`
2. Copy the generated `presentation-out/` folder to the Mac
3. On the Mac, open Terminal inside the copied `presentation-out/` folder
4. Run:

```bash
node serve-presentation.mjs --open
```

If you prefer, you can also double-click:

`Open Presentation.command`

## Important

- Do not open `presentation-out/index.html` directly with `file://`
- Always serve the exported folder through the local presentation server
- In presentation mode, the waitlist saves locally on the device if the live backend is unavailable
