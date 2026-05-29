// 하린이 일기/성장/건강/마일스톤 도메인 모듈
import { Module } from '@nestjs/common';
import { HarinDiaryController } from 'src/modules/harin/controllers/diary.controller';
import { HarinGrowthController } from 'src/modules/harin/controllers/growth.controller';
import { HarinHealthRecordController } from 'src/modules/harin/controllers/health-record.controller';
import { HarinDiaryRepository } from 'src/modules/harin/repositories/diary.repository';
import { HarinGrowthRepository } from 'src/modules/harin/repositories/growth.repository';
import { HarinHealthRecordRepository } from 'src/modules/harin/repositories/health-record.repository';
import { HarinDiaryService } from 'src/modules/harin/services/diary.service';
import { HarinGrowthService } from 'src/modules/harin/services/growth.service';
import { HarinHealthRecordService } from 'src/modules/harin/services/health-record.service';

@Module({
  controllers: [HarinDiaryController, HarinGrowthController, HarinHealthRecordController],
  providers: [
    HarinDiaryService,
    HarinDiaryRepository,
    HarinGrowthService,
    HarinGrowthRepository,
    HarinHealthRecordService,
    HarinHealthRecordRepository,
  ],
  exports: [HarinDiaryService, HarinGrowthService, HarinHealthRecordService],
})
export class HarinModule {}
