const notebooksConfig = {
    baseUrl: 'https://raw.githubusercontent.com/karriechey/JohnWassonNotebook/main/',
    notebooks: [
        {
            id: 'an-ar',
            title: 'John Wasson Meteorite Notebook (AN-AR)',
            imageFolder: 'images/AN_AR/',
            imagePrefix: 'An-Ar_page-',
            dataFile: 'data/an_ar.txt',
            totalPages: 20
        },
        {
            id: 'as-av',
            title: 'John Wasson Meteorite Notebook (AS-AV)',
            imageFolder: 'images/AS_AV/',
            imagePrefix: 'As-Av_page-',
            dataFile: 'data/as_av.txt',
            totalPages: 15
        },
        {
            id: 'a-al',
            title: 'John Wasson Meteorite Notebook (A-AL)',
            imageFolder: 'images/A_AL/',
            imagePrefix: 'A-AL_page-',
            dataFile: 'data/a_al.txt',
            totalPages: 26
        }
        // Add more notebooks here as needed
    ],
    
    // Alternative image paths to try if the primary paths fail
    alternativeImageFormats: [
        { pattern: '{baseUrl}{imageFolder}{imagePrefix}{paddedNumber}.jpg' },
        { pattern: '{baseUrl}{imageFolder}{lowercasePrefix}{paddedNumber}.jpg' },
        { pattern: 'https://karriechey.github.io/JohnWassonNotebook/{imageFolder}{imagePrefix}{paddedNumber}.jpg' },
        { pattern: 'images/{uppercaseId}/{imagePrefix}{paddedNumber}.jpg' },
        { pattern: '{baseUrl}{imageFolder}page-{paddedNumber}.jpg' }
    ]
};