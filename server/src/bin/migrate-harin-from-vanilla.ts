// 기존 Vanilla JS "하린이의 성장 일기" 앱 export JSON을
// Immich Postgres의 harin_* 테이블로 이관하는 CLI 스크립트
//
// 사용법:
//   docker compose exec immich-server \
//     node /usr/src/app/server/dist/bin/migrate-harin-from-vanilla.js \
//     <user-email> /path/to/export.json
//
// 옵션:
//   --dry-run   실제 insert 안 함, 건수만 보고
//
// userId는 user-email로 users 테이블에서 조회.
// 같은 데이터를 두 번 import해도 안전하도록 ID 기반 upsert.

import { Kysely, PostgresDialect, sql } from 'kysely';
import pg from 'pg';
import * as fs from 'node:fs';
import * as path from 'node:path';

interface VanillaExport {
  exportDate?: string;
  profile?: { name?: string; birthDate?: string; photoUrl?: string };
  growth?: Array<{ id?: string; date: string; height?: number | null; weight?: number | null; headCirc?: number | null; note?: string }>;
  diary?: Array<{ id?: string; date: string; title: string; content?: string; mood?: string; photos?: string[] }>;
  vaccinations?: Array<{ id?: string; name: string; schedule?: string; category?: string; completedDate?: string | null; hospital?: string; note?: string }>;
  hospitalVisits?: Array<{ id?: string; date: string; hospital?: string; symptoms?: string; prescription?: string; note?: string }>;
  allergies?: Array<{ id?: string; allergen: string; symptoms?: string; severity?: 'low' | 'medium' | 'high'; note?: string }>;
  milestones?: Array<{ id?: string; category: string; title: string; emoji?: string; achievedDate?: string | null; note?: string }>;
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const positional = args.filter((a) => !a.startsWith('--'));
  const [email, jsonPath] = positional;

  if (!email || !jsonPath) {
    console.error('Usage: migrate-harin-from-vanilla <user-email> <export.json> [--dry-run]');
    process.exit(1);
  }

  const absPath = path.resolve(jsonPath);
  if (!fs.existsSync(absPath)) {
    console.error(`File not found: ${absPath}`);
    process.exit(1);
  }

  const data: VanillaExport = JSON.parse(fs.readFileSync(absPath, 'utf-8'));

  const db = new Kysely<any>({
    dialect: new PostgresDialect({
      pool: new pg.Pool({
        host: process.env.DB_HOSTNAME ?? 'database',
        port: Number(process.env.DB_PORT ?? '5432'),
        database: process.env.DB_DATABASE_NAME ?? 'immich',
        user: process.env.DB_USERNAME ?? 'postgres',
        password: process.env.DB_PASSWORD ?? '',
      }),
    }),
  });

  try {
    const user = await db.selectFrom('users').select(['id']).where('email', '=', email).executeTakeFirst();
    if (!user) {
      console.error(`User not found: ${email}`);
      process.exit(1);
    }
    const userId = user.id as string;
    console.log(`Migrating to userId=${userId} ${dryRun ? '(DRY RUN)' : ''}`);

    let totals = { diary: 0, growth: 0, health: 0, milestone: 0 };

    // ─── diary ─────────────────────────────────────────────
    for (const d of data.diary ?? []) {
      const row = {
        userId,
        date: d.date,
        title: d.title,
        content: d.content ?? '',
        mood: d.mood ?? '😊',
        assetIds: [], // 기존 base64 사진은 Immich에 별도 업로드 후 연결
      };
      if (!dryRun) {
        await db
          .insertInto('harin_diary')
          .values(row)
          .onConflict((oc) => oc.doNothing())
          .execute();
      }
      totals.diary++;
    }

    // ─── growth ────────────────────────────────────────────
    for (const g of data.growth ?? []) {
      const row = {
        userId,
        date: g.date,
        heightCm: g.height ?? null,
        weightKg: g.weight ?? null,
        headCircCm: g.headCirc ?? null,
        note: g.note ?? '',
      };
      if (!dryRun) {
        await db
          .insertInto('harin_growth')
          .values(row)
          .onConflict((oc) => oc.doNothing())
          .execute();
      }
      totals.growth++;
    }

    // ─── vaccinations ──────────────────────────────────────
    for (const v of data.vaccinations ?? []) {
      const row = {
        userId,
        type: 'vaccination',
        date: v.completedDate ?? null,
        title: v.name,
        note: v.note ?? '',
        extra: {
          schedule: v.schedule,
          category: v.category,
          completedDate: v.completedDate ?? null,
          hospital: v.hospital,
        },
      };
      if (!dryRun) {
        await db
          .insertInto('harin_health_record')
          .values(row)
          .onConflict((oc) => oc.doNothing())
          .execute();
      }
      totals.health++;
    }

    // ─── hospital visits ──────────────────────────────────
    for (const h of data.hospitalVisits ?? []) {
      const row = {
        userId,
        type: 'hospital',
        date: h.date,
        title: h.hospital ?? '병원',
        note: h.note ?? '',
        extra: { hospital: h.hospital, symptoms: h.symptoms, prescription: h.prescription },
      };
      if (!dryRun) {
        await db
          .insertInto('harin_health_record')
          .values(row)
          .onConflict((oc) => oc.doNothing())
          .execute();
      }
      totals.health++;
    }

    // ─── allergies ─────────────────────────────────────────
    for (const a of data.allergies ?? []) {
      const row = {
        userId,
        type: 'allergy',
        date: null,
        title: a.allergen,
        note: a.note ?? '',
        extra: { allergen: a.allergen, symptoms: a.symptoms, severity: a.severity ?? 'low' },
      };
      if (!dryRun) {
        await db
          .insertInto('harin_health_record')
          .values(row)
          .onConflict((oc) => oc.doNothing())
          .execute();
      }
      totals.health++;
    }

    // ─── milestones ────────────────────────────────────────
    for (const m of data.milestones ?? []) {
      const row = {
        userId,
        category: m.category,
        title: m.title,
        emoji: m.emoji ?? '⭐',
        achievedDate: m.achievedDate ?? null,
        note: m.note ?? '',
        assetIds: [],
      };
      if (!dryRun) {
        await db
          .insertInto('harin_milestone')
          .values(row)
          .onConflict((oc) => oc.doNothing())
          .execute();
      }
      totals.milestone++;
    }

    console.log('Migration summary:');
    console.log(`  diary       : ${totals.diary}`);
    console.log(`  growth      : ${totals.growth}`);
    console.log(`  health      : ${totals.health}`);
    console.log(`  milestone   : ${totals.milestone}`);
    if (dryRun) console.log('No rows actually inserted (dry-run).');
  } finally {
    await db.destroy();
  }
}

void sql; // silence unused
main().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
