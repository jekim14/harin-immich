// 성장 기록 DTO
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const GrowthBaseSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  heightCm: z.number().positive().max(300).nullable().default(null),
  weightKg: z.number().positive().max(500).nullable().default(null),
  headCircCm: z.number().positive().max(200).nullable().default(null),
  note: z.string().max(2000).default(''),
  isCheckup: z.boolean().default(false),
  examRound: z.number().int().min(1).max(9).nullable().default(null),
  examPlace: z.string().max(200).default(''),
  assetIds: z.array(z.string().uuid()).default([]),
});

export class GrowthCreateDto extends createZodDto(GrowthBaseSchema) {}
export class GrowthUpdateDto extends createZodDto(GrowthBaseSchema.partial()) {}
