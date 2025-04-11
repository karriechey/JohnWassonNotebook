// Editor Module for in-page editing with GitHub integration

// Configuration
const editorConfig = {
    // This is just a placeholder - in production, use a proper auth system
    password: "EPSS2025",
    
    // GitHub API configuration
    github: {
        owner: "karriechey",
        repo: "JohnWassonNotebook",
        // Token will be loaded at runtime from a secure source
        // Never hardcode tokens in production code
        apiBase: "https://api.github.com"
    },
    
    // Editing state
    state: {
        isEditing: false,
        originalContent: null,
        currentNotebookId: null,
        changedPages: new Map()
    }
};

// Initialize the editor module
function initializeEditor() {
    console.log("Initializing editor module...");
    
    // Add floating edit controls to the page
    addFloatingEditControls();
    
    // Set up event listeners
    const editModeToggle = document.getElementById('editModeToggle');
    const authModal = document.getElementById('authModal');
    const closeModal = document.querySelector('.close');
    const authSubmit = document.getElementById('authSubmit');
    const saveChanges = document.getElementById('floatingSaveChanges');
    const cancelEditing = document.getElementById('floatingCancelEditing');
    
    // Edit mode toggle
    editModeToggle.addEventListener('click', () => {
        if (editorConfig.state.isEditing) {
            // Already in edit mode, do nothing
            return;
        }
        
        // Show authentication modal
        authModal.style.display = 'block';
    });
    
    // Close modal
    closeModal.addEventListener('click', () => {
        authModal.style.display = 'none';
    });
    
    // Authentication submission
    authSubmit.addEventListener('click', () => {
        const password = document.getElementById('editorPassword').value;
        
        if (password === editorConfig.password) {
            // Authentication successful
            authModal.style.display = 'none';
            enableEditMode();
        } else {
            alert("Invalid password. Please try again.");
        }
    });
    
    // Save changes
    saveChanges.addEventListener('click', saveContentToGitHub);
    
    // Cancel editing
    cancelEditing.addEventListener('click', disableEditMode);
    
    // Window click to close modal
    window.addEventListener('click', (event) => {
        if (event.target === authModal) {
            authModal.style.display = 'none';
        }
    });
    
    // Custom event listener for pages rendered
    document.addEventListener('pagesRendered', (event) => {
        // Store current notebook ID
        editorConfig.state.currentNotebookId = event.detail.notebookId;
        
        // If in edit mode, make content editable
        if (editorConfig.state.isEditing) {
            makeContentEditable();
        }
    });
    
    // Update back-to-top button position when in edit mode
    updateBackToTopButtonPosition();
}

// Add floating edit controls to the page
function addFloatingEditControls() {
    // Check if floating controls already exist
    if (document.getElementById('floatingEditControls')) {
        return;
    }
    
    // Create floating controls container
    const floatingControls = document.createElement('div');
    floatingControls.id = 'floatingEditControls';
    floatingControls.className = 'floating-edit-controls';
    
    // Create save button
    const saveButton = document.createElement('button');
    saveButton.id = 'floatingSaveChanges';
    saveButton.className = 'save-button';
    saveButton.setAttribute('data-tooltip', 'Save Changes');
    saveButton.innerHTML = '💾';
    
    // Create cancel button
    const cancelButton = document.createElement('button');
    cancelButton.id = 'floatingCancelEditing';
    cancelButton.className = 'cancel-button';
    cancelButton.setAttribute('data-tooltip', 'Cancel');
    cancelButton.innerHTML = '✖';
    
    // Add buttons to container
    floatingControls.appendChild(saveButton);
    floatingControls.appendChild(cancelButton);
    
    // Add container to body
    document.body.appendChild(floatingControls);
    
    // Add CSS for floating controls
    addFloatingControlsStyles();
}

// Add CSS for floating controls
function addFloatingControlsStyles() {
    // Check if styles already exist
    if (document.getElementById('floatingControlsStyles')) {
        return;
    }
    
    // Create style element
    const style = document.createElement('style');
    style.id = 'floatingControlsStyles';
    
    // Add CSS
    style.textContent = `
    /* Floating edit controls */
    .floating-edit-controls {
        position: fixed;
        bottom: 20px;
        right: 20px;
        display: flex;
        flex-direction: column;
        gap: 10px;
        z-index: 1000;
        transition: opacity 0.3s, transform 0.3s;
        opacity: 0;
        transform: translateY(20px);
        pointer-events: none;
    }

    .floating-edit-controls.active {
        opacity: 1;
        transform: translateY(0);
        pointer-events: all;
    }

    .floating-edit-controls button {
        width: 60px;
        height: 60px;
        border-radius: 50%;
        border: none;
        color: white;
        font-size: 24px;
        cursor: pointer;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        display: flex;
        align-items: center;
        justify-content: center;
        transition: transform 0.2s, background-color 0.2s;
    }

    .floating-edit-controls button:hover {
        transform: translateY(-5px);
    }

    .floating-edit-controls .save-button {
        background-color: #4CAF50;
    }

    .floating-edit-controls .save-button:hover {
        background-color: #45a049;
    }

    .floating-edit-controls .cancel-button {
        background-color: #f44336;
    }

    .floating-edit-controls .cancel-button:hover {
        background-color: #d32f2f;
    }

    /* Add a tooltip for buttons */
    .floating-edit-controls button {
        position: relative;
    }

    .floating-edit-controls button::after {
        content: attr(data-tooltip);
        position: absolute;
        right: 70px;
        top: 50%;
        transform: translateY(-50%);
        background-color: rgba(0, 0, 0, 0.7);
        color: white;
        padding: 5px 10px;
        border-radius: 4px;
        font-size: 14px;
        white-space: nowrap;
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.2s;
    }

    .floating-edit-controls button:hover::after {
        opacity: 1;
    }
    `;
    
    // Add style to head
    document.head.appendChild(style);
}

// Enable edit mode
function enableEditMode() {
    console.log("Enabling edit mode...");
    
    // Update UI
    document.getElementById('editModeToggle').classList.add('active');
    document.getElementById('floatingEditControls').classList.add('active');
    
    // Set editing state
    editorConfig.state.isEditing = true;
    
    // Make content editable
    makeContentEditable();
    
    // Add visual indication that we're in edit mode
    document.body.classList.add('edit-mode');
    
    // Show notification
    showNotification("Edit mode enabled. Click on text to make changes.");
    
    // Update back-to-top button position
    updateBackToTopButtonPosition();
}

// Disable edit mode
function disableEditMode() {
    console.log("Disabling edit mode...");
    
    // Update UI
    document.getElementById('editModeToggle').classList.remove('active');
    document.getElementById('floatingEditControls').classList.remove('active');
    
    // Reset editing state
    editorConfig.state.isEditing = false;
    
    // Restore original content if changes were made
    if (editorConfig.state.changedPages.size > 0) {
        if (confirm("You have unsaved changes. Are you sure you want to exit edit mode?")) {
            // Reload the current notebook to restore original content
            loadNotebook(editorConfig.state.currentNotebookId);
            
            // Clear changed pages
            editorConfig.state.changedPages.clear();
        } else {
            // User cancelled, stay in edit mode
            editorConfig.state.isEditing = true;
            document.getElementById('editModeToggle').classList.add('active');
            document.getElementById('floatingEditControls').classList.add('active');
            return;
        }
    } else {
        // No changes were made, just make content non-editable
        makeContentNonEditable();
    }
    
    // Remove visual indication
    document.body.classList.remove('edit-mode');
    
    // Show notification
    showNotification("Edit mode disabled.");
    
    // Update back-to-top button position
    updateBackToTopButtonPosition();
}

// Update back-to-top button position to avoid overlap with floating edit controls
function updateBackToTopButtonPosition() {
    const backToTopBtn = document.getElementById('backToTop');
    if (!backToTopBtn) return;
    
    if (editorConfig.state.isEditing) {
        backToTopBtn.style.bottom = '100px'; // Move up to avoid overlap
    } else {
        backToTopBtn.style.bottom = '20px'; // Restore original position
    }
}

// Make page content editable
function makeContentEditable() {
    const textElements = document.querySelectorAll('.text-content');
    const titleElements = document.querySelectorAll('.page-title');
    
    // Make text content editable
    textElements.forEach((element, index) => {
        // Store original content if not already stored
        const pageNumber = index + 1;
        if (!editorConfig.state.changedPages.has(pageNumber)) {
            editorConfig.state.changedPages.set(pageNumber, {
                originalTitle: titleElements[index].textContent,
                originalContent: element.textContent,
                changed: false
            });
        }
        
        // Make editable
        element.contentEditable = 'true';
        element.classList.add('editable');
        
        // Add input event listener
        element.addEventListener('input', function() {
            const pageData = editorConfig.state.changedPages.get(pageNumber);
            pageData.changed = true;
            pageData.newContent = this.textContent;
            
            // Highlight changed content
            this.classList.add('content-changed');
        });
    });
    
    // Make titles editable
    titleElements.forEach((element, index) => {
        // Make editable
        element.contentEditable = 'true';
        element.classList.add('editable');
        
        // Add input event listener
        element.addEventListener('input', function() {
            const pageNumber = index + 1;
            const pageData = editorConfig.state.changedPages.get(pageNumber);
            pageData.changed = true;
            pageData.newTitle = this.textContent;
            
            // Highlight changed content
            this.classList.add('content-changed');
        });
    });
}

// Make content non-editable
function makeContentNonEditable() {
    const textElements = document.querySelectorAll('.text-content');
    const titleElements = document.querySelectorAll('.page-title');
    
    // Make text content non-editable
    textElements.forEach(element => {
        element.contentEditable = 'false';
        element.classList.remove('editable', 'content-changed');
        
        // Remove input event listeners
        element.replaceWith(element.cloneNode(true));
    });
    
    // Make titles non-editable
    titleElements.forEach(element => {
        element.contentEditable = 'false';
        element.classList.remove('editable', 'content-changed');
        
        // Remove input event listeners
        element.replaceWith(element.cloneNode(true));
    });
}

// Save content to GitHub
async function saveContentToGitHub() {
    // Check if there are any changes
    let hasChanges = false;
    editorConfig.state.changedPages.forEach(page => {
        if (page.changed) {
            hasChanges = true;
        }
    });
    
    if (!hasChanges) {
        showNotification("No changes detected to save.");
        return;
    }
    
    // Get commit message
    const commitMessage = prompt("Please enter a description of your changes:", "Update notebook content");
    if (!commitMessage) {
        // User cancelled
        return;
    }
    
    // Show saving indicator
    showNotification("Preparing to save changes...", true);
    
    try {
        // Get GitHub token - this would be securely loaded in a production app
        const token = await getGitHubToken();
        
        if (!token) {
            showNotification("Failed to get GitHub authentication token.", false, true);
            return;
        }
        
        // Get current notebook data file path
        const notebook = currentNotebook;
        if (!notebook) {
            showNotification("No notebook is currently loaded.", false, true);
            return;
        }
        
        // Prepare the updated content
        const updatedContent = await prepareUpdatedContent(notebook);
        
        // Create a GitHub pull request
        const result = await createGitHubPullRequest(token, notebook, updatedContent, commitMessage);
        
        if (result.success) {
            showNotification(`Changes saved successfully! Pull request #${result.prNumber} created.`);
            
            // Reset changed state
            editorConfig.state.changedPages.forEach(page => {
                page.changed = false;
            });
            
            // Remove highlight from changed content
            document.querySelectorAll('.content-changed').forEach(element => {
                element.classList.remove('content-changed');
            });
        } else {
            showNotification(`Failed to save changes: ${result.error}`, false, true);
        }
    } catch (error) {
        console.error("Error saving changes:", error);
        showNotification(`Error saving changes: ${error.message}`, false, true);
    }
}

// Prepare updated content from the changes
async function prepareUpdatedContent(notebook) {
    // Get current file content from GitHub
    const currentFileContent = await fetchFileContent(notebook.dataFile);
    
    if (!currentFileContent) {
        throw new Error("Failed to retrieve current file content");
    }
    
    // Parse the content into pages
    const pages = parseFileContentIntoPages(currentFileContent);
    
    // Apply changes
    editorConfig.state.changedPages.forEach((pageData, pageNumber) => {
        if (pageData.changed) {
            if (pageNumber <= pages.length) {
                // Update existing page
                if (pageData.newTitle) {
                    pages[pageNumber - 1].title = pageData.newTitle;
                }
                if (pageData.newContent) {
                    pages[pageNumber - 1].content = pageData.newContent;
                }
            }
        }
    });
    
    // Reassemble the file content
    return assembleFileContent(pages, notebook);
}

// Parse file content into pages
function parseFileContentIntoPages(content) {
    const pages = [];
    
    // First, check if the file has a header line
    let headerLine = "";
    const headerMatch = content.match(/^=== \*\*Filename: (.*?)\*\*/);
    if (headerMatch) {
        headerLine = headerMatch[0];
    }
    
    // Parse pages
    const pageRegex = /=== \*\*Page: (\d+) of \d+\*\*\s*\n\s*(.*?)\s*\n\s*([\s\S]*?)(?=(?:=== \*\*Page:|$))/g;
    
    let match;
    while ((match = pageRegex.exec(content)) !== null) {
        const pageNumber = parseInt(match[1], 10);
        const title = match[2].trim();
        const pageContent = match[3].trim();
        
        pages[pageNumber - 1] = {
            number: pageNumber,
            title: title,
            content: pageContent
        };
    }
    
    // If no pages were found but we have content, try a simpler approach
    if (pages.length === 0 && content.trim().length > 0) {
        // Split by double newlines
        const chunks = content.split(/\n\n+/);
        if (chunks.length > 1) {
            // Assume first chunk is title
            const title = chunks[0].trim();
            const pageContent = chunks.slice(1).join("\n\n");
            
            pages.push({
                number: 1,
                title: title,
                content: pageContent
            });
        }
    }
    
    return pages;
}

// Assemble file content from pages
function assembleFileContent(pages, notebook) {
    let content = `=== **Filename: ${notebook.id}.pdf**\n`;
    
    pages.forEach(page => {
        content += `=== **Page: ${page.number} of ${pages.length}**\n\n${page.title}\n\n${page.content}\n\n`;
    });
    
    return content;
}

// Fetch file content from GitHub
async function fetchFileContent(filePath) {
    return new Promise((resolve) => {
        // First try to fetch from GitHub API using the current data in memory
        if (pageData && pageData.length > 0) {
            try {
                const content = pageDataToFileContent();
                if (content) {
                    console.log("Using in-memory page data for file content");
                    resolve(content);
                    return;
                }
            } catch (error) {
                console.warn("Failed to convert page data to file content:", error);
            }
        }
        
        // If that fails, fetch from the raw URL
        const fileUrl = `${notebooksConfig.baseUrl}${filePath}`;
        console.log(`Fetching file content from: ${fileUrl}`);
        
        fetch(fileUrl)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Failed to fetch file: ${response.status}`);
                }
                return response.text();
            })
            .then(text => {
                resolve(text);
            })
            .catch(error => {
                console.error("Error fetching file content:", error);
                resolve(null);
            });
    });
}

// Convert current pageData to file content
function pageDataToFileContent() {
    if (!pageData || !pageData.length || !currentNotebook) {
        return null;
    }
    
    let content = `=== **Filename: ${currentNotebook.id}.pdf**\n`;
    
    pageData.forEach((page, index) => {
        const pageNumber = index + 1;
        content += `=== **Page: ${pageNumber} of ${pageData.length}**\n\n${page.title}\n\n${page.content}\n\n`;
    });
    
    return content;
}

// Create a GitHub pull request
async function createGitHubPullRequest(token, notebook, updatedContent, commitMessage) {
    try {
        // 1. Get the current commit SHA for the target branch
        const branchData = await fetch(`${editorConfig.github.apiBase}/repos/${editorConfig.github.owner}/${editorConfig.github.repo}/branches/main`, {
            headers: {
                'Authorization': `token ${token}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        }).then(res => res.json());
        
        const baseSha = branchData.commit.sha;
        
        // 2. Create a new branch
        const timestamp = new Date().getTime();
        const newBranchName = `edit-${notebook.id}-${timestamp}`;
        
        await fetch(`${editorConfig.github.apiBase}/repos/${editorConfig.github.owner}/${editorConfig.github.repo}/git/refs`, {
            method: 'POST',
            headers: {
                'Authorization': `token ${token}`,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                ref: `refs/heads/${newBranchName}`,
                sha: baseSha
            })
        });
        
        // 3. Get the current file to get its SHA
        const fileData = await fetch(`${editorConfig.github.apiBase}/repos/${editorConfig.github.owner}/${editorConfig.github.repo}/contents/${notebook.dataFile}`, {
            headers: {
                'Authorization': `token ${token}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        }).then(res => res.json());
        
        // 4. Update the file in the new branch
        const fileResponse = await fetch(`${editorConfig.github.apiBase}/repos/${editorConfig.github.owner}/${editorConfig.github.repo}/contents/${notebook.dataFile}`, {
            method: 'PUT',
            headers: {
                'Authorization': `token ${token}`,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: commitMessage || `Update ${notebook.id} notebook content`,
                content: btoa(unescape(encodeURIComponent(updatedContent))), // Base64 encode the content properly for UTF-8
                sha: fileData.sha,
                branch: newBranchName
            })
        }).then(res => res.json());
        
        // 5. Create a pull request
        const pullRequestData = await fetch(`${editorConfig.github.apiBase}/repos/${editorConfig.github.owner}/${editorConfig.github.repo}/pulls`, {
            method: 'POST',
            headers: {
                'Authorization': `token ${token}`,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                title: commitMessage || `Update ${notebook.title} content`,
                body: 'These changes were made using the in-page editor.',
                head: newBranchName,
                base: 'main'
            })
        }).then(res => res.json());
        
        return {
            success: true,
            prNumber: pullRequestData.number,
            prUrl: pullRequestData.html_url
        };
    } catch (error) {
        console.error("Error creating pull request:", error);
        return {
            success: false,
            error: error.message
        };
    }
}

// Get GitHub token
async function getGitHubToken() {
    // In a real implementation, you would get the token from a more secure source
    
    // First try to get token from sessionStorage if it exists
    let token = sessionStorage.getItem('github_token');
    
    if (!token) {
        // Show more detailed instructions to the user
        const instructions = `
To save changes to GitHub, you need a Personal Access Token (PAT).

How to get a token:
1. Go to GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Click "Generate new token (classic)"
3. Give it a name like "Meteorite Notebook Editor"
4. Select at least the "repo" scope
5. Click "Generate token"
6. Copy the token and paste it below

Your token will be stored in your browser for this session only.
`;
        
        alert(instructions);
        
        // Prompt user to enter their personal access token
        token = prompt("Please enter your GitHub Personal Access Token with repo scope:", "");
        
        if (token) {
            // Store in sessionStorage for the duration of the browser session
            sessionStorage.setItem('github_token', token);
        }
    }
    
    return token;
}

// Show notification
function showNotification(message, isLoading = false, isError = false) {
    // Remove any existing notification
    const existingNotif = document.querySelector('.editor-notification');
    if (existingNotif) {
        existingNotif.remove();
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'editor-notification';
    
    if (isLoading) {
        notification.classList.add('loading');
    }
    
    if (isError) {
        notification.classList.add('error');
    }
    
    notification.textContent = message;
    
    // Add to body
    document.body.appendChild(notification);
    
    // Add notification styles if not already added
    addNotificationStyles();
    
    // Auto remove after 5 seconds unless it's a loading notification
    if (!isLoading) {
        setTimeout(() => {
            if (notification.parentNode) {
                notification.classList.add('fade-out');
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.parentNode.removeChild(notification);
                    }
                }, 500);
            }
        }, 5000);
    }
    
    return notification;
}

// Add notification styles
function addNotificationStyles() {
    // Check if styles already exist
    if (document.getElementById('notificationStyles')) {
        return;
    }
    
    // Create style element
    const style = document.createElement('style');
    style.id = 'notificationStyles';
    
    // Add CSS
    style.textContent = `
    /* Notification */
    .editor-notification {
        position: fixed;
        bottom: 20px;
        left: 20px;
        background-color: #4CAF50;
        color: white;
        padding: 15px 20px;
        border-radius: 5px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
        z-index: 1000;
        animation: slideIn 0.3s ease-out;
    }

    .editor-notification.error {
        background-color: #f44336;
    }

    .editor-notification.loading {
        background-color: #2196F3;
    }

    .editor-notification.loading::after {
        content: "...";
        animation: dots 1.5s infinite;
    }

    .editor-notification.fade-out {
        animation: fadeOut 0.5s ease-out forwards;
    }

    @keyframes slideIn {
        from {
            transform: translateX(-100px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @keyframes fadeOut {
        from {
            opacity: 1;
        }
        to {
            opacity: 0;
        }
    }

    @keyframes dots {
        0% { content: "."; }
        33% { content: ".."; }
        66% { content: "..."; }
    }

    /* Editable content styles */
    .editable {
        border: 1px dashed #ccc;
        padding: 10px;
        background-color: #f9f9f9;
        min-height: 30px;
    }

    .editable:focus {
        border-color: #2196F3;
        outline: none;
        background-color: white;
    }

    .content-changed {
        background-color: #e8f5e9;
    }

    .edit-mode .page-section {
        position: relative;
    }

    .edit-mode .page-section::before {
        content: 'Editable';
        position: absolute;
        top: 5px;
        right: 5px;
        background-color: #2196F3;
        color: white;
        padding: 3px 8px;
        border-radius: 3px;
        font-size: 12px;
        z-index: 10;
    }
    `;
    
    // Add style to head
    document.head.appendChild(style);
}

// Export functions for global use
window.editorModule = {
    initialize: initializeEditor,
    enableEditMode: enableEditMode,
    disableEditMode: disableEditMode,
    saveChanges: saveContentToGitHub
};