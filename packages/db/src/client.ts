import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";
import type { NeonHttpDatabase } from "drizzle-orm/neon-http";

// Lazy singleton — only initialized on first actual DB call (not at module load)
let _db: NeonHttpDatabase<typeof schema> | null = null;

export function getDb(): NeonHttpDatabase<typeof schema> {
  if (!_db) {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL is not set");
    }
    const sql = neon(process.env.DATABASE_URL);
    _db = drizzle(sql, { schema });
  }
  return _db;
}

// Convenience export — creates the lazy singleton on first property access
export const db: NeonHttpDatabase<typeof schema> = new Proxy(
  Object.create(null) as NeonHttpDatabase<typeof schema>,
  {
    get(_t, prop: string | symbol) {
      const d = getDb();
      const val = d[prop as keyof typeof d];
      return typeof val === "function" ? val.bind(d) : val;
    },
  },
);
