// 하린이 동영상 테이블 — YouTube 채널 임포트 + 수동 추가
import {
  Column,
  CreateDateColumn,
  ForeignKeyColumn,
  Generated,
  PrimaryGeneratedColumn,
  Table,
  Timestamp,
  UpdateDateColumn,
} from '@immich/sql-tools';
import { UpdatedAtTrigger, UpdateIdColumn } from 'src/decorators';
import { UserTable } from 'src/schema/tables/user.table';

@Table('harin_youtube_video')
@UpdatedAtTrigger('harin_youtube_video_updatedAt')
export class HarinYoutubeVideoTable {
  @PrimaryGeneratedColumn()
  id!: Generated<string>;

  @ForeignKeyColumn(() => UserTable, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  userId!: string;

  // YouTube 영상 ID (11자, unique per user)
  @Column({ type: 'text' })
  videoId!: string;

  @Column({ type: 'text', default: '' })
  channelId!: Generated<string>;

  @Column({ type: 'text' })
  title!: string;

  @Column({ type: 'text', default: '' })
  description!: Generated<string>;

  @Column({ type: 'text', default: '' })
  thumbnailUrl!: Generated<string>;

  @Column({ type: 'timestamp with time zone', nullable: true })
  publishedAt!: string | null;

  // ISO 8601 duration string e.g. "PT5M30S"
  @Column({ type: 'text', default: '' })
  duration!: Generated<string>;

  @Column({ type: 'date', nullable: true })
  date!: string | null;

  @Column({ type: 'text', default: '' })
  note!: Generated<string>;

  // 'imported' (YouTube Data API에서 자동 임포트) | 'manual' (사용자 수동 추가)
  @Column({ type: 'text', default: 'manual' })
  source!: Generated<string>;

  @CreateDateColumn()
  createdAt!: Generated<Timestamp>;

  @UpdateDateColumn()
  updatedAt!: Generated<Timestamp>;

  @UpdateIdColumn({ index: true })
  updateId!: Generated<string>;
}
