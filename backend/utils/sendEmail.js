const nodemailer = require('nodemailer');

// Create transporter 
function createTransporter() {
  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
    });
  }
}

const transporter = createTransporter();

// Order Confirmation Email
const sendOrderEmail = async (order, user) => {
  console.log('EMAIL_USER:', process.env.EMAIL_USER ?  process.env.EMAIL_USER : 'Missing');
  console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? 'Set' : 'Missing');
  console.log('Transporter:', transporter ? 'Created' : 'Not created');
  
  if (!transporter) {
    throw new Error('Email transporter not configured');
  }
  
  const to = (user && user.email) || process.env.EMAIL_USER || 'no-reply@example.com';
  console.log('Sending to:', to);
  const htmlItems = order.items.map(item => `<p>${item.name} (${item.size}) x${item.qty} - ₹${item.price}</p>`).join('');

  const mailOptions = {
    from: process.env.EMAIL_USER || 'no-reply@example.com',
    to,
    subject: `Order Confirmation - #${order._id}`,
    html: `<h1>Thank you for your order!</h1>
           <p>Order ID: ${order._id}</p>
           <p>Date: ${new Date(order.orderDate || Date.now()).toLocaleString()}</p>
           <h3>Items:</h3>
           ${htmlItems}
           <h2>Total: ₹${order.totalPrice}</h2>
           <p>We appreciate your business!</p>`
  };

  try {
    console.log('Sending email...');
    const result = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', result.messageId);
    return result;
  } catch (err) {
    console.error('Email error:', err);
    throw err;
  }
};

module.exports = sendOrderEmail;
