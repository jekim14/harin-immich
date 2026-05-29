// 하린이 일기/성장/건강/마일스톤 도메인 모듈
import { Module } from '@nestjs/common';
import { HarinDiaryController } from 'src/modules/harin/controllers/diary.controller';
import { HarinDiaryRepository } from 'src/modules/harin/repositories/diary.repository';
import { HarinDiaryService } from 'src/modules/harin/services/diary.service';

@Module({
  controllers: [HarinDiaryController],
  providers: [HarinDiaryService, HarinDiaryRepository],
  exports: [HarinDiaryService],
})
export class HarinModule {}
