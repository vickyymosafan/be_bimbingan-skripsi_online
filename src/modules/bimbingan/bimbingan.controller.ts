/**
 * Controller untuk mengelola Bimbingan
 */

import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { BimbinganService } from './bimbingan.service';
import { CreateBimbinganDto } from './dto/create-bimbingan.dto';
import { UpdateBimbinganDto } from './dto/update-bimbingan.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/enums';
import { BimbinganStatus } from './entities/bimbingan.entity';

interface AuthenticatedRequest {
  user: {
    id: string;
    email: string;
    role: UserRole;
  };
}

@ApiTags('Bimbingan')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('api/v1/bimbingan')
export class BimbinganController {
  constructor(private readonly bimbinganService: BimbinganService) {}

  @Post()
  @ApiOperation({ summary: 'Membuat jadwal bimbingan baru' })
  @ApiResponse({
    status: 201,
    description: 'Bimbingan berhasil dijadwalkan',
  })
  async create(
    @Body() createBimbinganDto: CreateBimbinganDto,
    @Request() req: AuthenticatedRequest,
  ) {
    const bimbingan = await this.bimbinganService.create(
      createBimbinganDto,
      req.user.id,
      req.user.role,
    );

    return {
      status: 'success',
      message: 'Bimbingan berhasil dijadwalkan',
      data: bimbingan,
    };
  }

  @Get()
  @ApiOperation({ summary: 'Mendapatkan daftar bimbingan' })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: BimbinganStatus,
    description: 'Filter berdasarkan status',
  })
  @ApiQuery({
    name: 'proposalId',
    required: false,
    description: 'Filter berdasarkan proposal',
  })
  @ApiQuery({
    name: 'startDate',
    required: false,
    type: Date,
    description: 'Filter tanggal mulai',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    type: Date,
    description: 'Filter tanggal akhir',
  })
  async findAll(
    @Request() req: AuthenticatedRequest,
    @Query('status') status?: BimbinganStatus,
    @Query('proposalId') proposalId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const filters = {
      status,
      proposalId,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    };

    const bimbingans = await this.bimbinganService.findAll(req.user, filters);

    return {
      status: 'success',
      message: 'Daftar bimbingan berhasil diambil',
      data: bimbingans,
    };
  }

  @Get('upcoming')
  @ApiOperation({ summary: 'Mendapatkan jadwal bimbingan mendatang' })
  async getUpcoming(@Request() req: AuthenticatedRequest) {
    const bimbingans = await this.bimbinganService.getUpcomingBimbingan(
      req.user.id,
      req.user.role,
    );

    return {
      status: 'success',
      message: 'Jadwal bimbingan mendatang berhasil diambil',
      data: bimbingans,
    };
  }

  @Get('history/:proposalId')
  @ApiOperation({ summary: 'Mendapatkan riwayat bimbingan untuk proposal' })
  async getHistory(
    @Param('proposalId', ParseUUIDPipe) proposalId: string,
    @Request() req: AuthenticatedRequest,
  ) {
    const history = await this.bimbinganService.getBimbinganHistory(
      proposalId,
      req.user,
    );

    return {
      status: 'success',
      message: 'Riwayat bimbingan berhasil diambil',
      data: history,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Mendapatkan detail bimbingan' })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: AuthenticatedRequest,
  ) {
    const bimbingan = await this.bimbinganService.findOne(id, req.user);

    return {
      status: 'success',
      message: 'Detail bimbingan berhasil diambil',
      data: bimbingan,
    };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update bimbingan' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateBimbinganDto: UpdateBimbinganDto,
    @Request() req: AuthenticatedRequest,
  ) {
    const bimbingan = await this.bimbinganService.update(
      id,
      updateBimbinganDto,
      req.user,
    );

    return {
      status: 'success',
      message: 'Bimbingan berhasil diupdate',
      data: bimbingan,
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Hapus bimbingan' })
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: AuthenticatedRequest,
  ) {
    await this.bimbinganService.remove(id, req.user);
  }

  @Post(':id/start')
  @ApiOperation({ summary: 'Mulai bimbingan' })
  async startBimbingan(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: AuthenticatedRequest,
  ) {
    const bimbingan = await this.bimbinganService.startBimbingan(id, req.user);

    return {
      status: 'success',
      message: 'Bimbingan berhasil dimulai',
      data: bimbingan,
    };
  }

  @Post(':id/finish')
  @Roles(UserRole.DOSEN)
  @ApiOperation({ summary: 'Selesaikan bimbingan' })
  async finishBimbingan(
    @Param('id', ParseUUIDPipe) id: string,
    @Body()
    data: {
      hasilBimbingan?: string;
      tugasSelanjutnya?: string;
      nilaiProgress?: number;
      catatan?: string;
    },
    @Request() req: AuthenticatedRequest,
  ) {
    const bimbingan = await this.bimbinganService.finishBimbingan(
      id,
      data,
      req.user,
    );

    return {
      status: 'success',
      message: 'Bimbingan berhasil diselesaikan',
      data: bimbingan,
    };
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: 'Batalkan bimbingan' })
  async cancelBimbingan(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('alasan') alasan: string,
    @Request() req: AuthenticatedRequest,
  ) {
    const bimbingan = await this.bimbinganService.cancelBimbingan(
      id,
      alasan,
      req.user,
    );

    return {
      status: 'success',
      message: 'Bimbingan berhasil dibatalkan',
      data: bimbingan,
    };
  }
}
