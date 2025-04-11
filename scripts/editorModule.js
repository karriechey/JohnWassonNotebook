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
    
    // Set up event listeners
    const editModeToggle = document.getElementById('editModeToggle');
    const authModal = document.getElementById('authModal');
    const closeModal = document.querySelector('.close');
    const authSubmit = document.getElementById('authSubmit');
    const saveChanges = document.getElementById('saveChanges');
    const cancelEditing = document.getElementById('cancelEditing');
    
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
}

// Enable edit mode
function enableEditMode() {
    console.log("Enabling edit mode...");
    
    // Update UI
    document.getElementById('editModeToggle').classList.add('active');
    document.getElementById('editControls').classList.remove('hidden');
    
    // Set editing state
    editorConfig.state.isEditing = true;
    
    // Make content editable
    makeContentEditable();
    
    // Add visual indication that we're in edit mode
    document.body.classList.add('edit-mode');
    
    // Show notification
    showNotification("Edit mode enabled. Click on text to make changes.");
}

// Disable edit mode
function disableEditMode() {
    console.log("Disabling edit mode...");
    
    // Update UI
    document.getElementById('editModeToggle').classList.remove('active');
    document.getElementById('editControls').classList.add('hidden');
    
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
            document.getElementById('editControls').classList.remove('hidden');
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
    });
    
    // Make titles non-editable
    titleElements.forEach(element => {
        element.contentEditable = 'false';
        element.classList.remove('editable', 'content-changed');
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
        const result = await createGitHubPullRequest(token, notebook, updatedContent);
        
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
    return assembleFileContent(pages);
}

// Parse file content into pages
function parseFileContentIntoPages(content) {
    const pages = [];
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
    
    return pages;
}

// Assemble file content from pages
function assembleFileContent(pages) {
    let content = `=== **Filename: ${currentNotebook.id}.pdf**\n`;
    
    pages.forEach(page => {
        content += `=== **Page: ${page.number} of ${pages.length}**\n\n${page.title}\n\n${page.content}\n\n`;
    });
    
    return content;
}

// Fetch file content from GitHub
async function fetchFileContent(filePath) {
    // In a real implementation, this would use the GitHub API
    // For now, we'll use the current pageData
    return new Promise((resolve) => {
        // Get the data file URL
        const fileUrl = `${notebooksConfig.baseUrl}${filePath}`;
        
        // Fetch the file
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

// Create a GitHub pull request
async function createGitHubPullRequest(token, notebook, updatedContent) {
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
        
        // 3. Update the file in the new branch
        const fileResponse = await fetch(`${editorConfig.github.apiBase}/repos/${editorConfig.github.owner}/${editorConfig.github.repo}/contents/${notebook.dataFile}`, {
            method: 'PUT',
            headers: {
                'Authorization': `token ${token}`,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: `Update ${notebook.id} notebook content`,
                content: btoa(updatedContent), // Base64 encode the content
                branch: newBranchName
            })
        }).then(res => res.json());
        
        // 4. Create a pull request
        const pullRequestData = await fetch(`${editorConfig.github.apiBase}/repos/${editorConfig.github.owner}/${editorConfig.github.repo}/pulls`, {
            method: 'POST',
            headers: {
                'Authorization': `token ${token}`,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                title: `Update ${notebook.title} content`,
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
    // In a real implementation, this would securely obtain the token
    // This is a mockup for demonstration purposes
    
    // Option 1: Get token from a secure server endpoint
    // return fetch('/api/github-token').then(res => res.text());
    
    // Option 2: Prompt user to enter their personal access token
    const token = prompt("Please enter your GitHub Personal Access Token with repo scope:", "");
    
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

// Export functions for global use
window.editorModule = {
    initialize: initializeEditor,
    enableEditMode: enableEditMode,
    disableEditMode: disableEditMode,
    saveChanges: saveContentToGitHub
};