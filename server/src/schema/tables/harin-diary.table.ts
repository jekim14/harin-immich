// 하린이 일지 테이블 — Phase 1
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

@Table('harin_diary')
@UpdatedAtTrigger('harin_diary_updatedAt')
export class HarinDiaryTable {
  @PrimaryGeneratedColumn()
  id!: Generated<string>;

  @ForeignKeyColumn(() => UserTable, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  userId!: string;

  @Column({ type: 'date' })
  date!: string;

  @Column({ type: 'text' })
  title!: string;

  @Column({ type: 'text', default: '' })
  content!: Generated<string>;

  @Column({ type: 'text', default: '😊' })
  mood!: Generated<string>;

  @Column({ type: 'text', array: true, default: '{}' })
  assetIds!: Generated<string[]>;

  @CreateDateColumn()
  createdAt!: Generated<Timestamp>;

  @UpdateDateColumn()
  updatedAt!: Generated<Timestamp>;

  @UpdateIdColumn({ index: true })
  updateId!: Generated<string>;
}
