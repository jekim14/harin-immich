// 하린이 성장 기록 테이블 — Phase 1
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

@Table('harin_growth')
@UpdatedAtTrigger('harin_growth_updatedAt')
export class HarinGrowthTable {
  @PrimaryGeneratedColumn()
  id!: Generated<string>;

  @ForeignKeyColumn(() => UserTable, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  userId!: string;

  @Column({ type: 'date' })
  date!: string;

  @Column({ type: 'double precision', nullable: true })
  heightCm!: number | null;

  @Column({ type: 'double precision', nullable: true })
  weightKg!: number | null;

  @Column({ type: 'double precision', nullable: true })
  headCircCm!: number | null;

  @Column({ type: 'text', default: '' })
  note!: Generated<string>;

  // 영유아 검진 (만 0~71개월, 9차)
  @Column({ type: 'boolean', default: false })
  isCheckup!: Generated<boolean>;

  @Column({ type: 'integer', nullable: true })
  examRound!: number | null;

  @Column({ type: 'text', default: '' })
  examPlace!: Generated<string>;

  @Column({ type: 'text', array: true, default: '{}' })
  assetIds!: Generated<string[]>;

  @CreateDateColumn()
  createdAt!: Generated<Timestamp>;

  @UpdateDateColumn()
  updatedAt!: Generated<Timestamp>;

  @UpdateIdColumn({ index: true })
  updateId!: Generated<string>;
}
