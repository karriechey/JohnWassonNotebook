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
    if (typeof clearSearchHighlights === 'function') {
        clearSearchHighlights();
    }
    
    // Load notebook data from the text file
    loadNotebookData();
}

// Load notebook data from the text file
function loadNotebookData() {
    // Reset page data
    pageData = [];
    
    // Construct the URL for the text file
    const textUrl = `${notebooksConfig.baseUrl}${currentNotebook.dataFile}`;
    
    console.log(`Loading text data from: ${textUrl}`);
    
    // Fetch the text file
    fetch(textUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Failed to load data file: ${textUrl} (Status: ${response.status})`);
            }
            return response.text();
        })
        .then(text => {
            // Parse the text file
            parseNotebookData(text);
            
            // Create notebook content
            createNotebookPages();
            
            // Hide loading message
            document.getElementById('loadingMessage').style.display = 'none';
            
            // Log success
            console.log(`Successfully loaded notebook data for ${currentNotebook.id}`);
        })
        .catch(error => {
            console.error('Error loading notebook data:', error);
            
            // Try alternate data URL
            const alternateUrl = `https://karriechey.github.io/JohnWassonNotebook/${currentNotebook.dataFile}`;
            console.log(`Trying alternate data URL: ${alternateUrl}`);
            
            fetch(alternateUrl)
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`Failed to load alternate data file: ${alternateUrl}`);
                    }
                    return response.text();
                })
                .then(text => {
                    parseNotebookData(text);
                    createNotebookPages();
                    document.getElementById('loadingMessage').style.display = 'none';
                    console.log(`Successfully loaded notebook data from alternate URL`);
                })
                .catch(altError => {
                    console.error('Error loading from alternate URL:', altError);
                    document.getElementById('loadingMessage').textContent = 
                        'Error loading notebook data. Please try again later.';
                    
                    // If there's an error loading both data files, try loading embedded data
                    loadEmbeddedData();
                });
        });
}

// Parse the notebook data from text file
function parseNotebookData(text) {
    // Reset page data
    pageData = [];
    
    // Check if the text contains page markers
    const hasPageMarkers = text.includes('=== **Page:');
    
    if (hasPageMarkers) {
        // Split by page markers
        const pageRegex = /=== \*\*Page: (\d+) of \d+\*\*([\s\S]*?)(?=(?:=== \*\*Page:|$))/g;
        let match;
        
        while ((match = pageRegex.exec(text)) !== null) {
            const pageNumber = parseInt(match[1], 10);
            const pageContent = match[2].trim();
            
            // Extract title and content
            const lines = pageContent.split('\n');
            const title = lines[0].trim();
            const content = lines.slice(1).join('\n').trim();
            
            // Add to page data
            pageData[pageNumber - 1] = {
                title: title,
                content: content
            };
        }
    } else {
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
    }
    
    // Fill in any missing pages with placeholders
    for (let i = 0; i < currentNotebook.totalPages; i++) {
        if (!pageData[i]) {
            pageData[i] = {
                title: `Page ${i + 1}`,
                content: 'No content available.'
            };
        }
    }
    
    // If we have more entries than total pages, update the total pages
    if (pageData.length > currentNotebook.totalPages) {
        currentNotebook.totalPages = pageData.length;
    }
    
    console.log(`Parsed ${pageData.length} pages of data`);
}

// Load embedded sample data for when data files can't be accessed
function loadEmbeddedData() {
    console.log('Loading embedded sample data');
    
    // This is sample data - in the final version, this would be loaded from text files
    if (currentNotebook.id === 'an-ar') {
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
    } else if (currentNotebook.id === 'a-al') {
        pageData = [
            {
                title: "Abakan",
                content: "Schreineitz No 1  \n(668)\n\nOct. bw 1.1 ± 0.3 mm  \nreheated sch. etc >1000°C ; matrix poly x, dz; toenite clear ; 2/8 indistinct & thorny  \nlittle schreib. (-tiny ones all dissolved ?) plessite dissolving up, surrounding a -denser, more  \nshadowy pptce. Small fields have already hatched. - C effect ?  \nvanished.  \nCurious post-heating Corrosion along x gib & planes  \nunique ?  \ntiny gray pptc ? 10μ"
            },
            {
                title: "Abee, metal clast 3,3,02,",
                content: "From Derch Sears July/August 1980\n\nJa INAA. 1.124 grammes one fragment to be mounted for pal thin section.  \nSilicate/Carbide inclusions!  \nNB NB"
            }
        ];
    } else if (currentNotebook.id === 'as-av') {
        pageData = [
            {
                title: "Asarca Mexicana",
                content: "2 II 70 USNM no number yet, 7.1 g , Polished and etched (45 sec) Two adjacent plains, total area ~ 4 cm^2; average band width of slightly swollen Widmanstatten patterns is ~1mm; several types of plessite: coarse crystalline, fine crypto, some with minor Widmanstatten structure; some Schreibersite (or Cohenite?) in inclusions ; one thin crack containing Schreibersite , slight edge oxidation  \n1.1 +- 0.2"
            },
            {
                title: "Ashfork (Arizona, USA)",
                content: "20 Aug 1967. Remnant (~5g) of sample from AMNH. Polished and etched to see vital sides of, 1.5cm^2. Clear structure  \nreheating visible on mottled kamacite, but plessite is  \nstill very clear, as is schreib at grain boundaries. Kamacite bands ~ 0.7-1.9mm, Og. Plagioclase in beam are distinct, as are some Neumann bands. Relatively fresh specimen. No cohenite,  \ngraphite, troilite recognizable. Schreib along grain boundaries.  \nPlessite fine, taenite between boundaries is discontinuous."
            }
        ];
    }
    
    // Fill in pages up to the total
    while (pageData.length < currentNotebook.totalPages) {
        const pageNumber = pageData.length + 1;
        pageData.push({
            title: `Page ${pageNumber}`,
            content: 'No content available. This is placeholder data because the original content could not be loaded.'
        });
    }
    
    // Create notebook content
    createNotebookPages();
    
    // Hide loading message
    document.getElementById('loadingMessage').style.display = 'none';
    
    // Show a warning about using embedded data
    const container = document.getElementById('notebookContainer');
    const warningDiv = document.createElement('div');
    warningDiv.style.backgroundColor = '#fff3cd';
    warningDiv.style.color = '#856404';
    warningDiv.style.padding = '10px';
    warningDiv.style.margin = '10px 0';
    warningDiv.style.borderRadius = '5px';
    warningDiv.style.textAlign = 'center';
    warningDiv.textContent = 'Using embedded sample data. Some content may be missing or incomplete.';
    
    container.insertBefore(warningDiv, container.firstChild);
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