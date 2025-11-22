/**
 * Module untuk Proposal
 */

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProposalService } from './proposal.service';
import { ProposalController } from './proposal.controller';
import { ProposalRepository } from './proposal.repository';
import { Proposal } from './entities/proposal.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Proposal])],
  controllers: [ProposalController],
  providers: [ProposalService, ProposalRepository],
  exports: [ProposalService, ProposalRepository],
})
export class ProposalModule {}
