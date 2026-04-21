Deploy this project's frontend to Vercel and return the live URL.

## Steps

### 1. Check Vercel CLI

Run `vercel --version`. If it fails, install it:
```
npm install -g vercel
```

### 2. Check login status

Run `vercel whoami`. If it returns an error or "Not logged in", stop and tell the user:
> You need to log in first. Run `! vercel login` in this terminal, then re-run `/deploy_vercel`.

Do not proceed until the user is authenticated.

### 3. Ensure vercel.json exists for SPA routing

Check if `vercel.json` exists at the project root. If it does **not** exist, create it with this content so that client-side React routing works correctly on Vercel:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

If it already exists, leave it unchanged.

### 4. Build the frontend

```
npm run build
```

The output goes to `build/` (configured in `vite.config.ts`). If the build fails, print the error and stop — do not attempt to deploy a broken build.

### 5. Deploy to Vercel

```
vercel build/ --prod --yes
```

- `--prod` targets the production URL (not a preview URL)
- `--yes` skips all interactive prompts

### 6. Print the live URL

Parse the CLI output for the production URL (the line starting with `Production:` or the final URL printed). Print it clearly:

```
Deployed! Live URL: https://your-project.vercel.app
```

## Important notes

- This deploys the **frontend only** (the React SPA). The Express backend (`server/`) cannot run on Vercel — auth and score-saving will not work in the deployed version. Guest gameplay works fine.
- The `vercel.json` rewrite rule is required so that refreshing on any route (e.g. `/game`) does not return a 404.
- If Vercel asks to link to an existing project or create a new one and `--yes` does not suppress it, run `vercel link` first to associate the directory with a Vercel project, then re-run this command.
