// 건강 기록 Controller
import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthDto } from 'src/dtos/auth.dto';
import { Auth, Authenticated } from 'src/middleware/auth.guard';
import {
  HealthRecordCreateDto,
  HealthRecordListQueryDto,
  HealthRecordUpdateDto,
} from 'src/modules/harin/dto/health-record.dto';
import { HarinHealthRecordService } from 'src/modules/harin/services/health-record.service';
import { UUIDParamDto } from 'src/validation';

@ApiTags('Harin Health')
@Controller('harin/health')
export class HarinHealthRecordController {
  constructor(private service: HarinHealthRecordService) {}

  @Get()
  @Authenticated()
  list(@Auth() auth: AuthDto, @Query() query: HealthRecordListQueryDto) {
    return this.service.list(auth.user.id, query.type);
  }

  @Get(':id')
  @Authenticated()
  get(@Auth() auth: AuthDto, @Param() { id }: UUIDParamDto) {
    return this.service.get(auth.user.id, id);
  }

  @Post()
  @Authenticated()
  create(@Auth() auth: AuthDto, @Body() dto: HealthRecordCreateDto) {
    return this.service.create(auth.user.id, dto);
  }

  @Put(':id')
  @Authenticated()
  update(@Auth() auth: AuthDto, @Param() { id }: UUIDParamDto, @Body() dto: HealthRecordUpdateDto) {
    return this.service.update(auth.user.id, id, dto);
  }

  @Delete(':id')
  @Authenticated()
  remove(@Auth() auth: AuthDto, @Param() { id }: UUIDParamDto) {
    return this.service.remove(auth.user.id, id);
  }
}
