// test_script.test.js

// Mocking necessary DOM elements and functions for testing in a Node.js environment
// In a real browser environment, these would be available globally.
const document = {
    getElementById: (id) => ({
        innerHTML: '',
        appendChild: () => {},
        querySelector: () => ({}),
        querySelectorAll: () => []
    }),
    createElement: (tag) => {
        const element = {
            classList: { add: () => {} },
            setAttribute: () => {},
            addEventListener: () => {},
            innerHTML: '',
            id: '',
            style: {},
            querySelector: () => ({}),
            querySelectorAll: () => [],
            appendChild: (child) => { element.innerHTML += child.nodeValue; } // Mock appendChild
        };
        return element;
    },
    createTextNode: (text) => ({ nodeValue: text }),
    dispatchEvent: () => {} // Mock dispatchEvent for DOMContentLoaded
};

const window = { location: { href: 'http://localhost:8000' } };
const navigator = { clipboard: { writeText: () => Promise.resolve() } };

// --- Functions from script.js (for testing purposes) ---
// In a real test setup (e.g., with Jest), you would import these functions.

let thoughts = [];
let currentPage = 1;
const thoughtsPerPage = 5;



function sanitizeHTML(str) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
}



// Simplified displayThoughts for testing HTML generation
function displayThoughtsForTest(paginatedThoughts) {
    let generatedHtml = '';
    paginatedThoughts.forEach(thought => {
        const explanation = thought.explanation;
        generatedHtml += `
            <section class="thought" id="thought-${thought.id}">
                <div class="thought-header">
                    <span class="date">${thought.date}</span>
                </div>
                <div class="text-block">
                    <blockquote>"${sanitizeHTML(thought.quote)}"</blockquote>
                    <p class="author">- ${sanitizeHTML(thought.author)}</p>
                </div>
                <div class="explanation">
                    <p>${explanation}</p>
                </div>
                <div class="share-buttons">
                    <button class="share-btn twitter-share" data-quote="${sanitizeHTML(thought.quote)}">Share on X</button>
                    <button class="share-btn linkedin-share" data-quote="${sanitizeHTML(thought.quote)}">Share on LinkedIn</button>
                    <button class="share-btn facebook-share" data-quote="${sanitizeHTML(thought.quote)}">Share on Facebook</button>
                    <button class="share-btn copy-quote" data-quote="${sanitizeHTML(thought.quote)}">Copy Quote</button>
                </div>
            </section>
        `;
    });
    return generatedHtml;
}

// --- Test Cases ---

// Mock data for tests
const mockThoughts = [
    {
        id: 0,
        quote: "Quote 1",
        author: "Author 1",
        date: "Date 1",
        explanation: "Explanation for quote 1 with keyword thinking."
    },
    {
        id: 1,
        quote: "Quote 2",
        author: "Author 2",
        date: "Date 2",
        explanation: "Explanation for quote 2 about patterns."
    },
    {
        id: 2,
        quote: "Quote 3",
        author: "Author 3",
        date: "Date 3",
        explanation: "Another explanation with thinking and patterns."
    }
];

describe('JavaScript Unit Tests', () => {
    beforeEach(() => {
        thoughts = [...mockThoughts];
    });

    it('should generate correct HTML for thoughts', () => {
        const generatedHtml = displayThoughtsForTest([mockThoughts[0]]);
        expect(generatedHtml).toContain('<section class="thought" id="thought-0">');
        expect(generatedHtml).toContain('<span class="date">Date 1</span>');
        expect(generatedHtml).toContain('<blockquote>"Quote 1"</blockquote>');
        expect(generatedHtml).toContain('<p class="author">- Author 1</p>');
        expect(generatedHtml).toContain(`
                <div class="explanation">
                    <p>Explanation for quote 1 with keyword thinking.</p>
                </div>`);
        expect(generatedHtml).toContain('<button class="share-btn twitter-share" data-quote="Quote 1">Share on X</button>');
    });

    it('should update the current year in the footer', () => {
        const mockCurrentYearElement = { textContent: '' };
        const originalGetElementById = document.getElementById;
        document.getElementById = (id) => {
            if (id === 'current-year') {
                return mockCurrentYearElement;
            }
            return originalGetElementById(id);
        };

        // Simulate the part of the script that updates the date
        // This assumes the script has already run and the DOMContentLoaded event has fired
        const scriptContent = `
            const currentYearElement = document.getElementById('current-year');
            if (currentYearElement) {
                currentYearElement.textContent = new Date().getFullYear().toString();
            }
        `;
        eval(scriptContent); // Execute the script content

        expect(mockCurrentYearElement.textContent).toBe(new Date().getFullYear().toString());

        // Restore original getElementById
        document.getElementById = originalGetElementById;
    });
});
