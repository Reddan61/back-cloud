import * as express from 'express'
import * as cookieParser from 'cookie-parser'
import { NestFactory } from '@nestjs/core'
import { join } from 'path'
import { AppModule } from './app.module'
import { ValidationPipe } from '@nestjs/common'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  
  //cors
  app.enableCors({
    origin: process.env.CLIENT_URL,
    methods: ['GET', 'PUT', 'POST','DELETE','PATCH']
  })

  //public files
  app.use('/uploads', express.static(join(__dirname, '..', 'uploads')))

  //validation
  app.useGlobalPipes(new ValidationPipe())

  //cookies
  app.use(cookieParser())

  await app.listen(8888)
}
bootstrap();
