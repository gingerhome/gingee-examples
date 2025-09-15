document.addEventListener('DOMContentLoaded', () => {
    // --- Global State ---
    let testsManifest = [];
    let currentTest = null;

    // --- DOM Element References ---
    const testListContainer = document.getElementById('test-list');
    const welcomeMessage = document.getElementById('welcome-message');
    const testView = document.getElementById('test-view');
    const testTitle = document.getElementById('test-title');
    const testDescription = document.getElementById('test-description');
    const sourceSpinner = document.getElementById('source-spinner');
    const sourceCodeContent = document.getElementById('source-code-content');
    const sourceCodePre = sourceCodeContent.parentElement;
    const copySourceBtn = document.getElementById('copy-source-btn');
    const copyBtnText = document.getElementById('copy-btn-text');
    const inputArea = document.getElementById('input-area');
    const runTestBtn = document.getElementById('run-test-btn');
    const resultsSpinner = document.getElementById('results-spinner');
    const resultsArea = document.getElementById('results-area');

    // --- Initialization ---
    async function init() {
        try {
            const response = await fetch('/tests/api/get-tests');
            if (!response.ok) throw new Error('Failed to load test manifest.');
            testsManifest = await response.json();
            renderNav();
        } catch (error) {
            testListContainer.innerHTML = `<div class="list-group-item text-danger">${error.message}</div>`;
        }
    }

    // --- UI Rendering Functions ---
    function renderNav() {
        testListContainer.innerHTML = '';
        testsManifest.forEach(test => {
            const a = document.createElement('a');
            a.className = 'list-group-item list-group-item-action';
            a.dataset.id = test.id;
            a.textContent = test.name;
            testListContainer.appendChild(a);
        });
    }

    async function selectTest(testId) {
        currentTest = testsManifest.find(t => t.id === testId);
        if (!currentTest) return;

        document.querySelectorAll('#test-list a').forEach(el => {
            el.classList.toggle('active', el.dataset.id === testId);
        });

        welcomeMessage.classList.add('d-none');
        testView.classList.remove('d-none');
        testTitle.textContent = currentTest.name;
        testDescription.textContent = currentTest.description;
        resultsArea.innerHTML = '';
        inputArea.innerHTML = '';

        renderInputForm(currentTest.inputs);
        await fetchAndRenderSourceCode(currentTest.id);
    }

    function renderInputForm(inputs = []) {
        if (inputs.length === 0) {
            inputArea.innerHTML = '<p class="text-muted"><em>This test requires no input.</em></p>';
            return;
        }
        const form = document.createElement('form');
        form.id = 'test-input-form';
        inputs.forEach(input => {
            const div = document.createElement('div');
            div.className = 'mb-3';
            const label = document.createElement('label');
            label.className = 'form-label';
            label.setAttribute('for', `input-${input.name}`);
            label.textContent = input.label;
            let inputEl = (input.type === 'textarea') ? document.createElement('textarea') : document.createElement('input');
            if (input.type === 'textarea') inputEl.rows = 5;
            else inputEl.type = input.type || 'text';
            inputEl.className = 'form-control';
            inputEl.id = `input-${input.name}`;
            inputEl.name = input.name;
            if (input.defaultValue) inputEl.value = input.defaultValue;
            div.appendChild(label);
            div.appendChild(inputEl);
            form.appendChild(div);
        });
        inputArea.appendChild(form);
    }

    async function fetchAndRenderSourceCode(testId) {
        sourceSpinner.classList.remove('d-none');
        sourceCodePre.classList.add('d-none');
        try {
            const response = await fetch(`/tests/api/get-test-source?id=${testId}`);
            if (!response.ok) throw new Error('Could not load source code.');
            const sourceCode = await response.text();
            sourceCodeContent.textContent = sourceCode;

            if (window.Prism) {
                Prism.highlightElement(sourceCodeContent);
            }

            sourceCodePre.classList.remove('d-none');
        } catch (error) {
            sourceCodeContent.textContent = `// ${error.message}`;
            sourceCodePre.classList.remove('d-none');
        } finally {
            sourceSpinner.classList.add('d-none');
        }
    }

    async function renderResults(response) {
        resultsArea.innerHTML = '';
        try {
            if (!response.ok) {
                const errorText = await response.text();
                let errorMessage = `Server responded with status ${response.status}.`;
                try {
                    const errorJson = JSON.parse(errorText);
                    errorMessage += ` Message: ${errorJson.message || 'Unknown error'}`;
                } catch (e) {
                    errorMessage += ` Response: ${errorText}`;
                }
                throw new Error(errorMessage);
            }

            const target = currentTest.resultTarget || 'auto';
            const blob = await response.blob();
            const objectURL = URL.createObjectURL(blob);

            switch (target) {
                case 'json':
                    const text = await blob.text();
                    const preJson = document.createElement('pre');
                    preJson.textContent = JSON.stringify(JSON.parse(text), null, 2);
                    resultsArea.appendChild(preJson);
                    break;
                case 'image':
                    const img = document.createElement('img');
                    img.src = objectURL;
                    resultsArea.appendChild(img);
                    break;
                case 'iframe':
                    const iframe = document.createElement('iframe');
                    iframe.src = objectURL;
                    resultsArea.appendChild(iframe);
                    break;
                case 'text':
                default:
                    const preText = document.createElement('pre');
                    preText.textContent = await blob.text();
                    resultsArea.appendChild(preText);
                    break;
            }
        } catch (error) {
            const preError = document.createElement('pre');
            preError.className = 'text-danger';
            preError.textContent = `Error: ${error.message}`;
            resultsArea.appendChild(preError);
        }
    }

    // --- Event Handlers ---
    testListContainer.addEventListener('click', (event) => {
        if (event.target.matches('a.list-group-item')) {
            selectTest(event.target.dataset.id);
        }
    });

    copySourceBtn.addEventListener('click', () => {
        const textToCopy = sourceCodeContent.textContent;
        if (!textToCopy) return;

        navigator.clipboard.writeText(textToCopy).then(() => {
            // Success feedback
            const originalText = copyBtnText.textContent;
            const originalIconClass = copySourceBtn.querySelector('i').className;
            
            copyBtnText.textContent = 'Copied!';
            copySourceBtn.querySelector('i').className = 'bi bi-check-lg';
            copySourceBtn.classList.add('btn-success');
            copySourceBtn.classList.remove('btn-outline-secondary');

            setTimeout(() => {
                copyBtnText.textContent = originalText;
                copySourceBtn.querySelector('i').className = originalIconClass;
                copySourceBtn.classList.remove('btn-success');
                copySourceBtn.classList.add('btn-outline-secondary');
            }, 2000); // Revert after 2 seconds
        }).catch(err => {
            // Error feedback
            console.error('Failed to copy text: ', err);
            copyBtnText.textContent = 'Failed!';
        });
    });

    runTestBtn.addEventListener('click', async () => {
        if (!currentTest) return;
        
        resultsSpinner.classList.remove('d-none');
        resultsArea.innerHTML = '';

        let url = currentTest.endpoint;
        const options = { method: currentTest.method };
        const form = document.getElementById('test-input-form');
        const formData = form ? new FormData(form) : new FormData();

        if (currentTest.method === 'GET') {
            const params = new URLSearchParams();
            formData.forEach((value, key) => {
                // Handle dynamic URL parameters
                if (url.includes(`:${key}`)) {
                    url = url.replace(`:${key}`, encodeURIComponent(value));
                } else {
                    params.append(key, value);
                }
            });
            const queryString = params.toString();
            if (queryString) {
                url += `?${queryString}`;
            }
        } else if (currentTest.method === 'POST') {
            if (currentTest.postBodyType === 'json') {
                options.headers = { 'Content-Type': 'application/json' };
                options.body = formData.get('jsonData');
            } else if (currentTest.postBodyType === 'form-urlencoded') {
                options.headers = { 'Content-Type': 'application/x-www-form-urlencoded' };
                options.body = new URLSearchParams(formData);
            } else if (currentTest.postBodyType === 'multipart') {
                options.body = formData;
            }
        }

        try {
            const response = await fetch(url, options);
            await renderResults(response);
        } catch (error) {
            resultsArea.innerHTML = `<pre class="text-danger">Network Error: ${error.message}</pre>`;
        } finally {
            resultsSpinner.classList.add('d-none');
        }
    });

    // --- Kick things off ---
    init();
});
