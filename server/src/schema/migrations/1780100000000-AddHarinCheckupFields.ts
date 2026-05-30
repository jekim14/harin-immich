// harin_growth 테이블에 영유아 검진 필드 추가
import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  await sql`ALTER TABLE "harin_growth" ADD COLUMN "isCheckup" boolean NOT NULL DEFAULT false;`.execute(db);
  await sql`ALTER TABLE "harin_growth" ADD COLUMN "examRound" integer;`.execute(db);
  await sql`ALTER TABLE "harin_growth" ADD COLUMN "examPlace" text NOT NULL DEFAULT '';`.execute(db);
  await sql`ALTER TABLE "harin_growth" ADD COLUMN "assetIds" text[] NOT NULL DEFAULT '{}';`.execute(db);
  await sql`CREATE INDEX "IDX_harin_growth_userId_isCheckup" ON "harin_growth" ("userId", "isCheckup") WHERE "isCheckup" = true;`.execute(db);
}

export async function down(db: Kysely<any>): Promise<void> {
  await sql`DROP INDEX IF EXISTS "IDX_harin_growth_userId_isCheckup";`.execute(db);
  await sql`ALTER TABLE "harin_growth" DROP COLUMN IF EXISTS "assetIds";`.execute(db);
  await sql`ALTER TABLE "harin_growth" DROP COLUMN IF EXISTS "examPlace";`.execute(db);
  await sql`ALTER TABLE "harin_growth" DROP COLUMN IF EXISTS "examRound";`.execute(db);
  await sql`ALTER TABLE "harin_growth" DROP COLUMN IF EXISTS "isCheckup";`.execute(db);
}
