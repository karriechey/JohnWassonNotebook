# JohnWassonNotebook
https://karriechey.github.io/JohnWassonNotebook/

# In-Page Editing System

This repository includes an in-page editing system that allows authorized users to make changes to notebook content directly in the browser and submit those changes as GitHub pull requests.

## For Editors

### Getting Started

1. Visit the [John Wasson Meteorite Notebook viewer](https://karriechey.github.io/JohnWassonNotebook/)
2. Click the "Edit Mode" button in the top navigation bar
3. Enter the editor password when prompted (contact the repository maintainer for access)
4. The page will enter editing mode, with editable content highlighted

### Making Edits

1. Simply click on any page title or content text to modify it
2. Changes are highlighted in light green
3. Edit as many pages as needed in a single session
4. To cancel your changes, click the "Cancel" button

### Saving Changes

1. When you're ready to submit your changes, click the "Save Changes" button
2. You'll be prompted to enter a description of your changes
3. You'll then need to provide a GitHub Personal Access Token (instructions will appear)
4. Your changes will be submitted as a pull request to the repository

### Creating a GitHub Personal Access Token

To save changes, you'll need a GitHub Personal Access Token (PAT) with "repo" scope:

1. Go to GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Click "Generate new token (classic)"
3. Give it a name like "Meteorite Notebook Editor"
4. Select the "repo" scope
5. Click "Generate token"
6. Copy the token to use in the editor
->The token looks like a long string of characters, for example: ghp_aBcDeFgHiJkLmNoPqRsTuVwXyZ1234567890

Note: Your token is only stored in your browser for the current session.
