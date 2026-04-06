import { readFileSync } from "fs";
import path from "path";
import pool from "./db";

async function initDB() {
  const sql = readFileSync(path.join(__dirname, "init.sql"), "utf-8");
  await pool.query(sql);

  console.log("Tables created");
  await pool.end();
}

initDB();
