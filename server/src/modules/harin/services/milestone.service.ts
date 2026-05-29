// 마일스톤 Service — 첫 접근 시 26개 기본 마일스톤 시드
import { Injectable, NotFoundException } from '@nestjs/common';
import { MilestoneCreateDto, MilestoneUpdateDto } from 'src/modules/harin/dto/milestone.dto';
import { HarinMilestoneRepository } from 'src/modules/harin/repositories/milestone.repository';

const DEFAULT_MILESTONES: Array<{ category: string; title: string; emoji: string }> = [
  // 만 3세
  { category: 'physical', title: '발끝으로 걷기', emoji: '🦶' },
  { category: 'physical', title: '세 발 자전거 타기', emoji: '🚲' },
  { category: 'physical', title: '단추 채우기', emoji: '🔘' },
  { category: 'language', title: '자기 이름·나이 말하기', emoji: '🗣️' },
  { category: 'language', title: '노래 따라 부르기', emoji: '🎵' },
  { category: 'social', title: '혼자 양치하기', emoji: '🪥' },
  { category: 'social', title: '친구와 함께 놀기', emoji: '👶' },
  { category: 'cognitive', title: '3까지 숫자 세기', emoji: '3️⃣' },
  { category: 'cognitive', title: '기본 색깔 3가지 구분', emoji: '🌈' },
  // 만 4~7세
  { category: 'physical', title: '한 발로 5초 이상 서기', emoji: '🦵' },
  { category: 'physical', title: '자전거(보조바퀴) 타기', emoji: '🚴' },
  { category: 'physical', title: '가위로 종이 오리기', emoji: '✂️' },
  { category: 'physical', title: '공 던지고 받기', emoji: '⚾' },
  { category: 'physical', title: '줄넘기', emoji: '🤸' },
  { category: 'language', title: '자기 이름 쓰기', emoji: '✏️' },
  { category: 'language', title: '5개 이상 단어로 문장 말하기', emoji: '💬' },
  { category: 'language', title: '동화책 줄거리 말하기', emoji: '📖' },
  { category: 'language', title: '한글 읽기 시작', emoji: '🔤' },
  { category: 'social', title: '규칙 있는 놀이 참여', emoji: '🎲' },
  { category: 'social', title: '친구 사귀기', emoji: '👫' },
  { category: 'social', title: '감정 말로 표현하기', emoji: '😊' },
  { category: 'social', title: '양보하기', emoji: '🤝' },
  { category: 'cognitive', title: '10까지 숫자 세기', emoji: '🔢' },
  { category: 'cognitive', title: '색깔 이름 알기', emoji: '🎨' },
  { category: 'cognitive', title: '퍼즐 (10조각 이상) 맞추기', emoji: '🧩' },
  { category: 'cognitive', title: '요일 개념 이해', emoji: '📅' },
];

@Injectable()
export class HarinMilestoneService {
  constructor(private repo: HarinMilestoneRepository) {}

  async list(userId: string, category?: string) {
    await this.ensureSeed(userId);
    return this.repo.list(userId, category);
  }

  async get(userId: string, id: string) {
    const row = await this.repo.get(userId, id);
    if (!row) throw new NotFoundException('milestone not found');
    return row;
  }

  create(userId: string, dto: MilestoneCreateDto) {
    return this.repo.create({ ...dto, userId });
  }

  async update(userId: string, id: string, dto: MilestoneUpdateDto) {
    await this.get(userId, id);
    return this.repo.update(userId, id, dto);
  }

  async remove(userId: string, id: string) {
    await this.get(userId, id);
    await this.repo.remove(userId, id);
  }

  private async ensureSeed(userId: string) {
    const count = await this.repo.countByUser(userId);
    if (Number(count?.n ?? 0) > 0) return;
    await this.repo.bulkCreate(
      DEFAULT_MILESTONES.map((m) => ({
        userId,
        category: m.category,
        title: m.title,
        emoji: m.emoji,
        achievedDate: null,
        note: '',
        assetIds: [],
      })),
    );
  }
}
