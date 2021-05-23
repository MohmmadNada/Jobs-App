CREATE TABLE IF NOT EXISTS jobstable(
    id SERIAL NOT NULL,
  title TEXT NOT NULL,
    company VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    link TEXT,
    description TEXT
) 