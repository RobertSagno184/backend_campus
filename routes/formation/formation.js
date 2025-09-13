const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const { convertBigIntToNumber } = require("../../utils/constants");
const prisma = new PrismaClient();

// ==================== CREATE ====================

// Créer une formation
router.post("/creer", async (req, res) => {
  const {
    nom,
    nomEn,
    nomFr,
    niveau,
    domaine,
    duree,
    diplome,
    langueEnseignement,
    coutAnnuel,
    description,
    descriptionEn,
    descriptionFr,
    prerequis,
    debouches,
  } = req.body;

  // Validation des champs obligatoires
  if (!nom || !nomEn || !nomFr) {
    return res.status(400).json({
      error: "Les champs nom, nomEn et nomFr sont obligatoires.",
    });
  }

  try {
    // Vérifier si une formation avec le même nom existe déjà
    const existingFormation = await prisma.formation.findFirst({
      where: {
        OR: [{ nom }, { nomEn }, { nomFr }],
      },
    });

    if (existingFormation) {
      return res.status(400).json({
        error: "Une formation avec ce nom existe déjà.",
      });
    }

    // Préparer les données pour la création
    const formationData = {
      nom,
      nomEn,
      nomFr,
    };

    // Ajouter les champs optionnels s'ils sont fournis
    if (niveau) formationData.niveau = niveau;
    if (domaine) formationData.domaine = domaine;
    if (duree) formationData.duree = duree;
    if (diplome) formationData.diplome = diplome;
    if (langueEnseignement)
      formationData.langueEnseignement = langueEnseignement;
    if (coutAnnuel) formationData.coutAnnuel = coutAnnuel;
    if (description) formationData.description = description;
    if (descriptionEn) formationData.descriptionEn = descriptionEn;
    if (descriptionFr) formationData.descriptionFr = descriptionFr;
    if (prerequis) formationData.prerequis = prerequis;
    if (debouches) formationData.debouches = debouches;

    // Créer la formation
    const formation = await prisma.formation.create({
      data: formationData,
    });

    res.status(201).json({
      message: "Formation créée avec succès",
      formation,
    });
  } catch (error) {
    console.error("Erreur lors de la création :", error);
    res.status(500).json({
      error: "Erreur lors de la création de la formation.",
      details: error.message,
    });
  }
});

// ==================== READ ====================

// Récupérer toutes les formations avec pagination
router.get("/lire", async (req, res) => {
  const {
    page = 1,
    limit = 20,
    niveau,
    domaine,
    langueEnseignement,
    duree,
  } = req.query;

  try {
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    // Construire les filtres
    const where = {};
    if (niveau) where.niveau = { contains: niveau};
    if (domaine) where.domaine = { contains: domaine};
    if (langueEnseignement)
      where.langueEnseignement = {
        contains: langueEnseignement,
      };
    if (duree) where.duree = { contains: duree};

    const [formations, total] = await Promise.all([
      prisma.formation.findMany({
        where,
        orderBy: [{ nom: "asc" }],
        skip,
        take,
        select: {
          id: true,
          nom: true,
          nomEn: true,
          nomFr: true,
          niveau: true,
          domaine: true,
          duree: true,
          diplome: true,
          langueEnseignement: true,
          coutAnnuel: true,
          description: true,
          creeA: true,
          modifieA: true,
        },
      }),
      prisma.formation.count({ where }),
    ]);

    res.status(200).json({
      message: "Formations récupérées avec succès",
      formations,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Erreur lors de la récupération :", error);
    res.status(500).json({
      error: "Erreur lors de la récupération des formations.",
      details: error.message,
    });
  }
});

// Récupérer une formation par ID
router.get("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const formation = await prisma.formation.findUnique({
      where: { id },
      include: {
        universiteFormations: {
          include: {
            universite: {
              select: {
                id: true,
                nom: true,
                nomEn: true,
                nomFr: true,
                pays: true,
                siteWeb: true,
                classement: true,
              },
            },
          },
        },
        utilisateursFavoris: {
          include: {
            utilisateur: {
              select: {
                id: true,
                nom: true,
                prenom: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!formation) {
      return res.status(404).json({
        error: "Formation non trouvée.",
      });
    }

    res.status(200).json({
      message: "Formation récupérée avec succès",
      formation,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération :", error);
    res.status(500).json({
      error: "Erreur lors de la récupération de la formation.",
      details: error.message,
    });
  }
});

// Rechercher des formations
router.get("/rechercher/:terme", async (req, res) => {
  const { terme } = req.params;
  const { niveau, domaine, limit = 20 } = req.query;

  try {
    const where = {
      OR: [
        { nom: { contains: terme,  } },
        { nomEn: { contains: terme,  } },
        { nomFr: { contains: terme,  } },
        { description: { contains: terme,  } },
        { descriptionEn: { contains: terme,  } },
        { descriptionFr: { contains: terme,  } },
      ],
    };

    const filters = [];
    if (niveau)
      filters.push({ niveau: { contains: niveau,  } });
    if (domaine)
      filters.push({ domaine: { contains: domaine,  } });

    if (filters.length > 0) {
      where.AND = filters;
    }

    const formations = await prisma.formation.findMany({
      where,
      select: {
        id: true,
        nom: true,
        nomEn: true,
        nomFr: true,
        niveau: true,
        domaine: true,
        duree: true,
        diplome: true,
        langueEnseignement: true,
        coutAnnuel: true,
        description: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { nom: "asc" },
      take: parseInt(limit),
    });

    res.status(200).json({
      message: "Recherche effectuée avec succès",
      formations,
      total: formations.length,
    });
  } catch (error) {
    console.error("Erreur lors de la recherche :", error);
    res.status(500).json({
      error: "Erreur lors de la recherche de formations.",
      details: error.message,
    });
  }
});

// Récupérer les formations par domaine
router.get("/domaine/:nomDomaine", async (req, res) => {
  const { nomDomaine } = req.params;
  const { niveau, limit = 50 } = req.query;

  try {
    const where = {
      domaine: { contains: nomDomaine,  },
    };

    if (niveau) {
      where.niveau = { contains: niveau};
    }

    const formations = await prisma.formation.findMany({
      where,
      select: {
        id: true,
        nom: true,
        nomEn: true,
        nomFr: true,
        niveau: true,
        domaine: true,
        duree: true,
        diplome: true,
        langueEnseignement: true,
        coutAnnuel: true,
        description: true,
        _count: {
          universiteFormations: true,
        },
      },
      orderBy: { nom: "asc" },
      take: parseInt(limit),
    });

    res.status(200).json({
      message: `Formations du domaine ${nomDomaine} récupérées avec succès`,
      formations,
      total: formations.length,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération par domaine :", error);
    res.status(500).json({
      error: "Erreur lors de la récupération des formations par domaine.",
      details: error.message,
    });
  }
});

// Récupérer les formations par niveau
router.get("/niveau/:nomNiveau", async (req, res) => {
  const { nomNiveau } = req.params;
  const { domaine, limit = 50 } = req.query;

  try {
    const where = {
      niveau: { contains: nomNiveau,  },
    };

    if (domaine) {
      where.domaine = { contains: domaine};
    }

    const formations = await prisma.formation.findMany({
      where,
      select: {
        id: true,
        nom: true,
        nomEn: true,
        nomFr: true,
        niveau: true,
        domaine: true,
        duree: true,
        diplome: true,
        langueEnseignement: true,
        coutAnnuel: true,
        description: true,
        _count: {
          universiteFormations: true,
        },
      },
      orderBy: { nom: "asc" },
      take: parseInt(limit),
    });

    res.status(200).json({
      message: `Formations de niveau ${nomNiveau} récupérées avec succès`,
      formations,
      total: formations.length,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération par niveau :", error);
    res.status(500).json({
      error: "Erreur lors de la récupération des formations par niveau.",
      details: error.message,
    });
  }
});

// ==================== UPDATE ====================

// Modifier une formation
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const {
    nom,
    nomEn,
    nomFr,
    niveau,
    domaine,
    duree,
    diplome,
    langueEnseignement,
    coutAnnuel,
    description,
    descriptionEn,
    descriptionFr,
    prerequis,
    debouches,
  } = req.body;

  try {
    // Vérifier si la formation existe
    const formationExistante = await prisma.formation.findUnique({
      where: { id },
    });

    if (!formationExistante) {
      return res.status(404).json({
        error: "Formation non trouvée.",
      });
    }

    // Vérifier si le nouveau nom n'est pas déjà utilisé par une autre formation
    if (nom || nomEn || nomFr) {
      const nomExiste = await prisma.formation.findFirst({
        where: {
          OR: [
            nom && nom !== formationExistante.nom ? { nom } : null,
            nomEn && nomEn !== formationExistante.nomEn ? { nomEn } : null,
            nomFr && nomFr !== formationExistante.nomFr ? { nomFr } : null,
          ].filter(Boolean),
          id: { not: id },
        },
      });

      if (nomExiste) {
        return res.status(400).json({
          error: "Une autre formation avec ce nom existe déjà.",
        });
      }
    }

    // Préparer les données à mettre à jour
    const dataToUpdate = {};

    if (nom) dataToUpdate.nom = nom;
    if (nomEn) dataToUpdate.nomEn = nomEn;
    if (nomFr) dataToUpdate.nomFr = nomFr;
    if (niveau !== undefined) dataToUpdate.niveau = niveau;
    if (domaine !== undefined) dataToUpdate.domaine = domaine;
    if (duree !== undefined) dataToUpdate.duree = duree;
    if (diplome !== undefined) dataToUpdate.diplome = diplome;
    if (langueEnseignement !== undefined)
      dataToUpdate.langueEnseignement = langueEnseignement;
    if (coutAnnuel !== undefined) dataToUpdate.coutAnnuel = coutAnnuel;
    if (description !== undefined) dataToUpdate.description = description;
    if (descriptionEn !== undefined) dataToUpdate.descriptionEn = descriptionEn;
    if (descriptionFr !== undefined) dataToUpdate.descriptionFr = descriptionFr;
    if (prerequis !== undefined) dataToUpdate.prerequis = prerequis;
    if (debouches !== undefined) dataToUpdate.debouches = debouches;

    // Mettre à jour la formation
    const formationMiseAJour = await prisma.formation.update({
      where: { id },
      data: dataToUpdate,
    });

    res.status(200).json({
      message: "Formation modifiée avec succès",
      formation: formationMiseAJour,
    });
  } catch (error) {
    console.error("Erreur lors de la modification :", error);
    res.status(500).json({
      error: "Erreur lors de la modification de la formation.",
      details: error.message,
    });
  }
});

// ==================== DELETE ====================

// Supprimer une formation
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    // Vérifier si la formation existe
    const formation = await prisma.formation.findUnique({
      where: { id },
    });

    if (!formation) {
      return res.status(404).json({
        error: "Formation non trouvée.",
      });
    }

    // Supprimer la formation (les relations seront supprimées en cascade)
    await prisma.formation.delete({
      where: { id },
    });

    res.status(200).json({
      message: "Formation supprimée avec succès",
    });
  } catch (error) {
    console.error("Erreur lors de la suppression :", error);
    res.status(500).json({
      error: "Erreur lors de la suppression de la formation.",
      details: error.message,
    });
  }
});

// Supprimer plusieurs formations
router.delete("/", async (req, res) => {
  const { ids } = req.body;

  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({
      error: "Une liste d'IDs valide est requise.",
    });
  }

  try {
    // Supprimer les formations
    const result = await prisma.formation.deleteMany({
      where: { id: { in: ids } },
    });

    res.status(200).json({
      message: `${result.count} formation(s) supprimée(s) avec succès`,
      supprimesCount: result.count,
    });
  } catch (error) {
    console.error("Erreur lors de la suppression multiple :", error);
    res.status(500).json({
      error: "Erreur lors de la suppression des formations.",
      details: error.message,
    });
  }
});

// ==================== RELATIONS ====================

// Associer une formation à une université
router.post("/:formationId/universite/:universiteId", async (req, res) => {
  const { formationId, universiteId } = req.params;
  const { capacite, fraisInscription, dateDebut, dateFin, langueEnseignement } =
    req.body;

  try {
    // Vérifier si l'association existe déjà
    const associationExistante = await prisma.universiteFormation.findFirst({
      where: {
        universiteId,
        formationId,
      },
    });

    if (associationExistante) {
      return res.status(400).json({
        error: "Cette association formation-université existe déjà.",
      });
    }

    // Préparer les données pour la création
    const associationData = {
      universiteId,
      formationId,
    };

    // Ajouter les champs optionnels
    if (capacite) associationData.capacite = parseInt(capacite);
    if (fraisInscription) associationData.fraisInscription = fraisInscription;
    if (dateDebut) associationData.dateDebut = new Date(dateDebut);
    if (dateFin) associationData.dateFin = new Date(dateFin);
    if (langueEnseignement)
      associationData.langueEnseignement = langueEnseignement;

    // Créer l'association
    const association = await prisma.universiteFormation.create({
      data: associationData,
      include: {
        formation: {
          select: {
            nom: true,
            nomEn: true,
            nomFr: true,
            niveau: true,
            domaine: true,
          },
        },
        universite: {
          select: {
            nom: true,
            nomEn: true,
            nomFr: true,
            pays: true,
          },
        },
      },
    });

    res.status(201).json({
      message: "Association formation-université créée avec succès",
      association,
    });
  } catch (error) {
    console.error("Erreur lors de l'association :", error);
    res.status(500).json({
      error: "Erreur lors de l'association formation-université.",
      details: error.message,
    });
  }
});

// Modifier l'association formation-université
router.put("/:formationId/universite/:universiteId", async (req, res) => {
  const { formationId, universiteId } = req.params;
  const { capacite, fraisInscription, dateDebut, dateFin, langueEnseignement } =
    req.body;

  try {
    // Vérifier si l'association existe
    const association = await prisma.universiteFormation.findFirst({
      where: {
        universiteId,
        formationId,
      },
    });

    if (!association) {
      return res.status(404).json({
        error: "Association formation-université non trouvée.",
      });
    }

    // Préparer les données à mettre à jour
    const dataToUpdate = {};
    if (capacite !== undefined)
      dataToUpdate.capacite = capacite ? parseInt(capacite) : null;
    if (fraisInscription !== undefined)
      dataToUpdate.fraisInscription = fraisInscription;
    if (dateDebut !== undefined)
      dataToUpdate.dateDebut = dateDebut ? new Date(dateDebut) : null;
    if (dateFin !== undefined)
      dataToUpdate.dateFin = dateFin ? new Date(dateFin) : null;
    if (langueEnseignement !== undefined)
      dataToUpdate.langueEnseignement = langueEnseignement;

    // Mettre à jour l'association
    const associationMiseAJour = await prisma.universiteFormation.update({
      where: { id: association.id },
      data: dataToUpdate,
      include: {
        formation: {
          select: {
            nom: true,
            nomEn: true,
            nomFr: true,
            niveau: true,
            domaine: true,
          },
        },
        universite: {
          select: {
            nom: true,
            nomEn: true,
            nomFr: true,
            pays: true,
          },
        },
      },
    });

    res.status(200).json({
      message: "Association formation-université modifiée avec succès",
      association: associationMiseAJour,
    });
  } catch (error) {
    console.error("Erreur lors de la modification de l'association :", error);
    res.status(500).json({
      error: "Erreur lors de la modification de l'association.",
      details: error.message,
    });
  }
});

// Dissocier une formation d'une université
router.delete("/:formationId/universite/:universiteId", async (req, res) => {
  const { formationId, universiteId } = req.params;

  try {
    const association = await prisma.universiteFormation.findFirst({
      where: {
        universiteId,
        formationId,
      },
    });

    if (!association) {
      return res.status(404).json({
        error: "Association formation-université non trouvée.",
      });
    }

    await prisma.universiteFormation.delete({
      where: { id: association.id },
    });

    res.status(200).json({
      message: "Association formation-université supprimée avec succès",
    });
  } catch (error) {
    console.error("Erreur lors de la dissociation :", error);
    res.status(500).json({
      error: "Erreur lors de la dissociation formation-université.",
      details: error.message,
    });
  }
});

// ==================== UTILITAIRES ====================

// Obtenir les statistiques des formations
router.get("/stats/general", async (req, res) => {
  try {
    const [total, parNiveau, parDomaine, plusPopulaires] = await Promise.all([
      prisma.formation.count(),
      prisma.formation.groupBy({
        by: ["niveau"],
        _count: { id: true },
        orderBy: { _count: { id: "desc" } },
      }),
      prisma.formation.groupBy({
        by: ["domaine"],
        _count: { id: true },
        orderBy: { _count: { id: "desc" } },
        take: 10,
      }),
      prisma.formation.findMany({
        select: {
          id: true,
          nom: true,
          nomEn: true,
          nomFr: true,
          niveau: true,
          domaine: true,
        },
        orderBy: {
          utilisateursFavoris: {
            _count: "desc",
          },
        },
        take: 10,
      }),
    ]);

    res.status(200).json({
      message: "Statistiques récupérées avec succès",
      stats: convertBigIntToNumber({
        total,
        parNiveau: parNiveau.filter((item) => item.niveau !== null),
        parDomaine: parDomaine.filter((item) => item.domaine !== null),
        plusPopulaires,
      }),
    });
  } catch (error) {
    console.error("Erreur lors du calcul des statistiques :", error);
    res.status(500).json({
      error: "Erreur lors de la récupération des statistiques.",
      details: error.message,
    });
  }
});

// Obtenir les domaines disponibles
router.get("/domaines/liste", async (req, res) => {
  try {
    const domaines = await prisma.formation.findMany({
      select: {
        domaine: true,
      },
      where: {
        domaine: { not: null },
      },
      distinct: ["domaine"],
      orderBy: { domaine: "asc" },
    });

    const listeDomainess = domaines.map((item) => item.domaine).filter(Boolean);

    res.status(200).json({
      message: "Domaines récupérés avec succès",
      domaines: listeDomainess,
      total: listeDomainess.length,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des domaines :", error);
    res.status(500).json({
      error: "Erreur lors de la récupération des domaines.",
      details: error.message,
    });
  }
});

// Obtenir les niveaux disponibles
router.get("/niveaux/liste", async (req, res) => {
  try {
    const niveaux = await prisma.formation.findMany({
      select: {
        niveau: true,
      },
      where: {
        niveau: { not: null },
      },
      distinct: ["niveau"],
      orderBy: { niveau: "asc" },
    });

    const listeNiveaux = niveaux.map((item) => item.niveau).filter(Boolean);

    res.status(200).json({
      message: "Niveaux récupérés avec succès",
      niveaux: listeNiveaux,
      total: listeNiveaux.length,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des niveaux :", error);
    res.status(500).json({
      error: "Erreur lors de la récupération des niveaux.",
      details: error.message,
    });
  }
});

// ==================== DÉTAILS FORMATION ====================

// Créer ou mettre à jour les détails d'une formation
router.post("/creer/:id/details", async (req, res) => {
  const { id } = req.params;
  const { contenuFr, contenuEn, lienFr, lienEn, videoFr, videoEn } = req.body;

  // Validation des champs obligatoires
  if (!contenuFr || !contenuEn) {
    return res.status(400).json({
      error: "Les champs contenuFr et contenuEn sont obligatoires.",
    });
  }

  try {
    // Vérifier si la formation existe
    const formation = await prisma.formation.findUnique({
      where: { id },
      include: { detailFormation: true },
    });

    if (!formation) {
      return res.status(404).json({
        error: "Formation non trouvée.",
      });
    }

    // Préparer les données pour les détails
    const detailData = {
      contenuFr,
      contenuEn,
      formationId: id,
    };

    // Ajouter les champs optionnels s'ils sont fournis
    if (lienFr) detailData.lienFr = lienFr;
    if (lienEn) detailData.lienEn = lienEn;
    if (videoFr) detailData.videoFr = videoFr;
    if (videoEn) detailData.videoEn = videoEn;

    let detailFormation;

    if (formation.detailFormation) {
      // Mettre à jour les détails existants
      detailFormation = await prisma.detailFormation.update({
        where: { formationId: id },
        data: {
          contenuFr,
          contenuEn,
          ...(lienFr !== undefined && { lienFr }),
          ...(lienEn !== undefined && { lienEn }),
          ...(videoFr !== undefined && { videoFr }),
          ...(videoEn !== undefined && { videoEn }),
        },
      });
    } else {
      // Créer de nouveaux détails
      detailFormation = await prisma.detailFormation.create({
        data: detailData,
      });
    }

    res.status(201).json({
      message: formation.detailFormation
        ? "Détails de la formation mis à jour avec succès"
        : "Détails de la formation créés avec succès",
      detailFormation,
    });
  } catch (error) {
    console.error("Erreur lors de la gestion des détails :", error);
    res.status(500).json({
      error: "Erreur lors de la gestion des détails de la formation.",
      details: error.message,
    });
  }
});

// Récupérer les détails d'une formation
router.get("/recuperer/:id/details", async (req, res) => {
  const { id } = req.params;

  try {
    const formation = await prisma.formation.findUnique({
      where: { id },
      include: {
        detailFormation: true,
      },
    });

    if (!formation) {
      return res.status(404).json({
        error: "Formation non trouvée.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Détails de la formation récupérés avec succès",
      formation,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des détails :", error);
    res.status(500).json({
      error: "Erreur lors de la récupération des détails de la formation.",
      details: error.message,
    });
  }
});

// Modifier uniquement les détails d'une formation
router.put("/modifier/:id/details", async (req, res) => {
  const { id } = req.params;
  const { contenuFr, contenuEn, lienFr, lienEn, videoFr, videoEn } = req.body;

  try {
    // Vérifier si la formation et ses détails existent
    const formation = await prisma.formation.findUnique({
      where: { id },
      include: { detailFormation: true },
    });

    if (!formation) {
      return res.status(404).json({
        error: "Formation non trouvée.",
      });
    }

    if (!formation.detailFormation) {
      return res.status(404).json({
        error:
          "Détails de la formation non trouvés. Utilisez POST pour les créer.",
      });
    }

    // Préparer les données à mettre à jour
    const dataToUpdate = {};
    if (contenuFr !== undefined) dataToUpdate.contenuFr = contenuFr;
    if (contenuEn !== undefined) dataToUpdate.contenuEn = contenuEn;
    if (lienFr !== undefined) dataToUpdate.lienFr = lienFr;
    if (lienEn !== undefined) dataToUpdate.lienEn = lienEn;
    if (videoFr !== undefined) dataToUpdate.videoFr = videoFr;
    if (videoEn !== undefined) dataToUpdate.videoEn = videoEn;

    // Mettre à jour les détails
    const detailFormationMiseAJour = await prisma.detailFormation.update({
      where: { formationId: id },
      data: dataToUpdate,
    });

    res.status(200).json({
      message: "Détails de la formation modifiés avec succès",
      detailFormation: detailFormationMiseAJour,
    });
  } catch (error) {
    console.error("Erreur lors de la modification des détails :", error);
    res.status(500).json({
      error: "Erreur lors de la modification des détails de la formation.",
      details: error.message,
    });
  }
});

// Supprimer les détails d'une formation
router.delete("/suprimer/:id/details", async (req, res) => {
  const { id } = req.params;

  try {
    // Vérifier si la formation et ses détails existent
    const formation = await prisma.formation.findUnique({
      where: { id },
      include: { detailFormation: true },
    });

    if (!formation) {
      return res.status(404).json({
        error: "Formation non trouvée.",
      });
    }

    if (!formation.detailFormation) {
      return res.status(404).json({
        error: "Aucun détail à supprimer pour cette formation.",
      });
    }

    // Supprimer les détails
    await prisma.detailFormation.delete({
      where: { formationId: id },
    });

    res.status(200).json({
      message: "Détails de la formation supprimés avec succès",
    });
  } catch (error) {
    console.error("Erreur lors de la suppression des détails :", error);
    res.status(500).json({
      error: "Erreur lors de la suppression des détails de la formation.",
      details: error.message,
    });
  }
});

// Récupérer toutes les formations avec leurs détails
router.get("/avec-details/lire", async (req, res) => {
  const {
    page = 1,
    limit = 20,
    niveau,
    domaine,
    langueEnseignement,
    duree,
    avecDetails = false, // Paramètre pour filtrer seulement les formations avec détails
  } = req.query;

  try {
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    // Construire les filtres
    const where = {};
    if (niveau) where.niveau = { contains: niveau};
    if (domaine) where.domaine = { contains: domaine};
    if (langueEnseignement)
      where.langueEnseignement = {
        contains: langueEnseignement,
      };
    if (duree) where.duree = { contains: duree};

    // Filtrer les formations qui ont des détails si demandé
    if (avecDetails === "true") {
      where.detailFormation = { isNot: null };
    }

    const [formations, total] = await Promise.all([
      prisma.formation.findMany({
        where,
        orderBy: [{ nom: "asc" }],
        skip,
        take,
        include: {
          detailFormation: true,
        },
      }),
      prisma.formation.count({ where }),
    ]);

    res.status(200).json({
      message: "Formations avec détails récupérées avec succès",
      formations,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Erreur lors de la récupération avec détails :", error);
    res.status(500).json({
      error: "Erreur lors de la récupération des formations avec détails.",
      details: error.message,
    });
  }
});

// ==================== LIKE/UNLIKE FORMATION ====================

// Like/Unlike une formation
router.post("/:formationId/like", async (req, res) => {
  const { formationId } = req.params;
  const { userId, action } = req.body;

  // Validation des paramètres
  if (!userId) {
    return res.status(400).json({
      success: false,
      error: "L'ID utilisateur est requis.",
    });
  }

  if (!action || (action !== "like" && action !== "unlike")) {
    return res.status(400).json({
      success: false,
      error: "L'action doit être 'like' ou 'unlike'.",
    });
  }

  try {
    // Vérifier si la formation existe
    const formation = await prisma.formation.findUnique({
      where: { id: formationId },
      select: { id: true, nom: true },
    });

    if (!formation) {
      return res.status(404).json({
        success: false,
        error: "Formation non trouvée.",
      });
    }

    // Vérifier si l'utilisateur existe
    const utilisateur = await prisma.utilisateur.findUnique({
      where: { id: parseInt(userId) },
      select: { id: true, nom: true, prenom: true },
    });

    if (!utilisateur) {
      return res.status(404).json({
        success: false,
        error: "Utilisateur non trouvé.",
      });
    }

    // Vérifier si le like existe déjà
    const likeExistant = await prisma.favoriFormation.findFirst({
      where: {
        utilisateurId: parseInt(userId),
        formationId: formationId,
      },
    });

    if (action === "like") {
      if (likeExistant) {
        return res.status(200).json({
          success: true,
          message: "Formation déjà dans les favoris.",
          data: {
            liked: true,
            formationId: formationId,
            alreadyLiked: true,
          },
        });
      }

      // Créer le favori
      const nouveauFavori = await prisma.favoriFormation.create({
        data: {
          utilisateurId: parseInt(userId),
          formationId: formationId,
        },
        include: {
          formation: {
            select: {
              id: true,
              nom: true,
              nomEn: true,
              nomFr: true,
              niveau: true,
              domaine: true,
            },
          },
        },
      });

      return res.status(201).json({
        success: true,
        message: "Formation ajoutée aux favoris avec succès.",
        data: {
          liked: true,
          formationId: formationId,
          favori: nouveauFavori,
        },
      });
    } else if (action === "unlike") {
      if (!likeExistant) {
        return res.status(200).json({
          success: true,
          message: "Formation n'était pas dans les favoris.",
          data: {
            liked: false,
            formationId: formationId,
            wasNotLiked: true,
          },
        });
      }

      // Supprimer le favori
      await prisma.favoriFormation.delete({
        where: { id: likeExistant.id },
      });

      return res.status(200).json({
        success: true,
        message: "Formation retirée des favoris avec succès.",
        data: {
          liked: false,
          formationId: formationId,
        },
      });
    }
  } catch (error) {
    console.error("Erreur lors de la gestion du like :", error);

    // Gestion spécifique des erreurs Prisma
    if (error.code === "P2002") {
      return res.status(400).json({
        success: false,
        error: "Cette formation est déjà dans vos favoris.",
      });
    }

    if (error.code === "P2025") {
      return res.status(404).json({
        success: false,
        error: "Enregistrement non trouvé.",
      });
    }

    return res.status(500).json({
      success: false,
      error: "Erreur lors de la gestion des favoris.",
      details: error.message,
    });
  }
});

// ==================== FORMATIONS FAVORITES UTILISATEUR ====================

// Récupérer les formations favorites d'un utilisateur
router.get("/:userId/liked-formations", async (req, res) => {
  const { userId } = req.params;
  const {
    page = 1,
    limit = 20,
    sortBy = "creeA",
    sortOrder = "desc",
    niveau,
    domaine,
    pays,
    includeDetails = "false",
  } = req.query;

  try {
    // Validation de l'userId
    if (!userId || isNaN(parseInt(userId))) {
      return res.status(400).json({
        success: false,
        error: "ID utilisateur invalide.",
      });
    }

    // Vérifier si l'utilisateur existe
    const utilisateur = await prisma.utilisateur.findUnique({
      where: { id: parseInt(userId) },
      select: { id: true, nom: true, prenom: true },
    });

    if (!utilisateur) {
      return res.status(404).json({
        success: false,
        error: "Utilisateur non trouvé.",
      });
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    // Construire les filtres pour les formations
    const formationFilters = {};
    if (niveau) {
      formationFilters.niveau = { contains: niveau};
    }
    if (domaine) {
      formationFilters.domaine = { contains: domaine};
    }

    // Filtre par pays via les universités
    const universiteFilters = {};
    if (pays) {
      universiteFilters.pays = { contains: pays};
    }

    // Construire la requête de tri
    const orderBy = {};
    if (sortBy === "creeA" || sortBy === "likedAt") {
      orderBy.creeA = sortOrder === "asc" ? "asc" : "desc";
    } else if (sortBy === "formationName") {
      orderBy.formation = { nom: sortOrder === "asc" ? "asc" : "desc" };
    } else if (sortBy === "universityName") {
      // Pour trier par nom d'université, on devra faire un tri en mémoire
      orderBy.creeA = "desc"; // tri par défaut
    }

    const [favorisFormations, total] = await Promise.all([
      prisma.favoriFormation.findMany({
        where: {
          utilisateurId: parseInt(userId),
          formation: {
            ...formationFilters,
            // Si on filtre par pays, on doit s'assurer que la formation est disponible dans ce pays
            ...(pays && {
              universiteFormations: {
                some: {
                  universite: universiteFilters,
                },
              },
            }),
          },
        },
        orderBy,
        skip,
        take,
        include: {
          formation: {
            include: {
              universiteFormations: {
                include: {
                  universite: {
                    select: {
                      id: true,
                      nom: true,
                      nomEn: true,
                      nomFr: true,
                      pays: true,
                      siteWeb: true,
                      classement: true,
                      typeEtablissement: true,
                      villeUniversites: {
                        include: {
                          ville: {
                            select: {
                              nom: true,
                              nomEn: true,
                              nomFr: true,
                              latitude: true,
                              longitude: true,
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
              ...(includeDetails === "true" && {
                detailFormation: true,
              }),
            },
          },
        },
      }),
      prisma.favoriFormation.count({
        where: {
          utilisateurId: parseInt(userId),
          formation: {
            ...formationFilters,
            ...(pays && {
              universiteFormations: {
                some: {
                  universite: universiteFilters,
                },
              },
            }),
          },
        },
      }),
    ]);

    // Transformation des données pour correspondre au format attendu par le frontend
    const formattedData = favorisFormations.map((favori) => {
      // Trouver la première université (ou celle du pays filtré si applicable)
      let universiteSelectionne =
        favori.formation.universiteFormations[0]?.universite;

      if (pays && favori.formation.universiteFormations.length > 1) {
        const universiteFiltre = favori.formation.universiteFormations.find(
          (uf) => uf.universite.pays.toLowerCase().includes(pays.toLowerCase())
        );
        if (universiteFiltre) {
          universiteSelectionne = universiteFiltre.universite;
        }
      }

      return {
        id: favori.id,
        formation: {
          id: favori.formation.id,
          nom: favori.formation.nom,
          nomEn: favori.formation.nomEn,
          nomFr: favori.formation.nomFr,
          niveau: favori.formation.niveau,
          domaine: favori.formation.domaine,
          duree: favori.formation.duree,
          diplome: favori.formation.diplome,
          description: favori.formation.description,
          descriptionEn: favori.formation.descriptionEn,
          descriptionFr: favori.formation.descriptionFr,
          ...(includeDetails === "true" && {
            detailFormation: favori.formation.detailFormation,
          }),
        },
        universite: universiteSelectionne || {
          id: "unknown",
          nom: "Université non spécifiée",
          nomEn: "University not specified",
          nomFr: "Université non spécifiée",
          pays: "Non spécifié",
        },
        universiteFormation:
          favori.formation.universiteFormations.find(
            (uf) => uf.universite.id === universiteSelectionne?.id
          ) ||
          favori.formation.universiteFormations[0] ||
          {},
        likedAt: favori.creeA.toISOString(),
        // Statistiques supplémentaires
        totalUniversites: favori.formation.universiteFormations.length      };
    });

    // Tri en mémoire si nécessaire (pour le nom d'université)
    if (sortBy === "universityName") {
      formattedData.sort((a, b) => {
        const nameA = a.universite.nom.toLowerCase();
        const nameB = b.universite.nom.toLowerCase();
        if (sortOrder === "asc") {
          return nameA.localeCompare(nameB);
        } else {
          return nameB.localeCompare(nameA);
        }
      });
    }

    // Statistiques supplémentaires
    const stats = {
      totalFavoris: total,
      parNiveau: await prisma.favoriFormation
        .groupBy({
          by: ["formationId"],
          where: { utilisateurId: parseInt(userId) },
          _count: { id: true },
        })
        .then(async (results) => {
          const formations = await prisma.formation.findMany({
            where: { id: { in: results.map((r) => r.formationId) } },
            select: { niveau: true },
          });
          const niveaux = {};
          formations.forEach((f) => {
            if (f.niveau) {
              niveaux[f.niveau] = (niveaux[f.niveau] || 0) + 1;
            }
          });
          return niveaux;
        }),
      parDomaine: await prisma.favoriFormation
        .groupBy({
          by: ["formationId"],
          where: { utilisateurId: parseInt(userId) },
          _count: { id: true },
        })
        .then(async (results) => {
          const formations = await prisma.formation.findMany({
            where: { id: { in: results.map((r) => r.formationId) } },
            select: { domaine: true },
          });
          const domaines = {};
          formations.forEach((f) => {
            if (f.domaine) {
              domaines[f.domaine] = (domaines[f.domaine] || 0) + 1;
            }
          });
          return domaines;
        }),
    };

    res.status(200).json({
      success: true,
      message: "Formations favorites récupérées avec succès",
      data: formattedData,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
      stats,
      utilisateur: {
        id: utilisateur.id,
        nom: utilisateur.nom,
        prenom: utilisateur.prenom,
      },
    });
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des formations favorites :",
      error
    );

    // Gestion spécifique des erreurs Prisma
    if (error.code === "P2025") {
      return res.status(404).json({
        success: false,
        error: "Données non trouvées.",
      });
    }

    return res.status(500).json({
      success: false,
      error: "Erreur lors de la récupération des formations favorites.",
      details: error.message,
    });
  }
});

module.exports = router;
