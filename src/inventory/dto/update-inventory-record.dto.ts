import { PartialType } from '@nestjs/swagger';
import { CreateInventoryRecordDto } from './create-inventory-record.dto';

export class UpdateInventoryRecordDto extends PartialType(CreateInventoryRecordDto) {}
