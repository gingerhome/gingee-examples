document.getElementById('helloButton').addEventListener('click', async () => {
    const responseElement = document.getElementById('response');
    responseElement.innerText = 'Loading...';
    try {
        const res = await fetch('/gintin/hello', { credentials: 'include' });
        const data = await res.json();
        responseElement.innerText = `Server says: ${data.message}`;
    } catch (err) {
        responseElement.innerText = 'Error: Could not connect to server.';
    }
});
