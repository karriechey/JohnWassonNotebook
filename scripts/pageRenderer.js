// Create notebook pages in the DOM
function createNotebookPages() {
    const container = document.getElementById('notebookContainer');
    container.innerHTML = ''; // Clear container
    
    for (let i = 0; i < pageData.length; i++) {
        const page = pageData[i];
        const pageNumber = i + 1;
        
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
        const img = createImageElement(currentNotebook, pageNumber, `Page ${pageNumber}: ${page.title}`);
        
        imageWrapper.appendChild(img);
        imageContainer.appendChild(imageWrapper);
        
        // Create text container
        const textContainer = document.createElement('div');
        textContainer.className = 'text-container';
        
        const pageNum = document.createElement('div');
        pageNum.className = 'page-number';
        pageNum.textContent = `Page ${pageNumber} of ${currentNotebook.totalPages}`;
        
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
}