import sgMail from "@sendgrid/mail";

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export async function sendStatusEmail({
  to,
  candidateName,
  jobTitle,
  status
}) {
  const subject =
    status === "INTERVIEW"
      ? `Interview Invitation – ${jobTitle}`
      : `Application Update – ${jobTitle}`;

  const text =
    status === "INTERVIEW"
      ? `Dear ${candidateName},

We are pleased to invite you for an interview for the ${jobTitle} position.
Our HR team will contact you shortly.

Regards,
HR Team`
      : `Dear ${candidateName},

Thank you for applying for the ${jobTitle} position.
After careful consideration, we regret to inform you that you were not selected.

We wish you all the best.

Regards,
HR Team`;

  await sgMail.send({
    to,
    from: process.env.SENDGRID_FROM_EMAIL, // MUST be verified
    subject,
    text
  });
}
