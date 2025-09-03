document.addEventListener('DOMContentLoaded', function() {
    const thoughtsContainer = document.getElementById('thoughts-container');
    const paginationContainer = document.getElementById('pagination-container');
    const modal = document.getElementById('modal');
    const modalBody = document.getElementById('modal-body');
    const closeButton = document.querySelector('.close-button');

    let thoughts = [];
    let keywordMap = {};
    let currentPage = 1;
    const thoughtsPerPage = 5;

    fetch('thoughts.json')
        .then(response => response.json())
        .then(data => {
            thoughts = data.map((thought, index) => ({ ...thought, id: index }));
            createKeywordMap();
            displayThoughts(currentPage);
            setupPagination();
        });

    function createKeywordMap() {
        thoughts.forEach(thought => {
            thought.keywords.forEach(keyword => {
                keywordMap[keyword.toLowerCase()] = thought.id;
            });
        });
    }

    function linkKeywords(text, currentThoughtId) {
        let linkedText = text;
        for (const keyword in keywordMap) {
            const thoughtId = keywordMap[keyword];
            if (thoughtId !== currentThoughtId) { // Don't link to the same thought
                const regex = new RegExp(`\b(${keyword})\b`, 'gi');
                linkedText = linkedText.replace(regex, `<a href="#" class="keyword-link" data-thought-id="${thoughtId}">$1</a>`);
            }
        }
        return linkedText;
    }

    function displayThoughts(page) {
        thoughtsContainer.innerHTML = '';
        const pageIndex = page - 1;

        const startIndex = pageIndex * thoughtsPerPage;
        const endIndex = startIndex + thoughtsPerPage;
        const paginatedThoughts = thoughts.slice(startIndex, endIndex);

        paginatedThoughts.forEach(thought => {
            const thoughtElement = document.createElement('section');
            thoughtElement.classList.add('thought');
            thoughtElement.id = `thought-${thought.id}`;
            const linkedExplanation = thought.explanation; // Use raw explanation

            thoughtElement.innerHTML = "`" +
                `                <div class=\"thought-header\">
                    <span class=\"date\">${thought.date}</span>
                </div>
                <div class=\"text-block\">
                    <blockquote>\"${thought.quote}\"</blockquote>
                    <p class=\"author\">- ${thought.author}</p>
                </div>
                <div class=\"explanation\">
                    <p>${linkedExplanation}</p>
                </div>
                <div class=\"share-buttons\">
                    <button class=\"share-btn twitter-share\" data-quote=\"${thought.quote}\">Share on X</button>
                    <button class=\"share-btn linkedin-share\" data-quote=\"${thought.quote}\">Share on LinkedIn</button>
                    <button class=\"share-btn facebook-share\" data-quote=\"${thought.quote}\">Share on Facebook</button>
                    <button class=\"share-btn copy-quote\" data-quote=\"${thought.quote}\">Copy Quote</button>
                </div>
            `;
            thoughtsContainer.appendChild(thoughtElement);
        });

        // Add event listeners for the new links
        document.querySelectorAll('.keyword-link').forEach(link => {
            link.addEventListener('click', handleKeywordClick);
        });

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

    function handleKeywordClick(event) {
        event.preventDefault();
        const thoughtId = parseInt(this.getAttribute('data-thought-id'));
        const thoughtPage = Math.floor(thoughtId / thoughtsPerPage) + 1;
        
        currentPage = thoughtPage;
        displayThoughts(currentPage);
        setupPagination();

        // Scroll to the thought after a short delay to allow for rendering
        setTimeout(() => {
            const targetThought = document.getElementById(`thought-${thoughtId}`);
            if (targetThought) {
                targetThought.scrollIntoView({ behavior: 'smooth' });
                targetThought.classList.add('highlight');
                setTimeout(() => targetThought.classList.remove('highlight'), 2000);
            }
        }, 100);
    }

    function openModal(thought) {
        const linkedExplanation = linkKeywords(thought.explanation, thought.id);
        modalBody.innerHTML = "`" +
            `            <h2>${thought.quote}</h2>
            <p class=\"author\">- ${thought.author}</p>
            <p>${linkedExplanation}</p>
        `;
        modal.style.display = 'block';

        // Add event listeners for keyword links inside the modal
        modalBody.querySelectorAll('.keyword-link').forEach(link => {
            link.addEventListener('click', function(event) {
                closeModal();
                handleKeywordClick.call(this, event);
            });
        });
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
        const pageCount = Math.ceil(thoughts.length / thoughtsPerPage);
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
});
