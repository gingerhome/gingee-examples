module.exports = async function () {
    gingee(async function ($g) {
        const fs = require('fs');
        const zip = require('zip');

        const results = [];

        const sourceDir = 'zip_source';
        const zipDefaultPath = 'temp/archive_default.zip';
        const zipWithRootPath = 'temp/archive_with_root.zip';
        const unzipDefaultDir = 'zip_unpacked_default';
        const unzipWithRootDir = 'zip_unpacked_with_root';
        const crossOriginZipPath = 'cross_origin_archive.zip';

        // --- 0. Cleanup ---
        for (const dir of [sourceDir, 'temp', unzipDefaultDir, unzipWithRootDir]) {
            if (fs.existsSync(fs.BOX, dir)) await fs.rmdir(fs.BOX, dir, { recursive: true });
        }
        await fs.rmdir(fs.WEB, 'temp', { recursive: true });
        results.push("0. Cleaned up old directories.");

        // --- 1. Create source directory ---
        await fs.writeFile(fs.BOX, `${sourceDir}/file1.txt`, 'hello');
        await fs.writeFile(fs.BOX, `${sourceDir}/subdir/file2.txt`, 'world');
        results.push(`1. Created source directory '${sourceDir}'.`);

        await fs.mkdir(fs.BOX, 'temp');
        results.push("1a. Created temporary directory for zips.");

        // --- 2. Test zipToFile (default - contents only) ---
        await zip.zipToFile(fs.BOX, sourceDir, fs.BOX, zipDefaultPath);
        await zip.unzip(fs.BOX, zipDefaultPath, fs.BOX, unzipDefaultDir);

        // Check for a file at the root of the unzipped folder
        if (!fs.existsSync(fs.BOX, `${unzipDefaultDir}/file1.txt`)) {
            throw new Error("Default zip (contents only) failed. Root file missing.");
        }
        results.push("2. PASS: Successfully zipped directory contents (default).");

        // --- 3. Test zipToFile (includeRootFolder: true) ---
        await zip.zipToFile(fs.BOX, sourceDir, fs.BOX, zipWithRootPath, { includeRootFolder: true });
        await zip.unzip(fs.BOX, zipWithRootPath, fs.BOX, unzipWithRootDir);

        // Now, the files should be inside a folder named 'zip_source'
        const expectedPath = `${unzipWithRootDir}/${sourceDir}/subdir/file2.txt`;
        if (!fs.existsSync(fs.BOX, expectedPath)) {
            throw new Error("Zipping with root folder failed. Nested file missing.");
        }
        results.push("3. PASS: Successfully zipped directory including the root folder.");

        // --- 4. Test zip to buffer (includeRootFolder: true) ---
        const buffer = await zip.zip(fs.BOX, sourceDir, { includeRootFolder: true });
        results.push(`4. PASS: Zipped to buffer with root folder (size: ${buffer.length} bytes).`);

        results.push("SUCCESS: All zip options completed successfully.");

        $g.response.send(results);
    });
};
