import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtAuthGuard } from '../common/jwt-auth.guard';
import { RolesGuard } from '../common/roles.guard';
import { Order, OrderSchema } from './schemas/order.schema';
import { OrdersService } from './orders.service';
import { AdminOrdersController } from './controllers/orders.admin.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Order.name,
        schema: OrderSchema,
      },
    ]),
  ],
  controllers: [AdminOrdersController],
  providers: [OrdersService, JwtAuthGuard, RolesGuard],
  exports: [OrdersService],
})
export class OrdersModule {}
