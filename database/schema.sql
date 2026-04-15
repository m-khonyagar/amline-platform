CREATE TABLE users (
  id VARCHAR(64) PRIMARY KEY,
  full_name VARCHAR(255) NOT NULL,
  mobile VARCHAR(32) UNIQUE NOT NULL
);

CREATE TABLE properties (
  id VARCHAR(64) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  city VARCHAR(128) NOT NULL,
  price BIGINT NOT NULL
);

CREATE INDEX idx_properties_city_price ON properties(city, price);
