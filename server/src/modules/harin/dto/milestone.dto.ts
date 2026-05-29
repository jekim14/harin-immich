// 마일스톤 DTO
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const MilestoneCategorySchema = z.enum(['physical', 'language', 'social', 'cognitive']);

const MilestoneBaseSchema = z.object({
  category: MilestoneCategorySchema,
  title: z.string().min(1).max(200),
  emoji: z.string().max(10).default('⭐'),
  achievedDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().default(null),
  note: z.string().max(2000).default(''),
  assetIds: z.array(z.string().uuid()).default([]),
});

export class MilestoneCreateDto extends createZodDto(MilestoneBaseSchema) {}
export class MilestoneUpdateDto extends createZodDto(MilestoneBaseSchema.partial()) {}

export const MilestoneListQuerySchema = z.object({
  category: MilestoneCategorySchema.optional(),
});
export class MilestoneListQueryDto extends createZodDto(MilestoneListQuerySchema) {}
