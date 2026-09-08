# ScratchNews Desktop

A thin Electron wrapper around scratchnews.net — opens the live site
in its own window with a proper app icon and taskbar/dock entry. It's not a
separate codebase to maintain: whatever changes on the live PHP site shows up
here automatically, since this just loads the real URL.

Links that go off the ScratchNews domain (Discord, Ko-fi, Scratch profiles,
GitHub) automatically open in your normal browser instead of inside the app —
see `main.js` if you ever want to change that behavior.

## You don't need Node.js installed on your computer

This is set up to build the exact same way you already deploy the main site:
push to GitHub, let GitHub Actions do the work, download the result. No local
dev environment needed.

## Setting this up (one-time)

1. Create a new repo, e.g. `xTODB/scratchnews-desktop`, and push everything
   in this folder to it (same as how `scratchnews-discord` is its own repo).
2. That's it — the workflow in `.github/workflows/build.yml` is already
   wired up.

## Making a test build

Push to `main`, or go to the **Actions** tab on GitHub and manually run
"Build Desktop App". This builds installers for Windows, Mac, and Linux and
attaches them as **Actions artifacts** — click into the finished run to
download them. These require you to be logged into GitHub and expire after
90 days, so they're only for testing, not the public download link.

## Publishing a real release (this is what the website should link to)

When you're happy with a build and want it public:

```
git tag v1.0.0
git push --tags
```

That triggers the same build, but this time the installers get attached to
a **public GitHub Release** — no login needed to download, and it doesn't
expire. Next time you want to ship an update, bump the version
(`npm version patch` or just tag `v1.0.1`, etc.) and push the new tag again.

### The links to put on the website

Because the installer filenames are pinned (not versioned), these three URLs
never change, no matter how many releases you publish after this:

```
https://github.com/xTODB/scratchnews-desktop/releases/latest/download/ScratchNews-Setup.exe
https://github.com/xTODB/scratchnews-desktop/releases/latest/download/ScratchNews.dmg
https://github.com/xTODB/scratchnews-desktop/releases/latest/download/ScratchNews.AppImage
```

(Swap `xTODB/scratchnews-desktop` for whatever you actually name the repo.)
Add these once as your Windows/Mac/Linux download buttons and you'll never
have to touch that page again — each new tag you push just updates what's
behind the same links.

## Heads up: unsigned installers

Nobody's paid for a code-signing certificate, so:

- **Windows** will show a blue "Windows protected your PC" SmartScreen
  warning. People can click "More info" → "Run anyway."
- **Mac** will show a Gatekeeper warning that the app "cannot be opened
  because it is from an unidentified developer." People need to right-click
  the app → Open, once, to get past it.

This is normal for any small/free desktop app and doesn't mean anything is
broken. Code signing costs money (~$100+/year, and Apple's requires an Apple
Developer account, which has the same 18+ requirement you already ran into
with the App Store) — not worth it at this size, but worth knowing about if
this ever gets big enough that the warnings start scaring people off.

## If the domain ever changes

Everything about the migration to a new domain (mentioned as "in progress"
on the site) only requires editing **one line** — the `SITE_URL` constant at
the top of `main.js`. Update it, push, tag a new release, done.
