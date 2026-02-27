# Accessibility Testing (US033)

Automated WCAG2AA checks using [pa11y-ci](https://pa11y.org/).

```bash
npm install                # install deps (includes pa11y-ci)
npm run dev                # start the app
npm run a11y               # run against localhost (in another terminal)
npm run a11y:aws           # run against AWS (set AWS_FRONT_URL env var)
```

To add pages, edit the `urls` array in `accessibility/.pa11yci`.
