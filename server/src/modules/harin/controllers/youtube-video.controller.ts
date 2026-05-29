// YouTube 동영상 Controller
import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthDto } from 'src/dtos/auth.dto';
import { Auth, Authenticated } from 'src/middleware/auth.guard';
import {
  ChannelSyncBodyDto,
  VideoCreateDto,
  VideoUpdateDto,
} from 'src/modules/harin/dto/youtube-video.dto';
import { HarinYoutubeVideoService } from 'src/modules/harin/services/youtube-video.service';
import { UUIDParamDto } from 'src/validation';

@ApiTags('Harin Video')
@Controller('harin/video')
export class HarinYoutubeVideoController {
  constructor(private service: HarinYoutubeVideoService) {}

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
  create(@Auth() auth: AuthDto, @Body() dto: VideoCreateDto) {
    return this.service.create(auth.user.id, dto);
  }

  @Put(':id')
  @Authenticated()
  update(@Auth() auth: AuthDto, @Param() { id }: UUIDParamDto, @Body() dto: VideoUpdateDto) {
    return this.service.update(auth.user.id, id, dto);
  }

  @Delete(':id')
  @Authenticated()
  remove(@Auth() auth: AuthDto, @Param() { id }: UUIDParamDto) {
    return this.service.remove(auth.user.id, id);
  }

  @Post('sync-channel')
  @Authenticated()
  syncChannel(@Auth() auth: AuthDto, @Body() body: ChannelSyncBodyDto) {
    return this.service.syncChannel(auth.user.id, body);
  }
}
