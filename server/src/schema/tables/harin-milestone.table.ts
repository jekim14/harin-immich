// 하린이 마일스톤 테이블
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

@Table('harin_milestone')
@UpdatedAtTrigger('harin_milestone_updatedAt')
export class HarinMilestoneTable {
  @PrimaryGeneratedColumn()
  id!: Generated<string>;

  @ForeignKeyColumn(() => UserTable, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  userId!: string;

  // 'physical' | 'language' | 'social' | 'cognitive'
  @Column({ type: 'text' })
  category!: string;

  @Column({ type: 'text' })
  title!: string;

  @Column({ type: 'text', default: '⭐' })
  emoji!: Generated<string>;

  @Column({ type: 'date', nullable: true })
  achievedDate!: string | null;

  @Column({ type: 'text', default: '' })
  note!: Generated<string>;

  @Column({ type: 'text', array: true, default: '{}' })
  assetIds!: Generated<string[]>;

  @CreateDateColumn()
  createdAt!: Generated<Timestamp>;

  @UpdateDateColumn()
  updatedAt!: Generated<Timestamp>;

  @UpdateIdColumn({ index: true })
  updateId!: Generated<string>;
}
