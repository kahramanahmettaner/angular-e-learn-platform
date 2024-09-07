import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseService } from './database/database.service';
import { DatabaseModule } from './database/database.module';
import { AssignmentsModule } from './assignments/assignments.module';

@Module({
  imports: [DatabaseModule, AssignmentsModule],
  controllers: [AppController],
  providers: [AppService, DatabaseService],
})
export class AppModule {}
