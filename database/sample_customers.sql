USE merit_swipe;
GO

-- =============================================================================
-- SAMPLE DATA: 25 Customers (users + profiles)
-- Note: password_hash values are bcrypt hashes of 'Password@123'
-- =============================================================================

INSERT INTO users
    (first_name, last_name, email, password_hash, email_verified_at, last_login_at, failed_login_attempts, is_deleted)
VALUES
    ('Ali',       'Hassan',     'ali.hassan@gmail.com',        '$2b$12$KIX8zW1bLmN3pQ7rT9uVOeYcD4fGhJsE6wA2xB5nM0dR8vC1tZ3q', '2024-11-01 08:00:00', '2025-03-10 09:15:00', 0, 0),
    ('Sara',      'Khan',       'sara.khan@outlook.com',       '$2b$12$LJY9aX2cMnO4qR8sU0vWPfZdE5gHiKtF7xB3yC6oN1eS9wD2uA4r', '2024-10-15 10:30:00', '2025-03-18 14:22:00', 0, 0),
    ('Usman',     'Malik',      'usman.malik@yahoo.com',       '$2b$12$MKZ0bY3dNoP5rS9tV1wXQgAeF6hIjLuG8yC4zD7pO2fT0xE3vB5s', '2024-12-01 07:45:00', '2025-03-20 11:00:00', 0, 0),
    ('Ayesha',    'Siddiqui',   'ayesha.siddiqui@gmail.com',   '$2b$12$NLA1cZ4eOpQ6sT0uW2xYRhBfG7iJkMvH9zD5AE8qP3gU1yF4wC6t', '2024-09-20 09:00:00', '2025-03-19 16:45:00', 0, 0),
    ('Bilal',     'Ahmed',      'bilal.ahmed@hotmail.com',     '$2b$12$OMB2dA5fPqR7tU1vX3yZSiCgH8jKlNwI0AE6BF9rQ4hV2zG5xD7u', '2025-01-05 12:00:00', '2025-03-21 08:30:00', 0, 0),
    ('Fatima',    'Iqbal',      'fatima.iqbal@gmail.com',      '$2b$12$PNC3eB6gQrS8uV2wY4zATjDhI9kLmOxJ1BF7CG0sR5iW3AH6yE8v', '2024-11-22 11:15:00', '2025-03-17 20:10:00', 0, 0),
    ('Hamza',     'Raza',       'hamza.raza@gmail.com',        '$2b$12$QOD4fC7hRsT9vW3xZ5ABUkEiJ0lMnPyK2CG8DH1tS6jX4BI7zF9w', '2024-08-30 14:00:00', '2025-03-15 13:55:00', 0, 0),
    ('Zainab',    'Butt',       'zainab.butt@outlook.com',     '$2b$12$RPE5gD8iStU0wX4yA6BCVlFjK1mNoQzL3DH9EI2uT7kY5CJ8AG0x', '2025-02-10 08:30:00', '2025-03-22 09:05:00', 0, 0),
    ('Omar',      'Sheikh',     'omar.sheikh@gmail.com',       '$2b$12$SQF6hE9jTuV1xY5zB7CDWmGkL2nOpRaM4EI0FJ3vU8lZ6DK9BH1y', '2024-07-14 16:45:00', '2025-03-12 18:30:00', 0, 0),
    ('Hina',      'Nawaz',      'hina.nawaz@yahoo.com',        '$2b$12$TRG7iF0kUvW2yZ6AC8DEXnHlM3oPqSbN5FJ1GK4wV9mA7EL0CI2z', '2024-10-08 10:00:00', '2025-03-20 07:40:00', 0, 0),
    ('Tariq',     'Hussain',    'tariq.hussain@gmail.com',     '$2b$12$USH8jG1lVwX3zA7BD9EFYoImN4pQrTcO6GK2HL5xW0nB8FM1DJ3A', '2025-01-18 09:20:00', '2025-03-21 15:25:00', 0, 0),
    ('Mahnoor',   'Ali',        'mahnoor.ali@gmail.com',       '$2b$12$VTI9kH2mWxY4AB8CE0FGZpJnO5qRsTdP7HL3IM6yX1oC9GN2EK4B', '2024-12-25 11:00:00', '2025-03-19 12:00:00', 0, 0),
    ('Faisal',    'Chaudhry',   'faisal.chaudhry@hotmail.com', '$2b$12$WUJ0lI3nXyZ5BC9DF1GHAqKoP6rStuEQ8IM4JN7zY2pD0HO3FL5C', '2024-06-11 15:30:00', '2025-03-10 10:15:00', 0, 0),
    ('Nadia',     'Mirza',      'nadia.mirza@gmail.com',       '$2b$12$XVK1mJ4oYzA6CD0EG2HIBrLpQ7sTuvFR9JN5KO8AZ3qE1IP4GM6D', '2024-11-30 08:00:00', '2025-03-18 19:50:00', 0, 0),
    ('Imran',     'Qureshi',    'imran.qureshi@outlook.com',   '$2b$12$YWL2nK5pZAB7DE1FH3IJCsMarQ8tUvwGS0KO6LP9BA4rF2JQ5HN7E', '2025-01-28 13:45:00', '2025-03-22 08:00:00', 0, 0),
    ('Sana',      'Farooq',     'sana.farooq@gmail.com',       '$2b$12$ZXM3oL6qABC8EF2GI4JKDtNbsR9uVwxHT1LP7MQ0CB5sG3KR6IO8F', '2024-09-05 10:15:00', '2025-03-16 21:30:00', 0, 0),
    ('Asad',      'Javed',      'asad.javed@gmail.com',        '$2b$12$AYN4pM7rBCD9FG3HJ5KLEuOctS0vWxyIU2MQ8NR1DC6tH4LS7JP9G', '2024-10-22 09:30:00', '2025-03-20 14:10:00', 0, 0),
    ('Rabia',     'Zahid',      'rabia.zahid@yahoo.com',       '$2b$12$BZO5qN8sCDE0GH4IK6LMFvPduT1wXyzJV3NR9OS2ED7uI5MT8KQ0H', '2025-02-01 07:00:00', '2025-03-21 17:45:00', 0, 0),
    ('Kamran',    'Niazi',      'kamran.niazi@gmail.com',      '$2b$12$CAP6rO9tDEF1HI5JL7MNGwQevU2xYzAKW4OS0PT3FE8vJ6NU9LR1I', '2024-08-17 14:20:00', '2025-03-13 11:00:00', 0, 0),
    ('Amna',      'Baig',       'amna.baig@hotmail.com',       '$2b$12$DBQ7sP0uEFG2IJ6KM8NOHxRfwV3yZaBLX5PT1QU4GF9wK7OV0MS2J', '2024-12-12 10:45:00', '2025-03-19 09:30:00', 0, 0),
    ('Shahzaib',  'Awan',       'shahzaib.awan@gmail.com',     '$2b$12$ECR8tQ1vFGH3JK7LN9OPIySgxW4zAbCMY6QU2RV5HG0xL8PW1NT3K', '2025-01-10 08:15:00', '2025-03-22 06:50:00', 0, 0),
    ('Mariam',    'Ghani',      'mariam.ghani@gmail.com',      '$2b$12$FDS9uR2wGHI4KL8MO0PQJzThyX5ABcDNZ7RV3SW6IH1yM9QX2OU4L', '2024-07-29 12:00:00', '2025-03-17 15:20:00', 0, 0),
    ('Zubair',    'Rajput',     'zubair.rajput@outlook.com',   '$2b$12$GET0vS3xHIJ5LM9NP1QRKAUizY6BCdEOA8SW4TX7JI2zN0RY3PV5M', '2024-11-14 09:00:00', '2025-03-20 10:05:00', 0, 0),
    ('Khadija',   'Rehman',     'khadija.rehman@gmail.com',    '$2b$12$HFU1wT4yIJK6MN0OQ2RSLBVjaZ7CDeFPB9TX5UY8KJ3AO1SZ4QW6N', '2025-02-20 11:30:00', '2025-03-21 13:15:00', 0, 0),
    ('Sohaib',    'Latif',      'sohaib.latif@gmail.com',      '$2b$12$IGV2xU5zJKL7NO1PR3STMCWkbA8DEfGQC0UY6VZ9LK4BP2TA5RX7O', '2024-10-03 16:00:00', '2025-03-18 08:45:00', 0, 0);
GO

-- =============================================================================
-- SAMPLE DATA: 25 Profiles (one per user above — assumes users get IDs 1–25)
-- =============================================================================

INSERT INTO profiles
    (user_id, city, bio)
VALUES
    (1,  'Lahore',     'Foodie exploring Lahore''s best deals.'),
    (2,  'Karachi',    'Always on the hunt for a great discount.'),
    (3,  'Islamabad',  'Tech enthusiast and casual diner.'),
    (4,  'Lahore',     'Loves trying new restaurants on weekends.'),
    (5,  'Rawalpindi', 'Budget-conscious foodie with a sweet tooth.'),
    (6,  'Faisalabad', 'Home chef who eats out on special occasions.'),
    (7,  'Lahore',     'Night-out planner and deal hunter.'),
    (8,  'Karachi',    'Brunch lover and café hopper.'),
    (9,  'Multan',     'Exploring local cuisines across Pakistan.'),
    (10, 'Islamabad',  'Regular diner, prefers fine dining.'),
    (11, 'Lahore',     'University student looking for affordable bites.'),
    (12, 'Lahore',     'Fitness-focused eater who loves healthy options.'),
    (13, 'Karachi',    'Corporate professional, frequent business lunches.'),
    (14, 'Hyderabad',  'Dessert fanatic and coffee addict.'),
    (15, 'Islamabad',  'Casual diner and weekend explorer.'),
    (16, 'Lahore',     'Family dining enthusiast.'),
    (17, 'Sialkot',    'Sports lover who refuels at local spots.'),
    (18, 'Lahore',     'Travel blogger covering Pakistan''s food scene.'),
    (19, 'Peshawar',   'Fan of traditional Pakistani cuisine.'),
    (20, 'Lahore',     'Busy mom finding great family deals.'),
    (21, 'Karachi',    'Startup founder, loves quick lunch spots.'),
    (22, 'Gujranwala', 'Spice lover and street food enthusiast.'),
    (23, 'Islamabad',  'Remote worker always in need of good Wi-Fi and food.'),
    (24, 'Lahore',     'Medical student, budget meals are a lifesaver.'),
    (25, 'Quetta',     'Exploring diverse cuisines on a tight schedule.');
GO
