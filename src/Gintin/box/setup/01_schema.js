module.exports = async function() {
    await gingee(async ($g) => {
        const db = require('db');
        const DB_NAME = 'gintin_db'; // The name we will define in app.json

        $g.log.info('Gintin Startup: Checking database schema...');

        try {
            // SQL for Users table
            const createUsersTableSQL = `
                CREATE TABLE IF NOT EXISTS "Users" (
                    "id" INTEGER PRIMARY KEY AUTOINCREMENT,
                    "username" TEXT NOT NULL UNIQUE,
                    "password_hash" TEXT NOT NULL,
                    "created_at" TEXT NOT NULL DEFAULT (datetime('now'))
                );
            `;
            await db.execute(DB_NAME, createUsersTableSQL);

            // SQL for Posts table
            const createPostsTableSQL = `
                CREATE TABLE IF NOT EXISTS "Posts" (
                    "id" TEXT PRIMARY KEY,
                    "title" TEXT NOT NULL,
                    "slug" TEXT NOT NULL UNIQUE,
                    "content" TEXT,
                    "cover_image_url" TEXT,
                    "author_id" INTEGER NOT NULL,
                    "status" TEXT NOT NULL DEFAULT 'draft',
                    "created_at" TEXT NOT NULL DEFAULT (datetime('now')),
                    "updated_at" TEXT NOT NULL DEFAULT (datetime('now')),
                    "published_at" TEXT,
                    FOREIGN KEY ("author_id") REFERENCES "Users"("id")
                );
            `;
            await db.execute(DB_NAME, createPostsTableSQL);

            // SQL for Comments table
            const createCommentsTableSQL = `
                CREATE TABLE IF NOT EXISTS "Comments" (
                    "id" INTEGER PRIMARY KEY AUTOINCREMENT,
                    "post_id" TEXT NOT NULL,
                    "author_name" TEXT NOT NULL,
                    "content" TEXT NOT NULL,
                    "status" TEXT NOT NULL DEFAULT 'pending',
                    "created_at" TEXT NOT NULL DEFAULT (datetime('now')),
                    FOREIGN KEY ("post_id") REFERENCES "Posts"("id") ON DELETE CASCADE
                );
            `;
            await db.execute(DB_NAME, createCommentsTableSQL);

            $g.log.info('Gintin Startup: Database schema check complete. Tables are ready.');

        } catch (err) {
            $g.log.error('Gintin Startup: Failed to initialize database schema.', { error: err.message });
            // Re-throw the error to halt server startup, as the app cannot run without a valid schema.
            throw err;
        }
    });
};
