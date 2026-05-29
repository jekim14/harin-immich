// YouTube 동영상 Repository
import { Injectable } from '@nestjs/common';
import { Insertable, Kysely, Updateable } from 'kysely';
import { InjectKysely } from 'nestjs-kysely';
import { DB } from 'src/schema';
import { HarinYoutubeVideoTable } from 'src/schema/tables/harin-youtube-video.table';

@Injectable()
export class HarinYoutubeVideoRepository {
  constructor(@InjectKysely() private db: Kysely<DB>) {}

  list(userId: string) {
    return this.db
      .selectFrom('harin_youtube_video')
      .selectAll()
      .where('userId', '=', userId)
      .orderBy('publishedAt', 'desc')
      .orderBy('createdAt', 'desc')
      .execute();
  }

  get(userId: string, id: string) {
    return this.db
      .selectFrom('harin_youtube_video')
      .selectAll()
      .where('userId', '=', userId)
      .where('id', '=', id)
      .executeTakeFirst();
  }

  getByVideoId(userId: string, videoId: string) {
    return this.db
      .selectFrom('harin_youtube_video')
      .selectAll()
      .where('userId', '=', userId)
      .where('videoId', '=', videoId)
      .executeTakeFirst();
  }

  create(data: Insertable<HarinYoutubeVideoTable>) {
    return this.db
      .insertInto('harin_youtube_video')
      .values(data)
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  upsertByVideoId(userId: string, videoId: string, data: Insertable<HarinYoutubeVideoTable>) {
    return this.db
      .insertInto('harin_youtube_video')
      .values({ ...data, userId, videoId })
      .onConflict((oc) =>
        oc.columns(['userId', 'videoId']).doUpdateSet({
          title: data.title,
          description: data.description,
          thumbnailUrl: data.thumbnailUrl,
          publishedAt: data.publishedAt,
          duration: data.duration,
        }),
      )
      .returningAll()
      .executeTakeFirst();
  }

  update(userId: string, id: string, data: Updateable<HarinYoutubeVideoTable>) {
    return this.db
      .updateTable('harin_youtube_video')
      .set(data)
      .where('userId', '=', userId)
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  remove(userId: string, id: string) {
    return this.db
      .deleteFrom('harin_youtube_video')
      .where('userId', '=', userId)
      .where('id', '=', id)
      .execute();
  }
}
