

// Debug functions to help troubleshoot file loading issues

// Add this to your index.html before the closing </body> tag:
// <script src="js/debug.js"></script>

// Enable debugging mode
let debugMode = true;

// Debug logger function
function debugLog(message, data) {
    if (!debugMode) return;
    
    console.log(`%c[DEBUG] ${message}`, 'color: blue; font-weight: bold;', data || '');
}

// Test image loading
function testImageLoading() {
    if (!currentNotebook) {
        console.error("No notebook loaded");
        return;
    }
    
    debugLog('Testing image loading for notebook', currentNotebook.id);
    
    // Test loading the first image
    const testImg = new Image();
    const paddedNumber = '0001';
    testImg.src = `${notebooksConfig.baseUrl}${currentNotebook.imageFolder}${currentNotebook.imagePrefix}${paddedNumber}.jpg`;
    
    debugLog('Attempting to load image', testImg.src);
    
    testImg.onload = function() {
        debugLog('✅ Image loaded successfully', testImg.src);
    };
    
    testImg.onerror = function() {
        console.error('❌ Failed to load image', testImg.src);
        
        // Try alternative paths
        debugLog('Trying alternative paths...');
        
        // Try without the prefix
        const altImg1 = new Image();
        altImg1.src = `${notebooksConfig.baseUrl}${currentNotebook.imageFolder}${paddedNumber}.jpg`;
        debugLog('Testing', altImg1.src);
        
        altImg1.onload = function() {
            debugLog('✅ Alternative path works', altImg1.src);
            console.info('Suggestion: Update your config to use this path pattern');
        };
        
        // Try different case
        const altImg2 = new Image();
        const lowercasePrefix = currentNotebook.imagePrefix.toLowerCase();
        altImg2.src = `${notebooksConfig.baseUrl}${currentNotebook.imageFolder}${lowercasePrefix}${paddedNumber}.jpg`;
        debugLog('Testing', altImg2.src);
        
        altImg2.onload = function() {
            debugLog('✅ Alternative path works (lowercase)', altImg2.src);
            console.info('Suggestion: Update your config to use lowercase prefix');
        };
    };
}

// Test text file loading
function testTextLoading() {
    if (!currentNotebook) {
        console.error("No notebook loaded");
        return;
    }
    
    debugLog('Testing text file loading for notebook', currentNotebook.id);
    
    const textUrl = `${notebooksConfig.baseUrl}${currentNotebook.dataFile}`;
    debugLog('Attempting to load text file', textUrl);
    
    fetch(textUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Server responded with ${response.status}: ${response.statusText}`);
            }
            debugLog('✅ Text file loaded successfully', textUrl);
            return response.text();
        })
        .then(text => {
            debugLog('Text file content preview:', text.substring(0, 200) + '...');
        })
        .catch(error => {
            console.error('❌ Failed to load text file', textUrl, error);
            
            // Try alternative paths
            debugLog('Trying alternative paths...');
            
            // Try with .txt explicitly added
            const altUrl1 = `${textUrl}.txt`;
            fetch(altUrl1)
                .then(response => {
                    if (!response.ok) throw new Error('Not found');
                    debugLog('✅ Alternative path works', altUrl1);
                    console.info('Suggestion: Update your config to use this path pattern');
                })
                .catch(() => {
                    debugLog('❌ Alternative path failed', altUrl1);
                });
            
            // Try lowercase filename
            const altUrl2 = `${notebooksConfig.baseUrl}data/${currentNotebook.id.toLowerCase()}.txt`;
            fetch(altUrl2)
                .then(response => {
                    if (!response.ok) throw new Error('Not found');
                    debugLog('✅ Alternative path works', altUrl2);
                    console.info('Suggestion: Update your config to use this path pattern');
                })
                .catch(() => {
                    debugLog('❌ Alternative path failed', altUrl2);
                });
        });
}

// Add debugging commands to window for console access
window.meteoriteDebug = {
    testImageLoading,
    testTextLoading,
    toggleDebug: function() {
        debugMode = !debugMode;
        console.log(`Debug mode ${debugMode ? 'enabled' : 'disabled'}`);
    }
};

// Run tests when a notebook is loaded
document.addEventListener('notebookLoaded', function(e) {
    if (debugMode) {
        setTimeout(() => {
            testImageLoading();
            testTextLoading();
        }, 1000);
    }
});

// Add event to notify when notebook is loaded
function notifyNotebookLoaded() {
    document.dispatchEvent(new CustomEvent('notebookLoaded', {
        detail: { notebookId: currentNotebook.id }
    }));
}

// Override the createNotebookPages function to add notification
const originalCreateNotebookPages = window.createNotebookPages;
window.createNotebookPages = function() {
    originalCreateNotebookPages.apply(this, arguments);
    notifyNotebookLoaded();
};

// Log initialization
debugLog('Debug tools initialized. Access via window.meteoriteDebug in console.');