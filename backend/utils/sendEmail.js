import nodemailer from 'nodemailer';


/**
 * Send an HTML Digital Receipt Email
 */
export const sendReceiptEmail = async ({ to, name, orderRef, varietyName, volume, totalAmount, paymentStatus, date }) => {
  try {
    // Check if SMTP details are missing in .env
    console.log('DEBUG: SMTP_EMAIL exists?', !!process.env.SMTP_EMAIL);
    console.log('DEBUG: SMTP_PASSWORD exists?', !!process.env.SMTP_PASSWORD);

    if (!process.env.SMTP_EMAIL || !process.env.SMTP_PASSWORD) {
      console.warn('⚠️ SMTP_EMAIL or SMTP_PASSWORD is not set in .env. Skipping email dispatch.');
      return;
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.SMTP_EMAIL.trim(),
        pass: process.env.SMTP_PASSWORD.trim(),
      },
    });

    // Modern HTML Email Template designed for Sankalp Hi-Tech Nursery
    const htmlTemplate = `
      <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px; background-color: #ffffff;">
        <div style="text-align: center; padding-bottom: 20px; border-bottom: 2px solid #e0f2e9;">
          <h1 style="color: #1a4d2e; margin: 0; font-size: 24px;">Sankalp Hi-Tech Nursery</h1>
          <p style="color: #6b7280; font-size: 14px; margin-top: 5px; text-transform: uppercase; letter-spacing: 1px;">Official Digital Receipt</p>
        </div>
        
        <div style="padding: 20px 0;">
          <p style="font-size: 16px; color: #111827;">Hello <strong>${name}</strong>,</p>
          <p style="font-size: 15px; color: #4b5563; line-height: 1.5;">Thank you for your booking! Your seedling order has been successfully placed in our system. Below are your order details:</p>
          
          <div style="background-color: #f0fdf4; padding: 20px; border-radius: 8px; margin-top: 20px; border: 1px solid #bbf7d0;">
            <p style="margin: 0 0 10px 0; font-size: 14px; color: #6b7280; text-transform: uppercase;">Order Reference</p>
            <h2 style="margin: 0 0 20px 0; color: #166534; font-size: 28px; letter-spacing: 1px;">#${orderRef}</h2>
            
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #4b5563; border-bottom: 1px solid #dcfce7;"><strong>Date:</strong></td>
                <td style="padding: 8px 0; color: #111827; text-align: right; border-bottom: 1px solid #dcfce7;">${date}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #4b5563; border-bottom: 1px solid #dcfce7;"><strong>Variety:</strong></td>
                <td style="padding: 8px 0; color: #111827; text-align: right; border-bottom: 1px solid #dcfce7;">${varietyName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #4b5563; border-bottom: 1px solid #dcfce7;"><strong>Volume:</strong></td>
                <td style="padding: 8px 0; color: #111827; text-align: right; border-bottom: 1px solid #dcfce7;">${volume.toLocaleString()} Seedlings</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #4b5563; border-bottom: 1px solid #dcfce7;"><strong>Payment Status:</strong></td>
                <td style="padding: 8px 0; color: ${paymentStatus === 'Paid' ? '#16a34a' : '#b45309'}; text-align: right; font-weight: bold; border-bottom: 1px solid #dcfce7;">${paymentStatus}</td>
              </tr>
              <tr>
                <td style="padding: 15px 0 0 0; color: #111827; font-size: 18px;"><strong>Total Amount:</strong></td>
                <td style="padding: 15px 0 0 0; color: #166534; text-align: right; font-size: 20px; font-weight: bold;">₹${totalAmount.toLocaleString()}</td>
              </tr>
            </table>
          </div>
        </div>
        
        <div style="text-align: center; padding-top: 20px; margin-top: 20px; border-top: 1px solid #e0f2e9;">
          <p style="font-size: 14px; color: #6b7280; line-height: 1.5;">Our team will initiate contact with you within 24 hours to confirm delivery schedule.<br>For questions, please contact our support.</p>
          <a href="http://localhost:3000/my-bookings.html" style="display: inline-block; margin-top: 15px; padding: 12px 24px; background-color: #1a4d2e; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: bold;">View Order in Dashboard</a>
        </div>
      </div>
    `;

    const mailOptions = {
      from: `"Sankalp Hi-Tech Nursery" <${process.env.SMTP_EMAIL}>`,
      to: to,
      subject: `Order Confirmed: Seedling Booking #${orderRef}`,
      html: htmlTemplate,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`📧 Success: Receipt sent to ${to} (Message ID: ${info.messageId})`);
    
  } catch (error) {
    // We catch the error so it doesn't crash the server or the checkout flow
    console.error('❌ Email Dispatch Failed:', error.message);
  }
};
