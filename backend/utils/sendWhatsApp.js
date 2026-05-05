import twilio from 'twilio';

/**
 * Send an Automated WhatsApp Receipt
 */
export const sendWhatsAppReceipt = async ({ mobile, name, orderRef, varietyName, volume, totalAmount, paymentStatus }) => {
  try {
    // 1. Validate Environment Variables
    const sid = process.env.TWILIO_ACCOUNT_SID;
    const token = process.env.TWILIO_AUTH_TOKEN;
    const from = process.env.TWILIO_WHATSAPP_NUMBER;

    if (!sid || !token || !from || sid === 'your_account_sid_here') {
      console.warn('⚠️ Twilio keys not fully configured in .env. Skipping WhatsApp.');
      return;
    }

    const client = twilio(sid, token);

    // 2. Format Mobile (Ensure it's like +919876543210)
    let cleanMobile = mobile.replace(/\D/g, '');
    if (cleanMobile.length === 10) cleanMobile = '91' + cleanMobile;
    const formattedTo = `whatsapp:+${cleanMobile}`;
    const formattedFrom = from.includes('whatsapp:') ? from.replace(/\s/g, '') : `whatsapp:${from.replace(/\s/g, '')}`;

    // 3. Construct Message
    const messageBody = `*Sankalp Hi-Tech Nursery* 🌿
_Order Confirmed!_

Hi *${name}*, thank you for your booking.
🧾 *Order:* #${orderRef}
🌱 *Variety:* ${varietyName}
📦 *Volume:* ${volume.toLocaleString()} Seedlings
💳 *Total:* ₹${totalAmount.toLocaleString()}
📊 *Payment:* ${paymentStatus}

Our team will contact you soon!`;

    // 4. Dispatch
    const message = await client.messages.create({
      body: messageBody,
      from: formattedFrom,
      to: formattedTo
    });

    console.log(`🟢 WhatsApp Sent: ${message.sid} to ${formattedTo}`);

  } catch (error) {
    console.error(`❌ WhatsApp Error Details:`);
    console.error(`   Message: ${error.message}`);
    console.error(`   Code: ${error.code}`);
    console.error(`   Status: ${error.status}`);
  }
};
