// 하린이 일기/성장/건강/마일스톤 도메인 모듈
import { Module } from '@nestjs/common';
import { HarinDiaryController } from 'src/modules/harin/controllers/diary.controller';
import { HarinGrowthController } from 'src/modules/harin/controllers/growth.controller';
import { HarinDiaryRepository } from 'src/modules/harin/repositories/diary.repository';
import { HarinGrowthRepository } from 'src/modules/harin/repositories/growth.repository';
import { HarinDiaryService } from 'src/modules/harin/services/diary.service';
import { HarinGrowthService } from 'src/modules/harin/services/growth.service';

@Module({
  controllers: [HarinDiaryController, HarinGrowthController],
  providers: [HarinDiaryService, HarinDiaryRepository, HarinGrowthService, HarinGrowthRepository],
  exports: [HarinDiaryService, HarinGrowthService],
})
export class HarinModule {}
