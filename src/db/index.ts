import sqlite3 from 'sqlite3'
import { open } from 'sqlite'
import * as path from 'path'

export const openDB = async () => {
  sqlite3.verbose()
  const db = await open({
    filename: 'data/database.db',
    driver: sqlite3.Database,
  })

  await db.migrate({ migrationsPath: path.join(__dirname, 'migrations') })

  return db
}
