// 성장 기록 Controller
import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthDto } from 'src/dtos/auth.dto';
import { Auth, Authenticated } from 'src/middleware/auth.guard';
import { GrowthCreateDto, GrowthUpdateDto } from 'src/modules/harin/dto/growth.dto';
import { HarinGrowthService } from 'src/modules/harin/services/growth.service';
import { UUIDParamDto } from 'src/validation';

@ApiTags('Harin Growth')
@Controller('harin/growth')
export class HarinGrowthController {
  constructor(private service: HarinGrowthService) {}

  @Get()
  @Authenticated()
  list(@Auth() auth: AuthDto) {
    return this.service.list(auth.user.id);
  }

  @Get(':id')
  @Authenticated()
  get(@Auth() auth: AuthDto, @Param() { id }: UUIDParamDto) {
    return this.service.get(auth.user.id, id);
  }

  @Post()
  @Authenticated()
  create(@Auth() auth: AuthDto, @Body() dto: GrowthCreateDto) {
    return this.service.create(auth.user.id, dto);
  }

  @Put(':id')
  @Authenticated()
  update(@Auth() auth: AuthDto, @Param() { id }: UUIDParamDto, @Body() dto: GrowthUpdateDto) {
    return this.service.update(auth.user.id, id, dto);
  }

  @Delete(':id')
  @Authenticated()
  remove(@Auth() auth: AuthDto, @Param() { id }: UUIDParamDto) {
    return this.service.remove(auth.user.id, id);
  }
}
