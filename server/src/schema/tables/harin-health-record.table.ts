// 하린이 건강 기록 테이블 — 접종/병원/알레르기 통합
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

@Table('harin_health_record')
@UpdatedAtTrigger('harin_health_record_updatedAt')
export class HarinHealthRecordTable {
  @PrimaryGeneratedColumn()
  id!: Generated<string>;

  @ForeignKeyColumn(() => UserTable, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  userId!: string;

  // 'vaccination' | 'hospital' | 'allergy'
  @Column({ type: 'text' })
  type!: string;

  @Column({ type: 'date', nullable: true })
  date!: string | null;

  @Column({ type: 'text' })
  title!: string;

  @Column({ type: 'text', default: '' })
  note!: Generated<string>;

  // 타입별 추가 필드 (vaccination.completedDate / hospital.symptoms / allergy.severity 등)
  @Column({ type: 'jsonb', default: '{}' })
  extra!: Generated<Record<string, unknown>>;

  @CreateDateColumn()
  createdAt!: Generated<Timestamp>;

  @UpdateDateColumn()
  updatedAt!: Generated<Timestamp>;

  @UpdateIdColumn({ index: true })
  updateId!: Generated<string>;
}
