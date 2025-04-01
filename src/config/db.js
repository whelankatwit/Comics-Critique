import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  user: 'postgres',
  host: '::1',
  database: 'Comics Critique',
  password: 'Merrimack00!',
  port: 5432,
});

export default pool; 