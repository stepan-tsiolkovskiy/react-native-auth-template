import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UsersController } from './users/users.controller';
import { UsersService } from './users/users.service';
import { UsersModule } from './users/users.module';
import { FirebaseService } from './firebase/firebase.service';
import { FirebaseModule } from './firebase/firebase.module';

@Module({
  imports: [AuthModule, UsersModule, FirebaseModule],
  controllers: [UsersController],
  providers: [UsersService, FirebaseService],
})
export class AppModule {}