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
        if (notebookId) {
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
}

// Populate the notebook selector dropdown
function populateNotebookSelector() {
    const selectElement = document.getElementById('notebookSelect');
    
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
    
    // Select AN-AR by default
    selectElement.value = 'an-ar';
}