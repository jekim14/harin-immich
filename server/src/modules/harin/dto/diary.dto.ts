// 일지 DTO — Zod 검증
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const DiaryBaseSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  title: z.string().min(1).max(200),
  content: z.string().max(10_000).default(''),
  mood: z.string().max(10).default('😊'),
  assetIds: z.array(z.string().uuid()).default([]),
});

export class DiaryCreateDto extends createZodDto(DiaryBaseSchema) {}
export class DiaryUpdateDto extends createZodDto(DiaryBaseSchema.partial()) {}

export const DiaryResponseSchema = DiaryBaseSchema.extend({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export class DiaryResponseDto extends createZodDto(DiaryResponseSchema) {}
