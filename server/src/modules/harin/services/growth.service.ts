// 성장 기록 Service
import { Injectable, NotFoundException } from '@nestjs/common';
import { GrowthCreateDto, GrowthUpdateDto } from 'src/modules/harin/dto/growth.dto';
import { HarinGrowthRepository } from 'src/modules/harin/repositories/growth.repository';

@Injectable()
export class HarinGrowthService {
  constructor(private repo: HarinGrowthRepository) {}

  list(userId: string) {
    return this.repo.list(userId);
  }

  async get(userId: string, id: string) {
    const row = await this.repo.get(userId, id);
    if (!row) throw new NotFoundException('growth record not found');
    return row;
  }

  create(userId: string, dto: GrowthCreateDto) {
    return this.repo.create({ ...dto, userId });
  }

  async update(userId: string, id: string, dto: GrowthUpdateDto) {
    await this.get(userId, id);
    return this.repo.update(userId, id, dto);
  }

  async remove(userId: string, id: string) {
    await this.get(userId, id);
    await this.repo.remove(userId, id);
  }
}
