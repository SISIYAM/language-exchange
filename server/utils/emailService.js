const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const sendSubscriptionEmail = async (
  userEmail,
  subscriptionType,
  username = ""
) => {
  const subject =
    subscriptionType === "premium"
      ? "Thank You for Joining Us! 🌍💚"
      : "Subscription Update";

  const premiumTemplate = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #074C77;">Hi ${username},</h2>
      <p style="font-size: 16px; line-height: 1.5;">Welcome to Enlighten! 🎉</p>
      <p style="font-size: 16px; line-height: 1.5;">Learn languages, connect globally, and help save nature—10% of our income goes to eco-projects!</p>
      <p style="font-size: 16px; line-height: 1.5;">Let's grow together. 🌱💬</p>
    </div>
  `;

  const freeTemplate = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #074C77;">Hi ${username},</h2>
      <p style="font-size: 16px; line-height: 1.5;">Welcome to Enlighten! 🎉</p>
      <p style="font-size: 16px; line-height: 1.5;">You currently have access to:</p>
      <ul style="font-size: 16px; line-height: 1.5;">
        <li>Basic language exchange</li>
        <li>Community access</li>
        <li>Basic chat features</li>
        <li>Limited partner search</li>
      </ul>
      <p style="font-size: 16px; line-height: 1.5;">Upgrade to Premium to unlock all features and help us support eco-projects! 🌱</p>
    </div>
  `;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: userEmail,
    subject: subject,
    html: subscriptionType === "premium" ? premiumTemplate : freeTemplate,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Subscription email sent successfully");
  } catch (error) {
    console.error("Error sending subscription email:", error);
    throw error;
  }
};

module.exports = {
  sendSubscriptionEmail,
};
