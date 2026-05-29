// 하린이 도메인 테이블 — diary/growth/health_record/milestone 4개 CREATE
import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  // ── harin_diary ──────────────────────────────────────────
  await sql`CREATE TABLE "harin_diary" (
    "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
    "userId" uuid NOT NULL,
    "date" date NOT NULL,
    "title" text NOT NULL,
    "content" text NOT NULL DEFAULT '',
    "mood" text NOT NULL DEFAULT '😊',
    "assetIds" text[] NOT NULL DEFAULT '{}',
    "createdAt" timestamp with time zone NOT NULL DEFAULT now(),
    "updatedAt" timestamp with time zone NOT NULL DEFAULT now(),
    "updateId" uuid NOT NULL DEFAULT immich_uuid_v7()
  );`.execute(db);
  await sql`ALTER TABLE "harin_diary" ADD CONSTRAINT "PK_harin_diary_id" PRIMARY KEY ("id");`.execute(db);
  await sql`ALTER TABLE "harin_diary" ADD CONSTRAINT "FK_harin_diary_userId" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON UPDATE CASCADE ON DELETE CASCADE;`.execute(db);
  await sql`CREATE INDEX "IDX_harin_diary_userId" ON "harin_diary" ("userId");`.execute(db);
  await sql`CREATE INDEX "IDX_harin_diary_userId_date" ON "harin_diary" ("userId", "date" DESC);`.execute(db);
  await sql`CREATE INDEX "IDX_harin_diary_updateId" ON "harin_diary" ("updateId");`.execute(db);
  await sql`CREATE OR REPLACE TRIGGER "harin_diary_updatedAt"
    BEFORE UPDATE ON "harin_diary"
    FOR EACH ROW
    EXECUTE FUNCTION updated_at();`.execute(db);

  // ── harin_growth ─────────────────────────────────────────
  await sql`CREATE TABLE "harin_growth" (
    "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
    "userId" uuid NOT NULL,
    "date" date NOT NULL,
    "heightCm" numeric,
    "weightKg" numeric,
    "headCircCm" numeric,
    "note" text NOT NULL DEFAULT '',
    "createdAt" timestamp with time zone NOT NULL DEFAULT now(),
    "updatedAt" timestamp with time zone NOT NULL DEFAULT now(),
    "updateId" uuid NOT NULL DEFAULT immich_uuid_v7()
  );`.execute(db);
  await sql`ALTER TABLE "harin_growth" ADD CONSTRAINT "PK_harin_growth_id" PRIMARY KEY ("id");`.execute(db);
  await sql`ALTER TABLE "harin_growth" ADD CONSTRAINT "FK_harin_growth_userId" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON UPDATE CASCADE ON DELETE CASCADE;`.execute(db);
  await sql`CREATE INDEX "IDX_harin_growth_userId" ON "harin_growth" ("userId");`.execute(db);
  await sql`CREATE INDEX "IDX_harin_growth_userId_date" ON "harin_growth" ("userId", "date" ASC);`.execute(db);
  await sql`CREATE INDEX "IDX_harin_growth_updateId" ON "harin_growth" ("updateId");`.execute(db);
  await sql`CREATE OR REPLACE TRIGGER "harin_growth_updatedAt"
    BEFORE UPDATE ON "harin_growth"
    FOR EACH ROW
    EXECUTE FUNCTION updated_at();`.execute(db);

  // ── harin_health_record ──────────────────────────────────
  await sql`CREATE TABLE "harin_health_record" (
    "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
    "userId" uuid NOT NULL,
    "type" text NOT NULL,
    "date" date,
    "title" text NOT NULL,
    "note" text NOT NULL DEFAULT '',
    "extra" jsonb NOT NULL DEFAULT '{}'::jsonb,
    "createdAt" timestamp with time zone NOT NULL DEFAULT now(),
    "updatedAt" timestamp with time zone NOT NULL DEFAULT now(),
    "updateId" uuid NOT NULL DEFAULT immich_uuid_v7()
  );`.execute(db);
  await sql`ALTER TABLE "harin_health_record" ADD CONSTRAINT "PK_harin_health_record_id" PRIMARY KEY ("id");`.execute(db);
  await sql`ALTER TABLE "harin_health_record" ADD CONSTRAINT "FK_harin_health_record_userId" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON UPDATE CASCADE ON DELETE CASCADE;`.execute(db);
  await sql`CREATE INDEX "IDX_harin_health_record_userId" ON "harin_health_record" ("userId");`.execute(db);
  await sql`CREATE INDEX "IDX_harin_health_record_userId_type" ON "harin_health_record" ("userId", "type");`.execute(db);
  await sql`CREATE INDEX "IDX_harin_health_record_updateId" ON "harin_health_record" ("updateId");`.execute(db);
  await sql`CREATE OR REPLACE TRIGGER "harin_health_record_updatedAt"
    BEFORE UPDATE ON "harin_health_record"
    FOR EACH ROW
    EXECUTE FUNCTION updated_at();`.execute(db);

  // ── harin_milestone ──────────────────────────────────────
  await sql`CREATE TABLE "harin_milestone" (
    "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
    "userId" uuid NOT NULL,
    "category" text NOT NULL,
    "title" text NOT NULL,
    "emoji" text NOT NULL DEFAULT '⭐',
    "achievedDate" date,
    "note" text NOT NULL DEFAULT '',
    "assetIds" text[] NOT NULL DEFAULT '{}',
    "createdAt" timestamp with time zone NOT NULL DEFAULT now(),
    "updatedAt" timestamp with time zone NOT NULL DEFAULT now(),
    "updateId" uuid NOT NULL DEFAULT immich_uuid_v7()
  );`.execute(db);
  await sql`ALTER TABLE "harin_milestone" ADD CONSTRAINT "PK_harin_milestone_id" PRIMARY KEY ("id");`.execute(db);
  await sql`ALTER TABLE "harin_milestone" ADD CONSTRAINT "FK_harin_milestone_userId" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON UPDATE CASCADE ON DELETE CASCADE;`.execute(db);
  await sql`CREATE INDEX "IDX_harin_milestone_userId" ON "harin_milestone" ("userId");`.execute(db);
  await sql`CREATE INDEX "IDX_harin_milestone_userId_category" ON "harin_milestone" ("userId", "category");`.execute(db);
  await sql`CREATE INDEX "IDX_harin_milestone_updateId" ON "harin_milestone" ("updateId");`.execute(db);
  await sql`CREATE OR REPLACE TRIGGER "harin_milestone_updatedAt"
    BEFORE UPDATE ON "harin_milestone"
    FOR EACH ROW
    EXECUTE FUNCTION updated_at();`.execute(db);
}

export async function down(db: Kysely<any>): Promise<void> {
  for (const t of ['harin_milestone', 'harin_health_record', 'harin_growth', 'harin_diary']) {
    await sql.raw(`DROP TRIGGER IF EXISTS "${t}_updatedAt" ON "${t}";`).execute(db);
    await sql.raw(`DROP TABLE IF EXISTS "${t}" CASCADE;`).execute(db);
  }
}
