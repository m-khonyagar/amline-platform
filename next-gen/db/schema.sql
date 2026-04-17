CREATE TABLE users (
  id UUID PRIMARY KEY,
  phone TEXT UNIQUE
);

CREATE TABLE contracts (
  id UUID PRIMARY KEY,
  status TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE contract_drafts (
  id UUID PRIMARY KEY,
  data JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
