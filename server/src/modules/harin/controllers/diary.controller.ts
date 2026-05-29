// 일지 Controller — 인증된 user_id 사용
import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthDto } from 'src/dtos/auth.dto';
import { Auth, Authenticated } from 'src/middleware/auth.guard';
import { DiaryCreateDto, DiaryUpdateDto } from 'src/modules/harin/dto/diary.dto';
import { HarinDiaryService } from 'src/modules/harin/services/diary.service';
import { UUIDParamDto } from 'src/validation';

@ApiTags('Harin Diary')
@Controller('harin/diary')
export class HarinDiaryController {
  constructor(private service: HarinDiaryService) {}

  @Get()
  @Authenticated()
  list(@Auth() auth: AuthDto, @Query('search') search?: string, @Query('month') month?: string) {
    return this.service.list(auth.user.id, { search, month });
  }

  @Get(':id')
  @Authenticated()
  get(@Auth() auth: AuthDto, @Param() { id }: UUIDParamDto) {
    return this.service.get(auth.user.id, id);
  }

  @Post()
  @Authenticated()
  create(@Auth() auth: AuthDto, @Body() dto: DiaryCreateDto) {
    return this.service.create(auth.user.id, dto);
  }

  @Put(':id')
  @Authenticated()
  update(@Auth() auth: AuthDto, @Param() { id }: UUIDParamDto, @Body() dto: DiaryUpdateDto) {
    return this.service.update(auth.user.id, id, dto);
  }

  @Delete(':id')
  @Authenticated()
  remove(@Auth() auth: AuthDto, @Param() { id }: UUIDParamDto) {
    return this.service.remove(auth.user.id, id);
  }
}
