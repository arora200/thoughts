document.addEventListener('DOMContentLoaded', function() {
    const thoughtsContainer = document.getElementById('thoughts-container');
    const paginationContainer = document.getElementById('pagination-container');
    const modal = document.getElementById('modal');
    const modalBody = document.getElementById('modal-body');
    const closeButton = document.querySelector('.close-button');
    const searchInput = document.getElementById('search-input');
    const categoryFiltersContainer = document.getElementById('category-filters');

    let thoughts = [];
    let filteredThoughts = []; // New variable for filtered results
    let currentPage = 1;
    const thoughtsPerPage = 5;
    let currentSearchQuery = '';
    let currentCategoryFilter = 'All'; // Default filter

    // Debounce function
    function debounce(func, delay) {
        let timeout;
        return function(...args) {
            const context = this;
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(context, args), delay);
        };
    }

    // Function to filter thoughts based on search query and category
    function filterThoughts() {
        filteredThoughts = thoughts.filter(thought => {
            const matchesSearch = thought.quote.toLowerCase().includes(currentSearchQuery.toLowerCase()) ||
                                  thought.explanation.toLowerCase().includes(currentSearchQuery.toLowerCase()) ||
                                  thought.author.toLowerCase().includes(currentSearchQuery.toLowerCase());

            const matchesCategory = currentCategoryFilter === 'All' ||
                                    (thought.category && thought.category.toLowerCase() === currentCategoryFilter.toLowerCase());

            return matchesSearch && matchesCategory;
        });
        currentPage = 1; // Reset to first page on filter/search
        displayThoughts(currentPage);
        setupPagination();
    }

    

    fetch('thoughts.json')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            thoughts = data.map((thought, index) => ({ ...thought, id: index }));
            filteredThoughts = [...thoughts]; // Initialize filteredThoughts
            displayCategories(); // Display category filters
            displayThoughts(currentPage);
            setupPagination();
        })
        .catch(error => {
            console.error('Error fetching thoughts:', error);
            thoughtsContainer.innerHTML = '<p>Failed to load thoughts. Please try again later.</p>';
        });

    // Function to display category filter buttons
    function displayCategories() {
        const categories = ['All', ...new Set(thoughts.map(thought => thought.category).filter(Boolean))];
        categoryFiltersContainer.innerHTML = ''; // Clear existing buttons

        categories.forEach(category => {
            const button = document.createElement('button');
            button.textContent = category;
            button.classList.add('category-filter-button');
            if (category === currentCategoryFilter) {
                button.classList.add('active');
            }
            button.addEventListener('click', () => {
                currentCategoryFilter = category;
                // Remove active class from all buttons
                document.querySelectorAll('.category-filter-button').forEach(btn => btn.classList.remove('active'));
                // Add active class to the clicked button
                button.classList.add('active');
                filterThoughts();
            });
            categoryFiltersContainer.appendChild(button);
        });
    }

    // Attach event listener to search input
    searchInput.addEventListener('input', debounce(() => {
        currentSearchQuery = searchInput.value;
        filterThoughts();
    }, 300));

    function displayThoughts(page) {
        thoughtsContainer.innerHTML = '';
        const pageIndex = page - 1;

        const startIndex = pageIndex * thoughtsPerPage;
        const endIndex = startIndex + thoughtsPerPage;
        const paginatedThoughts = filteredThoughts.slice(startIndex, endIndex);

        paginatedThoughts.forEach(thought => {
            const thoughtElement = document.createElement('section');
            thoughtElement.classList.add('thought');
            thoughtElement.id = `thought-${thought.id}`;
            const explanation = thought.explanation;

            thoughtElement.innerHTML = `
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
            `;
            thoughtsContainer.appendChild(thoughtElement);
        });

        // Add event listeners for the new links
        document.querySelectorAll('.read-more').forEach(link => {
            link.addEventListener('click', function(event) {
                event.preventDefault();
                const thoughtId = parseInt(this.getAttribute('data-thought-id'));
                const thought = thoughts.find(t => t.id === thoughtId);
                openModal(thought);
            });
        });

        // Add event listeners for share buttons
        document.querySelectorAll('.twitter-share').forEach(button => {
            button.addEventListener('click', function() {
                const quote = this.getAttribute('data-quote');
                const url = encodeURIComponent(window.location.href);
                window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(quote)}&url=${url}`, '_blank');
            });
        });

        document.querySelectorAll('.linkedin-share').forEach(button => {
            button.addEventListener('click', function() {
                const quote = this.getAttribute('data-quote');
                const url = encodeURIComponent(window.location.href);
                window.open(`https://www.linkedin.com/shareArticle?mini=true&url=${url}&title=${encodeURIComponent(quote)}`, '_blank');
            });
        });

        document.querySelectorAll('.facebook-share').forEach(button => {
            button.addEventListener('click', function() {
                const quote = this.getAttribute('data-quote');
                const url = encodeURIComponent(window.location.href);
                window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${encodeURIComponent(quote)}`, '_blank');
            });
        });

        document.querySelectorAll('.copy-quote').forEach(button => {
            button.addEventListener('click', function() {
                const quote = this.getAttribute('data-quote');
                navigator.clipboard.writeText(quote).then(() => {
                    alert('Quote copied to clipboard!');
                }).catch(err => {
                    console.error('Failed to copy: ', err);
                });
            });
        });
    }

    function openModal(thought) {
        modalBody.innerHTML = `
            <h2>${sanitizeHTML(thought.quote)}</h2>
            <p class="author">- ${sanitizeHTML(thought.author)}</p>
            <p>${sanitizeHTML(thought.explanation)}</p>
        `;
        modal.style.display = 'block';
    }

    function sanitizeHTML(str) {
        var div = document.createElement('div');
        div.appendChild(document.createTextNode(str));
        return div.innerHTML;
    }

    function closeModal() {
        modal.style.display = 'none';
    }

    closeButton.addEventListener('click', closeModal);
    window.addEventListener('click', function(event) {
        if (event.target == modal) {
            closeModal();
        }
    });

    function setupPagination() {
        const pageCount = Math.ceil(filteredThoughts.length / thoughtsPerPage);
        paginationContainer.innerHTML = ''; // Clear existing buttons
        for (let i = 1; i <= pageCount; i++) {
            const button = document.createElement('button');
            button.innerText = i;
            if (i === currentPage) {
                button.classList.add('active');
            }
            button.addEventListener('click', () => {
                currentPage = i;
                displayThoughts(currentPage);
                setupPagination();
            });
            paginationContainer.appendChild(button);
        }
    }

    // Dynamically update the footer date
    const currentYearElement = document.getElementById('current-year');
    if (currentYearElement) {
        currentYearElement.textContent = new Date().getFullYear();
    }
});