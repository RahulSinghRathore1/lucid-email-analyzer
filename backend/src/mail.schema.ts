import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type MailDocument = Mail & Document;

@Schema({ timestamps: true })
export class Mail {
  @Prop()
  subject: string;

  @Prop()
  from: string;

  @Prop()
  to: string;

  @Prop()
  date: Date;

  @Prop()
  snippet: string;

  @Prop([String])
  receivingChain: string[];

  @Prop()
  esp: string;
  @Prop({ default: 0 }) hops: number;
  @Prop() raw: string;
}

export const MailSchema = SchemaFactory.createForClass(Mail);
