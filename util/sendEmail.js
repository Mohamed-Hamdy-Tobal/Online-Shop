import nodemailer from "nodemailer";

const sendEmail = async (to, subject, text) => {
  try {
    // Create a transporter object using SMTP
    const transporter = nodemailer.createTransport({
      service: "gmail", // Use "gmail" or your email provider
      auth: {
        user: process.env.EMAIL_USER, // Your email address
        pass: process.env.EMAIL_PASS, // Your email password (or app password)
      },
    });

    // Email options
    const mailOptions = {
      from: process.env.EMAIL_USER, // Sender's email
      to, // Receiver's email
      subject, // Email subject
      text, // Email body (plain text)
    };

    // Send email
    await transporter.sendMail(mailOptions);
    console.log("Email sent successfully!");
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Failed to send email.");
  }
};

export default sendEmail;
