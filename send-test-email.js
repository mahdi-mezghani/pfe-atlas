import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: "noreply.pfeatlas@gmail.com",
    pass: "qztqwqdkkieglnza",
  },
});

async function send() {
  const info = await transporter.sendMail({
    from: '"PFE Atlas" <noreply.pfeatlas@gmail.com>',
    to: "noreply.pfeatlas@gmail.com",
    subject: "SMTP sanity check for PFE Atlas",
    text: "If this arrives, the Gmail SMTP setup is working.",
  });

  console.log("Message sent:", info.messageId);
}

send().catch((err) => {
  console.error(err);
  process.exit(1);
});
