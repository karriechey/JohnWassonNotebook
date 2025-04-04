// Search state
let searchState = {
    matches: [],
    currentMatchIndex: -1
};

// Perform search within the current notebook
function performSearch() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase().trim();
    const searchInTitle = document.getElementById('searchTitle').checked;
    const searchInContent = document.getElementById('searchContent').checked;
    
    if (searchTerm === '') {
        return;
    }
    
    // Clear previous search results
    clearSearchHighlights();
    
    // Reset search state
    searchState = {
        matches: [],
        currentMatchIndex: -1
    };
    
    // Find matches
    for (let i = 0; i < pageData.length; i++) {
        const pageNumber = i + 1;
        const page = pageData[i];
        const titleMatches = searchInTitle && page.title.toLowerCase().includes(searchTerm);
        const contentMatches = searchInContent && page.content.toLowerCase().includes(searchTerm);
        
        if (titleMatches || contentMatches) {
            const pageSection = document.querySelector(`#page-${pageNumber}`);
            
            // Highlight title matches
            if (titleMatches) {
                const titleElement = pageSection.querySelector('.page-title');
                highlightText(titleElement, searchTerm);
                
                // Add to matches
                const marks = titleElement.querySelectorAll('mark');
                for (let mark of marks) {
                    searchState.matches.push({
                        element: mark,
                        pageNumber: pageNumber
                    });
                }
            }
            
            // Highlight content matches
            if (contentMatches) {
                const contentElement = pageSection.querySelector('.text-content');
                highlightText(contentElement, searchTerm);
                
                // Add to matches
                const marks = contentElement.querySelectorAll('mark');
                for (let mark of marks) {
                    searchState.matches.push({
                        element: mark,
                        pageNumber: pageNumber
                    });
                }
            }
        }
    }
    
    // Update search results UI
    updateSearchResultsUI();
    
    // Navigate to first result if found
    if (searchState.matches.length > 0) {
        navigateSearchResults('next');
    } else {
        alert('No matches found for: ' + searchTerm);
    }
}

// Highlight text in an element
function highlightText(element, searchTerm) {
    const text = element.textContent;
    const regex = new RegExp(searchTerm, 'gi');
    const highlightedText = text.replace(regex, match => `<mark>${match}</mark>`);
    element.innerHTML = highlightedText;
}

// Clear all search highlights
function clearSearchHighlights() {
    document.querySelectorAll('mark').forEach(mark => {
        const parent = mark.parentNode;
        parent.replaceChild(document.createTextNode(mark.textContent), mark);
        parent.normalize();
    });
    
    // Hide search results UI
    document.getElementById('searchResults').style.display = 'none';
}

// Update search results UI
function updateSearchResultsUI() {
    const resultsCount = searchState.matches.length;
    const resultsElement = document.getElementById('searchResults');
    const resultsCountElement = document.getElementById('searchResultsCount');
    const currentResultElement = document.getElementById('currentResult');
    const prevResultBtn = document.getElementById('prevResult');
    const nextResultBtn = document.getElementById('nextResult');
    
    if (resultsCount > 0) {
        resultsElement.style.display = 'block';
        resultsCountElement.textContent = `${resultsCount} result${resultsCount !== 1 ? 's' : ''} found`;
        
        // Update current result indicator
        currentResultElement.textContent = `${searchState.currentMatchIndex + 1}/${resultsCount}`;
        
        // Enable/disable navigation buttons
        prevResultBtn.disabled = searchState.currentMatchIndex <= 0;
        nextResultBtn.disabled = searchState.currentMatchIndex >= resultsCount - 1;
    } else {
        resultsElement.style.display = 'none';
    }
}

// Navigate search results
function navigateSearchResults(direction) {
    const matches = searchState.matches;
    
    if (matches.length === 0) {
        return;
    }
    
    // Update current match index
    if (direction === 'next') {
        searchState.currentMatchIndex++;
        if (searchState.currentMatchIndex >= matches.length) {
            searchState.currentMatchIndex = 0;
        }
    } else if (direction === 'prev') {
        searchState.currentMatchIndex--;
        if (searchState.currentMatchIndex < 0) {
            searchState.currentMatchIndex = matches.length - 1;
        }
    }
    
    // Get current match
    const currentMatch = matches[searchState.currentMatchIndex];
    
    // Scroll to match
    currentMatch.element.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
    });
    
    // Highlight current match
    matches.forEach((match, index) => {
        if (index === searchState.currentMatchIndex) {
            match.element.style.backgroundColor = 'orange';
        } else {
            match.element.style.backgroundColor = 'yellow';
        }
    });
    
    // Update UI
    updateSearchResultsUI();
}