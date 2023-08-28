const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendVerifyMail = (email, verificationToken) => {
  console.log(email, verificationToken);
  const msg = {
    to: email,
    from: "barsikstd@gmail.com",
    subject: "Verify your email",
    text: `Some useless text`,
    html: `To veriify your email follow this link <a href="localhost:3000/api/users/verify/${verificationToken}">Link</a>`,
  };
  sgMail
    .send(msg)
    .then(() => {
      console.log("Email sent");
    })
    .catch((error) => {
      console.error(error);
    });
};
module.exports = sendVerifyMail;
