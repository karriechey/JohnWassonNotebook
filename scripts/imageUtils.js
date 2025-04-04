/**
 * Utility functions for image handling in the Wasson Meteorite Notebook viewer
 */

/**
 * Constructs the image path for a specific notebook page
 * @param {Object} notebook - The notebook configuration object
 * @param {number} pageNumber - The page number
 * @returns {string} - The complete image path
 */
function getImagePath(notebook, pageNumber) {
    // Convert the page number to a string and add leading zeros to make it 4 digits
    const paddedNumber = pageNumber.toString().padStart(4, '0');
    
    // Use the correct file naming format from the GitHub repository
    const path = `${notebooksConfig.baseUrl}${notebook.imageFolder}${notebook.imagePrefix}${paddedNumber}.jpg`;
    
    // Log the image path for debugging purposes
    console.log(`Loading image: ${path}`);
    
    return path;
}

/**
 * Creates an image element with robust error handling
 * @param {Object} notebook - The notebook configuration object
 * @param {number} pageNumber - The page number
 * @param {string} altText - Alternative text for the image
 * @returns {HTMLImageElement} - The created image element
 */
function createImageElement(notebook, pageNumber, altText) {
    // Create the image element
    const img = document.createElement('img');
    
    // Enable lazy loading for better performance
    img.loading = 'lazy';
    
    // Format page number with leading zeros
    const paddedNumber = pageNumber.toString().padStart(4, '0');
    
    // Set the image source to the GitHub raw content URL with the correct format
    img.src = getImagePath(notebook, pageNumber);
    
    // Set descriptive alt text for accessibility
    img.alt = altText || `Page ${pageNumber}`;
    
    // Set a base64 encoded placeholder image that will display when error occurs
    // This is a tiny gray square image encoded as base64
    const placeholderImage = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAAABmJLR0QA/wD/AP+gvaeTAAAAB3RJTUUH4QIFBCg7lhEQ2gAAAAlwSFlzAAAOwwAADsMBx2+oZAAAABl0RVh0Q29tbWVudABDcmVhdGVkIHdpdGggR0lNUFeBDhcAAABsSURBVHja7c0BDQAAAMKg909tDwcUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADAuyoAAAEGutPR7QAAAABJRU5ErkJggg==';
    
    // Store notebook ID and padded page number in data attributes for use in error handler
    img.dataset.notebookId = notebook.id;
    img.dataset.paddedNumber = paddedNumber;
    img.dataset.imageFolder = notebook.imageFolder;
    img.dataset.imagePrefix = notebook.imagePrefix;
    
    // Handle image loading errors with multiple fallback options
    img.onerror = function() {
        console.error(`Failed to load image: ${this.src}`);
        
        // Get the stored notebook details from data attributes
        const notebookId = this.dataset.notebookId;
        const paddedNumber = this.dataset.paddedNumber;
        const imageFolder = this.dataset.imageFolder;
        const imagePrefix = this.dataset.imagePrefix;
        
        // Try GitHub Pages URL format as a fallback
        if (this.src.includes('raw.githubusercontent.com')) {
            console.log('Trying GitHub Pages format...');
            this.src = `https://karriechey.github.io/JohnWassonNotebook/images/${imageFolder}${imagePrefix}${paddedNumber}.jpg`;
        }
        // If GitHub Pages format failed, try a relative path
        else if (this.src.includes('github.io')) {
            console.log('Trying relative path format...');
            this.src = `${imageFolder}${imagePrefix}${paddedNumber}.jpg`;
        }
        // Try without the folder path
        else if (this.src.includes(imageFolder)) {
            console.log('Trying without folder path...');
            this.src = `https://raw.githubusercontent.com/karriechey/JohnWassonNotebook/main/images/${imagePrefix}${paddedNumber}.jpg`;
        }
        // Try with lowercase prefix
        else if (!this.src.includes(imagePrefix.toLowerCase())) {
            console.log('Trying lowercase prefix...');
            this.src = `https://raw.githubusercontent.com/karriechey/JohnWassonNotebook/main/images/${imageFolder}${imagePrefix.toLowerCase()}${paddedNumber}.jpg`;
        }
        // If all attempts failed, use the placeholder
        else if (!this.src.startsWith('data:image/')) {
            console.log('All image loading attempts failed, using placeholder...');
            this.src = placeholderImage;
            this.alt = 'Image not available';
            this.classList.add('placeholder-image');
        }
    };
    
    return img;
}