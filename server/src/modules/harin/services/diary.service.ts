// 일지 Service — 비즈니스 로직
import { Injectable, NotFoundException } from '@nestjs/common';
import { DiaryCreateDto, DiaryUpdateDto } from 'src/modules/harin/dto/diary.dto';
import { DiarySearchOpts, HarinDiaryRepository } from 'src/modules/harin/repositories/diary.repository';

@Injectable()
export class HarinDiaryService {
  constructor(private repo: HarinDiaryRepository) {}

  list(userId: string, opts: DiarySearchOpts = {}) {
    return this.repo.search(userId, opts);
  }

  async get(userId: string, id: string) {
    const row = await this.repo.get(userId, id);
    if (!row) throw new NotFoundException('diary not found');
    return row;
  }

  create(userId: string, dto: DiaryCreateDto) {
    return this.repo.create({ ...dto, userId });
  }

  async update(userId: string, id: string, dto: DiaryUpdateDto) {
    await this.get(userId, id);
    return this.repo.update(userId, id, dto);
  }

  async remove(userId: string, id: string) {
    await this.get(userId, id);
    await this.repo.remove(userId, id);
  }
}
