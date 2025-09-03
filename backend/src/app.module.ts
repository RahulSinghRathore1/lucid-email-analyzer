import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MailModule } from './mail.module';
import * as dotenv from 'dotenv';

dotenv.config();

@Module({
  imports: [
    // ✅ Connect to MongoDB
    MongooseModule.forRoot(process.env.MONGO_URI as string),

    // ✅ Import your Mail module
    MailModule,
  ],
})
export class AppModule {}
