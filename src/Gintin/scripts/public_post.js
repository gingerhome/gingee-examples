document.addEventListener('DOMContentLoaded', () => {
    const postContainer = document.getElementById('post-content-container');
    const commentListContainer = document.getElementById('comment-list');
    const commentForm = document.getElementById('comment-form');
    const commentFormMessage = document.getElementById('comment-form-message');
    let currentPostId = null;

    /**
     * Main function to initialize the page.
     */
    const init = async () => {
        // Get the post slug from the URL query parameter
        const urlParams = new URLSearchParams(window.location.search);
        const slug = urlParams.get('slug');

        if (!slug) {
            displayError('Post not specified.');
            return;
        }

        try {
            const post = await fetchPost(slug);
            currentPostId = post.id; // Store post ID for comment submission
            renderPost(post);

            const comments = await fetchComments(post.id);
            renderComments(comments);

            commentForm.addEventListener('submit', handleCommentSubmit);

        } catch (error) {
            console.error('Error loading post:', error);
            displayError(error.message);
        }
    };

    /**
     * Fetches a single post by its slug.
     * @param {string} slug The post slug.
     */
    const fetchPost = async (slug) => {
        const response = await fetch(`/gintin/api/public/posts/${slug}`);
        if (response.status === 404) {
            throw new Error('Post not found.');
        }
        if (!response.ok) {
            throw new Error('Failed to load the post.');
        }
        return await response.json();
    };

    /**
     * Renders the post content in an image-first "Modern Magazine" layout.
     * @param {Object} post The post object.
     */
    const renderPost = (post) => {
        document.title = `${post.title} - Gintin`;

        const publishedDate = new Date(post.published_at).toLocaleDateString('en-US', {
            year: 'numeric', month: 'long', day: 'numeric'
        });

        const coverImageUrl = post.cover_image_url || 'https://via.placeholder.com/1200x600.png?text=Gintin';

        const contentHtml = marked.parse(post.content || '');

        postContainer.innerHTML = `
            <article>
                <!-- 1. COVER IMAGE (NOW FIRST) -->
                <div class="mb-8 rounded-lg shadow-lg overflow-hidden h-96">
                    <img src="${coverImageUrl}" alt="${post.title}" class="w-full h-full object-cover">
                </div>

                <!-- 2. HEADER: TITLE & METADATA -->
                <header class="text-center mb-12">
                    <h1 class="text-4xl md:text-6xl font-extrabold tracking-tight text-gray-900 mb-4">${post.title}</h1>
                    <p class="text-lg text-gray-500">
                        By ${post.author_name} on ${publishedDate}
                    </p>
                </header>
                
                <!-- 3. ARTICLE CONTENT -->
                <div class="prose prose-lg lg:prose-xl max-w-3xl mx-auto">
                    ${contentHtml}
                </div>
            </article>
        `;
    };

    /**
     * Fetches approved comments for a given post ID.
     * @param {string} postId The ID of the post.
     */
    const fetchComments = async (postId) => {
        const response = await fetch(`/gintin/api/public/posts/${postId}/comments`);
        if (!response.ok) {
            throw new Error('Failed to load comments.');
        }
        return await response.json();
    };

    /**
     * Renders the list of comments.
     * @param {Array<Object>} comments Array of comment objects.
     */
    const renderComments = (comments) => {
        if (comments.length === 0) {
            commentListContainer.innerHTML = '<p class="text-gray-500">Be the first to comment!</p>';
            return;
        }

        commentListContainer.innerHTML = comments.map(comment => {
            const commentDate = new Date(comment.created_at).toLocaleString('en-US', {
                dateStyle: 'medium', timeStyle: 'short'
            });
            return `
                <div class="bg-white p-4 rounded-lg shadow-sm mb-4 border">
                    <p class="font-semibold text-gray-800">${comment.author_name}</p>
                    <p class="text-xs text-gray-500 mb-2">${commentDate}</p>
                    <p class="text-gray-700">${comment.content.replace(/\n/g, '<br>')}</p>
                </div>
            `;
        }).join('');
    };

    /**
     * Handles the new comment form submission.
     * @param {Event} event The form submission event.
     */
    const handleCommentSubmit = async (event) => {
        event.preventDefault();
        const formData = new FormData(commentForm);
        const data = Object.fromEntries(formData.entries());

        commentFormMessage.textContent = 'Submitting...';
        commentFormMessage.className = 'mt-4 text-sm text-gray-600';

        try {
            const response = await fetch(`/gintin/api/public/posts/${currentPostId}/comments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Failed to submit comment.');
            }

            commentFormMessage.textContent = result.message;
            commentFormMessage.className = 'mt-4 text-sm text-green-600';
            commentForm.reset();

        } catch (error) {
            commentFormMessage.textContent = error.message;
            commentFormMessage.className = 'mt-4 text-sm text-red-600';
        }
    };

    /**
     * Displays a generic error message on the page.
     * @param {string} message The error message to display.
     */
    const displayError = (message) => {
        postContainer.innerHTML = `<div class="text-center text-red-500 p-8 bg-red-50 rounded-lg">${message}</div>`;
        document.getElementById('comments-section').style.display = 'none'; // Hide comments section
    };

    // Run the initialization function when the page loads
    init();
});
