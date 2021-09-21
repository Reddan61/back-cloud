import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { FilesModule } from './files/files.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      cache: true,
      isGlobal:true
    }),
    MongooseModule.forRoot(process.env.DATABASE_URL, {
      useFindAndModify:false
    }),
    AuthModule,
    FilesModule 
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
