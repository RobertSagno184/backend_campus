const express = require("express");
const { PrismaClient } = require("@prisma/client");
const { convertBigIntToNumber } = require("../../utils/constants");

const router = express.Router();
const prisma = new PrismaClient();

// =============================================================================
// ROUTES CRUD POUR LES PUBLICITÉS
// =============================================================================

// Créer une nouvelle publicité
router.post("/creer", async (req, res) => {
  try {
    const {
      titre,
      titreEn,
      titreFr,
      description,
      descriptionEn,
      descriptionFr,
      urlImage,
      urlCible,
      categorie,
      estActif = true,
      priorite = 0,
      cibleGeo
    } = req.body;

    // Validation des champs obligatoires
    if (!titre || !urlCible || !categorie) {
      return res.status(400).json({
        error: "Champs obligatoires manquants",
        details: "titre, urlCible et categorie sont requis"
      });
    }

    // Utiliser les valeurs par défaut pour les champs multilingues si vides
    const finalTitreEn = titreEn || titre;
    const finalTitreFr = titreFr || titre;
    const finalDescription = description || "";
    const finalDescriptionEn = descriptionEn || finalDescription;
    const finalDescriptionFr = descriptionFr || finalDescription;

    const publicite = await prisma.publicite.create({
      data: {
        id: `pub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        titre,
        titreEn: finalTitreEn,
        titreFr: finalTitreFr,
        description: finalDescription,
        descriptionEn: finalDescriptionEn,
        descriptionFr: finalDescriptionFr,
        urlImage,
        urlCible,
        categorie,
        estActif,
        priorite,
        cibleGeo: cibleGeo ? JSON.parse(cibleGeo) : null,
        modifieA: new Date()
      }
    });

    res.status(201).json(convertBigIntToNumber({
      message: "Publicité créée avec succès",
      publicite
    }));
  } catch (error) {
    console.error("Erreur lors de la création de la publicité:", error);
    res.status(500).json({
      error: "Erreur lors de la création de la publicité",
      details: error.message
    });
  }
});

// Récupérer toutes les publicités
router.get("/lire", async (req, res) => {
  try {
    const {
      page = 1,
      limite = 50,
      categorie,
      estActif,
      search
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limite);
    const take = parseInt(limite);

    // Construction des filtres
    const where = {};
    
    if (categorie) {
      where.categorie = categorie;
    }
    
    if (estActif !== undefined) {
      where.estActif = estActif === 'true';
    }
    
    if (search) {
      where.OR = [
        { titre: { contains: search, mode: 'insensitive' } },
        { titreEn: { contains: search, mode: 'insensitive' } },
        { titreFr: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { descriptionEn: { contains: search, mode: 'insensitive' } },
        { descriptionFr: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [publicites, total] = await Promise.all([
      prisma.publicite.findMany({
        where,
        skip,
        take,
        orderBy: [
          { priorite: 'desc' },
          { creeA: 'desc' }
        ]
      }),
      prisma.publicite.count({ where })
    ]);

    const totalPages = Math.ceil(total / take);

    res.status(200).json(convertBigIntToNumber({
      message: "Publicités récupérées avec succès",
      publicites,
      pagination: {
        page: parseInt(page),
        limite: parseInt(limite),
        total,
        totalPages
      }
    }));
  } catch (error) {
    console.error("Erreur lors de la récupération des publicités:", error);
    res.status(500).json({
      error: "Erreur lors de la récupération des publicités",
      details: error.message
    });
  }
});

// Récupérer une publicité par ID
router.get("/recuperer/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const publicite = await prisma.publicite.findUnique({
      where: { id }
    });

    if (!publicite) {
      return res.status(404).json({
        error: "Publicité non trouvée",
        details: `Aucune publicité trouvée avec l'ID: ${id}`
      });
    }

    res.status(200).json(convertBigIntToNumber({
      message: "Publicité récupérée avec succès",
      publicite
    }));
  } catch (error) {
    console.error("Erreur lors de la récupération de la publicité:", error);
    res.status(500).json({
      error: "Erreur lors de la récupération de la publicité",
      details: error.message
    });
  }
});

// Modifier une publicité
router.put("/modifier/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const {
      titre,
      titreEn,
      titreFr,
      description,
      descriptionEn,
      descriptionFr,
      urlImage,
      urlCible,
      categorie,
      estActif,
      priorite,
      cibleGeo
    } = req.body;

    // Vérifier que la publicité existe
    const publiciteExistante = await prisma.publicite.findUnique({
      where: { id }
    });

    if (!publiciteExistante) {
      return res.status(404).json({
        error: "Publicité non trouvée",
        details: `Aucune publicité trouvée avec l'ID: ${id}`
      });
    }

    const publicite = await prisma.publicite.update({
      where: { id },
      data: {
        ...(titre && { titre }),
        ...(titreEn && { titreEn }),
        ...(titreFr && { titreFr }),
        ...(description && { description }),
        ...(descriptionEn && { descriptionEn }),
        ...(descriptionFr && { descriptionFr }),
        ...(urlImage !== undefined && { urlImage }),
        ...(urlCible && { urlCible }),
        ...(categorie && { categorie }),
        ...(estActif !== undefined && { estActif }),
        ...(priorite !== undefined && { priorite }),
        ...(cibleGeo !== undefined && { cibleGeo: cibleGeo ? JSON.parse(cibleGeo) : null }),
        modifieA: new Date()
      }
    });

    res.status(200).json(convertBigIntToNumber({
      message: "Publicité modifiée avec succès",
      publicite
    }));
  } catch (error) {
    console.error("Erreur lors de la modification de la publicité:", error);
    res.status(500).json({
      error: "Erreur lors de la modification de la publicité",
      details: error.message
    });
  }
});

// Supprimer une publicité
router.delete("/suprimer/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Vérifier que la publicité existe
    const publiciteExistante = await prisma.publicite.findUnique({
      where: { id }
    });

    if (!publiciteExistante) {
      return res.status(404).json({
        error: "Publicité non trouvée",
        details: `Aucune publicité trouvée avec l'ID: ${id}`
      });
    }

    await prisma.publicite.delete({
      where: { id }
    });

    res.status(200).json(convertBigIntToNumber({
      message: "Publicité supprimée avec succès"
    }));
  } catch (error) {
    console.error("Erreur lors de la suppression de la publicité:", error);
    res.status(500).json({
      error: "Erreur lors de la suppression de la publicité",
      details: error.message
    });
  }
});

// =============================================================================
// ROUTES DE STATISTIQUES
// =============================================================================

// Obtenir les statistiques générales des publicités
router.get("/stats/general", async (req, res) => {
  try {
    const [
      total,
      actives,
      inactives,
      parCategorie,
      parPriorite
    ] = await Promise.all([
      prisma.publicite.count(),
      prisma.publicite.count({ where: { estActif: true } }),
      prisma.publicite.count({ where: { estActif: false } }),
      prisma.publicite.groupBy({
        by: ['categorie'],
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } }
      }),
      prisma.publicite.groupBy({
        by: ['priorite'],
        _count: { id: true },
        orderBy: { priorite: 'desc' }
      })
    ]);

    res.status(200).json(convertBigIntToNumber({
      message: "Statistiques récupérées avec succès",
      total,
      actives,
      inactives,
      parCategorie,
      parPriorite
    }));
  } catch (error) {
    console.error("Erreur lors de la récupération des statistiques:", error);
    res.status(500).json({
      error: "Erreur lors de la récupération des statistiques",
      details: error.message
    });
  }
});

// =============================================================================
// ROUTES SPÉCIALISÉES
// =============================================================================

// Récupérer les publicités actives par catégorie
router.get("/actives/:categorie", async (req, res) => {
  try {
    const { categorie } = req.params;
    const { limite = 10 } = req.query;

    const publicites = await prisma.publicite.findMany({
      where: {
        categorie,
        estActif: true
      },
      take: parseInt(limite),
      orderBy: [
        { priorite: 'desc' },
        { creeA: 'desc' }
      ]
    });

    res.status(200).json(convertBigIntToNumber({
      message: "Publicités actives récupérées avec succès",
      publicites
    }));
  } catch (error) {
    console.error("Erreur lors de la récupération des publicités actives:", error);
    res.status(500).json({
      error: "Erreur lors de la récupération des publicités actives",
      details: error.message
    });
  }
});

// Basculer l'état actif/inactif d'une publicité
router.patch("/toggle/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const publiciteExistante = await prisma.publicite.findUnique({
      where: { id }
    });

    if (!publiciteExistante) {
      return res.status(404).json({
        error: "Publicité non trouvée",
        details: `Aucune publicité trouvée avec l'ID: ${id}`
      });
    }

    const publicite = await prisma.publicite.update({
      where: { id },
      data: {
        estActif: !publiciteExistante.estActif,
        modifieA: new Date()
      }
    });

    res.status(200).json(convertBigIntToNumber({
      message: `Publicité ${publicite.estActif ? 'activée' : 'désactivée'} avec succès`,
      publicite
    }));
  } catch (error) {
    console.error("Erreur lors du basculement de l'état de la publicité:", error);
    res.status(500).json({
      error: "Erreur lors du basculement de l'état de la publicité",
      details: error.message
    });
  }
});

module.exports = router;
