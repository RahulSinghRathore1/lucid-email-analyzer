import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { simpleParser } from 'mailparser';
import { Mail, MailDocument } from './mail.schema';
import Imap from 'imap'; // ✅ correct import

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(@InjectModel(Mail.name) private mailModel: Model<MailDocument>) {}

  private connectImap() {
    return new Imap({
      user: process.env.EMAIL_USER,
      password: process.env.EMAIL_PASS,
      host: process.env.IMAP_HOST,
      port: parseInt(process.env.IMAP_PORT || '993', 10),
      tls: true,
      tlsOptions: { rejectUnauthorized: false }, // ✅ fix self-signed cert error
    });
  }

  async getLatestEmail(): Promise<any> {
    return new Promise((resolve, reject) => {
      const imap = this.connectImap();

      imap.once('ready', () => {
        imap.openBox('INBOX', false, (err) => {
          if (err) return reject(err);

          imap.search(['UNSEEN'], (err, results) => {
            if (err || results.length === 0) {
              imap.end();
              return resolve(null);
            }

            const f = imap.fetch(results.slice(-1), { bodies: '' });

            f.on('message', (msg) => {
              let rawData = '';

              msg.on('body', (stream) => {
                stream.on('data', (chunk) => {
                  rawData += chunk.toString('utf8');
                });
              });

              msg.once('end', async () => {
                try {
                  const parsed = await simpleParser(rawData);

                  // ✅ Extract Received headers
                  // ✅ Extract Received headers properly
                  const headersArray: string[] = [];
                  if (parsed.headerLines && parsed.headerLines.length > 0) {
                    for (const h of parsed.headerLines) {
                      if (h.key.toLowerCase() === 'received') {
                        headersArray.push(h.line);
                      }
                    }
                  }

                  // ✅ Detect ESP
                  let esp = 'Unknown';
                  const fromText = parsed.from?.text || '';
                  if (fromText.includes('gmail.com')) esp = 'Gmail';
                  else if (fromText.includes('outlook.com')) esp = 'Outlook';
                  else if (fromText.includes('zoho.com')) esp = 'Zoho';
                  else if (fromText.includes('amazonses.com'))
                    esp = 'Amazon SES';

                  // ✅ Save email in MongoDB
                  // ✅ Save email in MongoDB
                  const emailDoc = new this.mailModel({
                    subject: parsed.subject || '',
                    from: parsed.from?.text || '',
                    to: parsed.to?.text || '',
                    date: parsed.date || new Date(),
                    snippet: parsed.text?.slice(0, 200) || '',
                    receivingChain: headersArray,
                    esp,
                    hops: headersArray.length,
                    raw: rawData, // ✅ store hop count
                  });
                  await emailDoc.save();

                  this.logger.log(
                    `✅ Email saved: ${parsed.subject} [ESP: ${esp}]`,
                  );

                  // ✅ Return shaped object to frontend
                  resolve({
                    subject: emailDoc.subject,
                    from: emailDoc.from,
                    to: emailDoc.to,
                    date: emailDoc.date,
                    snippet: emailDoc.snippet,
                    receivingChain: emailDoc.receivingChain,
                    esp: emailDoc.esp,
                  });
                } catch (parseErr) {
                  reject(parseErr);
                }
              });
            });

            f.once('error', (fetchErr) => reject(fetchErr));
            f.once('end', () => imap.end());
          });
        });
      });

      imap.once('error', (err) => reject(err));
      imap.connect();
    });
  }

  async getHistory(): Promise<Mail[]> {
    return this.mailModel.find().sort({ createdAt: -1 }).limit(20).exec();
  }
}
