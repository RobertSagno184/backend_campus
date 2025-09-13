const cloudinary = require("cloudinary").v2;

// Vérification des variables d'environnement
if (
  !process.env.CLOUDINARY_CLOUD_NAME ||
  !process.env.CLOUDINARY_API_KEY ||
  !process.env.CLOUDINARY_API_SECRET
) {
  console.error("❌ Variables Cloudinary manquantes:");
  console.error("CLOUDINARY_CLOUD_NAME:", !!process.env.CLOUDINARY_CLOUD_NAME);
  console.error("CLOUDINARY_API_KEY:", !!process.env.CLOUDINARY_API_KEY);
  console.error("CLOUDINARY_API_SECRET:", !!process.env.CLOUDINARY_API_SECRET);
  throw new Error("Variables d'environnement Cloudinary manquantes");
}

// Configuration Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

console.log(
  "✅ Cloudinary configuré avec succès pour:",
  process.env.CLOUDINARY_CLOUD_NAME
);

// Fonction d'upload
async function handleImageUpload(
  file,
  oldImageUrl = null,
  folder = "utilisateurs"
) {
  if (!file) return null;

  try {
    // Validation du fichier
    if (!file || !file.buffer) {
      throw new Error("Fichier invalide ou buffer manquant");
    }

    console.log("🔄 Début upload Cloudinary...");
    console.log("📁 Taille fichier:", file.buffer.length, "bytes");
    console.log("📋 Type MIME:", file.mimetype);

    // Upload vers Cloudinary
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            resource_type: "image",
            folder: folder,
            quality: "auto",
            fetch_format: "auto",
          },
          (error, result) => {
            if (error) {
              console.error("❌ Erreur Cloudinary détaillée:", error);
              reject(error);
            } else {
              console.log("✅ Upload réussi:", result.secure_url);
              resolve(result);
            }
          }
        )
        .end(file.buffer);
    });

    // Supprimer l'ancienne image si elle existe
    if (oldImageUrl && oldImageUrl.includes("cloudinary.com")) {
      try {
        const publicId = extractPublicIdFromUrl(oldImageUrl);
        if (publicId) {
          await cloudinary.uploader.destroy(publicId);
        } else {
          console.log("⚠️ Impossible d'extraire le public_id depuis l'URL.");
        }
      } catch (err) {
        console.log(
          "⚠️ Impossible de supprimer l'ancienne image:",
          err.message
        );
      }
    }

    return result.secure_url;
  } catch (error) {
    console.error("❌ Erreur lors de l'upload vers Cloudinary:", error);
    throw new Error("Erreur lors de l'upload de l'image");
  }
}

// Fonction utilitaire pour extraire le public_id d'une URL Cloudinary
function extractPublicIdFromUrl(url) {
  try {
    // Extraire le public_id incluant le dossier
    const matches = url.match(/\/upload\/(?:v\d+\/)?(.+)\.[a-zA-Z]+$/);
    return matches ? matches[1] : null;
  } catch (error) {
    console.error("❌ Erreur extraction public_id:", error.message);
    return null;
  }
}

// Test de connexion Cloudinary
async function testCloudinaryConnection() {
  try {
    const result = await cloudinary.api.ping();
    console.log("✅ Test Cloudinary réussi:", result);
    return true;
  } catch (error) {
    console.error("❌ Test Cloudinary échoué:", error);
    return false;
  }
}

// Tester la connexion au démarrage
testCloudinaryConnection();

module.exports = {
  handleImageUpload,
  cloudinary,
  testCloudinaryConnection,
  extractPublicIdFromUrl,
};
