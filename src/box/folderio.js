module.exports = async function () {
    ginger(async function ($g) {
        const fs = require('fs');
        const basePath = 'folder_tests';
        const originalDir = `${basePath}/original`;
        const copyDir = `${basePath}/copy`;
        const movedDir = `${basePath}/final_location`;

        // Async folder operations
        const results = [];
        // --- 0. Cleanup from previous runs ---
        if (fs.existsSync(fs.BOX, basePath)) {
            await fs.rmdir(fs.BOX, basePath, { recursive: true });
            results.push("0. Cleaned up old test directory.");
        }

        // --- 1. CREATE the directory structure ---
        await fs.mkdir(fs.BOX, `${originalDir}/subdir`);
        await fs.writeFile(fs.BOX, `${originalDir}/file1.txt`, 'hello');
        await fs.writeFile(fs.BOX, `${originalDir}/subdir/file2.txt`, 'world');
        results.push(`1. Created directory structure in '${originalDir}'.`);
        if (!fs.existsSync(fs.BOX, `${originalDir}/subdir/file2.txt`)) throw new Error("Dir creation failed.");

        // --- 2. COPY the entire folder ---
        await fs.copyDir(fs.BOX, originalDir, fs.BOX, copyDir);
        results.push(`2. Recursively copied '${originalDir}' to '${copyDir}'.`);
        if (!fs.existsSync(fs.BOX, `${copyDir}/subdir/file2.txt`)) throw new Error("Recursive copy failed.");

        // --- 3. MOVE the copied folder ---
        await fs.moveDir(fs.BOX, copyDir, fs.BOX, movedDir);
        results.push(`3. Moved '${copyDir}' to '${movedDir}'.`);
        if (fs.existsSync(fs.BOX, copyDir)) throw new Error("Old copy directory still exists after move.");
        if (!fs.existsSync(fs.BOX, `${movedDir}/subdir/file2.txt`)) throw new Error("Moved directory content is missing.");

        // --- 4. DELETE folders ---
        // Attempt to delete non-empty folder (should fail)
        let didFail = false;
        try {
            await fs.rmdir(fs.BOX, originalDir); // No { recursive: true }
        } catch (e) {
            didFail = true;
            results.push(`4a. Correctly failed to delete non-empty directory '${originalDir}'.`);
        }
        if (!didFail) throw new Error("Should have failed to delete non-empty directory.");

        // Recursively delete both remaining folder trees
        await Promise.all([
            fs.rmdir(fs.BOX, originalDir, { recursive: true }),
            fs.rmdir(fs.BOX, movedDir, { recursive: true })
        ]);
        results.push("4b. Successfully deleted all remaining directories recursively.");
        if (fs.existsSync(fs.BOX, originalDir) || fs.existsSync(fs.BOX, movedDir)) {
            throw new Error("Recursive delete failed.");
        }

        results.push("\nSUCCESS: Full async folder lifecycle completed successfully.");

        // Synchronous folder operations
        const syncResults = [];
        
        // --- 0. Cleanup from previous runs ---
        if (fs.existsSync(fs.BOX, basePath)) {
            fs.rmdirSync(fs.BOX, basePath, { recursive: true });
            syncResults.push("0. Cleaned up old test directory.");
        }

        // --- 1. CREATE the directory structure ---
        fs.mkdirSync(fs.BOX, `${originalDir}/subdir`);
        fs.writeFileSync(fs.BOX, `${originalDir}/file1.txt`, 'hello');
        fs.writeFileSync(fs.BOX, `${originalDir}/subdir/file2.txt`, 'world');
        syncResults.push(`1. Synchronously created directory structure in '${originalDir}'.`);
        if (!fs.existsSync(fs.BOX, `${originalDir}/subdir/file2.txt`)) throw new Error("Synchronous dir creation failed.");

        // --- 2. COPY the entire folder ---
        fs.copyDirSync(fs.BOX, originalDir, fs.BOX, copyDir);
        syncResults.push(`2. Synchronously copied '${originalDir}' to '${copyDir}'.`);
        if (!fs.existsSync(fs.BOX, `${copyDir}/subdir/file2.txt`)) throw new Error("Synchronous recursive copy failed.");

        // --- 3. MOVE the copied folder ---
        fs.moveDirSync(fs.BOX, copyDir, fs.BOX, movedDir);
        syncResults.push(`3. Synchronously moved '${copyDir}' to '${movedDir}'.`);
        if (fs.existsSync(fs.BOX, copyDir)) throw new Error("Old copy directory still exists after synchronous move.");
        if (!fs.existsSync(fs.BOX, `${movedDir}/subdir/file2.txt`)) throw new Error("Synchronous moved directory content is missing.");

        // --- 4. DELETE folders ---
        // Attempt to delete non-empty folder (should fail)
        didFail = false;
        try {
            fs.rmdirSync(fs.BOX, originalDir); // No { recursive: true }
        } catch (e) {
            didFail = true;
            syncResults.push(`4a. Correctly failed to delete non-empty directory '${originalDir}'.`);
        }
        if (!didFail) throw new Error("Should have failed to delete non-empty directory.");

        // Recursively delete both remaining folder trees
        fs.rmdirSync(fs.BOX, originalDir, { recursive: true });
        fs.rmdirSync(fs.BOX, movedDir, { recursive: true });
        syncResults.push("4b. Successfully deleted all remaining directories recursively.");
        if (fs.existsSync(fs.BOX, originalDir) || fs.existsSync(fs.BOX, movedDir)) {
            throw new Error("Recursive delete failed.");
        }

        syncResults.push("\nSUCCESS: Full synchronous folder lifecycle completed successfully.");

        $g.response.send({
            status: 'success',
            async_folder_lifecycle_events: results,
            sync_folder_lifecycle_events: syncResults
        });
    });
};
