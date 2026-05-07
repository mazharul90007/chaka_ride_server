import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: this.configService.get<string>('APP_USER'),
        pass: this.configService.get<string>('APP_PASS'),
      },
    });
  }

  async sendQueryConfirmation(email: string, queryData: any) {
    const mailOptions = {
      from: '"Chaka Ride" <mazharul90007@gmail.com>',
      to: email,
      subject: 'Query Received - Chaka Ride',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
          <h2 style="color: #333;">Hello ${queryData.fullName},</h2>
          <p>Thank you for reaching out to <strong>Chaka Ride</strong>!</p>
          <p>We have received your ride query with the following details:</p>
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <tr style="background: #f9f9f9;"><td style="padding: 10px; border: 1px solid #ddd;"><strong>Pickup Location</strong></td><td style="padding: 10px; border: 1px solid #ddd;">${queryData.pickupLocation}</td></tr>
            <tr><td style="padding: 10px; border: 1px solid #ddd;"><strong>Destination</strong></td><td style="padding: 10px; border: 1px solid #ddd;">${queryData.destination}</td></tr>
            <tr style="background: #f9f9f9;"><td style="padding: 10px; border: 1px solid #ddd;"><strong>Car Type</strong></td><td style="padding: 10px; border: 1px solid #ddd;">${queryData.carCategory?.categoryName || 'Not Specified'}</td></tr>
            <tr><td style="padding: 10px; border: 1px solid #ddd;"><strong>Pickup Date</strong></td><td style="padding: 10px; border: 1px solid #ddd;">${queryData.pickupDate}</td></tr>
            <tr style="background: #f9f9f9;"><td style="padding: 10px; border: 1px solid #ddd;"><strong>Pickup Time</strong></td><td style="padding: 10px; border: 1px solid #ddd;">${queryData.pickupTime}</td></tr>
          </table>
          <p>Shortly, our admin will contact you at <strong>${queryData.whatsAppNumber}</strong> with all the details and final pricing.</p>
          <p>Please give us some time to arrange the best ride for you.</p>
          <br/>
          <p>Regards,</p>
          <p><strong>Chaka Ride Team</strong></p>
        </div>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log('Confirmation email sent to:', email);
    } catch (error) {
      console.error('Error sending email:', error);
    }
  }
}
