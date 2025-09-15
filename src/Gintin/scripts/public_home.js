document.addEventListener('DOMContentLoaded', () => {
    const postListContainer = document.getElementById('post-list-container');

    const loadPosts = async () => {
        try {
            const response = await fetch('/gintin/api/public/posts', { credentials: 'include' });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const posts = await response.json();
            renderPosts(posts);
        } catch (error) {
            console.error('Failed to fetch posts:', error);
            postListContainer.innerHTML = `
                <div class="md:col-span-2 lg:col-span-3 text-center text-red-500">
                    Failed to load posts. Please try again later.
                </div>
            `;
        }
    };

    /**
     * Renders an array of post objects into the DOM as magazine-style cards.
     * @param {Array<Object>} posts - The array of posts to render.
     */
    const renderPosts = (posts) => {
        if (!posts || posts.length === 0) {
            postListContainer.innerHTML = `
                <div class="md:col-span-2 lg:col-span-3 text-center text-gray-500">
                    No posts have been published yet. Check back soon!
                </div>
            `;
            return;
        }

        // Clear the "Loading..." message
        postListContainer.innerHTML = '';

        posts.forEach(post => {
            const postElement = document.createElement('article');
            // Card container with shadow, rounded corners, and a subtle transition
            postElement.className = 'bg-white rounded-lg shadow-md overflow-hidden transform hover:-translate-y-1 transition-transform duration-300';

            // **CORRECTED LINE**
            const publishedDate = new Date(post.published_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });

            const postLink = `/gintin/post.html?slug=${post.slug}`;

            // Use a fallback image if a post doesn't have a cover image
            const imageUrl = post.cover_image_url || 'https://via.placeholder.com/600x400.png?text=Gintin';

            postElement.innerHTML = `
                <a href="${postLink}" class="block">
                    <img src="${imageUrl}" alt="${post.title}" class="w-full h-48 object-cover">
                </a>
                <div class="p-6">
                    <h2 class="text-xl font-bold mb-2 leading-tight">
                        <a href="${postLink}" class="text-gray-900 hover:text-blue-600">
                            ${post.title}
                        </a>
                    </h2>
                    <p class="text-sm text-gray-600">
                        By ${post.author_name} &bull; ${publishedDate}
                    </p>
                </div>
            `;
            postListContainer.appendChild(postElement);
        });
    };

    // Initial load
    loadPosts();
});
