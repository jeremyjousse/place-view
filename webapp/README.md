# Webapp

The web app uses SvelteKit and GitHub Pages.

## Deploy

The workflow builds the app and copies `resources/places.json` into the site.
The workflow runs after relevant changes reach `main`.
You can also run the workflow manually.

1. In repository settings, select **Pages**.
2. Set the build source to **GitHub Actions** before running the new workflow.
3. Keep `webcams.jousse.fr` as the custom domain and keep HTTPS enabled.
4. Run the **Deploy website** workflow.
5. Check `https://webcams.jousse.fr/` and `https://jeremyjousse.github.io/place-view/places.json`.

The GitHub URL for `places.json` redirects to the custom domain.
The Swift app depends on this URL.
Keep the custom domain configured when changing deployment settings.
Disable automatic deployments in the previous hosting provider separately.

The build generates a static page for each place in `resources/places.json`.
Changes to that file trigger a new deployment.
GitHub Pages returns HTTP 404 for unknown paths, even when the fallback app loads.

## URL state

The URL stores the current view and place in the path.
It stores search text in `q` and the favorites-only filter in `favorites=1`.
It stores the map position in `lat`, `lon`, and `zoom`.
The map uses `place` to focus on a selected place.
Favorite selections remain in browser storage and are not shared in the URL.
