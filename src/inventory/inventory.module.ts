import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtAuthGuard } from '../common/jwt-auth.guard';
import { RolesGuard } from '../common/roles.guard';
import { InventoryRecord, InventoryRecordSchema } from './schemas/inventory-record.schema';
import { InventoryService } from './inventory.service';
import { AdminInventoryController } from './controllers/inventory.admin.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: InventoryRecord.name,
        schema: InventoryRecordSchema,
      },
    ]),
  ],
  controllers: [AdminInventoryController],
  providers: [InventoryService, JwtAuthGuard, RolesGuard],
  exports: [InventoryService],
})
export class InventoryModule {}
