// Create notebook pages in the DOM
function createNotebookPages() {
    const container = document.getElementById('notebookContainer');
    
    // Clear container
    container.innerHTML = ''; 
    
    // Verify we have data to render
    if (!pageData || pageData.length === 0) {
        console.error('No page data available to render');
        container.innerHTML = `
            <div class="error-message" style="text-align: center; padding: 20px; color: #721c24; background-color: #f8d7da; border-radius: 5px;">
                <h2>No Content Available</h2>
                <p>Unable to load notebook content. Please try selecting a different notebook or refreshing the page.</p>
                <button onclick="window.location.reload()" style="padding: 8px 15px; background-color: #dc3545; color: white; border: none; border-radius: 4px; cursor: pointer; margin-top: 10px;">Refresh Page</button>
            </div>
        `;
        return;
    }
    
    console.log(`Creating ${pageData.length} pages in the DOM`);
    
    // Create page sections
    for (let i = 0; i < pageData.length; i++) {
        const page = pageData[i];
        const pageNumber = i + 1;
        
        // Skip if page data is invalid
        if (!page || !page.title || !page.content) {
            console.warn(`Skipping page ${pageNumber} due to missing data`);
            continue;
        }
        
        // Create page section
        const section = document.createElement('section');
        section.className = 'page-section';
        section.id = `page-${pageNumber}`;
        
        // Create image container
        const imageContainer = document.createElement('div');
        imageContainer.className = 'image-container';
        
        const imageWrapper = document.createElement('div');
        imageWrapper.className = 'image-wrapper';
        
        // Use the utility function to create the image with robust error handling
        if (currentNotebook) {
            try {
                const img = createImageElement(currentNotebook, pageNumber, `Page ${pageNumber}: ${page.title}`);
                imageWrapper.appendChild(img);
            } catch (error) {
                console.error(`Error creating image for page ${pageNumber}:`, error);
                const errorMsg = document.createElement('div');
                errorMsg.className = 'image-error';
                errorMsg.textContent = 'Image could not be loaded';
                imageWrapper.appendChild(errorMsg);
            }
        } else {
            console.warn('No current notebook available for images');
        }
        
        imageContainer.appendChild(imageWrapper);
        
        // Create text container
        const textContainer = document.createElement('div');
        textContainer.className = 'text-container';
        
        const pageNum = document.createElement('div');
        pageNum.className = 'page-number';
        
        if (currentNotebook) {
            pageNum.textContent = `Page ${pageNumber} of ${currentNotebook.totalPages}`;
        } else {
            pageNum.textContent = `Page ${pageNumber}`;
        }
        
        const pageTitle = document.createElement('h2');
        pageTitle.className = 'page-title';
        pageTitle.textContent = page.title;
        
        const textContent = document.createElement('div');
        textContent.className = 'text-content';
        textContent.textContent = page.content;
        
        textContainer.appendChild(pageNum);
        textContainer.appendChild(pageTitle);
        textContainer.appendChild(textContent);
        
        // Add them to the section
        section.appendChild(imageContainer);
        section.appendChild(textContainer);
        
        // Add the section to the container
        container.appendChild(section);
    }
    
    // Notify that notebook pages have been created (for debugging)
    console.log(`Created ${pageData.length} page elements in the DOM`);
    
    // Dispatch a custom event to notify that pages are rendered
    document.dispatchEvent(new CustomEvent('pagesRendered', {
        detail: { 
            notebookId: currentNotebook ? currentNotebook.id : 'unknown', 
            pageCount: pageData.length 
        }
    }));
}

// Create a visual notification that pages were rendered
function showRenderNotification() {
    const notif = document.createElement('div');
    notif.style.position = 'fixed';
    notif.style.bottom = '20px';
    notif.style.right = '20px';
    notif.style.backgroundColor = '#28a745';
    notif.style.color = 'white';
    notif.style.padding = '10px 20px';
    notif.style.borderRadius = '5px';
    notif.style.zIndex = '9999';
    notif.textContent = 'Notebook loaded successfully';
    
    document.body.appendChild(notif);
    
    // Remove after 3 seconds
    setTimeout(() => {
        if (notif.parentNode) {
            notif.parentNode.removeChild(notif);
        }
    }, 3000);
}

// Listen for the pagesRendered event
document.addEventListener('pagesRendered', function(event) {
    console.log(`Pages rendered for notebook: ${event.detail.notebookId}, page count: ${event.detail.pageCount}`);
    showRenderNotification();
});