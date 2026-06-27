# Target Rush

Target Rush is a small browser game made with HTML, CSS, and JavaScript. Open it in a browser and play.

## Files

- `index.html`: page structure
- `styles.css`: layout and visual design
- `script.js`: game logic
- `.nojekyll`: ensures GitHub Pages serves the repository exactly as a static site

## Run locally

### Option 1: open in a browser

1. Open `index.html` in your browser.
2. Click **Start match**.

### Option 2: run a local static server

If Python is installed:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000` in your browser.

## How to play

1. Player X starts.
2. Hit the moving dot to take the highlighted box.
3. Miss it or run out of time and the turn goes to the other player.
4. Get 3 in a row to win.

## How to work on it

1. Edit `index.html`, `styles.css`, or `script.js`.
2. Refresh the browser to see changes.
3. If you use the Python server, keep it running while you work.

## Deploy to GitHub Pages

### 1. Create a GitHub repository

1. Go to GitHub.
2. Create a new repository.
3. Do not add extra generated files if you plan to push this folder as-is.

### 2. Push this project

Run these commands inside this folder:

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPOSITORY.git
git push -u origin main
```

If the repository already exists locally, only run the commands that are missing for your case.

### 3. Enable GitHub Pages

1. Open the repository on GitHub.
2. Go to **Settings**.
3. Open **Pages** in the sidebar.
4. Under **Build and deployment**, set **Source** to **Deploy from a branch**.
5. Choose branch **main**.
6. Choose folder **/(root)**.
7. Click **Save**.

### 4. Open the live site

GitHub will publish the site at:

```text
https://YOUR-USERNAME.github.io/YOUR-REPOSITORY/
```

It may take a minute or two after saving the Pages settings.

## Update the deployed site later

After making changes, run:

```bash
git add .
git commit -m "Update game"
git push
```

GitHub Pages will redeploy automatically.