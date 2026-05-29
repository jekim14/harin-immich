// harin_youtube_video 테이블 — YouTube 채널 임포트 + 수동 추가
import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  await sql`CREATE TABLE "harin_youtube_video" (
    "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
    "userId" uuid NOT NULL,
    "videoId" text NOT NULL,
    "channelId" text NOT NULL DEFAULT '',
    "title" text NOT NULL,
    "description" text NOT NULL DEFAULT '',
    "thumbnailUrl" text NOT NULL DEFAULT '',
    "publishedAt" timestamp with time zone,
    "duration" text NOT NULL DEFAULT '',
    "date" date,
    "note" text NOT NULL DEFAULT '',
    "source" text NOT NULL DEFAULT 'manual',
    "createdAt" timestamp with time zone NOT NULL DEFAULT now(),
    "updatedAt" timestamp with time zone NOT NULL DEFAULT now(),
    "updateId" uuid NOT NULL DEFAULT immich_uuid_v7()
  );`.execute(db);
  await sql`ALTER TABLE "harin_youtube_video" ADD CONSTRAINT "PK_harin_youtube_video_id" PRIMARY KEY ("id");`.execute(db);
  await sql`ALTER TABLE "harin_youtube_video" ADD CONSTRAINT "FK_harin_youtube_video_userId" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON UPDATE CASCADE ON DELETE CASCADE;`.execute(db);
  await sql`ALTER TABLE "harin_youtube_video" ADD CONSTRAINT "UQ_harin_youtube_video_user_video" UNIQUE ("userId", "videoId");`.execute(db);
  await sql`CREATE INDEX "IDX_harin_youtube_video_userId" ON "harin_youtube_video" ("userId");`.execute(db);
  await sql`CREATE INDEX "IDX_harin_youtube_video_userId_publishedAt" ON "harin_youtube_video" ("userId", "publishedAt" DESC);`.execute(db);
  await sql`CREATE INDEX "IDX_harin_youtube_video_updateId" ON "harin_youtube_video" ("updateId");`.execute(db);
  await sql`CREATE OR REPLACE TRIGGER "harin_youtube_video_updatedAt"
    BEFORE UPDATE ON "harin_youtube_video"
    FOR EACH ROW
    EXECUTE FUNCTION updated_at();`.execute(db);
}

export async function down(db: Kysely<any>): Promise<void> {
  await sql`DROP TRIGGER IF EXISTS "harin_youtube_video_updatedAt" ON "harin_youtube_video";`.execute(db);
  await sql`DROP TABLE IF EXISTS "harin_youtube_video" CASCADE;`.execute(db);
}
