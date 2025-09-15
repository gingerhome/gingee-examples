document.addEventListener('DOMContentLoaded', () => {

    // --- STATE & CONFIGURATION ---
    const state = {
        token: localStorage.getItem('gintin_jwt'),
        editorInstance: null,
        editingPostId: null,
        currentView: 'postList' // Track the current view
    };

    // --- DOM ELEMENT REFERENCES ---
    const DOMElements = {
        appRoot: document.getElementById('app-root'),
        loginView: document.getElementById('login-view'),
        dashboardView: document.getElementById('dashboard-view'),
        loginForm: document.getElementById('login-form'),
        loginError: document.getElementById('login-error'),
        logoutButton: document.getElementById('logout-button'),
        welcomeMessage: document.getElementById('welcome-message'),
        dashboardContent: document.getElementById('dashboard-content'),
        adminNav: document.getElementById('admin-nav'),
    };

    /**
     * A centralized fetch wrapper that adds the auth token and handles auth errors.
     * @param {string} url - The API endpoint to call.
     * @param {object} options - Standard fetch options.
     * @returns {Promise<Response>} - The fetch response.
     */
    const fetchApi = async (url, options = {}) => {
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers,
        };

        if (state.token) {
            headers['Authorization'] = `Bearer ${state.token}`;
        }

        const response = await fetch(`/gintin${url}`, { ...options, headers });

        if (response.status === 401) {
            handleLogout();
            return; // Stop further execution
        }

        return response;
    };

    // --- VIEW ROUTING & RENDERING ---

    /**
     * Updates the active state of the navigation tabs.
     */
    const updateNavActiveState = () => {
        DOMElements.adminNav.querySelectorAll('a').forEach(link => {
            if (link.dataset.nav === state.currentView) {
                link.className = 'border-indigo-500 text-indigo-600 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm';
            } else {
                link.className = 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm';
            }
        });
    };

    /**
     * Simple client-side router to render different views in the dashboard.
     * @param {string} view - The view to render ('postList', 'postEditor', 'commentList').
     * @param {object} params - Any parameters for the view (e.g., { postId: '...' }).
     */
    const navigateTo = (view, params = {}) => {
        // A bit of a hack to make the router simpler. If we are editing, the "active" nav tab is still 'posts'.
        const baseView = view === 'postEditor' ? 'postList' : view;
        state.currentView = baseView;

        updateNavActiveState();
        DOMElements.dashboardContent.innerHTML = '<div class="text-center p-8">Loading...</div>';

        switch (view) {
            case 'postEditor':
                renderPostEditor(params.postId);
                break;
            case 'commentList':
                renderCommentList();
                break;
            case 'userList':
                renderUserList();
                break;
            case 'postList':
            default:
                renderPostList();
                break;
        }
    };

    /**
     * Fetches and renders the list of all posts.
     */
    const renderPostList = async () => {
        try {
            const response = await fetchApi('/api/posts');
            if (!response || !response.ok) throw new Error('Failed to fetch posts.');
            const posts = await response.json();

            DOMElements.dashboardContent.innerHTML = `
                <div class="flex justify-between items-center mb-6">
                    <h2 class="text-3xl font-bold">Manage Posts</h2>
                    <button data-action="create-post" class="bg-green-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-700">
                        + New Post
                    </button>
                </div>
                <div class="bg-white shadow-md rounded-lg overflow-hidden">
                    <table class="min-w-full divide-y divide-gray-200">
                        <thead class="bg-gray-50">
                            <tr>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Updated</th>
                                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody class="bg-white divide-y divide-gray-200">
                            ${posts.map(post => `
                                <tr>
                                    <td class="px-6 py-4 whitespace-nowrap font-medium text-gray-900">${post.title}</td>
                                    <td class="px-6 py-4 whitespace-nowrap">
                                        <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${post.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}">
                                            ${post.status}
                                        </span>
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${new Date(post.updated_at).toLocaleDateString()}</td>
                                    <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button data-action="edit-post" data-post-id="${post.id}" class="text-indigo-600 hover:text-indigo-900 mr-4">Edit</button>
                                        <button data-action="delete-post" data-post-id="${post.id}" class="text-red-600 hover:text-red-900">Delete</button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            `;
        } catch (error) {
            DOMElements.dashboardContent.innerHTML = `<div class="text-red-500">${error.message}</div>`;
        }
    };

    /**
     * Renders the post editor for creating or updating a post.
     * @param {string|null} postId - The ID of the post to edit, or null to create a new one.
     */
    const renderPostEditor = async (postId = null) => {
        state.editingPostId = postId;
        let post = { title: '', content: '', status: 'draft', cover_image_url: '' }; // Default for new post

        if (postId) {
            try {
                const response = await fetchApi(`/api/posts/${postId}`);
                if (!response.ok) throw new Error('Failed to load post for editing.');
                post = await response.json();
            } catch (error) {
                DOMElements.dashboardContent.innerHTML = `<div class="text-red-500">${error.message}</div>`;
                return;
            }
        }

        const hasCoverImage = post.cover_image_url && post.cover_image_url.length > 0;

        DOMElements.dashboardContent.innerHTML = `
            <div class="flex justify-between items-center mb-6">
                <h2 class="text-3xl font-bold">${postId ? 'Edit Post' : 'Create New Post'}</h2>
                <button data-action="back-to-list" class="text-blue-600 hover:underline">&larr; Back to List</button>
            </div>
            <form id="post-editor-form" class="space-y-6 bg-white p-8 rounded-lg shadow-md">
                <div>
                    <label for="post-title" class="block text-sm font-medium text-gray-700">Title</label>
                    <input type="text" id="post-title" value="${post.title}" required class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm">
                </div>
                <div>
                <label class="block text-sm font-medium text-gray-700">Cover Image</label>
                <div class="mt-1 flex items-center space-x-6">
                        <div id="cover-image-preview-container" class="w-48 h-24 bg-gray-100 rounded-md overflow-hidden">
                            ${hasCoverImage
                ? `<img id="cover-image-preview" src="${post.cover_image_url}" class="w-full h-full object-cover">`
                : `<div class="w-full h-full flex items-center justify-center text-gray-400 text-sm">No Image</div>`
            }
                        </div>
                        <div class="flex-grow">
                            <input type="hidden" id="post-cover-image-url" value="${post.cover_image_url || ''}">
                            <button type="button" data-action="upload-cover" class="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700">
                                Upload Image
                            </button>
                            <button type="button" data-action="remove-cover" class="ml-2 px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50" style="${!hasCoverImage ? 'display: none;' : ''}">
                                Remove
                            </button>
                            <p id="cover-upload-status" class="text-xs text-gray-500 mt-2"></p>
                        </div>
                    </div>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700">Content</label>
                    <div id="editor" class="mt-1"></div>
                </div>
                <div>
                    <label for="post-status" class="block text-sm font-medium text-gray-700">Status</label>
                    <select id="post-status" class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
                        <option value="draft" ${post.status === 'draft' ? 'selected' : ''}>Draft</option>
                        <option value="published" ${post.status === 'published' ? 'selected' : ''}>Published</option>
                    </select>
                </div>
                <button type="submit" class="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700">Save Post</button>
            </form>
        `;

        // Initialize Toast UI Editor
        state.editorInstance = new toastui.Editor({
            el: document.querySelector('#editor'),
            height: '500px',
            initialEditType: 'markdown',
            previewStyle: 'vertical',
            initialValue: post.content || '',
            hooks: {
                addImageBlobHook: async (blob, callback) => {
                    const formData = new FormData();
                    formData.append('image', blob);

                    const response = await fetch('/gintin/api/uploads/image', {
                        method: 'POST',
                        headers: { 'Authorization': `Bearer ${state.token}` },
                        body: formData
                    });

                    if (!response.ok) {
                        alert('Image upload failed!');
                        return;
                    }

                    const result = await response.json();
                    callback(result.url, 'Image Alt Text');
                }
            }
        });
    };

    /**
     * Fetches and renders the list of pending comments for moderation.
     */
    const renderCommentList = async () => {
        try {
            const response = await fetchApi('/api/comments/pending');
            if (!response || !response.ok) throw new Error('Failed to fetch pending comments.');
            const comments = await response.json();

            DOMElements.dashboardContent.innerHTML = `
                <div class="flex justify-between items-center mb-6">
                    <h2 class="text-3xl font-bold">Moderate Comments</h2>
                </div>
                ${comments.length === 0
                    ? '<p class="text-gray-500">There are no comments awaiting moderation.</p>'
                    : comments.map(comment => `
                        <div class="bg-white shadow-md rounded-lg p-6 mb-4">
                            <div class="flex justify-between items-start">
                                <div>
                                    <p class="font-bold text-lg text-gray-800">${comment.author_name}</p>
                                    <p class="text-sm text-gray-500">
                                        Commented on: <span class="font-medium text-gray-700">${comment.post_title}</span>
                                    </p>
                                    <p class="text-sm text-gray-500">
                                        ${new Date(comment.created_at).toLocaleString()}
                                    </p>
                                </div>
                                <div class="flex-shrink-0 ml-4">
                                    <button data-action="approve-comment" data-comment-id="${comment.id}" class="bg-green-600 text-white font-bold py-1 px-3 rounded-md hover:bg-green-700 text-sm mr-2">Approve</button>
                                    <button data-action="delete-comment" data-comment-id="${comment.id}" class="bg-red-600 text-white font-bold py-1 px-3 rounded-md hover:bg-red-700 text-sm">Delete</button>
                                </div>
                            </div>
                            <p class="mt-4 text-gray-700">${comment.content.replace(/\n/g, '<br>')}</p>
                        </div>
                    `).join('')
                }
            `;
        } catch (error) {
            DOMElements.dashboardContent.innerHTML = `<div class="text-red-500">${error.message}</div>`;
        }
    };

    /**
     * Fetches and renders the list of users.
     */
    const renderUserList = async () => {
        try {
            const response = await fetchApi('/api/users');
            if (!response || !response.ok) throw new Error('Failed to fetch users.');
            const users = await response.json();

            DOMElements.dashboardContent.innerHTML = `
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div class="lg:col-span-2">
                    <h2 class="text-3xl font-bold mb-6">Existing Users</h2>
                    <div class="bg-white shadow-md rounded-lg overflow-hidden">
                        <table class="min-w-full divide-y divide-gray-200">
                            <thead class="bg-gray-50">
                                <tr>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Username</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Joined</th>
                                    <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody class="bg-white divide-y divide-gray-200">
                                ${users.map(user => `
                                    <tr>
                                        <td class="px-6 py-4 font-medium">${user.username}</td>
                                        <td class="px-6 py-4 text-sm text-gray-500">${new Date(user.created_at).toLocaleDateString()}</td>
                                        <td class="px-6 py-4 text-right">
                                            <button data-action="delete-user" data-user-id="${user.id}" class="text-red-600 hover:text-red-900 text-sm font-medium">Delete</button>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
                <div>
                    <h2 class="text-3xl font-bold mb-6">Add New User</h2>
                    <form id="add-user-form" class="bg-white shadow-md rounded-lg p-6 space-y-4">
                        <div>
                            <label for="new-username" class="block text-sm font-medium text-gray-700">Username</label>
                            <input type="text" id="new-username" required class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md">
                        </div>
                        <div>
                            <label for="new-password" class="block text-sm font-medium text-gray-700">Password</label>
                            <input type="password" id="new-password" required class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md">
                            <p class="text-xs text-gray-500 mt-1">Must be at least 8 characters.</p>
                        </div>
                        <button type="submit" class="w-full bg-green-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-700">Create User</button>
                        <p id="user-form-message" class="text-sm text-center"></p>
                    </form>
                </div>
            </div>
        `;
        } catch (error) {
            DOMElements.dashboardContent.innerHTML = `<div class="text-red-500">${error.message}</div>`;
        }
    };

    // --- EVENT HANDLERS ---

    /**
     * Handles the login form submission.
     */
    const handleLogin = async (event) => {
        event.preventDefault();
        DOMElements.loginError.textContent = '';
        const formData = new FormData(DOMElements.loginForm);
        const data = Object.fromEntries(formData.entries());

        try {
            const response = await fetch('/gintin/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            const result = await response.json();
            if (!response.ok) throw new Error(result.error || 'Login failed.');

            state.token = result.token;
            localStorage.setItem('gintin_jwt', state.token);

            const payload = JSON.parse(atob(state.token.split('.')[1]));
            DOMElements.welcomeMessage.textContent = `Welcome, ${payload.username}!`;

            DOMElements.loginView.classList.add('hidden');
            DOMElements.dashboardView.classList.remove('hidden');
            navigateTo('postList');

        } catch (error) {
            DOMElements.loginError.textContent = error.message;
        }
    };

    /**
     * Handles logout.
     */
    const handleLogout = () => {
        state.token = null;
        localStorage.removeItem('gintin_jwt');
        DOMElements.dashboardView.classList.add('hidden');
        DOMElements.loginView.classList.remove('hidden');
    };

    /**
     * Handles clicks on the main navigation tabs.
     */
    const handleNavClick = (event) => {
        event.preventDefault();
        const navLink = event.target.closest('a[data-nav]');
        if (navLink) {
            const view = navLink.dataset.nav;
            if (view === 'posts') {
                navigateTo('postList');
            } else if (view === 'comments') {
                navigateTo('commentList');
            } else if (view === 'users') {
                navigateTo('userList');
            }
        }
    };

    /**
     * Handles clicks within the main dashboard content area using event delegation.
     */
    const handleDashboardClick = async (event) => {
        const target = event.target.closest('button[data-action]');
        if (!target) return;

        const action = target.dataset.action;
        const postId = target.dataset.postId;
        const commentId = target.dataset.commentId;

        if (action === 'create-post') {
            navigateTo('postEditor');
        }

        if (action === 'edit-post') {
            navigateTo('postEditor', { postId });
        }

        if (action === 'back-to-list') {
            navigateTo('postList');
        }

        if (action === 'delete-post') {
            if (confirm('Are you sure you want to delete this post? This cannot be undone.')) {
                try {
                    const response = await fetchApi(`/api/posts/${postId}`, { method: 'DELETE' });
                    if (!response || !response.ok) throw new Error('Failed to delete post.');
                    navigateTo('postList');
                } catch (error) {
                    alert(error.message);
                }
            }
        }

        if (action === 'approve-comment') {
            try {
                const response = await fetchApi(`/api/comments/${commentId}/approve`, { method: 'PUT' });
                if (!response || !response.ok) throw new Error('Failed to approve comment.');
                navigateTo('commentList');
            } catch (error) {
                alert(error.message);
            }
        }

        if (action === 'delete-comment') {
            if (confirm('Are you sure you want to delete this comment?')) {
                try {
                    const response = await fetchApi(`/api/comments/${commentId}`, { method: 'DELETE' });
                    if (!response || !response.ok) throw new Error('Failed to delete comment.');
                    navigateTo('commentList');
                } catch (error) {
                    alert(error.message);
                }
            }
        }

        if (action === 'upload-cover') {
            handleCoverImageUpload();
        }

        if (action === 'remove-cover') {
            document.getElementById('post-cover-image-url').value = '';
            const previewContainer = document.getElementById('cover-image-preview-container');
            previewContainer.innerHTML = `<div class="w-full h-full flex items-center justify-center text-gray-400 text-sm">No Image</div>`;
            target.style.display = 'none'; // Hide the remove button
        }

        if (action === 'delete-user') {
            if (confirm('Are you sure you want to delete this user? This cannot be undone.')) {
                try {
                    const response = await fetchApi(`/api/users/${userId}`, { method: 'DELETE' });
                    if (!response || !response.ok) {
                        const err = await response.json();
                        throw new Error(err.error || 'Failed to delete user.');
                    }
                    navigateTo('userList');
                } catch (error) {
                    alert(error.message);
                }
            }
        }
    };

    /**
     * NEW: Helper function to manage the cover image upload process.
     */
    const handleCoverImageUpload = () => {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'image/*';

        fileInput.onchange = async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const statusEl = document.getElementById('cover-upload-status');
            statusEl.textContent = 'Uploading...';

            const formData = new FormData();
            formData.append('image', file);

            try {
                const response = await fetch('/gintin/api/uploads/image', {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${state.token}` },
                    body: formData
                });

                if (!response.ok) {
                    const err = await response.json();
                    throw new Error(err.error || 'Upload failed');
                }

                const result = await response.json();

                // Update the UI with the new image URL and preview
                document.getElementById('post-cover-image-url').value = result.url;
                const previewContainer = document.getElementById('cover-image-preview-container');
                previewContainer.innerHTML = `<img id="cover-image-preview" src="${result.url}" class="w-full h-full object-cover">`;
                document.querySelector('button[data-action="remove-cover"]').style.display = 'inline-block';
                statusEl.textContent = 'Upload successful!';
                setTimeout(() => statusEl.textContent = '', 3000);

            } catch (error) {
                statusEl.textContent = `Error: ${error.message}`;
                statusEl.classList.add('text-red-500');
            }
        };

        fileInput.click();
    };

    /**
     * Handles the submission of the post editor form.
     */
    const handlePostEditorSubmit = async (event) => {
        event.preventDefault();

        const postData = {
            title: document.getElementById('post-title').value,
            cover_image_url: document.getElementById('post-cover-image-url').value,
            status: document.getElementById('post-status').value,
            content: state.editorInstance.getMarkdown(),
        };

        const isUpdating = !!state.editingPostId;
        const url = isUpdating ? `/api/posts/${state.editingPostId}` : '/api/posts';
        const method = isUpdating ? 'PUT' : 'POST';

        try {
            const response = await fetchApi(url, {
                method,
                body: JSON.stringify(postData)
            });
            if (!response || !response.ok) {
                const err = await response.json();
                throw new Error(err.error || 'Failed to save the post.');
            }
            navigateTo('postList');
        } catch (error) {
            alert(error.message);
        }
    };

    const handleUserCreateSubmit = async (event) => {
        event.preventDefault();
        const form = event.target;
        const messageEl = document.getElementById('user-form-message');
        messageEl.textContent = '';

        const data = {
            username: form.querySelector('#new-username').value,
            password: form.querySelector('#new-password').value,
        };

        try {
            const response = await fetchApi('/api/users', {
                method: 'POST',
                body: JSON.stringify(data),
            });

            if (!response || !response.ok) {
                const err = await response.json();
                throw new Error(err.error || 'Failed to create user.');
            }

            messageEl.className = 'text-sm text-center text-green-600';
            messageEl.textContent = 'User created successfully!';
            form.reset();
            navigateTo('userList'); // Refresh the list
        } catch (error) {
            messageEl.className = 'text-sm text-center text-red-600';
            messageEl.textContent = error.message;
        }
    };


    // --- INITIALIZATION ---

    const init = () => {
        if (state.token) {
            const payload = JSON.parse(atob(state.token.split('.')[1]));
            DOMElements.welcomeMessage.textContent = `Welcome, ${payload.username}!`;
            DOMElements.loginView.classList.add('hidden');
            DOMElements.dashboardView.classList.remove('hidden');
            navigateTo(state.currentView);
        } else {
            DOMElements.loginView.classList.remove('hidden');
            DOMElements.dashboardView.classList.add('hidden');
        }

        // Attach primary event listeners
        DOMElements.loginForm.addEventListener('submit', handleLogin);
        DOMElements.logoutButton.addEventListener('click', handleLogout);
        DOMElements.dashboardContent.addEventListener('click', handleDashboardClick);
        DOMElements.adminNav.addEventListener('click', handleNavClick);
        DOMElements.appRoot.addEventListener('submit', (event) => {
            if (event.target.id === 'post-editor-form') {
                handlePostEditorSubmit(event);
            } else if (event.target.id === 'add-user-form') {
                handleUserCreateSubmit(event);
            }
        });
    };

    init(); // Run the application
});
