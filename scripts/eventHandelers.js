// Set up all event listeners
function setupEventListeners() {
    const notebookSelect = document.getElementById('notebookSelect');
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');
    const backToTopBtn = document.getElementById('backToTop');
    const prevResultBtn = document.getElementById('prevResult');
    const nextResultBtn = document.getElementById('nextResult');
    
    // Notebook selection change
    notebookSelect.addEventListener('change', function() {
        const notebookId = this.value;
        console.log(`Notebook selection changed to: ${notebookId}`);
        
        if (notebookId) {
            // Clear any previous search results before loading the new notebook
            if (typeof clearSearchHighlights === 'function') {
                clearSearchHighlights();
            }
            
            // Reset the search input field
            if (searchInput) {
                searchInput.value = '';
            }
            
            // Load the selected notebook
            loadNotebook(notebookId);
        }
    });
    
    // Search functionality
    searchInput.addEventListener('keyup', function(event) {
        if (event.key === 'Enter') {
            performSearch();
        }
    });
    
    searchButton.addEventListener('click', performSearch);
    
    // Back to top button
    window.addEventListener('scroll', function() {
        if (window.pageYOffset > 300) {
            backToTopBtn.style.display = 'block';
        } else {
            backToTopBtn.style.display = 'none';
        }
    });
    
    backToTopBtn.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
    
    // Search navigation
    prevResultBtn.addEventListener('click', function() {
        navigateSearchResults('prev');
    });
    
    nextResultBtn.addEventListener('click', function() {
        navigateSearchResults('next');
    });
    
    // Add keydown event for keyboard navigation
    document.addEventListener('keydown', function(event) {
        // Allow keyboard navigation through search results using arrow keys
        if (document.getElementById('searchResults').style.display === 'block') {
            if (event.key === 'ArrowDown' || event.key === 'ArrowRight') {
                navigateSearchResults('next');
                event.preventDefault();
            } else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') {
                navigateSearchResults('prev');
                event.preventDefault();
            }
        }
    });
}

// Populate the notebook selector dropdown
function populateNotebookSelector() {
    const selectElement = document.getElementById('notebookSelect');
    
    // Clear any existing options
    selectElement.innerHTML = '';
    
    // Sort notebooks alphabetically
    const sortedNotebooks = [...notebooksConfig.notebooks].sort((a, b) => 
        a.title.localeCompare(b.title)
    );
    
    // Add options to the select element
    sortedNotebooks.forEach(notebook => {
        const option = document.createElement('option');
        option.value = notebook.id;
        option.textContent = notebook.title;
        selectElement.appendChild(option);
    });
    
    // Select the first notebook by default or AN-AR if available
    const defaultNotebook = sortedNotebooks.find(nb => nb.id === 'an-ar') || sortedNotebooks[0];
    if (defaultNotebook) {
        selectElement.value = defaultNotebook.id;
    }
    
    console.log(`Populated notebook selector with ${sortedNotebooks.length} notebooks`);
}