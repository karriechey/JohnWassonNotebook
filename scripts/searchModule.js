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
    
    // Update floating search navigation
    updateFloatingSearchNav();
    
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
    
    // Hide floating search navigation
    const floatingNav = document.getElementById('floatingSearchNav');
    if (floatingNav) {
        floatingNav.classList.remove('active');
    }
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
    
    // Update floating search navigation
    updateFloatingSearchNav();
}

// Initialize the floating search navigation
function initFloatingSearchNav() {
    // Check if the floating nav already exists
    if (document.getElementById('floatingSearchNav')) {
        return; // Already initialized
    }
    
    // Create the floating navigation element
    const floatingNav = document.createElement('div');
    floatingNav.id = 'floatingSearchNav';
    floatingNav.className = 'floating-search-nav';
    floatingNav.innerHTML = `
        <button id="floatingPrevResult" title="Previous result">↑</button>
        <div id="floatingCurrentResult" class="count">0/0</div>
        <button id="floatingNextResult" title="Next result">↓</button>
        <button id="floatingClearSearch" class="close-btn" title="Clear search">×</button>
    `;
    
    // Add the element to the body
    document.body.appendChild(floatingNav);
    
    // Add styles for the floating navigation
    const style = document.createElement('style');
    style.textContent = `
        .floating-search-nav {
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            display: flex;
            align-items: center;
            background-color: rgba(0, 0, 0, 0.7);
            color: white;
            padding: 10px 15px;
            border-radius: 30px;
            box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
            z-index: 1000;
            transition: opacity 0.3s, transform 0.3s;
            opacity: 0;
            pointer-events: none;
            gap: 10px;
        }
        
        .floating-search-nav.active {
            opacity: 1;
            pointer-events: all;
            transform: translateX(-50%) translateY(0);
        }
        
        .floating-search-nav button {
            background-color: transparent;
            border: 1px solid rgba(255, 255, 255, 0.5);
            color: white;
            width: 36px;
            height: 36px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            font-size: 16px;
            transition: background-color 0.2s;
        }
        
        .floating-search-nav button:hover {
            background-color: rgba(255, 255, 255, 0.2);
        }
        
        .floating-search-nav button:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }
        
        .floating-search-nav .count {
            padding: 0 10px;
            font-size: 14px;
            font-weight: bold;
        }
        
        .floating-search-nav .close-btn {
            font-size: 18px;
            margin-left: 5px;
        }
    `;
    document.head.appendChild(style);
    
    // Set up event listeners
    const floatingPrevBtn = document.getElementById('floatingPrevResult');
    const floatingNextBtn = document.getElementById('floatingNextResult');
    const floatingClearBtn = document.getElementById('floatingClearSearch');
    
    floatingPrevBtn.addEventListener('click', function() {
        navigateSearchResults('prev');
    });
    
    floatingNextBtn.addEventListener('click', function() {
        navigateSearchResults('next');
    });
    
    floatingClearBtn.addEventListener('click', function() {
        clearSearchHighlights();
    });
    
    // Add keyboard support for the floating navigation
    document.addEventListener('keydown', function(event) {
        // Only handle when search is active
        if (!floatingNav.classList.contains('active')) return;
        
        if (event.key === 'ArrowDown' || event.key === 'ArrowRight') {
            navigateSearchResults('next');
            event.preventDefault();
        } else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') {
            navigateSearchResults('prev');
            event.preventDefault();
        } else if (event.key === 'Escape') {
            clearSearchHighlights();
            event.preventDefault();
        }
    });
}

// Update the floating search navigation
function updateFloatingSearchNav() {
    // Ensure the floating nav is initialized
    if (!document.getElementById('floatingSearchNav')) {
        initFloatingSearchNav();
    }
    
    const floatingNav = document.getElementById('floatingSearchNav');
    const floatingCountDisplay = document.getElementById('floatingCurrentResult');
    const floatingPrevBtn = document.getElementById('floatingPrevResult');
    const floatingNextBtn = document.getElementById('floatingNextResult');
    
    if (!floatingNav || !floatingCountDisplay || !floatingPrevBtn || !floatingNextBtn) {
        return;
    }
    
    const resultsCount = searchState.matches.length;
    
    if (resultsCount > 0) {
        // Show the floating navigation
        floatingNav.classList.add('active');
        
        // Update the counter
        floatingCountDisplay.textContent = `${searchState.currentMatchIndex + 1}/${resultsCount}`;
        
        // Enable/disable buttons
        floatingPrevBtn.disabled = searchState.currentMatchIndex <= 0;
        floatingNextBtn.disabled = searchState.currentMatchIndex >= resultsCount - 1;
    } else {
        // Hide the floating navigation
        floatingNav.classList.remove('active');
    }
}

// Initialize floating search navigation when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initFloatingSearchNav();
});