const nodemailer = require("nodemailer");

const createTransporter = () => {
  return nodemailer.createTransport({
    service: process.env.MAIL_SERVICE || "gmail",
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  });
};

const sendPasswordResetEmail = async (userEmail, userFirstName, resetToken) => {
  try {
    const transporter = createTransporter();

    const baseUrl = process.env.EXPO_PUBLIC_API_BASE_URL;
    const resetLink = `${baseUrl}/reset-password/${resetToken}`;

    const mailOptions = {
      from: `"CampusGo" <${process.env.MAIL_USER}>`,
      to: userEmail,
      subject: "Réinitialisation de votre mot de passe",
      html: `
        <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
          <h2 style="color: #333; text-align: center;">Réinitialisation du mot de passe</h2>
          <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px;">
            <p>Bonjour ${userFirstName || ""},</p>
            <p>Vous avez demandé la réinitialisation de votre mot de passe.</p>
            <p>Cliquez sur le bouton ci-dessous pour réinitialiser votre mot de passe :</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetLink}"
                 style="background-color: #0EA5A4; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Réinitialiser mon mot de passe
              </a>
            </div>
            <p><strong>Important :</strong> Ce lien est valide pendant 1 heure seulement.</p>
            <p style="color: #666; font-size: 14px;">
              Si vous n'avez pas demandé cette réinitialisation, vous pouvez ignorer ce message en toute sécurité.
            </p>
            <hr style="margin: 20px 0; border: none; border-top: 1px solid #ddd;">
            <p style="color: #999; font-size: 12px; text-align: center;">
              Si le bouton ne fonctionne pas, copiez et collez ce lien dans votre navigateur :<br>
              <a href="${resetLink}" style="color: #0EA5A4;">${resetLink}</a>
            </p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    return {
      success: true,
      message: "Email de réinitialisation envoyé avec succès",
    };
  } catch (error) {
    console.error(
      "Erreur lors de l'envoi de l'email de réinitialisation :",
      error
    );
    throw new Error("Erreur lors de l'envoi de l'email de réinitialisation");
  }
};

const sendPasswordResetCode = async (userEmail, userFirstName, resetCode) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"CampusGo" <${process.env.MAIL_USER}>`,
      to: userEmail,
      subject: "Code de réinitialisation de votre mot de passe",
      html: `
        <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
          <h2 style="color: #333; text-align: center;">Code de réinitialisation</h2>
          <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px;">
            <p>Bonjour ${userFirstName || ""},</p>
            <p>Votre code de réinitialisation :</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <div style="background-color: #0EA5A4; color: white; padding: 20px; border-radius: 8px; display: inline-block;">
                <h1 style="margin: 0; font-size: 32px; letter-spacing: 8px; font-family: 'Courier New', monospace;">
                  ${resetCode}
                </h1>
              </div>
            </div>
            
            <p><strong>Valide pendant 10 minutes.</strong></p>
            
            <div style="background-color: #fff3cd; border: 1px solid #ffeeba; color: #856404; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <strong>⚠️</strong> Ne partagez jamais ce code.
            </div>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    return {
      success: true,
      message: "Code de réinitialisation envoyé avec succès",
    };
  } catch (error) {
    console.error(
      "Erreur lors de l'envoi du code de réinitialisation :",
      error
    );
    throw new Error("Erreur lors de l'envoi du code de réinitialisation");
  }
};

const sendWelcomeEmail = async (userEmail, userFirstName, userLastName) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"CampusGo" <${process.env.MAIL_USER}>`,
      to: userEmail,
      subject: "Bienvenue sur CampusGo !",
      html: `
        <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
          <h2 style="color: #333; text-align: center;">Bienvenue sur CampusGo !</h2>
          <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px;">
            <p>Bonjour ${userFirstName} ${userLastName},</p>
            <p>Nous sommes ravis de vous accueillir sur CampusGo !</p>
            <p>Votre compte a été créé avec succès. Vous pouvez maintenant découvrir nos services de voyage pour étudiants.</p>
            <p>Si vous avez des questions, n'hésitez pas à nous contacter.</p>
            <p>Commencez dès maintenant à planifier vos prochaines aventures étudiantes !</p>
            <p style="margin-top: 30px;">
              Cordialement,<br>
              L'équipe CampusGo
            </p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    return { success: true, message: "Email de bienvenue envoyé avec succès" };
  } catch (error) {
    console.error("Erreur lors de l'envoi de l'email de bienvenue :", error);
    return {
      success: false,
      message: "Erreur lors de l'envoi de l'email de bienvenue",
    };
  }
};

const sendNotificationEmail = async (userEmail, subject, message) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"CampusGo" <${process.env.MAIL_USER}>`,
      to: userEmail,
      subject: subject,
      html: `
        <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
          <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px;">
            ${message}
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    return {
      success: true,
      message: "Email de notification envoyé avec succès",
    };
  } catch (error) {
    console.error("Erreur lors de l'envoi de l'email de notification :", error);
    throw new Error("Erreur lors de l'envoi de l'email de notification");
  }
};

const testEmailConfiguration = async () => {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    console.log("Configuration email validée avec succès");
    return true;
  } catch (error) {
    console.error("Erreur de configuration email :", error);
    return false;
  }
};

const sendAccountConfirmationCode = async (
  userEmail,
  userFirstName,
  confirmationCode
) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"CampusGo" <${process.env.MAIL_USER}>`,
      to: userEmail,
      subject: "Confirmez votre inscription sur CampusGo",
      html: `
        <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
          <div style="background: linear-gradient(135deg, #0EA5A4 0%, #0d9493 100%); padding: 40px 20px; border-radius: 8px 8px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">CampusGo</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">Confirmez votre inscription</p>
          </div>
          
          <div style="background-color: #f9f9f9; padding: 30px 20px; border-radius: 0 0 8px 8px;">
            <p style="font-size: 16px; color: #333; margin-bottom: 20px;">Bonjour ${
              userFirstName || ""
            },</p>
            
            <p style="font-size: 16px; color: #555; line-height: 1.6; margin-bottom: 25px;">
              Merci de vous être inscrit sur <strong>CampusGo</strong>, votre compagnon de voyage étudiant ! 
              Pour activer votre compte et commencer à explorer nos offres de voyage, 
              veuillez saisir le code de confirmation suivant :
            </p>
            
            <div style="text-align: center; margin: 35px 0;">
              <div style="background: linear-gradient(135deg, #0EA5A4 0%, #0d9493 100%); 
                          color: white; padding: 25px; border-radius: 12px; display: inline-block;
                          box-shadow: 0 4px 15px rgba(14, 165, 164, 0.3);">
                <p style="margin: 0 0 10px 0; font-size: 14px; opacity: 0.9;">Code de confirmation</p>
                <h1 style="margin: 0; font-size: 36px; letter-spacing: 12px; font-family: 'Courier New', monospace; font-weight: bold;">
                  ${confirmationCode}
                </h1>
              </div>
            </div>
            
            <div style="background-color: #e8f6f6; border-left: 4px solid #0EA5A4; padding: 15px; margin: 25px 0; border-radius: 4px;">
              <p style="margin: 0; color: #0d9493; font-size: 14px;">
                <strong>⏱️ Important :</strong> Ce code est valide pendant 15 minutes seulement.
              </p>
            </div>
            
            <div style="background-color: #fff3cd; border: 1px solid #ffeeba; color: #856404; 
                        padding: 15px; border-radius: 5px; margin: 25px 0;">
              <strong>🔒 Sécurité :</strong> Ne partagez jamais ce code avec qui que ce soit. 
              Notre équipe ne vous demandera jamais ce code par téléphone ou email.
            </div>
            
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
            
            <p style="color: #666; font-size: 14px; line-height: 1.6; margin-bottom: 20px;">
              Si vous n'avez pas créé de compte sur CampusGo, vous pouvez ignorer cet email en toute sécurité.
            </p>
            
            <p style="color: #333; font-size: 16px; margin-top: 30px;">
              Prêt à vivre des aventures étudiantes inoubliables ?<br>
              <span style="color: #0EA5A4; font-weight: 500;">L'équipe CampusGo</span>
            </p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    return {
      success: true,
      message: "Code de confirmation envoyé avec succès",
    };
  } catch (error) {
    console.error("Erreur lors de l'envoi du code de confirmation :", error);
    throw new Error("Erreur lors de l'envoi du code de confirmation");
  }
};

const sendAccountConfirmationEmail = async (
  userEmail,
  userFirstName,
  confirmationToken
) => {
  try {
    const transporter = createTransporter();

    const baseUrl = process.env.EXPO_PUBLIC_API_BASE_URL;
    const confirmLink = `${baseUrl}/users/confirm-email?token=${confirmationToken}`;

    const mailOptions = {
      from: `"CampusGo" <${process.env.MAIL_USER}>`,
      to: userEmail,
      subject: "Confirmez votre inscription",
      html: `
        <div style="max-width:600px;margin:0 auto;font-family:Arial,sans-serif;">
          <h2 style="color:#333;text-align:center;">Confirmation de votre inscription</h2>
          <div style="background:#f9f9f9;padding:20px;border-radius:8px;">
            <p>Bonjour ${userFirstName || ""},</p>
            <p>Merci de vous être inscrit sur CampusGo, votre application de voyage étudiant.<br>
            Veuillez cliquer sur le bouton ci-dessous pour activer votre compte :</p>
            <div style="text-align:center;margin:30px 0;">
              <a href="${confirmLink}"
                 style="background:#0EA5A4;color:white;padding:12px 24px;text-decoration:none;border-radius:5px;display:inline-block;">
                Confirmer mon compte
              </a>
            </div>
            <p style="color:#666;font-size:14px;">Si le bouton ne fonctionne pas, copiez/collez ce lien dans votre navigateur :<br>
              <a href="${confirmLink}" style="color:#0EA5A4;">${confirmLink}</a>
            </p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    return {
      success: true,
      message: "Email de confirmation envoyé avec succès",
    };
  } catch (error) {
    console.error("Erreur lors de l'envoi de l'email de confirmation :", error);
    throw new Error("Erreur lors de l'envoi de l'email de confirmation");
  }
};

module.exports = {
  sendPasswordResetEmail,
  sendWelcomeEmail,
  sendNotificationEmail,
  testEmailConfiguration,
  sendAccountConfirmationEmail,
  sendPasswordResetCode,
  sendAccountConfirmationCode,
};
