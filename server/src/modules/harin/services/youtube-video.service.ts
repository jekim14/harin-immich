// YouTube 동영상 Service — 채널 임포트 + CRUD
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import {
  ChannelSyncBodyDto,
  VideoCreateDto,
  VideoUpdateDto,
} from 'src/modules/harin/dto/youtube-video.dto';
import { HarinYoutubeVideoRepository } from 'src/modules/harin/repositories/youtube-video.repository';

interface YouTubeApiVideo {
  contentDetails?: { videoId?: string };
  snippet?: {
    title?: string;
    description?: string;
    thumbnails?: { high?: { url?: string }; medium?: { url?: string }; default?: { url?: string } };
    publishedAt?: string;
    channelId?: string;
  };
}

interface YouTubeApiPlaylistItemsResponse {
  items?: YouTubeApiVideo[];
  nextPageToken?: string;
}

interface YouTubeApiChannelResponse {
  items?: Array<{ id?: string; contentDetails?: { relatedPlaylists?: { uploads?: string } } }>;
}

@Injectable()
export class HarinYoutubeVideoService {
  constructor(private repo: HarinYoutubeVideoRepository) {}

  list(userId: string) {
    return this.repo.list(userId);
  }

  async get(userId: string, id: string) {
    const row = await this.repo.get(userId, id);
    if (!row) throw new NotFoundException('video not found');
    return row;
  }

  create(userId: string, dto: VideoCreateDto) {
    return this.repo.create({ ...dto, userId });
  }

  async update(userId: string, id: string, dto: VideoUpdateDto) {
    await this.get(userId, id);
    return this.repo.update(userId, id, dto);
  }

  async remove(userId: string, id: string) {
    await this.get(userId, id);
    await this.repo.remove(userId, id);
  }

  // ─── 채널 동기화 ────────────────────────────────────────────
  async syncChannel(userId: string, body: ChannelSyncBodyDto) {
    const apiKey = body.apiKey || process.env.HARIN_YOUTUBE_API_KEY;
    if (!apiKey) {
      throw new BadRequestException(
        'YouTube API key가 필요합니다. body.apiKey 또는 HARIN_YOUTUBE_API_KEY 환경변수로 제공.',
      );
    }

    const channelId = body.channelId || (await this.resolveChannelIdFromUrl(body.channelUrl, apiKey));
    if (!channelId) throw new BadRequestException('채널 ID를 확인할 수 없습니다.');

    const uploadsPlaylistId = await this.getUploadsPlaylistId(channelId, apiKey);
    if (!uploadsPlaylistId) throw new BadRequestException('업로드 플레이리스트를 찾을 수 없습니다.');

    const imported: string[] = [];
    let pageToken: string | undefined;
    let totalFetched = 0;
    const MAX = 200; // 최대 200개로 안전 제한

    while (totalFetched < MAX) {
      const url = new URL('https://www.googleapis.com/youtube/v3/playlistItems');
      url.searchParams.set('part', 'snippet,contentDetails');
      url.searchParams.set('playlistId', uploadsPlaylistId);
      url.searchParams.set('maxResults', '50');
      url.searchParams.set('key', apiKey);
      if (pageToken) url.searchParams.set('pageToken', pageToken);

      const res = await fetch(url.toString());
      if (!res.ok) throw new BadRequestException(`YouTube API 오류 ${res.status}`);
      const data = (await res.json()) as YouTubeApiPlaylistItemsResponse;

      for (const item of data.items ?? []) {
        const videoId = item.contentDetails?.videoId;
        if (!videoId) continue;
        await this.repo.upsertByVideoId(userId, videoId, {
          userId,
          videoId,
          channelId,
          title: item.snippet?.title ?? '',
          description: item.snippet?.description ?? '',
          thumbnailUrl:
            item.snippet?.thumbnails?.high?.url ??
            item.snippet?.thumbnails?.medium?.url ??
            item.snippet?.thumbnails?.default?.url ??
            '',
          publishedAt: item.snippet?.publishedAt ?? null,
          duration: '',
          date: item.snippet?.publishedAt ? item.snippet.publishedAt.slice(0, 10) : null,
          note: '',
          source: 'imported',
        });
        imported.push(videoId);
      }

      totalFetched += data.items?.length ?? 0;
      if (!data.nextPageToken) break;
      pageToken = data.nextPageToken;
    }

    return { channelId, importedCount: imported.length };
  }

  private async resolveChannelIdFromUrl(url: string | undefined, apiKey: string): Promise<string | null> {
    if (!url) return null;
    const handleMatch = url.match(/youtube\.com\/@([\w.-]+)/i);
    const channelMatch = url.match(/youtube\.com\/channel\/([\w-]+)/i);
    if (channelMatch) return channelMatch[1];
    if (handleMatch) {
      const handle = handleMatch[1];
      const lookup = new URL('https://www.googleapis.com/youtube/v3/channels');
      lookup.searchParams.set('part', 'id');
      lookup.searchParams.set('forHandle', `@${handle}`);
      lookup.searchParams.set('key', apiKey);
      const res = await fetch(lookup.toString());
      if (!res.ok) return null;
      const data = (await res.json()) as YouTubeApiChannelResponse;
      return data.items?.[0]?.id ?? null;
    }
    return null;
  }

  private async getUploadsPlaylistId(channelId: string, apiKey: string): Promise<string | null> {
    const url = new URL('https://www.googleapis.com/youtube/v3/channels');
    url.searchParams.set('part', 'contentDetails');
    url.searchParams.set('id', channelId);
    url.searchParams.set('key', apiKey);
    const res = await fetch(url.toString());
    if (!res.ok) return null;
    const data = (await res.json()) as YouTubeApiChannelResponse;
    return data.items?.[0]?.contentDetails?.relatedPlaylists?.uploads ?? null;
  }
}
