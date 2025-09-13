const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");
const crypto = require("crypto");

const prisma = new PrismaClient();

async function main() {
  try {
    // Vérifier si un admin existe déjà
    const adminExistant = await prisma.$queryRaw`
      SELECT id, email FROM Utilisateur WHERE email = 'admin@gmail.com' LIMIT 1
    `;

    if (adminExistant.length > 0) {
      console.log("✅ Admin existe déjà");
      return;
    }

    // Mot de passe fixe
    const motDePasseFixe = "admiN@123";

    // Hasher le mot de passe fixe
    const motDePasseHashe = await bcrypt.hash(motDePasseFixe, 10);

    // Générer un token unique
    const token = crypto.randomBytes(16).toString("hex");

    // Créer l'administrateur avec une requête SQL directe
    const result = await prisma.$queryRaw`
      INSERT INTO Utilisateur (
        nom, prenom, email, motdepasse, token, numero, 
        dateNaissance, pays, ville, imageUrl, role, estActif, creeA
      ) VALUES (
        'Administrateur', 'Système', 'admin@gmail.com', ${motDePasseHashe}, ${token}, '+33000000000',
        '1990-01-01', 'France', 'Paris', NULL, 'ADMIN', true, NOW()
      )
    `;""

    // Récupérer l'admin créé
    const admin = await prisma.$queryRaw`
      SELECT id, email, token FROM Utilisateur WHERE email = 'admin@gmail.com' LIMIT 1
    `;

    console.log("✅ Admin créé avec succès:", admin[0].email);

    // Sauvegarder les credentials dans un fichier
    const fs = require("fs");
    const credentialsData = {
      id: admin[0].id,
      email: admin[0].email,
      password: motDePasseFixe,
      token: admin[0].token,
      createdAt: new Date().toISOString(),
      note: "Credentials admin par défaut - CHANGEZ LE MOT DE PASSE !",
    };

    fs.writeFileSync(
      "./admin-credentials.json",
      JSON.stringify(credentialsData, null, 2)
    );

    console.log("✅ Credentials sauvegardés dans admin-credentials.json");
  } catch (error) {
    console.error("❌ Erreur détaillée:", error);
    throw error;
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("❌ Erreur lors du seeding:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
