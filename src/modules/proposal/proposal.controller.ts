/**
 * Controller untuk mengelola Proposal
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
import { ProposalService } from './proposal.service';
import { CreateProposalDto } from './dto/create-proposal.dto';
import { UpdateProposalDto } from './dto/update-proposal.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/enums';
import { ProposalStatus } from './entities/proposal.entity';

interface AuthenticatedRequest {
  user: {
    id: string;
    email: string;
    role: UserRole;
  };
}

@ApiTags('Proposals')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('api/v1/proposals')
export class ProposalController {
  constructor(private readonly proposalService: ProposalService) {}

  @Post()
  @Roles(UserRole.MAHASISWA)
  @ApiOperation({ summary: 'Membuat proposal baru' })
  @ApiResponse({
    status: 201,
    description: 'Proposal berhasil dibuat',
  })
  @ApiResponse({
    status: 400,
    description:
      'Data tidak valid atau mahasiswa sudah memiliki proposal aktif',
  })
  async create(
    @Body() createProposalDto: CreateProposalDto,
    @Request() req: AuthenticatedRequest,
  ) {
    const proposal = await this.proposalService.create(
      createProposalDto,
      req.user.id,
    );

    return {
      status: 'success',
      message: 'Proposal berhasil dibuat',
      data: proposal,
    };
  }

  @Get()
  @ApiOperation({ summary: 'Mendapatkan daftar proposal' })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ProposalStatus,
    description: 'Filter berdasarkan status',
  })
  @ApiQuery({
    name: 'searchTerm',
    required: false,
    description: 'Cari berdasarkan judul atau deskripsi',
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
  @ApiResponse({
    status: 200,
    description: 'Daftar proposal berhasil diambil',
  })
  async findAll(
    @Request() req: AuthenticatedRequest,
    @Query('status') status?: ProposalStatus,
    @Query('searchTerm') searchTerm?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const filters: {
      status?: ProposalStatus;
      searchTerm?: string;
      startDate?: Date;
      endDate?: Date;
    } = {
      status,
      searchTerm,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    };

    const proposals = await this.proposalService.findAll(req.user, filters);

    return {
      status: 'success',
      message: 'Daftar proposal berhasil diambil',
      data: proposals,
    };
  }

  @Get('statistics')
  @ApiOperation({ summary: 'Mendapatkan statistik proposal' })
  @ApiResponse({
    status: 200,
    description: 'Statistik proposal berhasil diambil',
  })
  async getStatistics(@Request() req: AuthenticatedRequest): Promise<any> {
    const stats = await this.proposalService.getStatistics(req.user);

    return {
      status: 'success',
      message: 'Statistik proposal berhasil diambil',
      data: stats,
    };
  }

  @Get('pending-review')
  @Roles(UserRole.DOSEN)
  @ApiOperation({
    summary: 'Mendapatkan proposal yang perlu direview (khusus dosen)',
  })
  @ApiResponse({
    status: 200,
    description: 'Daftar proposal pending review berhasil diambil',
  })
  async getPendingReview(@Request() req: AuthenticatedRequest) {
    const proposals = await this.proposalService.getPendingReview(req.user.id);

    return {
      status: 'success',
      message: 'Daftar proposal yang perlu direview berhasil diambil',
      data: proposals,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Mendapatkan detail proposal berdasarkan ID' })
  @ApiResponse({
    status: 200,
    description: 'Detail proposal berhasil diambil',
  })
  @ApiResponse({
    status: 404,
    description: 'Proposal tidak ditemukan',
  })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: AuthenticatedRequest,
  ) {
    const proposal = await this.proposalService.findOne(id, req.user);

    return {
      status: 'success',
      message: 'Detail proposal berhasil diambil',
      data: proposal,
    };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update proposal' })
  @ApiResponse({
    status: 200,
    description: 'Proposal berhasil diupdate',
  })
  @ApiResponse({
    status: 403,
    description: 'Tidak memiliki akses untuk update proposal',
  })
  @ApiResponse({
    status: 404,
    description: 'Proposal tidak ditemukan',
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateProposalDto: UpdateProposalDto,
    @Request() req: AuthenticatedRequest,
  ) {
    const proposal = await this.proposalService.update(
      id,
      updateProposalDto,
      req.user,
    );

    return {
      status: 'success',
      message: 'Proposal berhasil diupdate',
      data: proposal,
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Hapus proposal (soft delete)' })
  @ApiResponse({
    status: 204,
    description: 'Proposal berhasil dihapus',
  })
  @ApiResponse({
    status: 403,
    description: 'Tidak memiliki akses untuk hapus proposal',
  })
  @ApiResponse({
    status: 404,
    description: 'Proposal tidak ditemukan',
  })
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: AuthenticatedRequest,
  ) {
    await this.proposalService.remove(id, req.user);
  }

  @Post(':id/submit')
  @Roles(UserRole.MAHASISWA)
  @ApiOperation({ summary: 'Ajukan proposal (ubah status ke DIAJUKAN)' })
  @ApiResponse({
    status: 200,
    description: 'Proposal berhasil diajukan',
  })
  @ApiResponse({
    status: 400,
    description: 'Proposal tidak dapat diajukan',
  })
  async submitProposal(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: AuthenticatedRequest,
  ) {
    const proposal = await this.proposalService.submitProposal(id, req.user.id);

    return {
      status: 'success',
      message: 'Proposal berhasil diajukan',
      data: proposal,
    };
  }

  @Post(':id/approve')
  @Roles(UserRole.DOSEN)
  @ApiOperation({ summary: 'Setujui proposal (khusus dosen pembimbing)' })
  @ApiResponse({
    status: 200,
    description: 'Proposal berhasil disetujui',
  })
  @ApiResponse({
    status: 403,
    description: 'Bukan dosen pembimbing proposal ini',
  })
  async approveProposal(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() data: { dosenPenguji1Id?: string; dosenPenguji2Id?: string },
    @Request() req: AuthenticatedRequest,
  ) {
    const proposal = await this.proposalService.approveProposal(
      id,
      req.user.id,
      data,
    );

    return {
      status: 'success',
      message: 'Proposal berhasil disetujui',
      data: proposal,
    };
  }

  @Post(':id/reject')
  @Roles(UserRole.DOSEN)
  @ApiOperation({ summary: 'Tolak proposal (khusus dosen pembimbing)' })
  @ApiResponse({
    status: 200,
    description: 'Proposal berhasil ditolak',
  })
  @ApiResponse({
    status: 403,
    description: 'Bukan dosen pembimbing proposal ini',
  })
  async rejectProposal(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('alasanPenolakan') alasanPenolakan: string,
    @Request() req: AuthenticatedRequest,
  ) {
    const proposal = await this.proposalService.rejectProposal(
      id,
      req.user.id,
      alasanPenolakan,
    );

    return {
      status: 'success',
      message: 'Proposal berhasil ditolak',
      data: proposal,
    };
  }

  @Post(':id/revision')
  @Roles(UserRole.DOSEN)
  @ApiOperation({ summary: 'Minta revisi proposal (khusus dosen pembimbing)' })
  @ApiResponse({
    status: 200,
    description: 'Permintaan revisi berhasil dikirim',
  })
  @ApiResponse({
    status: 403,
    description: 'Bukan dosen pembimbing proposal ini',
  })
  async requestRevision(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('catatanRevisi') catatanRevisi: string,
    @Request() req: AuthenticatedRequest,
  ) {
    const proposal = await this.proposalService.requestRevision(
      id,
      req.user.id,
      catatanRevisi,
    );

    return {
      status: 'success',
      message: 'Permintaan revisi berhasil dikirim',
      data: proposal,
    };
  }
}
