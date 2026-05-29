// 건강 기록 DTO
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const HealthTypeSchema = z.enum(['vaccination', 'hospital', 'allergy']);

const VaccinationExtraSchema = z.object({
  schedule: z.string().optional(),
  category: z.string().optional(),
  completedDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
  hospital: z.string().optional(),
});

const HospitalExtraSchema = z.object({
  hospital: z.string().optional(),
  symptoms: z.string().optional(),
  prescription: z.string().optional(),
});

const AllergyExtraSchema = z.object({
  allergen: z.string().optional(),
  symptoms: z.string().optional(),
  severity: z.enum(['low', 'medium', 'high']).default('low'),
});

export const HealthRecordExtraSchema = z.union([
  VaccinationExtraSchema,
  HospitalExtraSchema,
  AllergyExtraSchema,
  z.record(z.string(), z.unknown()),
]);

const HealthRecordBaseSchema = z.object({
  type: HealthTypeSchema,
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().default(null),
  title: z.string().min(1).max(200),
  note: z.string().max(2000).default(''),
  extra: HealthRecordExtraSchema.default({}),
});

export class HealthRecordCreateDto extends createZodDto(HealthRecordBaseSchema) {}
export class HealthRecordUpdateDto extends createZodDto(HealthRecordBaseSchema.partial()) {}

export const HealthRecordListQuerySchema = z.object({
  type: HealthTypeSchema.optional(),
});
export class HealthRecordListQueryDto extends createZodDto(HealthRecordListQuerySchema) {}
