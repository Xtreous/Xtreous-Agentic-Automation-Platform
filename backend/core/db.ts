import { SQLDatabase } from 'encore.dev/storage/sqldb';

export const coreDB = new SQLDatabase("xtreous_core", {
  migrations: "./migrations",
});
