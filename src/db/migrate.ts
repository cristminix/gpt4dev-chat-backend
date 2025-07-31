import { drizzle } from "drizzle-orm/better-sqlite3"
import { migrate } from "drizzle-orm/better-sqlite3/migrator"
import Database from "better-sqlite3"

const sqlite = new Database("sqlite.db")
const db = drizzle(sqlite)

console.log("Running migrations...")
migrate(db, { migrationsFolder: "./drizzle" })
console.log("Migrations completed!")

sqlite.close()
