// 마일스톤 Controller
import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthDto } from 'src/dtos/auth.dto';
import { Auth, Authenticated } from 'src/middleware/auth.guard';
import {
  MilestoneCreateDto,
  MilestoneListQueryDto,
  MilestoneUpdateDto,
} from 'src/modules/harin/dto/milestone.dto';
import { HarinMilestoneService } from 'src/modules/harin/services/milestone.service';
import { UUIDParamDto } from 'src/validation';

@ApiTags('Harin Milestone')
@Controller('harin/milestone')
export class HarinMilestoneController {
  constructor(private service: HarinMilestoneService) {}

  @Get()
  @Authenticated()
  list(@Auth() auth: AuthDto, @Query() query: MilestoneListQueryDto) {
    return this.service.list(auth.user.id, query.category);
  }

  @Get(':id')
  @Authenticated()
  get(@Auth() auth: AuthDto, @Param() { id }: UUIDParamDto) {
    return this.service.get(auth.user.id, id);
  }

  @Post()
  @Authenticated()
  create(@Auth() auth: AuthDto, @Body() dto: MilestoneCreateDto) {
    return this.service.create(auth.user.id, dto);
  }

  @Put(':id')
  @Authenticated()
  update(@Auth() auth: AuthDto, @Param() { id }: UUIDParamDto, @Body() dto: MilestoneUpdateDto) {
    return this.service.update(auth.user.id, id, dto);
  }

  @Delete(':id')
  @Authenticated()
  remove(@Auth() auth: AuthDto, @Param() { id }: UUIDParamDto) {
    return this.service.remove(auth.user.id, id);
  }
}
