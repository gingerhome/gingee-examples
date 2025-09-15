// File: web/gindoo/box/setup/01_schema.js

module.exports = async function() {
    await gingee(async ($g) => {
        const db = require('db');
        const DB_NAME = 'main_db';

        $g.log.info('Running setup script for Gindoo with SQLite: 01_schema.js...');

        // Create the Users table (SQLite compatible)
        const createUsersTableSql = `
            CREATE TABLE IF NOT EXISTS "Users" (
                "id" TEXT PRIMARY KEY,
                "name" TEXT NOT NULL,
                "email" TEXT UNIQUE NOT NULL,
                "password_hash" TEXT NOT NULL,
                "role" TEXT NOT NULL DEFAULT 'user',
                "avatar_url" TEXT,
                "created_at" TEXT DEFAULT (datetime('now'))
            );
        `;
        await db.execute(DB_NAME, createUsersTableSql);
        $g.log.info('Table "Users" is present.');

        // Create the Tasks table (SQLite compatible)
        const createTasksTableSql = `
            CREATE TABLE IF NOT EXISTS "Tasks" (
                "id" TEXT PRIMARY KEY,
                "title" TEXT NOT NULL,
                "description" TEXT,
                "status" TEXT NOT NULL,
                "assignee_id" TEXT REFERENCES "Users"("id") ON DELETE SET NULL,
                "created_at" TEXT DEFAULT (datetime('now')),
                "updated_at" TEXT DEFAULT (datetime('now'))
            );
        `;
        await db.execute(DB_NAME, createTasksTableSql);
        $g.log.info('Table "Tasks" is present.');

        $g.log.info('Gindoo SQLite database schema setup is complete.');
    });
};
