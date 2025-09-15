// File: web/gindoo/box/setup/03_seed_sample_data.js

module.exports = async function() {
    await gingee(async ($g) => {
        const db = require('db');
        const crypto = require('crypto');
        const uuid = require('uuid');
        
        const DB_NAME = 'main_db';

        try {
            $g.log.info('[Seed Data] Checking if sample data needs to be added...');

            // 1. Idempotency Check: Only run if there is exactly 1 user (the admin).
            const userCountResult = await db.query.one(DB_NAME, 'SELECT COUNT(*) as count FROM "Users"');
            if (userCountResult.count !== 1) {
                $g.log.info('[Seed Data] Database already contains more than one user. Skipping sample data creation.');
                return;
            }

            $g.log.info('[Seed Data] Seeding Gindoo with sample users and tasks...');

            // 2. Create 3 Sample Users
            const passwordHash = await crypto.hashPassword('changepwd123');
            
            const usersToCreate = [
                { id: uuid.v4(), name: 'Alice Dell', email: 'alice@gindoo.app' },
                { id: uuid.v4(), name: 'Bob Marley', email: 'bob@gindoo.app' },
                { id: uuid.v4(), name: 'Charlie Brown', email: 'charlie@gindoo.app' },
            ];

            for (const user of usersToCreate) {
                const userSql = 'INSERT INTO "Users" (id, name, email, password_hash, role) VALUES ($1, $2, $3, $4, $5)';
                await db.execute(DB_NAME, userSql, [user.id, user.name, user.email, passwordHash, 'user']);
            }
            $g.log.info(`[Seed Data] Created ${usersToCreate.length} sample users.`);

            // 3. Create and Assign 10 Sample Tasks
            const tasksToCreate = [
                // Tasks for Alice (Frontend)
                { title: 'Implement User Login UI', description: 'Create the main login form component with email and password fields.', status: 'done', assignee_id: usersToCreate[0].id },
                { title: 'Build Kanban Drag-and-Drop functionality', description: 'Use dnd-kit to allow cards to be moved between columns.', status: 'in_progress', assignee_id: usersToCreate[0].id },
                { title: 'Design the "Add Task" modal', description: 'Create the popup modal for adding and editing tasks.', status: 'in_progress', assignee_id: usersToCreate[0].id },
                { title: 'Refactor Navbar for mobile responsiveness', description: 'The top navigation bar needs to collapse into a hamburger menu on smaller screens.', status: 'todo', assignee_id: usersToCreate[0].id },

                // Tasks for Bob (Backend)
                { title: 'Set up JWT authentication endpoint', description: 'Create the /api/auth/login script and JWT generation logic.', status: 'done', assignee_id: usersToCreate[1].id },
                { title: 'Create CRUD API for Tasks', description: 'Build all endpoints for creating, reading, updating, and deleting tasks.', status: 'in_progress', assignee_id: usersToCreate[1].id },
                { title: 'Implement role-based permissions for task deletion', description: 'Only users with the "admin" role should be able to delete tasks.', status: 'todo', assignee_id: usersToCreate[1].id },

                // Tasks for Charlie (QA/UX)
                { title: 'Test user registration and login flow', description: 'Verify that new users can be created and can log in successfully.', status: 'done', assignee_id: usersToCreate[2].id },
                { title: 'Define user stories for Dashboard page', description: 'Outline the requirements and expected behavior for the analytics dashboard.', status: 'todo', assignee_id: usersToCreate[2].id },
                { title: 'Perform accessibility testing on the Kanban board', description: 'Check for keyboard navigation and screen reader compatibility.', status: 'todo', assignee_id: usersToCreate[2].id },
            ];
            
            for (const task of tasksToCreate) {
                const taskSql = 'INSERT INTO "Tasks" (id, title, description, status, assignee_id) VALUES ($1, $2, $3, $4, $5)';
                await db.execute(DB_NAME, taskSql, [uuid.v4(), task.title, task.description, task.status, task.assignee_id]);
            }
            $g.log.info(`[Seed Data] Created ${tasksToCreate.length} sample tasks.`);
            $g.log.info('[Seed Data] Seeding complete.');

        } catch (err) {
            $g.log.error('[Seed Data] An error occurred during data seeding.', { error: err.message, stack: err.stack });
        }
    });
};
