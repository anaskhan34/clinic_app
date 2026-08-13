import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: Number(process.env.MAIL_PORT),
  secure: false,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASSWORD,
  },
});

export const sendAppointmentConfirmation = async ({
  patientEmail,
  patientName,
  doctorName,
  clinicName,
  appointmentDate,
  appointmentTime,
  queueNumber,
}) => {
  try {
    const info = await transporter.sendMail({
      from: `"ClinicFlow" <${process.env.MAIL_USER}>`,
      to: patientEmail,
      subject: "Appointment Confirmation - ClinicFlow",

      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
          <h2>Appointment Confirmed</h2>

          <p>Hello ${patientName},</p>

          <p>Your appointment has been successfully booked.</p>

          <h3>Appointment Details</h3>

          <p><strong>Doctor:</strong> ${doctorName}</p>
          <p><strong>Clinic:</strong> ${clinicName}</p>
          <p><strong>Date:</strong> ${appointmentDate}</p>
          <p><strong>Time:</strong> ${appointmentTime}</p>
          <p><strong>Queue Number:</strong> ${queueNumber}</p>

          <p>Please arrive a few minutes before your appointment.</p>

          <p>Thank you for choosing ClinicFlow.</p>
        </div>
      `,
    });

    console.log("Email sent successfully:", info.messageId);

    return {
      success: true,
      message: "Appointment confirmation email sent successfully",
      messageId: info.messageId,
    };
  } catch (error) {
    console.error("Email sending failed:", error);

    return {
      success: false,
      message: "Failed to send appointment confirmation email",
      error: error.message,
    };
  }
};
