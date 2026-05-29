// 건강 기록 Repository
import { Injectable } from '@nestjs/common';
import { Insertable, Kysely, Updateable } from 'kysely';
import { InjectKysely } from 'nestjs-kysely';
import { DB } from 'src/schema';
import { HarinHealthRecordTable } from 'src/schema/tables/harin-health-record.table';

@Injectable()
export class HarinHealthRecordRepository {
  constructor(@InjectKysely() private db: Kysely<DB>) {}

  list(userId: string, type?: string) {
    let q = this.db.selectFrom('harin_health_record').selectAll().where('userId', '=', userId);
    if (type) q = q.where('type', '=', type);
    return q.orderBy('date', 'desc').orderBy('createdAt', 'desc').execute();
  }

  get(userId: string, id: string) {
    return this.db
      .selectFrom('harin_health_record')
      .selectAll()
      .where('userId', '=', userId)
      .where('id', '=', id)
      .executeTakeFirst();
  }

  create(data: Insertable<HarinHealthRecordTable>) {
    return this.db
      .insertInto('harin_health_record')
      .values(data)
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  bulkCreate(rows: Insertable<HarinHealthRecordTable>[]) {
    if (rows.length === 0) return Promise.resolve([] as Awaited<ReturnType<typeof this.create>>[]);
    return this.db.insertInto('harin_health_record').values(rows).returningAll().execute();
  }

  update(userId: string, id: string, data: Updateable<HarinHealthRecordTable>) {
    return this.db
      .updateTable('harin_health_record')
      .set(data)
      .where('userId', '=', userId)
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  remove(userId: string, id: string) {
    return this.db
      .deleteFrom('harin_health_record')
      .where('userId', '=', userId)
      .where('id', '=', id)
      .execute();
  }

  countByUser(userId: string, type: string) {
    return this.db
      .selectFrom('harin_health_record')
      .select((eb) => eb.fn.count('id').as('n'))
      .where('userId', '=', userId)
      .where('type', '=', type)
      .executeTakeFirst();
  }
}
