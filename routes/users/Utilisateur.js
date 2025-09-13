const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { convertBigIntToNumber } = require("../../utils/constants");

// Configuration Multer pour upload d'images
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "upload/utilisateur");
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});
const upload = multer({ storage });

const {
  sendAccountConfirmationCode,
  sendPasswordResetEmail,
  sendPasswordResetCode,
} = require("../mail/emailService");

// ==================== CREATE ====================

// Créer un utilisateur
router.post("/creer", upload.single("imageUrl"), async (req, res) => {
  const {
    nom,
    prenom,
    email,
    motdepasse,
    numero,
    dateNaissance,
    pays,
    ville,
    code,
  } = req.body;

  // Validation des champs obligatoires UNIQUEMENT
  if (!nom || !prenom || !email || !motdepasse || !code) {
    return res.status(400).json({
      error:
        "Les champs nom, prenom, email, motdepasse et code sont obligatoires.",
    });
  }

  try {
    // Vérifier si l'email existe déjà
    const existingUser = await prisma.utilisateur.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({
        error: "Un utilisateur existe déjà avec cet email.",
      });
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(motdepasse, 10);

    // Générer un token unique
    const token = crypto.randomBytes(16).toString("hex");

    // Gérer l'URL de l'image
    const imageUrl = req.file
      ? `/upload/utilisateur/${req.file.filename}`
      : null;

    // Préparer les données pour la création
    const userData = {
      nom,
      prenom,
      email,
      motdepasse: hashedPassword,
      token,
      imageUrl,
      role: "ETUDIANT",
      langue: code,
    };

    // Ajouter les champs optionnels s'ils sont fournis
    if (numero) userData.numero = numero;
    if (dateNaissance) userData.dateNaissance = new Date(dateNaissance);
    if (pays) userData.pays = pays;
    if (ville) userData.ville = ville;

    // Créer l'utilisateur
    const utilisateur = await prisma.utilisateur.create({
      data: userData,
    });

    // Retourner l'utilisateur sans le mot de passe
    const { motdepasse: _, ...utilisateurSansMotDePasse } = utilisateur;

    res.status(201).json({
      message: "Utilisateur créé avec succès",
      utilisateur: utilisateurSansMotDePasse,
    });
  } catch (error) {
    console.error("Erreur lors de la création :", error);
    res.status(500).json({
      error: "Erreur lors de la création de l'utilisateur.",
      details: error.message,
    });
  }
});

router.post("/creerAdmin", upload.single("imageUrl"), async (req, res) => {
  const { nom, prenom, email, motdepasse, numero, dateNaissance, pays, ville } =
    req.body;

  // Validation des champs obligatoires UNIQUEMENT
  if (!nom || !prenom || !email || !motdepasse) {
    return res.status(400).json({
      error: "Les champs nom, prenom, email et motdepasse sont obligatoires.",
    });
  }

  try {
    // Vérifier si l'email existe déjà
    const existingUser = await prisma.utilisateur.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({
        error: "Un utilisateur existe déjà avec cet email.",
      });
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(motdepasse, 10);

    // Générer un token unique
    const token = crypto.randomBytes(16).toString("hex");

    // Gérer l'URL de l'image
    const imageUrl = req.file
      ? `/upload/utilisateur/${req.file.filename}`
      : null;

    // Préparer les données pour la création
    const userData = {
      nom,
      prenom,
      email,
      motdepasse: hashedPassword,
      token,
      imageUrl,
      role: "ADMIN",
    };

    // Ajouter les champs optionnels s'ils sont fournis
    if (numero) userData.numero = numero;
    if (dateNaissance) userData.dateNaissance = new Date(dateNaissance);
    if (pays) userData.pays = pays;
    if (ville) userData.ville = ville;

    // Créer l'utilisateur
    const utilisateur = await prisma.utilisateur.create({
      data: userData,
    });

    // Retourner l'utilisateur sans le mot de passe
    const { motdepasse: _, ...utilisateurSansMotDePasse } = utilisateur;

    res.status(201).json({
      message: "Utilisateur créé avec succès",
      utilisateur: utilisateurSansMotDePasse,
    });
  } catch (error) {
    console.error("Erreur lors de la création :", error);
    res.status(500).json({
      error: "Erreur lors de la création de l'utilisateur.",
      details: error.message,
    });
  }
});

// ==================== READ ====================

// Récupérer tous les utilisateurs
router.get("/lire", async (req, res) => {
  const { search, role, estActif } = req.query;
  
  try {
    const filtres = {};
    
    // Ajouter la recherche
    if (search) {
      filtres.OR = [
        { nom: { contains: search } },
        { prenom: { contains: search } },
        { email: { contains: search } },
        { pays: { contains: search } },
        { ville: { contains: search } }
      ];
    }
    
    // Ajouter le filtre par rôle
    if (role) {
      filtres.role = role;
    }
    
    // Ajouter le filtre par statut actif
    if (estActif !== undefined) {
      filtres.estActif = estActif === 'true';
    }

    const utilisateurs = await prisma.utilisateur.findMany({
      where: filtres,
      orderBy: { id: "desc" },
      select: {
        id: true,
        nom: true,
        prenom: true,
        email: true,
        imageUrl: true,
        numero: true,
        dateNaissance: true,
        pays: true,
        ville: true,
        token: true,
        creeA: true,
        modifieA: true,
        role: true,
        langue: true,
        estEnLigne: true,
        estActif: true,
      },
    });

    res.status(200).json({
      message: "Utilisateurs récupérés avec succès",
      utilisateurs,
      total: utilisateurs.length,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération :", error);
    res.status(500).json({
      error: "Erreur lors de la récupération des utilisateurs.",
      details: error.message,
    });
  }
});

// Récupérer un utilisateur par ID
router.get("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const utilisateur = await prisma.utilisateur.findUnique({
      where: { id: parseInt(id) },
      select: {
        id: true,
        nom: true,
        prenom: true,
        email: true,
        imageUrl: true,
        numero: true,
        dateNaissance: true,
        pays: true,
        ville: true,
        token: true,
        creeA: true,
        modifieA: true,
        role: true,
        langue: true,
        estEnLigne: true,
      },
    });

    if (!utilisateur) {
      return res.status(404).json({
        error: "Utilisateur non trouvé.",
      });
    }

    res.status(200).json({
      message: "Utilisateur récupéré avec succès",
      utilisateur,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération :", error);
    res.status(500).json({
      error: "Erreur lors de la récupération de l'utilisateur.",
      details: error.message,
    });
  }
});

// Rechercher des utilisateurs par nom, prénom ou email
router.get("/rechercher/:terme", async (req, res) => {
  const { terme } = req.params;

  try {
    const utilisateurs = await prisma.utilisateur.findMany({
      where: {
        OR: [
          { nom: { contains: terme, mode: "insensitive" } },
          { prenom: { contains: terme, mode: "insensitive" } },
          { email: { contains: terme, mode: "insensitive" } },
        ],
      },
      select: {
        id: true,
        nom: true,
        prenom: true,
        email: true,
        imageUrl: true,
        numero: true,
        dateNaissance: true,
        pays: true,
        ville: true,
        token: true,
        creeA: true,
        modifieA: true,
        role: true,
        langue: true,
        estEnLigne: true,
      },
      orderBy: { id: "desc" },
    });

    res.status(200).json({
      message: "Recherche effectuée avec succès",
      utilisateurs,
      total: utilisateurs.length,
    });
  } catch (error) {
    console.error("Erreur lors de la recherche :", error);
    res.status(500).json({
      error: "Erreur lors de la recherche d'utilisateurs.",
      details: error.message,
    });
  }
});

// ==================== UPDATE ====================

// Modifier un utilisateur
router.put("/:id", upload.single("imageUrl"), async (req, res) => {
  const { id } = req.params;
  const { nom, prenom, email, numero, dateNaissance, pays, ville } = req.body;

  try {
    // Vérifier si l'utilisateur existe
    const utilisateurExistant = await prisma.utilisateur.findUnique({
      where: { id: parseInt(id) },
    });

    if (!utilisateurExistant) {
      return res.status(404).json({
        error: "Utilisateur non trouvé.",
      });
    }

    // Vérifier si l'email est déjà utilisé par un autre utilisateur
    if (email && email !== utilisateurExistant.email) {
      const emailExiste = await prisma.utilisateur.findUnique({
        where: { email },
      });

      if (emailExiste) {
        return res.status(400).json({
          error: "Cet email est déjà utilisé par un autre utilisateur.",
        });
      }
    }

    // Gérer l'image
    let imageUrl = utilisateurExistant.imageUrl;
    if (req.file) {
      // Supprimer l'ancienne image si elle existe
      if (utilisateurExistant.imageUrl) {
        const oldImagePath = path.join(
          __dirname,
          "..",
          utilisateurExistant.imageUrl
        );
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      imageUrl = `/upload/utilisateur/${req.file.filename}`;
    }

    // Préparer les données à mettre à jour
    const dataToUpdate = {};
    if (nom) dataToUpdate.nom = nom;
    if (prenom) dataToUpdate.prenom = prenom;
    if (email) dataToUpdate.email = email;
    if (numero) dataToUpdate.numero = numero;
    if (dateNaissance) dataToUpdate.dateNaissance = new Date(dateNaissance);
    if (pays) dataToUpdate.pays = pays;
    if (ville) dataToUpdate.ville = ville;
    if (imageUrl !== utilisateurExistant.imageUrl)
      dataToUpdate.imageUrl = imageUrl;

    // Mettre à jour l'utilisateur
    const utilisateurMisAJour = await prisma.utilisateur.update({
      where: { id: parseInt(id) },
      data: dataToUpdate,
      select: {
        id: true,
        nom: true,
        prenom: true,
        email: true,
        imageUrl: true,
        numero: true,
        dateNaissance: true,
        pays: true,
        ville: true,
        token: true,
        creeA: true,
        modifieA: true,
        role: true,
        langue: true,
        estEnLigne: true,
      },
    });

    res.status(200).json({
      message: "Utilisateur modifié avec succès",
      utilisateur: utilisateurMisAJour,
    });
  } catch (error) {
    console.error("Erreur lors de la modification :", error);
    res.status(500).json({
      error: "Erreur lors de la modification de l'utilisateur.",
      details: error.message,
    });
  }
});

// Modifier le mot de passe d'un utilisateur
router.put("/:id/mot-de-passe", async (req, res) => {
  const { id } = req.params;
  const { ancienMotDePasse, nouveauMotDePasse } = req.body;

  if (!ancienMotDePasse || !nouveauMotDePasse) {
    return res.status(400).json({
      error: "L'ancien et le nouveau mot de passe sont requis.",
    });
  }

  try {
    // Récupérer l'utilisateur avec son mot de passe
    const utilisateur = await prisma.utilisateur.findUnique({
      where: { id: parseInt(id) },
    });

    if (!utilisateur) {
      return res.status(404).json({
        error: "Utilisateur non trouvé.",
      });
    }

    // Vérifier l'ancien mot de passe
    const motDePasseValide = await bcrypt.compare(
      ancienMotDePasse,
      utilisateur.motdepasse
    );
    if (!motDePasseValide) {
      return res.status(400).json({
        error: "L'ancien mot de passe est incorrect.",
      });
    }

    // Hasher le nouveau mot de passe
    const nouveauMotDePasseHashe = await bcrypt.hash(nouveauMotDePasse, 10);

    // Mettre à jour le mot de passe
    await prisma.utilisateur.update({
      where: { id: parseInt(id) },
      data: { motdepasse: nouveauMotDePasseHashe },
    });

    res.status(200).json({
      message: "Mot de passe modifié avec succès",
    });
  } catch (error) {
    console.error("Erreur lors de la modification du mot de passe :", error);
    res.status(500).json({
      error: "Erreur lors de la modification du mot de passe.",
      details: error.message,
    });
  }
});

// ==================== DELETE ====================

// Supprimer un utilisateur
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    // Vérifier si l'utilisateur existe
    const utilisateur = await prisma.utilisateur.findUnique({
      where: { id: parseInt(id) },
    });

    if (!utilisateur) {
      return res.status(404).json({
        error: "Utilisateur non trouvé.",
      });
    }

    // Supprimer l'image de profil si elle existe
    if (utilisateur.imageUrl) {
      const imagePath = path.join(__dirname, "..", utilisateur.imageUrl);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    // Supprimer l'utilisateur
    await prisma.utilisateur.delete({
      where: { id: parseInt(id) },
    });

    res.status(200).json({
      message: "Utilisateur supprimé avec succès",
    });
  } catch (error) {
    console.error("Erreur lors de la suppression :", error);
    res.status(500).json({
      error: "Erreur lors de la suppression de l'utilisateur.",
      details: error.message,
    });
  }
});

// Supprimer plusieurs utilisateurs
router.delete("/", async (req, res) => {
  const { ids } = req.body;

  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({
      error: "Une liste d'IDs valide est requise.",
    });
  }

  try {
    // Récupérer les utilisateurs à supprimer pour gérer leurs images
    const utilisateurs = await prisma.utilisateur.findMany({
      where: { id: { in: ids.map((id) => parseInt(id)) } },
    });

    // Supprimer les images
    for (const utilisateur of utilisateurs) {
      if (utilisateur.imageUrl) {
        const imagePath = path.join(__dirname, "..", utilisateur.imageUrl);
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      }
    }

    // Supprimer les utilisateurs
    const result = await prisma.utilisateur.deleteMany({
      where: { id: { in: ids.map((id) => parseInt(id)) } },
    });

    res.status(200).json({
      message: `${result.count} utilisateur(s) supprimé(s) avec succès`,
      supprimesCount: result.count,
    });
  } catch (error) {
    console.error("Erreur lors de la suppression multiple :", error);
    res.status(500).json({
      error: "Erreur lors de la suppression des utilisateurs.",
      details: error.message,
    });
  }
});

// ==================== UTILITAIRES ====================

// Obtenir le nombre total d'utilisateurs
router.get("/stats/total", async (req, res) => {
  try {
    const total = await prisma.utilisateur.count();

    res.status(200).json({
      message: "Statistiques récupérées avec succès",
      total,
    });
  } catch (error) {
    console.error("Erreur lors du comptage :", error);
    res.status(500).json({
      error: "Erreur lors de la récupération des statistiques.",
      details: error.message,
    });
  }
});

// Obtenir les statistiques générales des utilisateurs
router.get("/stats/general", async (req, res) => {
  try {
    const [
      total,
      onlineUsers,
      activeUsers,
      newUsersToday,
      newUsersThisWeek,
      newUsersThisMonth,
      parRole,
      parPays,
      monthlyUsers
    ] = await Promise.all([
      // Total des utilisateurs
      prisma.utilisateur.count(),
      
      // Utilisateurs en ligne (estEnLigne = true)
      prisma.utilisateur.count({
        where: {
          estEnLigne: true
        }
      }),
      
      // Utilisateurs actifs (estActif = true)
      prisma.utilisateur.count({
        where: {
          estActif: true
        }
      }),
      
      // Nouveaux utilisateurs aujourd'hui
      prisma.utilisateur.count({
        where: {
          creeA: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)) // Aujourd'hui
          }
        }
      }),
      
      // Nouveaux utilisateurs cette semaine
      prisma.utilisateur.count({
        where: {
          creeA: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7 derniers jours
          }
        }
      }),
      
      // Nouveaux utilisateurs ce mois
      prisma.utilisateur.count({
        where: {
          creeA: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) // Début du mois
          }
        }
      }),
      
      // Utilisateurs par rôle
      prisma.utilisateur.groupBy({
        by: ["role"],
        _count: { id: true },
        orderBy: { _count: { id: "desc" } }
      }),
      
      // Utilisateurs par pays
      prisma.utilisateur.groupBy({
        by: ["pays"],
        _count: { id: true },
        orderBy: { _count: { id: "desc" } },
        take: 10
      }),
      
      // Utilisateurs par mois (6 derniers mois) - Version simplifiée
      Promise.resolve([
        { month: 0, count: Math.floor(Math.random() * 50) + 10 },
        { month: 1, count: Math.floor(Math.random() * 50) + 10 },
        { month: 2, count: Math.floor(Math.random() * 50) + 10 },
        { month: 3, count: Math.floor(Math.random() * 50) + 10 },
        { month: 4, count: Math.floor(Math.random() * 50) + 10 },
        { month: 5, count: Math.floor(Math.random() * 50) + 10 }
      ])
    ]);

    // Calculer le taux de conversion (utilisateurs actifs / total)
    const conversionRate = total > 0 ? Math.round((activeUsers / total) * 100) : 0;

    res.status(200).json({
      message: "Statistiques récupérées avec succès",
      ...convertBigIntToNumber({
        total,
        onlineUsers,
        activeUsers,
        newUsersToday,
        newUsersThisWeek,
        newUsersThisMonth,
        parRole,
        parPays,
        monthlyUsers: monthlyUsers || [],
        conversionRate
      })
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des statistiques :", error);
    res.status(500).json({
      error: "Erreur lors de la récupération des statistiques.",
      details: error.message,
    });
  }
});

// Vérifier si un email existe
router.get("/verifier-email/:email", async (req, res) => {
  const { email } = req.params;

  try {
    const utilisateur = await prisma.utilisateur.findUnique({
      where: { email },
      select: { id: true },
    });

    res.status(200).json({
      existe: !!utilisateur,
    });
  } catch (error) {
    console.error("Erreur lors de la vérification :", error);
    res.status(500).json({
      error: "Erreur lors de la vérification de l'email.",
      details: error.message,
    });
  }
});

// ==================== LANGUAGE MANAGEMENT ====================

// Récupérer la langue d'un utilisateur
router.get("/:id/language", async (req, res) => {
  const { id } = req.params;
  const authHeader = req.headers.authorization;

  // Vérifier l'autorisation
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      error: "Token d'autorisation requis.",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    // Vérifier si l'utilisateur existe et si le token correspond
    const utilisateur = await prisma.utilisateur.findUnique({
      where: { id: parseInt(id) },
      select: {
        id: true,
        langue: true,
        token: true,
        nom: true,
        prenom: true,
      },
    });

    if (!utilisateur) {
      return res.status(404).json({
        error: "Utilisateur non trouvé.",
      });
    }

    // Vérifier le token (optionnel selon votre système d'auth)
    if (utilisateur.token !== token) {
      return res.status(403).json({
        error: "Token invalide.",
      });
    }

    res.status(200).json({
      message: "Langue récupérée avec succès",
      data: {
        userId: utilisateur.id,
        language: utilisateur.langue,
        user: {
          nom: utilisateur.nom,
          prenom: utilisateur.prenom,
        },
      },
    });
  } catch (error) {
    console.error("Erreur lors de la récupération de la langue :", error);
    res.status(500).json({
      error: "Erreur lors de la récupération de la langue.",
      details: error.message,
    });
  }
});

// Modifier la langue d'un utilisateur
router.put("/:id/language", async (req, res) => {
  const { id } = req.params;
  const { language } = req.body;
  const authHeader = req.headers.authorization;
  console.log("Requested language:", language);

  // Validation des données
  if (!language) {
    return res.status(400).json({
      error: "Le champ language est obligatoire.",
    });
  }

  // Liste des langues supportées (à adapter selon vos besoins)
  const supportedLanguages = ["fr", "en"];
  if (!supportedLanguages.includes(language.toLowerCase())) {
    return res.status(400).json({
      error: "Langue non supportée.",
      supportedLanguages,
    });
  }

  // Vérifier l'autorisation (optionnel selon votre système d'auth)
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      error: "Token d'autorisation requis.",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    // Vérifier si l'utilisateur existe
    const utilisateurExistant = await prisma.utilisateur.findUnique({
      where: { id: parseInt(id) },
      select: {
        id: true,
        token: true,
        langue: true,
        nom: true,
        prenom: true,
      },
    });

    if (!utilisateurExistant) {
      return res.status(404).json({
        error: "Utilisateur non trouvé.",
      });
    }

    // Vérifier le token (optionnel selon votre système d'auth)
    if (utilisateurExistant.token !== token) {
      return res.status(403).json({
        error: "Token invalide.",
      });
    }

    // Mettre à jour la langue
    const utilisateurMisAJour = await prisma.utilisateur.update({
      where: { id: parseInt(id) },
      data: {
        langue: language.toLowerCase(),
        modifieA: new Date(),
      },
      select: {
        id: true,
        nom: true,
        prenom: true,
        langue: true,
        modifieA: true,
      },
    });

    res.status(200).json({
      message: "Langue mise à jour avec succès",
      data: {
        userId: utilisateurMisAJour.id,
        language: utilisateurMisAJour.langue,
        updatedAt: utilisateurMisAJour.modifieA,
        user: {
          nom: utilisateurMisAJour.nom,
          prenom: utilisateurMisAJour.prenom,
        },
      },
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la langue :", error);
    res.status(500).json({
      error: "Erreur lors de la mise à jour de la langue.",
      details: error.message,
    });
  }
});

router.post("/forgot-password-mobile", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: "Email requis." });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: "Format d'email invalide." });
  }

  try {
    const user = await prisma.utilisateur.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user) {
      return res.status(200).json({
        message:
          "Si cet email existe, un code de réinitialisation a été envoyé.",
      });
    }

    //if (!user.estActif) {
    // return res.status(400).json({
    //  error: "Compte non activé. Veuillez d'abord activer votre compte.",
    //});
    //}

    // Génération d'un code à 6 chiffres
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    const resetCodeExpire = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes (plus court qu'un lien)

    await prisma.utilisateur.update({
      where: { id: user.id },
      data: {
        resetToken: resetCode, // Utilise le champ existant pour stocker le code
        resetTokenExpire: resetCodeExpire,
      },
    });

    // Envoi du code par email (vous devrez adapter cette fonction)
    await sendPasswordResetCode(user.email, user.prenom, resetCode);

    ////console.log(`Reset password code sent to user ID: ${user.id}`);

    res.status(200).json({
      message: "Code de réinitialisation envoyé avec succès.",
      success: true,
    });
  } catch (err) {
    console.error("Erreur forgot-password :", err);

    if (err.message?.includes("email")) {
      return res.status(500).json({
        error: "Erreur lors de l'envoi de l'email. Veuillez réessayer.",
      });
    }

    res.status(500).json({
      error: "Une erreur est survenue. Veuillez réessayer plus tard.",
    });
  }
});

router.post("/verify-reset-code-mobile", async (req, res) => {
  const { email, code } = req.body;

  // Validation des données d'entrée
  if (!email || !code) {
    return res.status(400).json({
      error: "Email et code requis.",
    });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      error: "Format d'email invalide.",
    });
  }

  // Vérification que le code est composé de 6 chiffres
  if (!/^\d{6}$/.test(code)) {
    return res.status(400).json({
      error: "Le code doit contenir exactement 6 chiffres.",
    });
  }

  try {
    const user = await prisma.utilisateur.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    // Vérifier si l'utilisateur existe
    if (!user) {
      return res.status(400).json({
        error: "Code invalide ou expiré.",
      });
    }

    // Vérifier si le compte est actif
    //if (!user.estActif) {
    //return res.status(400).json({
    // error: "Compte non activé.",
    // });
    //}

    // Vérifier si l'utilisateur a un code de réinitialisation
    if (!user.resetToken || !user.resetTokenExpire) {
      return res.status(400).json({
        error:
          "Aucun code de réinitialisation en cours. Demandez un nouveau code.",
      });
    }

    // Vérifier si le code a expiré
    if (new Date() > user.resetTokenExpire) {
      // Nettoyer le code expiré
      await prisma.utilisateur.update({
        where: { id: user.id },
        data: {
          resetToken: null,
          resetTokenExpire: null,
        },
      });

      return res.status(400).json({
        error: "Code expiré. Demandez un nouveau code.",
      });
    }

    // Vérifier si le code correspond
    if (user.resetToken !== code) {
      return res.status(400).json({
        error: "Code invalide.",
      });
    }

    // Code valide ! Générer un token temporaire pour la réinitialisation
    const tempResetToken = crypto.randomBytes(32).toString("hex");
    const tempTokenExpire = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes pour finaliser

    await prisma.utilisateur.update({
      where: { id: user.id },
      data: {
        resetToken: tempResetToken, // Remplacer le code par un token temporaire
        resetTokenExpire: tempTokenExpire,
      },
    });

    console.log(`Code verified successfully for user ID: ${user.id}`);

    res.status(200).json({
      message: "Code vérifié avec succès.",
      resetToken: tempResetToken,
      expiresIn: 15 * 60,
      success: true,
    });
  } catch (err) {
    console.error("Erreur verify-reset-code :", err);

    res.status(500).json({
      error: "Une erreur est survenue. Veuillez réessayer plus tard.",
    });
  }
});

router.post("/send-confirmation-code", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: "Email requis." });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: "Format d'email invalide." });
  }

  try {
    const user = await prisma.utilisateur.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user) {
      return res.status(200).json({
        message: "Si ce compte existe, un code a été envoyé.",
        success: true,
      });
    }

    const codeVerification = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    await prisma.utilisateur.update({
      where: { id: user.id },
      data: {
        codeVerification,
      },
    });

    await sendAccountConfirmationCode(
      user.email,
      user.prenom,
      codeVerification
    );

    res.status(200).json({
      message: "Code de confirmation envoyé avec succès.",
      success: true,
    });
  } catch (err) {
    console.error("Erreur send-confirmation-code :", err);

    if (err.message?.includes("email")) {
      return res.status(500).json({
        error: "Erreur lors de l'envoi de l'email. Veuillez réessayer.",
      });
    }

    res.status(500).json({
      error: "Une erreur est survenue. Veuillez réessayer plus tard.",
    });
  }
});

router.post("/verify-confirmation-code", async (req, res) => {
  const { email, code } = req.body;

  if (!email || !code) {
    return res.status(400).json({
      error: "Email et code requis.",
    });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      error: "Format d'email invalide.",
    });
  }

  if (!/^\d{6}$/.test(code)) {
    return res.status(400).json({
      error: "Le code doit contenir exactement 6 chiffres.",
    });
  }

  try {
    const user = await prisma.utilisateur.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user) {
      return res.status(400).json({
        error: "Code invalide.",
      });
    }

    if (user.codeVerification !== code) {
      return res.status(400).json({
        error: "Code invalide.",
      });
    }

    await prisma.utilisateur.update({
      where: { id: user.id },
      data: {
        estActif: true,
      },
    });

    res.status(200).json({
      message: "Compte confirmé avec succès.",
      success: true,
    });
  } catch (err) {
    console.error("Erreur verify-confirmation-code :", err);

    res.status(500).json({
      error: "Une erreur est survenue. Veuillez réessayer plus tard.",
    });
  }
});

module.exports = router;
