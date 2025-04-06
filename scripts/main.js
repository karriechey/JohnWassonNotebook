// Initialize the viewer when the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeNotebookViewer();
});

// Main initialization function
function initializeNotebookViewer() {
    // Populate notebook selector dropdown
    populateNotebookSelector();
    
    // Set up event listeners
    setupEventListeners();
    
    // Load the default notebook (AN-AR)
    loadNotebook('an-ar');
}


//  Refresh button: to make it go back to the top of the page when clicked

document.addEventListener('DOMContentLoaded', function() {
    // Get the refresh button
    const refreshBtn = document.getElementById('clearSearch') || document.getElementById('reloadNotebook');
    
    if (refreshBtn) {
        // Update the button's tooltip and title
        refreshBtn.title = 'Back to top';
        refreshBtn.setAttribute('aria-label', 'Back to top');
        
        // Remove any existing event listeners by cloning and replacing the button
        refreshBtn.replaceWith(refreshBtn.cloneNode(true));
        
        // Get the fresh element reference
        const freshBtn = document.getElementById('clearSearch') || document.getElementById('reloadNotebook');
        
        // Add the new event listener
        freshBtn.addEventListener('click', function(event) {
            event.preventDefault();
            
            console.log('Back to top button clicked');
            
            // Scroll to the top of the page
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
});


// Future authentication and GitHub API integration functions will go here
// Examples:

/*
// Authentication functions 
function initializeAuthentication() {
    // Set up login form and event handlers
}

function authenticateUser(username, password) {
    // Authenticate with GitHub
}

// GitHub API functions
function initializeGitHubAPI(token) {
    // Initialize GitHub API with authentication token
}

function updateFile(path, content, message) {
    // Update a file in the GitHub repository
}

function createFile(path, content, message) {
    // Create a new file in the GitHub repository
}
*/