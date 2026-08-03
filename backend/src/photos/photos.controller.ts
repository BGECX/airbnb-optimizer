import { Controller, Get, Post, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { PhotosService } from './photos.service';
import { CreatePhotoDto } from './dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { PhotoPhase, UserRole } from '@prisma/client';

@ApiTags('Photos')
@Controller('photos')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class PhotosController {
  constructor(private photosService: PhotosService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.CHEF_CHANTIER, UserRole.COMPAGNON)
  create(@Body() dto: CreatePhotoDto, @CurrentUser() user: { sub: string; role: UserRole }) {
    return this.photosService.create(dto, user);
  }

  @Get()
  findAll(@CurrentUser() user: { sub: string; role: UserRole }, @Query('chantierId') chantierId?: string, @Query('phase') phase?: PhotoPhase, @Query('zone') zone?: string) {
    return this.photosService.findAll(user, chantierId, phase, zone);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: { sub: string; role: UserRole }) {
    return this.photosService.findOne(id, user);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  remove(@Param('id') id: string) {
    return this.photosService.remove(id);
  }
}
