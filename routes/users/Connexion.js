const express = require("express");
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const router = express.Router();
const prisma = new PrismaClient();
// Configuration JWT
const JWT_SECRET =
  process.env.JWT_SECRET || "votre_cle_secrete_jwt_super_securisee_changez_moi";

/**
 * Route de connexion utilisateur
 * @route POST /connexion
 * @desc Authentifie un utilisateur avec email/mot de passe
 * @access Public
 */
router.post("/connexion", async (req, res) => {
  const { email, motdepasse } = req.body;

  try {
    // Validation des champs requis
    if (!email || !motdepasse) {
      return res.status(400).json({
        error: "Email et mot de passe sont requis.",
      });
    }

    // Recherche de l'utilisateur avec requête SQL directe
    const users = await prisma.$queryRaw`
      SELECT * FROM Utilisateur WHERE email = ${email} LIMIT 1
    `;
    const user = users[0];

    if (!user) {
      return res.status(404).json({
        error: "Aucun utilisateur trouvé avec cet email.",
      });
    }

    // Vérification du statut du compte
    if (!user.estActif) {
      return res.status(403).json({
        error: "Votre compte n'est pas encore activé.",
      });
    }

    // Vérification du mot de passe
    const isPasswordValid = await bcrypt.compare(motdepasse, user.motdepasse);
    if (!isPasswordValid) {
      return res.status(401).json({
        error: "Mot de passe incorrect.",
      });
    }

    // Création du payload JWT avec expiration prolongée
    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    // Génération du token JWT avec durée d'expiration plus longue
    const token = jwt.sign(payload, JWT_SECRET, {
      expiresIn: "7d", // 7 jours au lieu de 3h pour maintenir la session plus longtemps
      issuer: "study-abroad-platform",
      audience: "study-abroad-users",
    });

    // Calcul de la date d'expiration du token
    const tokenExpiry = new Date();
    tokenExpiry.setDate(tokenExpiry.getDate() + 7); // Ajouter 7 jours

    // Mise à jour de la session et du statut utilisateur
    req.session.userId = user.id;

    // Mise à jour avec requête SQL directe
    await prisma.$queryRaw`
      UPDATE Utilisateur 
      SET token = ${token} 
      WHERE id = ${user.id}
    `;

    // Préparation de la réponse (sans mot de passe)
    const { motdepasse: _, ...userSansMotdepasse } = user;

    res.status(200).json({
      message: "Connexion réussie.",
      user: {
        ...userSansMotdepasse,
        token,
        tokenExpiry: tokenExpiry.getTime(), // Retourner l'expiration en timestamp
      },
    });
  } catch (error) {
    console.error("Erreur lors de la connexion :", error);
    res.status(500).json({
      error: "Erreur serveur lors de la connexion.",
    });
  }
});

/**
 * Route de vérification de token
 * @route GET /verify-token
 * @desc Vérifie si le token JWT est toujours valide
 * @access Private
 */
router.get("/verify-token", async (req, res) => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({
        success: false,
        error: "Token manquant",
        valid: false,
      });
    }

    // Vérification du token JWT
    const decoded = jwt.verify(token, JWT_SECRET);

    // Vérification que l'utilisateur existe toujours avec requête SQL directe
    const users = await prisma.$queryRaw`
      SELECT * FROM Utilisateur WHERE id = ${decoded.userId} LIMIT 1
    `;
    const user = users[0];

    if (!user) {
      return res.status(401).json({
        success: false,
        error: "Utilisateur introuvable",
        valid: false,
      });
    }

    // Vérification que le token stocké correspond
    if (user.token !== token) {
      return res.status(401).json({
        success: false,
        error: "Token invalide",
        valid: false,
      });
    }

    // Vérification de l'expiration du token stocké
    // if (user.tokenExpiry && new Date() > user.tokenExpiry) {
    //   return res.status(401).json({
    //     success: false,
    //     error: "Token expiré",
    //     valid: false,
    //   });
    // }

    // Mise à jour de la dernière activité
    // await prisma.utilisateur.update({
    //   where: { id: user.id },
    //   data: {
    //     derniereActivite: new Date(),
    //   },
    // });

    res.status(200).json({
      success: true,
      valid: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        error: "Token invalide",
        valid: false,
      });
    }

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        error: "Token expiré",
        valid: false,
      });
    }

    console.error("Erreur lors de la vérification du token :", error);
    res.status(500).json({
      success: false,
      error: "Erreur serveur",
      valid: false,
    });
  }
});

/**
 * Route de rafraîchissement de token
 * @route POST /refresh-token
 * @desc Génère un nouveau token pour prolonger la session
 * @access Private
 */
router.post("/refresh-token", async (req, res) => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({
        success: false,
        error: "Token manquant",
      });
    }

    // Vérification du token même s'il est expiré (pour le rafraîchissement)
    const decoded = jwt.verify(token, JWT_SECRET, { ignoreExpiration: true });

    const users = await prisma.$queryRaw`
      SELECT * FROM Utilisateur WHERE id = ${decoded.userId} LIMIT 1
    `;
    const user = users[0];

    if (!user || user.token !== token) {
      return res.status(401).json({
        success: false,
        error: "Token invalide",
      });
    }

    // Génération d'un nouveau token
    const newPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const newToken = jwt.sign(newPayload, JWT_SECRET, {
      expiresIn: "7d",
      issuer: "study-abroad-platform",
      audience: "study-abroad-users",
    });

    const newTokenExpiry = new Date();
    newTokenExpiry.setDate(newTokenExpiry.getDate() + 7);

    // Mise à jour du token en base avec requête SQL directe
    await prisma.$queryRaw`
      UPDATE Utilisateur 
      SET token = ${newToken} 
      WHERE id = ${user.id}
    `;

    const { motdepasse: _, ...userSansMotdepasse } = user;

    res.status(200).json({
      success: true,
      token: newToken,
      tokenExpiry: newTokenExpiry.getTime(),
      user: {
        ...userSansMotdepasse,
        token: newToken,
      },
    });
  } catch (error) {
    console.error("Erreur lors du rafraîchissement du token :", error);
    res.status(500).json({
      success: false,
      error: "Erreur serveur",
    });
  }
});

module.exports = router;
