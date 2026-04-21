Deploy this project's frontend to GitHub Pages and return the live URL.

## Steps

### 1. Check GitHub CLI is installed

Run `gh --version`. If it fails, stop and tell the user:

> GitHub CLI (`gh`) is not installed. Download it from https://cli.github.com, then re-run `/deploy_github`.

### 2. Check authentication

Run `gh auth status`. If the output contains "not logged in" or the command errors, stop and tell the user:

> You are not authenticated with GitHub. Run `! gh auth login` in this terminal, then re-run `/deploy_github`.

Do not proceed until the user is authenticated.

### 3. Get the authenticated GitHub username

```
gh api user --jq .login
```

Save this value as `OWNER`. It will be used to build the final live URL.

### 4. Initialize a git repository (if needed)

Run `git status`. If the output says "not a git repository", run:

```
git init
git add .
git commit -m "Initial commit"
```

If it is already a git repo, skip this step.

### 5. Check for a GitHub remote, or create a new repo

Run `git remote get-url origin`.

**If no remote exists:**
- Use AskUserQuestion to ask: "What would you like to name your GitHub repository? (e.g. `treasure-game`)"
- Once you have the name (save as `REPO_NAME`), run:
  ```
  gh repo create <REPO_NAME> --public --source=. --remote=origin --push
  ```
  This creates the repo on GitHub, sets `origin`, and pushes the initial commit.

**If a remote already exists:**
- Parse `REPO_NAME` from the URL. For example `https://github.com/alice/treasure-game.git` → `REPO_NAME=treasure-game`.

### 6. Configure Vite base path for GitHub Pages

GitHub Pages serves the site at `https://<OWNER>.github.io/<REPO_NAME>/`, so Vite must know the sub-path.

Read `vite.config.ts` and check whether a `base:` field already exists inside `defineConfig({...})`.

**If `base` is NOT present**, add it as the first property inside `defineConfig`:

```ts
export default defineConfig({
  base: '/<REPO_NAME>/',
  plugins: [react()],
  // ...rest unchanged
})
```

**If `base` is already set**, verify it equals `/<REPO_NAME>/`. Update it if it does not match.

### 7. Build the frontend

```
npm run build
```

Output goes to `build/` (configured in `vite.config.ts`). If the build fails, print the full error and stop — do not attempt to deploy a broken build.

### 8. Deploy to GitHub Pages

```
npx gh-pages -d build
```

This pushes the contents of `build/` to the `gh-pages` branch on GitHub. `npx` will install the `gh-pages` package temporarily if it is not already cached — no permanent install is needed.

### 9. Enable GitHub Pages in repository settings

After the `gh-pages` branch is pushed, activate Pages via the API:

```
gh api repos/<OWNER>/<REPO_NAME>/pages \
  --method POST \
  -f source[branch]=gh-pages \
  -f source[path]=/
```

If the response is HTTP 409 (Pages is already enabled), ignore the error and continue.

### 10. Commit the vite.config.ts change to main

```
git add vite.config.ts
git commit -m "Configure Vite base path for GitHub Pages"
git push origin main
```

### 11. Print the live URL

Print clearly:

```
Deployed! Live URL: https://<OWNER>.github.io/<REPO_NAME>/
```

Also tell the user:

> GitHub Pages may take 1–3 minutes to go live on first deployment. If you see a 404, wait and refresh.

## Important notes

- This deploys the **frontend only**. The Express backend (`server/`) cannot run on GitHub Pages — auth and score-saving will not work. Guest gameplay works fine.
- The `base` value in `vite.config.ts` must match the GitHub repository name **exactly** (case-sensitive). A mismatch will cause all assets (images, sounds, JS) to return 404.
- If the repository is ever renamed on GitHub, update `base` in `vite.config.ts` and re-run `/deploy_github`.
