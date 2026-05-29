// 하린이 일기/성장/건강/마일스톤 도메인 모듈
import { Module } from '@nestjs/common';
import { HarinDiaryController } from 'src/modules/harin/controllers/diary.controller';
import { HarinGrowthController } from 'src/modules/harin/controllers/growth.controller';
import { HarinHealthRecordController } from 'src/modules/harin/controllers/health-record.controller';
import { HarinMilestoneController } from 'src/modules/harin/controllers/milestone.controller';
import { HarinDiaryRepository } from 'src/modules/harin/repositories/diary.repository';
import { HarinGrowthRepository } from 'src/modules/harin/repositories/growth.repository';
import { HarinHealthRecordRepository } from 'src/modules/harin/repositories/health-record.repository';
import { HarinMilestoneRepository } from 'src/modules/harin/repositories/milestone.repository';
import { HarinDiaryService } from 'src/modules/harin/services/diary.service';
import { HarinGrowthService } from 'src/modules/harin/services/growth.service';
import { HarinHealthRecordService } from 'src/modules/harin/services/health-record.service';
import { HarinMilestoneService } from 'src/modules/harin/services/milestone.service';

@Module({
  controllers: [
    HarinDiaryController,
    HarinGrowthController,
    HarinHealthRecordController,
    HarinMilestoneController,
  ],
  providers: [
    HarinDiaryService,
    HarinDiaryRepository,
    HarinGrowthService,
    HarinGrowthRepository,
    HarinHealthRecordService,
    HarinHealthRecordRepository,
    HarinMilestoneService,
    HarinMilestoneRepository,
  ],
  exports: [HarinDiaryService, HarinGrowthService, HarinHealthRecordService, HarinMilestoneService],
})
export class HarinModule {}
