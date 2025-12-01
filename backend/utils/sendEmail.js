const nodemailer = require('nodemailer');
const { Resend } = require('resend');

const sendOrderEmail = async (order, user) => {
  const to = user?.email || process.env.EMAIL_USER;
  const htmlItems = order.items.map(item => `<p>${item.name} (${item.size}) x${item.qty} - ₹${item.price}</p>`).join('');
  
  const htmlContent = `<h1>Thank you for your order!</h1>
           <p>Order ID: ${order._id}</p>
           <p>Date: ${new Date(order.orderDate || Date.now()).toLocaleString()}</p>
           <h3>Items:</h3>
           ${htmlItems}
           <h2>Total: ₹${order.totalPrice}</h2>
           <p>We appreciate your business!</p>`;

  // Use Gmail in development, Resend in production
  if (process.env.NODE_ENV === 'production' && process.env.RESEND_API_KEY) {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const { data } = await resend.emails.send({
      from: 'FashionHub <onboarding@resend.dev>',
      to: [to],
      subject: `Order Confirmation - #${order._id}`,
      html: htmlContent
    });
    console.log('Email sent via Resend:', data.id);
    return data;
  } else {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
    });
    const result = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject: `Order Confirmation - #${order._id}`,
      html: htmlContent
    });
    console.log('Email sent via Gmail:', result.messageId);
    return result;
  }
};

module.exports = sendOrderEmail;
