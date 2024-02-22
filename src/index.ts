import { openDB } from './db'
import { LocationServer } from './server'
;(async function main() {
  const db = await openDB()
  new LocationServer(db).listen()
})()
