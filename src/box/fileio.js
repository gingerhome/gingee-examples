module.exports = async function () {
    ginger(async function ($g) {
        const fs = require('fs');

        const originalPath = 'temp/original.txt';
        const copyPath = 'temp/copy.txt';
        const movedPath = 'temp/moved.txt';

        //Async file operations
        const asyncResults = [];
        // --- 1. CREATE the original file ---
        await fs.writeFile(fs.BOX, originalPath, 'This is the original file.');
        asyncResults.push(`1. Wrote file to: ${originalPath}`);
        if (!fs.existsSync(fs.BOX, originalPath)) throw new Error("Original file was not created.");

        // --- 1a. VERIFY the original file ---
        const originalContent = await fs.readFile(fs.BOX, originalPath, 'utf8');
        if (originalContent !== 'This is the original file.') throw new Error("Original file content is incorrect.");
        asyncResults.push(`1a. Verified original file content: ${originalContent}`);

        // --- 2. COPY the file ---
        await fs.copyFile(fs.BOX, originalPath, fs.BOX, copyPath);
        asyncResults.push(`2. Copied file to: ${copyPath}`);
        if (!fs.existsSync(fs.BOX, copyPath)) throw new Error("Copied file does not exist.");

        // --- 3. MOVE (rename) the copied file ---
        await fs.moveFile(fs.BOX, copyPath, fs.BOX, movedPath);
        asyncResults.push(`3. Moved file to: ${movedPath}`);
        if (fs.existsSync(fs.BOX, copyPath)) throw new Error("Old copied file still exists after move.");
        if (!fs.existsSync(fs.BOX, movedPath)) throw new Error("Moved file does not exist.");

        // --- 4. DELETE both remaining files ---
        await Promise.all([
            fs.deleteFile(fs.BOX, originalPath),
            fs.deleteFile(fs.BOX, movedPath)
        ]);
        asyncResults.push(`4. Deleted both files: ${originalPath} and ${movedPath}`);
        if (fs.existsSync(fs.BOX, originalPath) || fs.existsSync(fs.BOX, movedPath)) {
            throw new Error("Files were not deleted correctly.");
        }
        asyncResults.push("\nSUCCESS: Full async file lifecycle completed successfully.");


        //Synchronous file operations
        const results = [];
        // --- 1. CREATE the original file ---
        fs.writeFileSync(fs.BOX, originalPath, 'This is the original file.');
        results.push(`1. Synchronously wrote file to: ${originalPath}`);
        if (!fs.existsSync(fs.BOX, originalPath)) throw new Error("Original file was not created synchronously.");

        // --- 1a. VERIFY the original file ---
        const originalContentSync = fs.readFileSync(fs.BOX, originalPath, 'utf8');
        if (originalContentSync !== 'This is the original file.') throw new Error("Original file content is incorrect.");
        results.push(`1a. Verified original file content: ${originalContentSync}`);

        // --- 2. COPY the file ---
        fs.copyFileSync(fs.BOX, originalPath, fs.BOX, copyPath);
        results.push(`2. Synchronously copied file to: ${copyPath}`);
        if (!fs.existsSync(fs.BOX, copyPath)) throw new Error("Copied file does not exist synchronously.");

        // --- 3. MOVE (rename) the copied file ---
        fs.moveFileSync(fs.BOX, copyPath, fs.BOX, movedPath);
        results.push(`3. Synchronously moved file to: ${movedPath}`);
        if (fs.existsSync(fs.BOX, copyPath)) throw new Error("Old copied file still exists after synchronous move.");
        if (!fs.existsSync(fs.BOX, movedPath)) throw new Error("Moved file does not exist synchronously.");
        
        // --- 4. DELETE both remaining files ---
        fs.deleteFileSync(fs.BOX, originalPath);
        fs.deleteFileSync(fs.BOX, movedPath);
        results.push(`4. Synchronously deleted both files: ${originalPath} and ${movedPath}`);
        if (fs.existsSync(fs.BOX, originalPath) || fs.existsSync(fs.BOX, movedPath)) {
            throw new Error("Files were not deleted correctly synchronously.");
        }

        results.push("\nSUCCESS: Full sync file lifecycle completed successfully.");

        $g.response.send({ status: 'success', async_lifecycle_events: asyncResults, sync_lifecycle_events: results });
    });
};
