// Debug notebook loading issues

document.addEventListener('DOMContentLoaded', function() {
    // Add console debugging
    console.log('Starting debug monitoring');
    
    // Monitor notebook selection changes
    const notebookSelect = document.getElementById('notebookSelect');
    if (notebookSelect) {
        const originalOnChange = notebookSelect.onchange;
        notebookSelect.onchange = function(event) {
            console.log(`Notebook selection changed to: ${this.value}`);
            
            // Force clear the container
            const container = document.getElementById('notebookContainer');
            if (container) {
                console.log('Forcibly clearing notebook container');
                container.innerHTML = '<div class="loading" id="loadingMessage">Loading notebook data...</div>';
            }
            
            // Call the original handler if it exists
            if (typeof originalOnChange === 'function') {
                originalOnChange.call(this, event);
            }
        };
    }
    
    // Monitor loadNotebook function
    if (typeof loadNotebook === 'function') {
        const originalLoadNotebook = loadNotebook;
        window.loadNotebook = function(notebookId) {
            console.log(`DEBUG: loadNotebook called for ${notebookId}`);
            
            // Reset pageData to ensure it's empty
            pageData = [];
            
            return originalLoadNotebook(notebookId);
        };
    }
    
    // Monitor parseNotebookData function
    if (typeof parseNotebookData === 'function') {
        const originalParseNotebookData = parseNotebookData;
        window.parseNotebookData = function(text) {
            console.log(`DEBUG: parseNotebookData called with text length: ${text.length}`);
            console.log(`First 100 chars: ${text.substring(0, 100)}`);
            
            const result = originalParseNotebookData(text);
            console.log(`DEBUG: parseNotebookData processed ${pageData.length} pages`);
            return result;
        };
    }
    
    // Test function to reload the current notebook
    window.reloadCurrentNotebook = function() {
        if (currentNotebook) {
            console.log(`Forcing reload of notebook: ${currentNotebook.id}`);
            loadNotebook(currentNotebook.id);
        } else {
            console.log('No current notebook to reload');
        }
    };
    
    // Test function to manually load a notebook
    window.manualLoadNotebook = function(notebookId) {
        console.log(`Manually loading notebook: ${notebookId}`);
        // Reset global state
        pageData = [];
        
        // Load notebook
        const notebook = notebooksConfig.notebooks.find(nb => nb.id === notebookId);
        if (notebook) {
            currentNotebook = notebook;
            
            // Update UI
            document.getElementById('notebookTitle').textContent = notebook.title;
            document.title = notebook.title;
            
            // Clear container and show loading
            const container = document.getElementById('notebookContainer');
            container.innerHTML = '<div class="loading" id="loadingMessage">Loading notebook data manually...</div>';
            
            // Load text data
            const textUrl = `${notebooksConfig.baseUrl}${notebook.dataFile}`;
            console.log(`Loading from: ${textUrl}`);
            
            fetch(textUrl)
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`Failed to load: ${response.status}`);
                    }
                    return response.text();
                })
                .then(text => {
                    console.log(`Got text data, length: ${text.length}`);
                    parseNotebookData(text);
                    createNotebookPages();
                    document.getElementById('loadingMessage').style.display = 'none';
                })
                .catch(error => {
                    console.error('Manual load failed:', error);
                    // Try embedded data as fallback
                    loadEmbeddedData();
                });
        } else {
            console.error(`Notebook not found: ${notebookId}`);
        }
    };
    
    console.log('Debug monitoring initialized');
    console.log('Available debug commands:');
    console.log('- window.reloadCurrentNotebook()');
    console.log('- window.manualLoadNotebook("an-ar")');
    console.log('- window.testAllImagePaths(currentNotebook, 1)');
});

// Add custom styles for debug information
const style = document.createElement('style');
style.textContent = `
.debug-info {
    position: fixed;
    bottom: 10px;
    left: 10px;
    background: rgba(0, 0, 0, 0.7);
    color: #fff;
    padding: 10px;
    border-radius: 5px;
    font-family: monospace;
    font-size: 12px;
    max-width: 400px;
    max-height: 200px;
    overflow: auto;
    z-index: 9999;
    display: none;
}

.debug-toggle {
    position: fixed;
    bottom: 10px;
    left: 10px;
    background: #333;
    color: #fff;
    border: none;
    border-radius: 5px;
    padding: 5px 10px;
    cursor: pointer;
    z-index: 10000;
}
`;
document.head.appendChild(style);

// Add debug panel
document.addEventListener('DOMContentLoaded', function() {
    const debugToggle = document.createElement('button');
    debugToggle.className = 'debug-toggle';
    debugToggle.textContent = 'Debug';
    
    const debugInfo = document.createElement('div');
    debugInfo.className = 'debug-info';
    
    document.body.appendChild(debugToggle);
    document.body.appendChild(debugInfo);
    
    debugToggle.addEventListener('click', function() {
        const display = debugInfo.style.display;
        debugInfo.style.display = display === 'none' ? 'block' : 'none';
        
        if (debugInfo.style.display === 'block') {
            // Update debug info
            const info = [
                `Current Notebook: ${currentNotebook ? currentNotebook.id : 'None'}`,
                `Page Data Length: ${pageData ? pageData.length : 0}`,
                `Total Pages: ${currentNotebook ? currentNotebook.totalPages : 0}`,
                `Data URL: ${currentNotebook ? notebooksConfig.baseUrl + currentNotebook.dataFile : 'None'}`,
                `Image Folder: ${currentNotebook ? currentNotebook.imageFolder : 'None'}`
            ].join('<br>');
            
            debugInfo.innerHTML = info;
        }
    });
});