const express = require("express");
const { PrismaClient } = require("@prisma/client");

const router = express.Router();
const prisma = new PrismaClient();

// Configuration de l'inactivité
const INACTIVITY_LIMIT = 30 * 60 * 1000; // 30 minutes en millisecondes

/**
 * Middleware de gestion de l'inactivité utilisateur
 * @desc Vérifie l'activité de l'utilisateur et déconnecte après inactivité
 * @param {Object} req - Objet request Express
 * @param {Object} res - Objet response Express
 * @param {Function} next - Fonction next Express
 */
const handleInactivity = async (req, res, next) => {
  // Vérification de l'initialisation de la session
  if (!req.session) {
    return res.status(500).json({
      error: "Session non initialisée",
    });
  }

  // Ignorer les requêtes d'API pour éviter les déconnexions intempestives
  if (req.path.startsWith('/api/') || req.path.includes('/stats/') || req.path.includes('/lire') || req.path.includes('/rechercher')) {
    return next();
  }

  // Traitement uniquement si l'utilisateur est connecté
  if (req.session.userId) {
    const now = Date.now();

    // Vérification du délai d'inactivité
    if (
      req.session.lastActivity &&
      now - req.session.lastActivity > INACTIVITY_LIMIT
    ) {
      try {
        // Nettoyage du token utilisateur en base de données
        await prisma.utilisateur.update({
          where: { id: req.session.userId },
          data: {
            token: "",
            estEnLigne: false,
            // Supprimer derniereConnexion car ce champ n'existe pas dans le schéma
          },
        });

        // Destruction de la session
        req.session.destroy((err) => {
          if (err) {
            console.error("Erreur lors de la destruction de la session:", err);
            return res.status(500).json({
              error: "Erreur lors de la déconnexion automatique.",
            });
          }
          return res.status(401).json({
            error: "Session expirée par inactivité.",
            redirect: "/",
          });
        });

        return; // Arrêter l'exécution ici
      } catch (error) {
        console.error("Erreur lors de la gestion de l'inactivité:", error);
        return res.status(500).json({
          error: "Erreur interne du serveur.",
        });
      }
    } else {
      // Mise à jour de l'activité utilisateur
      req.session.lastActivity = now;
    }
  }

  next();
};

// Application du middleware à toutes les routes
router.use(handleInactivity);

/**
 * Route de déconnexion utilisateur
 * @route POST /deconnexion
 * @desc Déconnecte l'utilisateur et détruit sa session
 * @access Private
 */
router.post("/deconnexion", async (req, res) => {
  // Récupération de l'email depuis le body (pour les logs)
  const { email } = req.body;
  console.log(
    "Déconnexion demandée pour l'utilisateur:",
    email || "Non spécifié"
  );

  // Vérification de l'initialisation de la session
  if (!req.session) {
    return res.status(500).json({
      error: "Session non initialisée",
    });
  }

  // Traitement de la déconnexion si utilisateur connecté
  if (req.session.userId) {
    try {
      // Nettoyage des données utilisateur en base
      await prisma.utilisateur.update({
        where: { id: req.session.userId },
        data: {
          token: "",
          estEnLigne: false,
          // Supprimer derniereConnexion car ce champ n'existe pas
          // Si vous voulez traquer la dernière connexion, ajoutez ce champ à votre schéma Prisma
        },
      });

      // Destruction de la session
      req.session.destroy((err) => {
        if (err) {
          console.error("Erreur lors de la destruction de la session:", err);
          return res.status(500).json({
            error: "Erreur lors de la déconnexion.",
          });
        }

        // Déconnexion réussie
        res.status(200).json({
          message: "Déconnexion réussie.",
          redirect: "/",
        });
      });
    } catch (error) {
      console.error("Erreur lors de la suppression du token:", error);
      res.status(500).json({
        error: "Erreur lors de la déconnexion.",
      });
    }
  } else {
    // Utilisateur non connecté - redirection vers l'accueil
    res.status(200).json({
      message: "Utilisateur non connecté.",
      redirect: "/",
    });
  }
});

module.exports = router;
