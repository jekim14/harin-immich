// 성장 기록 Repository
import { Injectable } from '@nestjs/common';
import { Insertable, Kysely, Updateable } from 'kysely';
import { InjectKysely } from 'nestjs-kysely';
import { DB } from 'src/schema';
import { HarinGrowthTable } from 'src/schema/tables/harin-growth.table';

@Injectable()
export class HarinGrowthRepository {
  constructor(@InjectKysely() private db: Kysely<DB>) {}

  list(userId: string) {
    return this.db
      .selectFrom('harin_growth')
      .selectAll()
      .where('userId', '=', userId)
      .orderBy('date', 'asc')
      .execute();
  }

  get(userId: string, id: string) {
    return this.db
      .selectFrom('harin_growth')
      .selectAll()
      .where('userId', '=', userId)
      .where('id', '=', id)
      .executeTakeFirst();
  }

  create(data: Insertable<HarinGrowthTable>) {
    return this.db.insertInto('harin_growth').values(data).returningAll().executeTakeFirstOrThrow();
  }

  update(userId: string, id: string, data: Updateable<HarinGrowthTable>) {
    return this.db
      .updateTable('harin_growth')
      .set(data)
      .where('userId', '=', userId)
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  remove(userId: string, id: string) {
    return this.db.deleteFrom('harin_growth').where('userId', '=', userId).where('id', '=', id).execute();
  }
}
