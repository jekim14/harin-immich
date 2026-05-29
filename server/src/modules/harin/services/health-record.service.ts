// 건강 기록 Service — 첫 접근 시 기본 접종 시드
import { Injectable, NotFoundException } from '@nestjs/common';
import { HealthRecordCreateDto, HealthRecordUpdateDto } from 'src/modules/harin/dto/health-record.dto';
import { HarinHealthRecordRepository } from 'src/modules/harin/repositories/health-record.repository';

const DEFAULT_VACCINATIONS: Array<{ title: string; extra: Record<string, unknown> }> = [
  { title: '인플루엔자', extra: { schedule: '매년 가을', category: '인플루엔자' } },
  { title: 'DTaP 5차', extra: { schedule: '만 4~6세', category: '디프테리아/파상풍/백일해' } },
  { title: '폴리오 (IPV) 4차', extra: { schedule: '만 4~6세', category: '소아마비' } },
  { title: 'MMR 2차', extra: { schedule: '만 4~6세', category: '홍역/유행성이하선염/풍진' } },
  { title: '일본뇌염 (사백신) 4차', extra: { schedule: '만 6세', category: '일본뇌염' } },
  { title: '일본뇌염 (사백신) 5차', extra: { schedule: '만 12세', category: '일본뇌염' } },
  { title: 'Td / Tdap 6차', extra: { schedule: '만 11~12세', category: '디프테리아/파상풍' } },
  { title: 'HPV 1차', extra: { schedule: '만 11~12세', category: '사람유두종바이러스' } },
  { title: 'HPV 2차', extra: { schedule: '만 11~12세', category: '사람유두종바이러스' } },
];

@Injectable()
export class HarinHealthRecordService {
  constructor(private repo: HarinHealthRecordRepository) {}

  async list(userId: string, type?: string) {
    if (type === 'vaccination') {
      await this.ensureSeed(userId);
    }
    return this.repo.list(userId, type);
  }

  async get(userId: string, id: string) {
    const row = await this.repo.get(userId, id);
    if (!row) throw new NotFoundException('health record not found');
    return row;
  }

  create(userId: string, dto: HealthRecordCreateDto) {
    return this.repo.create({ ...dto, userId });
  }

  async update(userId: string, id: string, dto: HealthRecordUpdateDto) {
    await this.get(userId, id);
    return this.repo.update(userId, id, dto);
  }

  async remove(userId: string, id: string) {
    await this.get(userId, id);
    await this.repo.remove(userId, id);
  }

  // 첫 접근 시 기본 접종 자동 등록
  private async ensureSeed(userId: string) {
    const count = await this.repo.countByUser(userId, 'vaccination');
    if (Number(count?.n ?? 0) > 0) return;
    await this.repo.bulkCreate(
      DEFAULT_VACCINATIONS.map((v) => ({
        userId,
        type: 'vaccination',
        date: null,
        title: v.title,
        note: '',
        extra: v.extra,
      })),
    );
  }
}
