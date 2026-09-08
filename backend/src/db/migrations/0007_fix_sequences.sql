-- Fix sequence values to match actual max IDs in tables
SELECT setval('users_id_seq', (SELECT MAX(id) FROM users) + 1);
SELECT setval('projects_id_seq', (SELECT MAX(id) FROM projects) + 1);
SELECT setval('modules_id_seq', (SELECT MAX(id) FROM modules) + 1);
SELECT setval('stages_id_seq', (SELECT MAX(id) FROM stages) + 1);
SELECT setval('points_id_seq', (SELECT MAX(id) FROM points) + 1);
SELECT setval('comments_id_seq', (SELECT MAX(id) FROM comments) + 1);
SELECT setval('notifications_id_seq', (SELECT MAX(id) FROM notifications) + 1);
SELECT setval('update_history_id_seq', (SELECT MAX(id) FROM update_history) + 1);
