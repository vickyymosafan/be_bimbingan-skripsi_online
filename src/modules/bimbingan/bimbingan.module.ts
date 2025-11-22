/**
 * Module untuk Bimbingan
 */

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BimbinganService } from './bimbingan.service';
import { BimbinganController } from './bimbingan.controller';
import { Bimbingan } from './entities/bimbingan.entity';
import { ProposalModule } from '../proposal/proposal.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Bimbingan]),
    ProposalModule, // Import ProposalModule untuk akses ProposalService
  ],
  controllers: [BimbinganController],
  providers: [BimbinganService],
  exports: [BimbinganService],
})
export class BimbinganModule {}
