// YouTube 동영상 DTO
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const VideoBaseSchema = z.object({
  videoId: z.string().regex(/^[A-Za-z0-9_-]{11}$/),
  channelId: z.string().default(''),
  title: z.string().min(1).max(500),
  description: z.string().max(20_000).default(''),
  thumbnailUrl: z.string().url().or(z.literal('')).default(''),
  publishedAt: z.string().nullable().default(null),
  duration: z.string().default(''),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().default(null),
  note: z.string().max(2000).default(''),
  source: z.enum(['imported', 'manual']).default('manual'),
});

export class VideoCreateDto extends createZodDto(VideoBaseSchema) {}
export class VideoUpdateDto extends createZodDto(VideoBaseSchema.partial()) {}

const ChannelSyncBodySchema = z.object({
  channelUrl: z.string().url().optional(),
  channelId: z.string().optional(),
  apiKey: z.string().min(10).optional(),
});
export class ChannelSyncBodyDto extends createZodDto(ChannelSyncBodySchema) {}
