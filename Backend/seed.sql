-- Test seed data. All seeded users share the password: Test1234!
-- Safe to re-run: every insert is guarded against duplicates.
INSERT INTO users (email, username, password_hash, favorites_public) VALUES
    ('alice@example.com', 'alice', '$2b$10$O.fl.n3dfIZ8eq1IG1I.ruFFb8cutrvLnpDwZRF4haLF9vDWbrieK', TRUE),
    ('bob@example.com', 'bob', '$2b$10$O.fl.n3dfIZ8eq1IG1I.ruFFb8cutrvLnpDwZRF4haLF9vDWbrieK', TRUE),
    ('carol@example.com', 'carol', '$2b$10$O.fl.n3dfIZ8eq1IG1I.ruFFb8cutrvLnpDwZRF4haLF9vDWbrieK', FALSE)
ON CONFLICT (email) DO NOTHING;

INSERT INTO groups (name, owner_id)
    SELECT 'Movie Night', (SELECT id FROM users WHERE username = 'alice')
    WHERE NOT EXISTS (SELECT 1 FROM groups WHERE name = 'Movie Night');

INSERT INTO group_members (group_id, user_id, status) VALUES
    ((SELECT id FROM groups WHERE name = 'Movie Night'), (SELECT id FROM users WHERE username = 'alice'), 'member'),
    ((SELECT id FROM groups WHERE name = 'Movie Night'), (SELECT id FROM users WHERE username = 'bob'), 'member'),
    ((SELECT id FROM groups WHERE name = 'Movie Night'), (SELECT id FROM users WHERE username = 'carol'), 'invited')
ON CONFLICT (group_id, user_id) DO NOTHING;

INSERT INTO group_media (group_id, tmdb_id, media_type, added_by) VALUES
    ((SELECT id FROM groups WHERE name = 'Movie Night'), 27205, 'movie', (SELECT id FROM users WHERE username = 'alice')),
    ((SELECT id FROM groups WHERE name = 'Movie Night'), 1396, 'tv', (SELECT id FROM users WHERE username = 'bob'))
ON CONFLICT (group_id, media_type, tmdb_id) DO NOTHING;

INSERT INTO favorites (user_id, media_type, tmdb_id) VALUES
    ((SELECT id FROM users WHERE username = 'alice'), 'movie', 27205),
    ((SELECT id FROM users WHERE username = 'alice'), 'movie', 155),
    ((SELECT id FROM users WHERE username = 'bob'), 'tv', 1396)
ON CONFLICT (user_id, media_type, tmdb_id) DO NOTHING;

INSERT INTO reviews (user_id, rating, review_text, media_type, tmdb_id) VALUES
    ((SELECT id FROM users WHERE username = 'alice'), 5, 'Mind-bending and beautifully shot.', 'movie', 27205),
    ((SELECT id FROM users WHERE username = 'bob'), 4, 'Great performances all around.', 'movie', 155),
    ((SELECT id FROM users WHERE username = 'carol'), 5, 'One of the best TV dramas ever made.', 'tv', 1396)
ON CONFLICT (user_id, media_type, tmdb_id) DO NOTHING;
