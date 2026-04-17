CREATE TABLE users (
  id UUID PRIMARY KEY,
  phone TEXT UNIQUE,
  full_name TEXT,
  user_type TEXT DEFAULT 'person'
);

CREATE TABLE contracts (
  id UUID PRIMARY KEY,
  status TEXT,
  visibility TEXT DEFAULT 'people_only',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE contract_drafts (
  id UUID PRIMARY KEY,
  contract_id UUID,
  data JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE contract_parties (
  id UUID PRIMARY KEY,
  contract_id UUID,
  role TEXT,
  full_name TEXT,
  phone TEXT,
  signature_status TEXT DEFAULT 'pending',
  signed_at TIMESTAMP NULL
);

CREATE TABLE signature_events (
  id UUID PRIMARY KEY,
  contract_id UUID,
  party_role TEXT,
  otp_code TEXT,
  status TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE review_queue (
  id UUID PRIMARY KEY,
  contract_id UUID,
  review_type TEXT,
  status TEXT DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
