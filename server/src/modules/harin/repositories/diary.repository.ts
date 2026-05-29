// 일지 Repository — Kysely
import { Injectable } from '@nestjs/common';
import { Insertable, Kysely, Updateable } from 'kysely';
import { InjectKysely } from 'nestjs-kysely';
import { DB } from 'src/schema';
import { HarinDiaryTable } from 'src/schema/tables/harin-diary.table';

export interface DiarySearchOpts {
  search?: string;
  month?: string;
}

@Injectable()
export class HarinDiaryRepository {
  constructor(@InjectKysely() private db: Kysely<DB>) {}

  search(userId: string, opts: DiarySearchOpts = {}) {
    let q = this.db.selectFrom('harin_diary').selectAll().where('userId', '=', userId);
    if (opts.search) {
      const term = `%${opts.search}%`;
      q = q.where((eb) => eb.or([eb('title', 'ilike', term), eb('content', 'ilike', term)]));
    }
    if (opts.month) {
      q = q.where('date', 'like', `${opts.month}%`);
    }
    return q.orderBy('date', 'desc').execute();
  }

  get(userId: string, id: string) {
    return this.db
      .selectFrom('harin_diary')
      .selectAll()
      .where('userId', '=', userId)
      .where('id', '=', id)
      .executeTakeFirst();
  }

  create(data: Insertable<HarinDiaryTable>) {
    return this.db.insertInto('harin_diary').values(data).returningAll().executeTakeFirstOrThrow();
  }

  update(userId: string, id: string, data: Updateable<HarinDiaryTable>) {
    return this.db
      .updateTable('harin_diary')
      .set(data)
      .where('userId', '=', userId)
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  remove(userId: string, id: string) {
    return this.db.deleteFrom('harin_diary').where('userId', '=', userId).where('id', '=', id).execute();
  }
}
