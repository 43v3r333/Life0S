import dotenv from "dotenv";

// This module must remain the first server import. Loading deployment
// configuration before storage modules are evaluated ensures that every
// persistent artifact observes LIFEOS_DATA_DIR, including values supplied in
// the gitignored .env.local file.
dotenv.config({ path: ".env.local" });
dotenv.config();
