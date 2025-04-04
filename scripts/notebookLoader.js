// Global state variables
let currentNotebook = null;
let pageData = [];

// Load a notebook by ID
function loadNotebook(notebookId) {
    // Find the notebook configuration
    currentNotebook = notebooksConfig.notebooks.find(nb => nb.id === notebookId);
    
    if (!currentNotebook) {
        showError('Notebook not found');
        return;
    }
    
    // Update UI
    document.getElementById('notebookTitle').textContent = currentNotebook.title;
    document.title = currentNotebook.title;
    
    // Show loading message
    const loadingMessage = document.getElementById('loadingMessage');
    loadingMessage.textContent = 'Loading notebook data...';
    loadingMessage.style.display = 'block';
    
    // Clear any previous content
    const container = document.getElementById('notebookContainer');
    container.innerHTML = '';
    container.appendChild(loadingMessage);
    
    // Reset search state
    clearSearchHighlights();
    
    // Load notebook data from the single text file
    loadNotebookData();
}

// Load notebook data from the combined text file
function loadNotebookData() {
    // Reset page data
    pageData = [];
    
    // Construct the URL for the text file
    const textUrl = `${notebooksConfig.baseUrl}${currentNotebook.dataFile}`;
    
    // Fetch the text file
    fetch(textUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Failed to load data file: ${textUrl}`);
            }
            return response.text();
        })
        .then(text => {
            // Parse the combined text file
            parseNotebookData(text);
            
            // Create notebook content
            createNotebookPages();
            
            // Hide loading message
            document.getElementById('loadingMessage').style.display = 'none';
        })
        .catch(error => {
            console.error('Error loading notebook data:', error);
            document.getElementById('loadingMessage').textContent = 
                'Error loading notebook data. Please try again later.';
            
            // If there's an error loading the data file, try loading embedded data
            if (currentNotebook.id === 'an-ar') {
                console.log('Falling back to embedded data');
                loadEmbeddedData();
            }
        });
}

// Parse the notebook data from a single text file
function parseNotebookData(text) {
    // Reset page data
    pageData = [];
    
    // Split the text by sections using a regex pattern that identifies titles
    // This assumes each entry starts with a title on its own line
    const entries = text.split(/\n(?=\S[^\n]*\n-{3,})/g);
    
    entries.forEach((entry, index) => {
        if (entry.trim() === '') return; // Skip empty entries
        
        // Split the entry into title and content
        const lines = entry.trim().split('\n');
        let title = lines[0].trim();
        
        // Remove any separator line (----)
        let contentStart = 1;
        if (lines[1] && lines[1].match(/^-{3,}$/)) {
            contentStart = 2;
        }
        
        const content = lines.slice(contentStart).join('\n').trim();
        
        // Add to page data
        pageData.push({
            title: title,
            content: content
        });
    });
    
    // If no entries were found, create placeholders
    if (pageData.length === 0) {
        for (let i = 1; i <= currentNotebook.totalPages; i++) {
            pageData.push({
                title: `Page ${i}`,
                content: 'No content available.'
            });
        }
    }
    
    // If we have fewer entries than total pages, add placeholders
    while (pageData.length < currentNotebook.totalPages) {
        const pageNumber = pageData.length + 1;
        pageData.push({
            title: `Page ${pageNumber}`,
            content: 'No content available.'
        });
    }
    
    // If we have more entries than total pages, update the total pages
    if (pageData.length > currentNotebook.totalPages) {
        currentNotebook.totalPages = pageData.length;
    }
}

// Load embedded data for AN-AR notebook (for development purposes)
function loadEmbeddedData() {
    // This is sample data - in the final version, this would be loaded from text files
    pageData = [
        {
            title: "Anderson (Ohio, USA)",
            content: "30 III 68 From Harvard, entire 170g mass. Broke off small fragment. Rounded olivine, in many sized spheres from 0.3 to 1.0 cm. Some \"coalesced.\" There seems to be a border between coalesced nodules - indicates Schreiber, or differently oriented crystal structures, or both. Thin deposits of Schreiber seem to surround olivine. The olivine only appears to occupy ~50% of area in this section, and is definitely not close-packed. One metallic area is ~1.5 cm across. Small fragment shows some surface oxidation, but not too much."
        },
        {
            title: "Angelica",
            content: "9 II 70 USNM#2177, 4.8g, Area ~ 2 cm²; polished and etched (30 sec);  \nrather regular Widmanstätten pattern, band width ~0.5-1 mm; this piece contains an inclusion of Troilite and Cohenite (?) (see picture), and a small hole without oxidation products; most of the plessite shows micro-Widmanstätten structure. There are some very thin long cracks in this piece; surface slightly oxidized"
        },
        {
            title: "Angra Dos Reis (vion)",
            content: "IN 381\n\nHex JA  \n5.46% Ni, .2% P  \n57 ppm Ga, 188 ppm Ge, 31 ppm Ir  \nCohenite, Troilite, Schreibersite  \nVFB\n\nHexahedrite  \n5.5% Ni  \n.2% P  \nMany Habolites present  \nNeumann lines  \nSome Schreibersite  \n2 Vhard irregular inclusions, probably schreibersite  \nEffects of torsion visible along one side.\n\nINAA (1) 11 I 77  \n(2) 21 IX 77"
        },
        {
            title: "Arvorezinha",
            content: "This iron is from Zucoloto. She wondered if it could be Campo and the only evidence that it is not is a high Au content.\n\nPolishing (rough) and etching shows much evidence of oxidation, some L-shaped inclusions (bar thicknesses ~ 0.1mm, bar lengths 0.2 to 3 mm).  \nI am not sure that these are. They seem to be schreibisite.*\n\nThe sample is badly corroded and the only evidence regarding boundaries is that areas outlined by corrosion have dimensions of ~ 2 mm. But the ca. 1 cm^2 sample shows no kamacite boundaries. I speculate that it may have suffered reheating.\n\n*Perhaps these \"inclusions\" are taenite. One triangular area could be plessite. They occupy ~ 1-2% of the surface."
        }
    ];
    
    // Create notebook content
    createNotebookPages();
    
    // Hide loading message
    document.getElementById('loadingMessage').style.display = 'none';
}

// Show error message
function showError(message) {
    const container = document.getElementById('notebookContainer');
    const errorDiv = document.createElement('div');
    errorDiv.style.color = 'red';
    errorDiv.style.padding = '20px';
    errorDiv.style.textAlign = 'center';
    errorDiv.textContent = message;
    
    container.innerHTML = '';
    container.appendChild(errorDiv);
}