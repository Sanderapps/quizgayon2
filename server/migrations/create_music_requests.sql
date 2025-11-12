CREATE TABLE IF NOT EXISTS music_requests (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) DEFAULT 'Anônimo',
  song VARCHAR(200) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  status VARCHAR(20) DEFAULT 'pending'
);

CREATE INDEX idx_music_requests_created_at ON music_requests(created_at DESC);
CREATE INDEX idx_music_requests_status ON music_requests(status);
