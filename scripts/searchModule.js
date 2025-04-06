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
        alert('Please enter a search term');
        return;
    }
    
    console.log(`Performing search for: "${searchTerm}"`);
    console.log(`Search in titles: ${searchInTitle}, Search in content: ${searchInContent}`);
    
    // Clear previous search results
    clearSearchHighlights();
    
    // Reset search state
    searchState = {
        matches: [],
        currentMatchIndex: -1
    };
    
    // Verify we have page data to search
    if (!pageData || pageData.length === 0) {
        console.error('No page data available for search');
        alert('No content available to search. Please try loading the notebook again.');
        return;
    }
    
    // Log first few pages for debugging
    console.log(`Searching through ${pageData.length} pages`);
    if (pageData.length > 0) {
        console.log(`First page title: "${pageData[0].title}"`);
        console.log(`First page content preview: "${pageData[0].content.substring(0, 50)}..."`);
    }
    
    // Find matches
    let matchesFound = false;
    
    for (let i = 0; i < pageData.length; i++) {
        const pageNumber = i + 1;
        const page = pageData[i];
        
        if (!page.title || !page.content) {
            console.warn(`Page ${pageNumber} has missing data`, page);
            continue;
        }
        
        const titleMatches = searchInTitle && page.title.toLowerCase().includes(searchTerm);
        const contentMatches = searchInContent && page.content.toLowerCase().includes(searchTerm);
        
        if (titleMatches || contentMatches) {
            matchesFound = true;
            console.log(`Match found on page ${pageNumber}: Title match: ${titleMatches}, Content match: ${contentMatches}`);
            
            const pageSection = document.querySelector(`#page-${pageNumber}`);
            if (!pageSection) {
                console.warn(`Could not find DOM element for page ${pageNumber}`);
                continue;
            }
            
            // Highlight title matches
            if (titleMatches) {
                const titleElement = pageSection.querySelector('.page-title');
                if (titleElement) {
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
            }
            
            // Highlight content matches
            if (contentMatches) {
                const contentElement = pageSection.querySelector('.text-content');
                if (contentElement) {
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
    }
    
    // Update search results UI
    updateSearchResultsUI();
    
    // Show floating navigation
    showFloatingNav();
    
    // Navigate to first result if found
    if (searchState.matches.length > 0) {
        console.log(`${searchState.matches.length} matches found`);
        navigateSearchResults('next');
    } else {
        if (matchesFound) {
            console.warn('Matches were found in page data but no elements were highlighted');
            alert(`No visible matches found for: "${searchTerm}". There might be a display issue.`);
        } else {
            console.log('No matches found');
            alert(`No matches found for: "${searchTerm}"`);
        }
    }
}

// Highlight text in an element
function highlightText(element, searchTerm) {
    const text = element.textContent;
    if (!text) {
        console.warn('Element has no text content to highlight', element);
        return;
    }
    
    try {
        // Create a case-insensitive regular expression
        const regex = new RegExp(escapeRegExp(searchTerm), 'gi');
        const highlightedText = text.replace(regex, match => `<mark>${match}</mark>`);
        element.innerHTML = highlightedText;
    } catch (error) {
        console.error('Error highlighting text:', error);
    }
}

// Helper function to escape special characters in search term for RegExp
function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

// Clear all search highlights
function clearSearchHighlights() {
    document.querySelectorAll('mark').forEach(mark => {
        const parent = mark.parentNode;
        if (parent) {
            try {
                parent.replaceChild(document.createTextNode(mark.textContent), mark);
                parent.normalize();
            } catch (error) {
                console.error('Error removing highlight:', error);
            }
        }
    });
    
    // Reset search state
    searchState = {
        matches: [],
        currentMatchIndex: -1
    };
    
    // Hide search results UI
    document.getElementById('searchResults').style.display = 'none';
    
    // Hide floating navigation
    hideFloatingNav();
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
    
    console.log(`Navigating ${direction}, current index: ${searchState.currentMatchIndex}, total matches: ${matches.length}`);
    
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
    if (!currentMatch || !currentMatch.element) {
        console.error('Current match is invalid', currentMatch);
        return;
    }
    
    // Scroll to match with a slight delay to ensure DOM is ready
    setTimeout(() => {
        try {
            currentMatch.element.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });
        } catch (error) {
            console.error('Error scrolling to match:', error);
        }
    }, 100);
    
    // Highlight current match
    matches.forEach((match, index) => {
        if (match && match.element) {
            if (index === searchState.currentMatchIndex) {
                match.element.style.backgroundColor = 'orange';
            } else {
                match.element.style.backgroundColor = 'yellow';
            }
        }
    });
    
    // Update UI
    updateSearchResultsUI();
    
    // Update floating navigation counter
    updateFloatingNavCounter();
}

// Show the floating navigation
function showFloatingNav() {
    const floatingNav = document.getElementById('floatingSearchNav');
    if (floatingNav && searchState.matches.length > 0) {
        floatingNav.classList.add('active');
        updateFloatingNavCounter();
    }
}

// Hide the floating navigation
function hideFloatingNav() {
    const floatingNav = document.getElementById('floatingSearchNav');
    if (floatingNav) {
        floatingNav.classList.remove('active');
    }
}

// Update the counter in the floating navigation
function updateFloatingNavCounter() {
    const floatingCurrentResult = document.getElementById('floatingCurrentResult');
    const floatingPrevBtn = document.getElementById('floatingPrevResult');
    const floatingNextBtn = document.getElementById('floatingNextResult');
    
    if (floatingCurrentResult && searchState.matches.length > 0) {
        floatingCurrentResult.textContent = `${searchState.currentMatchIndex + 1}/${searchState.matches.length}`;
    }
    
    if (floatingPrevBtn) {
        floatingPrevBtn.disabled = searchState.currentMatchIndex <= 0;
    }
    
    if (floatingNextBtn) {
        floatingNextBtn.disabled = searchState.currentMatchIndex >= searchState.matches.length - 1;
    }
}

// Set up event listeners once the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    const floatingPrevBtn = document.getElementById('floatingPrevResult');
    const floatingNextBtn = document.getElementById('floatingNextResult');
    const floatingClearBtn = document.getElementById('floatingClearSearch');
    
    if (floatingPrevBtn) {
        floatingPrevBtn.addEventListener('click', function(event) {
            event.preventDefault();
            console.log('Previous button clicked');
            navigateSearchResults('prev');
        });
    }
    
    if (floatingNextBtn) {
        floatingNextBtn.addEventListener('click', function(event) {
            event.preventDefault();
            console.log('Next button clicked');
            navigateSearchResults('next');
        });
    }
    
    if (floatingClearBtn) {
        floatingClearBtn.addEventListener('click', function(event) {
            event.preventDefault();
            console.log('Clear button clicked');
            clearSearchHighlights();
        });
    }
});