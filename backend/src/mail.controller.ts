import {
  Controller,
  Get,
  Query,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { MailService } from './mail.service';

@Controller('mail')
export class MailController {
  private readonly logger = new Logger(MailController.name);

  constructor(private readonly mailService: MailService) {}

  // 👉 For the UI: shows where to send + a suggested subject
  @Get('meta')
  meta() {
    const testAddress = process.env.EMAIL_USER || '';
    const exampleSubject = `Lucid Test Email ${Math.floor(
      Math.random() * 100000,
    )}`;
    return { testAddress, exampleSubject };
  }

  @Get('latest')
  async getLatest(@Query('subject') subject?: string) {
    try {
      const result = await this.mailService.getLatestEmail();

      if (!result) {
        return {
          message:
            'No matching unread email found. Send a new test email and keep it unread.',
        };
      }

      // ✅ Shape result for frontend
      return {
        subject: result.subject || '',
        from: result.from || '',
        to: result.to || '',
        date: result.date || new Date(),
        snippet: result.snippet || '',
        receivingChain: result.receivingChain || [],
        esp: result.esp || 'Unknown',
      };
    } catch (err) {
      this.logger.error('❌ Controller error', err.stack || err);
      throw new InternalServerErrorException(
        err.message || 'IMAP processing failed',
      );
    }
  }

  @Get('history')
  async getHistory() {
    const items = await this.mailService.getHistory();
    return items.map((i) => ({
      subject: i.subject || '',
      from: i.from || '',
      to: i.to || '',
      date: i.date || new Date(),
      snippet: i.snippet || '',
      receivingChain: i.receivingChain || [],
      esp: i.esp || 'Unknown',
    }));
  }

  @Get('health')
  health() {
    return { ok: true, service: 'mail', time: new Date().toISOString() };
  }
}
