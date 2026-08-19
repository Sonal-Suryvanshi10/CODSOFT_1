# Firebase setup and GitHub Pages deployment

The app uses Firebase Authentication and Cloud Firestore. Uploaded audio is stored locally in the browser with IndexedDB, so Firebase Storage and billing are not required.

1. In the existing Firebase project, create a **Cloud Firestore** database. Choose the same project shown in `firebase.js`.
2. In Firestore’s **Rules** tab, paste and **publish** `firestore.rules`. GitHub deployment does not publish Firebase rules automatically; without this step cloud saves will be denied.
3. In **Authentication → Settings → Authorized domains**, add your GitHub Pages domain, such as `your-github-name.github.io`.
4. Push this `MUSIC PLAYER` folder to a GitHub repository. In **Settings → Pages**, select **Deploy from a branch**, choose `main` and the `/ (root)` folder. Your website will be available at `https://your-github-name.github.io/repository-name/`.

Firebase’s web configuration in `firebase.js` is designed to be public. The rules are what keep each user’s likes and playlists private. Uploaded audio remains available only in the same browser and device where it was added.
