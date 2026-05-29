// 마일스톤 Repository
import { Injectable } from '@nestjs/common';
import { Insertable, Kysely, Updateable } from 'kysely';
import { InjectKysely } from 'nestjs-kysely';
import { DB } from 'src/schema';
import { HarinMilestoneTable } from 'src/schema/tables/harin-milestone.table';

@Injectable()
export class HarinMilestoneRepository {
  constructor(@InjectKysely() private db: Kysely<DB>) {}

  list(userId: string, category?: string) {
    let q = this.db.selectFrom('harin_milestone').selectAll().where('userId', '=', userId);
    if (category) q = q.where('category', '=', category);
    return q.orderBy('category', 'asc').orderBy('createdAt', 'asc').execute();
  }

  get(userId: string, id: string) {
    return this.db
      .selectFrom('harin_milestone')
      .selectAll()
      .where('userId', '=', userId)
      .where('id', '=', id)
      .executeTakeFirst();
  }

  create(data: Insertable<HarinMilestoneTable>) {
    return this.db.insertInto('harin_milestone').values(data).returningAll().executeTakeFirstOrThrow();
  }

  bulkCreate(rows: Insertable<HarinMilestoneTable>[]) {
    if (rows.length === 0) return Promise.resolve([] as Awaited<ReturnType<typeof this.create>>[]);
    return this.db.insertInto('harin_milestone').values(rows).returningAll().execute();
  }

  update(userId: string, id: string, data: Updateable<HarinMilestoneTable>) {
    return this.db
      .updateTable('harin_milestone')
      .set(data)
      .where('userId', '=', userId)
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  remove(userId: string, id: string) {
    return this.db
      .deleteFrom('harin_milestone')
      .where('userId', '=', userId)
      .where('id', '=', id)
      .execute();
  }

  countByUser(userId: string) {
    return this.db
      .selectFrom('harin_milestone')
      .select((eb) => eb.fn.count('id').as('n'))
      .where('userId', '=', userId)
      .executeTakeFirst();
  }
}
