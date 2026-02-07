import initSqlJs, { Database } from 'sql.js';

let db: Database | null = null;

export function getDatabase(): Database {
  if (!db) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }
  return db;
}

export async function initDatabase(): Promise<void> {
  // Initialize SQL.js (runs SQLite in WebAssembly - no native modules needed)
  const SQL = await initSqlJs();
  db = new SQL.Database();

  // Create tables
  db.run(`
    -- Cases table for tracking user cases
    CREATE TABLE IF NOT EXISTS cases (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      reference_number TEXT UNIQUE NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      status TEXT DEFAULT 'open',
      category TEXT NOT NULL,
      subcategory TEXT,
      summary TEXT NOT NULL,
      postcode TEXT,
      client_name TEXT,
      client_email TEXT,
      client_phone TEXT,
      notes TEXT,
      assigned_adviser TEXT,
      priority TEXT DEFAULT 'normal'
    )
  `);

  db.run(`
    -- Case events/timeline
    CREATE TABLE IF NOT EXISTS case_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      case_id INTEGER NOT NULL,
      event_date DATETIME DEFAULT CURRENT_TIMESTAMP,
      event_type TEXT NOT NULL,
      description TEXT NOT NULL,
      created_by TEXT,
      FOREIGN KEY (case_id) REFERENCES cases(id)
    )
  `);

  db.run(`
    -- Deadlines table
    CREATE TABLE IF NOT EXISTS deadlines (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      case_id INTEGER,
      deadline_type TEXT NOT NULL,
      deadline_date DATE NOT NULL,
      description TEXT,
      status TEXT DEFAULT 'pending',
      reminder_sent INTEGER DEFAULT 0,
      FOREIGN KEY (case_id) REFERENCES cases(id)
    )
  `);

  db.run(`
    -- Local services cache
    CREATE TABLE IF NOT EXISTS local_services (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      postcode_area TEXT NOT NULL,
      service_type TEXT NOT NULL,
      service_name TEXT NOT NULL,
      address TEXT,
      phone TEXT,
      email TEXT,
      website TEXT,
      opening_hours TEXT,
      last_updated DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create indexes
  db.run(`CREATE INDEX IF NOT EXISTS idx_cases_reference ON cases(reference_number)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_cases_status ON cases(status)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_cases_category ON cases(category)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_cases_postcode ON cases(postcode)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_deadlines_date ON deadlines(deadline_date)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_local_services_postcode ON local_services(postcode_area)`);

  // Seed sample local services data
  seedLocalServices();

  console.log('✅ Database initialized successfully (in-memory SQLite via sql.js)');
}

function seedLocalServices(): void {
  if (!db) return;
  
  const services = [
    // Citizens Advice offices
    { postcode_area: 'SW1', service_type: 'citizens_advice', service_name: 'Citizens Advice Westminster', address: '21 Warwick Row, London SW1E 5ER', phone: '0800 144 8848', website: 'https://www.westminstercab.org.uk' },
    { postcode_area: 'M1', service_type: 'citizens_advice', service_name: 'Citizens Advice Manchester', address: 'St Nicholas Buildings, 51 St Nicholas St, Manchester M1 4TE', phone: '0808 278 7800', website: 'https://www.citizensadvicemanchester.org.uk' },
    { postcode_area: 'B1', service_type: 'citizens_advice', service_name: 'Citizens Advice Birmingham', address: 'Gazette Buildings, 168 Corporation Street, Birmingham B4 6TB', phone: '0344 477 1010', website: 'https://www.bhamcab.org.uk' },
    { postcode_area: 'L1', service_type: 'citizens_advice', service_name: 'Citizens Advice Liverpool', address: '2nd Floor, Cunard Building, Water Street, Liverpool L3 1DS', phone: '0808 278 7888', website: 'https://www.citizensadviceliverpool.org.uk' },
    { postcode_area: 'G1', service_type: 'citizens_advice', service_name: 'Citizens Advice Glasgow', address: '1st Floor, 87 Bath Street, Glasgow G2 2EE', phone: '0141 552 5556', website: 'https://www.glasgowcab.org.uk' },
    
    // Shelter offices
    { postcode_area: 'SW1', service_type: 'housing', service_name: 'Shelter London Hub', address: '88 Old Street, London EC1V 9HU', phone: '0808 800 4444', website: 'https://www.shelter.org.uk' },
    { postcode_area: 'M1', service_type: 'housing', service_name: 'Shelter Manchester', address: 'Swan Buildings, 20 Swan Street, Manchester M4 5JW', phone: '0808 800 4444', website: 'https://www.shelter.org.uk' },
    
    // Job centres
    { postcode_area: 'SW1', service_type: 'employment', service_name: 'Jobcentre Plus Victoria', address: '19-27 Buckingham Palace Road, London SW1W 0PT', phone: '0800 169 0190', website: 'https://www.gov.uk/contact-jobcentre-plus' },
    { postcode_area: 'M1', service_type: 'employment', service_name: 'Jobcentre Plus Manchester', address: '77 Mosley Street, Manchester M2 3HR', phone: '0800 169 0190', website: 'https://www.gov.uk/contact-jobcentre-plus' },
    
    // Legal aid
    { postcode_area: 'SW1', service_type: 'legal_aid', service_name: 'London Legal Support Trust', address: 'Central London', phone: '020 7092 3960', website: 'https://www.londonlegalsupporttrust.org.uk' },
  ];

  for (const service of services) {
    db.run(
      `INSERT OR IGNORE INTO local_services (postcode_area, service_type, service_name, address, phone, website)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [service.postcode_area, service.service_type, service.service_name, service.address, service.phone, service.website]
    );
  }
}

// Helper function to run queries and get results
export function runQuery<T>(sql: string, params: unknown[] = []): T[] {
  const database = getDatabase();
  const stmt = database.prepare(sql);
  stmt.bind(params);
  
  const results: T[] = [];
  while (stmt.step()) {
    const row = stmt.getAsObject() as T;
    results.push(row);
  }
  stmt.free();
  return results;
}

// Helper function for single result
export function runQuerySingle<T>(sql: string, params: unknown[] = []): T | undefined {
  const results = runQuery<T>(sql, params);
  return results[0];
}

// Helper function for insert/update/delete
export function runExec(sql: string, params: unknown[] = []): { lastInsertRowid: number; changes: number } {
  const database = getDatabase();
  const stmt = database.prepare(sql);
  stmt.bind(params);
  stmt.step();
  stmt.free();
  
  const lastId = runQuerySingle<{ id: number }>('SELECT last_insert_rowid() as id');
  const changes = runQuerySingle<{ changes: number }>('SELECT changes() as changes');
  
  return {
    lastInsertRowid: lastId?.id || 0,
    changes: changes?.changes || 0
  };
}
