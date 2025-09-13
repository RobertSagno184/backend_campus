const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const { convertBigIntToNumber } = require("../../utils/constants");
const prisma = new PrismaClient();

// ==================== CREATE ====================

// Créer une université
router.post("/creer", async (req, res) => {
  const {
    nom,
    nomEn,
    nomFr,
    pays,
    siteWeb,
    domaine,
    idRor,
    latitude,
    longitude,
    fournisseur,
    description,
    descriptionEn,
    descriptionFr,
    fondee,
    statut,
    classement,
  } = req.body;

  // Validation des champs obligatoires
  if (!nom || !nomEn || !nomFr || !pays || !fournisseur) {
    return res.status(400).json({
      error:
        "Les champs nom, nomEn, nomFr, pays et fournisseur sont obligatoires.",
    });
  }

  try {
    // Vérifier si une université avec le même nom existe déjà dans le même pays
    const existingUniversite = await prisma.universiteMondiale.findFirst({
      where: {
        AND: [{ nom }, { pays }],
      },
    });

    if (existingUniversite) {
      return res.status(400).json({
        error: "Une université avec ce nom existe déjà dans ce pays.",
      });
    }

    // Normaliser les noms pour la recherche
    const nomNorme = nom
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
    const paysNorme = pays
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

    // Préparer les données pour la création
    const universiteData = {
      nom,
      nomEn,
      nomFr,
      pays,
      nomNorme,
      paysNorme,
      fournisseur,
      dernierSync: BigInt(Date.now()),
    };

    // Ajouter les champs optionnels s'ils sont fournis
    if (siteWeb) universiteData.siteWeb = siteWeb;
    if (domaine) universiteData.domaine = domaine;
    if (idRor) universiteData.idRor = idRor;
    if (latitude) universiteData.latitude = parseFloat(latitude);
    if (longitude) universiteData.longitude = parseFloat(longitude);
    if (description) universiteData.description = description;
    if (descriptionEn) universiteData.descriptionEn = descriptionEn;
    if (descriptionFr) universiteData.descriptionFr = descriptionFr;
    if (fondee) universiteData.fondee = parseInt(fondee);
    if (statut) universiteData.statut = statut;
    if (classement) universiteData.classement = parseInt(classement);

    // Créer l'université
    const universite = await prisma.universiteMondiale.create({
      data: universiteData,
    });

    res.status(201).json(convertBigIntToNumber({
      message: "Université créée avec succès",
      universite,
    }));
  } catch (error) {
    console.error("Erreur lors de la création :", error);
    res.status(500).json({
      error: "Erreur lors de la création de l'université.",
      details: error.message,
    });
  }
});

// ==================== READ ====================

// Récupérer toutes les universités avec pagination
router.get("/lire", async (req, res) => {
  const {
    page = 1,
    limit = 20,
    pays,
    domaine,
    fournisseur,
    classementMin,
    classementMax,
  } = req.query;

  try {
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    // Construire les filtres
    const where = {};
    if (pays) where.pays = { contains: pays };
    if (domaine) where.domaine = { contains: domaine };
    if (fournisseur) where.fournisseur = fournisseur;
    if (classementMin || classementMax) {
      where.classement = {};
      if (classementMin) where.classement.gte = parseInt(classementMin);
      if (classementMax) where.classement.lte = parseInt(classementMax);
    }

    const [universites, total] = await Promise.all([
      prisma.universiteMondiale.findMany({
        where,
        orderBy: [{ classement: "asc" }, { nom: "asc" }],
        skip,
        take,
        select: {
          id: true,
          nom: true,
          nomEn: true,
          nomFr: true,
          pays: true,
          siteWeb: true,
          domaine: true,
          classement: true,
          fondee: true,
          statut: true,
          latitude: true,
          longitude: true,
          creeA: true,
          modifieA: true,
        },
      }),
      prisma.universiteMondiale.count({ where }),
    ]);

    res.status(200).json(convertBigIntToNumber({
      message: "Universités récupérées avec succès",
      universites,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    }));
  } catch (error) {
    console.error("Erreur lors de la récupération :", error);
    res.status(500).json({
      error: "Erreur lors de la récupération des universités.",
      details: error.message,
    });
  }
});

// Récupérer une université par ID
router.get("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const universite = await prisma.universiteMondiale.findUnique({
      where: { id },
      include: {
        villeUniversites: {
          include: {
            ville: true,
          },
        },
        universiteFormations: {
          include: {
            formation: {
              select: {
                id: true,
                nom: true,
                nomEn: true,
                nomFr: true,
                niveau: true,
                domaine: true,
                duree: true,
              },
            },
          },
        },
      },
    });

    if (!universite) {
      return res.status(404).json({
        error: "Université non trouvée.",
      });
    }

    res.status(200).json(convertBigIntToNumber({
      message: "Université récupérée avec succès",
      universite,
    }));
  } catch (error) {
    console.error("Erreur lors de la récupération :", error);
    res.status(500).json({
      error: "Erreur lors de la récupération de l'université.",
      details: error.message,
    });
  }
});

// Rechercher des universités
router.get("/rechercher/:terme", async (req, res) => {
  const { terme } = req.params;
  const { pays, limit = 20 } = req.query;

  try {
    const where = {
      OR: [
        { nom: { contains: terme } },
        { nomEn: { contains: terme } },
        { nomFr: { contains: terme } },
        { nomNorme: { contains: terme.toLowerCase() } },
      ],
    };

    if (pays) {
      where.AND = [{ pays: { contains: pays } }];
    }

    const universites = await prisma.universiteMondiale.findMany({
      where,
      select: {
        id: true,
        nom: true,
        nomEn: true,
        nomFr: true,
        pays: true,
        siteWeb: true,
        domaine: true,
        classement: true,
        fondee: true,
        statut: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: [{ classement: "asc" }, { nom: "asc" }],
      take: parseInt(limit),
    });

    res.status(200).json(convertBigIntToNumber({
      message: "Recherche effectuée avec succès",
      universites,
      total: universites.length,
    }));
  } catch (error) {
    console.error("Erreur lors de la recherche :", error);
    res.status(500).json({
      error: "Erreur lors de la recherche d'universités.",
      details: error.message,
    });
  }
});

// Récupérer les universités par pays
router.get("/pays/:nomPays", async (req, res) => {
  const { nomPays } = req.params;
  const { limit = 50 } = req.query;

  try {
    const universites = await prisma.universiteMondiale.findMany({
      where: {
        paysNorme: { contains: nomPays.toLowerCase() },
      },
      select: {
        id: true,
        nom: true,
        nomEn: true,
        nomFr: true,
        pays: true,
        siteWeb: true,
        domaine: true,
        classement: true,
        fondee: true,
        statut: true,
      },
      orderBy: [{ classement: "asc" }, { nom: "asc" }],
      take: parseInt(limit),
    });

    res.status(200).json(convertBigIntToNumber({
      message: `Universités de ${nomPays} récupérées avec succès`,
      universites,
      total: universites.length,
    }));
  } catch (error) {
    console.error("Erreur lors de la récupération par pays :", error);
    res.status(500).json({
      error: "Erreur lors de la récupération des universités par pays.",
      details: error.message,
    });
  }
});

// ==================== UPDATE ====================

// Modifier une université
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const {
    nom,
    nomEn,
    nomFr,
    pays,
    siteWeb,
    domaine,
    idRor,
    latitude,
    longitude,
    description,
    descriptionEn,
    descriptionFr,
    fondee,
    statut,
    classement,
  } = req.body;

  try {
    // Vérifier si l'université existe
    const universiteExistante = await prisma.universiteMondiale.findUnique({
      where: { id },
    });

    if (!universiteExistante) {
      return res.status(404).json({
        error: "Université non trouvée.",
      });
    }

    // Vérifier si le nouveau nom n'est pas déjà utilisé par une autre université dans le même pays
    if (
      nom &&
      pays &&
      (nom !== universiteExistante.nom || pays !== universiteExistante.pays)
    ) {
      const nomExiste = await prisma.universiteMondiale.findFirst({
        where: {
          AND: [{ nom }, { pays }, { id: { not: id } }],
        },
      });

      if (nomExiste) {
        return res.status(400).json({
          error: "Une autre université avec ce nom existe déjà dans ce pays.",
        });
      }
    }

    // Préparer les données à mettre à jour
    const dataToUpdate = {
      dernierSync: BigInt(Date.now()),
    };

    if (nom) {
      dataToUpdate.nom = nom;
      dataToUpdate.nomNorme = nom
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
    }
    if (nomEn) dataToUpdate.nomEn = nomEn;
    if (nomFr) dataToUpdate.nomFr = nomFr;
    if (pays) {
      dataToUpdate.pays = pays;
      dataToUpdate.paysNorme = pays
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
    }
    if (siteWeb !== undefined) dataToUpdate.siteWeb = siteWeb;
    if (domaine !== undefined) dataToUpdate.domaine = domaine;
    if (idRor !== undefined) dataToUpdate.idRor = idRor;
    if (latitude !== undefined)
      dataToUpdate.latitude = latitude ? parseFloat(latitude) : null;
    if (longitude !== undefined)
      dataToUpdate.longitude = longitude ? parseFloat(longitude) : null;
    if (description !== undefined) dataToUpdate.description = description;
    if (descriptionEn !== undefined) dataToUpdate.descriptionEn = descriptionEn;
    if (descriptionFr !== undefined) dataToUpdate.descriptionFr = descriptionFr;
    if (fondee !== undefined)
      dataToUpdate.fondee = fondee ? parseInt(fondee) : null;
    if (statut !== undefined) dataToUpdate.statut = statut;
    if (classement !== undefined)
      dataToUpdate.classement = classement ? parseInt(classement) : null;

    // Mettre à jour l'université
    const universiteMiseAJour = await prisma.universiteMondiale.update({
      where: { id },
      data: dataToUpdate,
    });

    res.status(200).json(convertBigIntToNumber({
      message: "Université modifiée avec succès",
      universite: universiteMiseAJour,
    }));
  } catch (error) {
    console.error("Erreur lors de la modification :", error);
    res.status(500).json({
      error: "Erreur lors de la modification de l'université.",
      details: error.message,
    });
  }
});

// ==================== DELETE ====================

// Supprimer une université
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    // Vérifier si l'université existe
    const universite = await prisma.universiteMondiale.findUnique({
      where: { id },
    });

    if (!universite) {
      return res.status(404).json({
        error: "Université non trouvée.",
      });
    }

    // Supprimer l'université (les relations seront supprimées en cascade)
    await prisma.universiteMondiale.delete({
      where: { id },
    });

    res.status(200).json({
      message: "Université supprimée avec succès",
    });
  } catch (error) {
    console.error("Erreur lors de la suppression :", error);
    res.status(500).json({
      error: "Erreur lors de la suppression de l'université.",
      details: error.message,
    });
  }
});

// Supprimer plusieurs universités
router.delete("/", async (req, res) => {
  const { ids } = req.body;

  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({
      error: "Une liste d'IDs valide est requise.",
    });
  }

  try {
    // Supprimer les universités
    const result = await prisma.universiteMondiale.deleteMany({
      where: { id: { in: ids } },
    });

    res.status(200).json({
      message: `${result.count} université(s) supprimée(s) avec succès`,
      supprimesCount: result.count,
    });
  } catch (error) {
    console.error("Erreur lors de la suppression multiple :", error);
    res.status(500).json({
      error: "Erreur lors de la suppression des universités.",
      details: error.message,
    });
  }
});

// ==================== UTILITAIRES ====================

// Obtenir les statistiques des universités
router.get("/stats/general", async (req, res) => {
  try {
    const [total, parPays, parFournisseur, avecClassement] = await Promise.all([
      prisma.universiteMondiale.count(),
      prisma.universiteMondiale.groupBy({
        by: ["pays"],
        _count: { id: true },
        orderBy: { _count: { id: "desc" } },
        take: 10,
      }),
      prisma.universiteMondiale.groupBy({
        by: ["fournisseur"],
        _count: { id: true },
      }),
      prisma.universiteMondiale.count({
        where: { classement: { not: null } },
      }),
    ]);

    res.status(200).json({
      message: "Statistiques récupérées avec succès",
      stats: convertBigIntToNumber({
        total,
        avecClassement,
        parPays,
        parFournisseur,
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

// Associer une université à une ville
router.post("/:universiteId/ville/:villeId", async (req, res) => {
  const { universiteId, villeId } = req.params;

  try {
    // Vérifier si l'association existe déjà
    const associationExistante = await prisma.villeUniversite.findFirst({
      where: {
        universiteId,
        villeId,
      },
    });

    if (associationExistante) {
      return res.status(400).json({
        error: "Cette association université-ville existe déjà.",
      });
    }

    // Créer l'association
    const association = await prisma.villeUniversite.create({
      data: {
        universiteId,
        villeId,
      },
      include: {
        ville: true,
        universite: {
          select: {
            nom: true,
            nomEn: true,
            nomFr: true,
          },
        },
      },
    });

    res.status(201).json({
      message: "Association université-ville créée avec succès",
      association,
    });
  } catch (error) {
    console.error("Erreur lors de l'association :", error);
    res.status(500).json({
      error: "Erreur lors de l'association université-ville.",
      details: error.message,
    });
  }
});

// Dissocier une université d'une ville
router.delete("/:universiteId/ville/:villeId", async (req, res) => {
  const { universiteId, villeId } = req.params;

  try {
    const association = await prisma.villeUniversite.findFirst({
      where: {
        universiteId,
        villeId,
      },
    });

    if (!association) {
      return res.status(404).json({
        error: "Association université-ville non trouvée.",
      });
    }

    await prisma.villeUniversite.delete({
      where: { id: association.id },
    });

    res.status(200).json({
      message: "Association université-ville supprimée avec succès",
    });
  } catch (error) {
    console.error("Erreur lors de la dissociation :", error);
    res.status(500).json({
      error: "Erreur lors de la dissociation université-ville.",
      details: error.message,
    });
  }
});

// Récupérer les universités par pays avec filtres et données associées
router.get("/pays1/:paysId", async (req, res) => {
  const { paysId } = req.params;
  const {
    typeEtablissement,
    includeVilles = "true",
    includeFormations = "true",
    villeId,
    formationId,
    limit = 50,
  } = req.query;

  try {
    // Déterminer si paysId est un nom ou un ID
    let whereUniversites = {};

    // Vérifier si paysId est un UUID (format ID) ou un nom
    const isUUID =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        paysId
      );

    if (isUUID) {
      // Si c'est un UUID, récupérer d'abord le nom du pays
      const pays = await prisma.pays.findUnique({
        where: { id: paysId },
        select: { nom: true },
      });

      if (!pays) {
        return res.status(404).json({
          success: false,
          error: "Pays non trouvé.",
        });
      }

      whereUniversites.pays = pays.nom;
    } else {
      // Si c'est un nom, l'utiliser directement
      whereUniversites.pays = paysId;
    }

    // Filtrer par type d'établissement si fourni
    if (typeEtablissement && ["public", "prive"].includes(typeEtablissement)) {
      whereUniversites.typeEtablissement = typeEtablissement;
    }

    // Filtrer par ville si fourni
    if (villeId) {
      whereUniversites.villeUniversites = {
        some: {
          villeId: villeId,
        },
      };
    }

    // Filtrer par formation si fourni
    if (formationId) {
      whereUniversites.universiteFormations = {
        some: {
          formationId: formationId,
        },
      };
    }

    // Récupérer les universités avec leurs relations
    const universites = await prisma.universiteMondiale.findMany({
      where: whereUniversites,
      select: {
        id: true,
        nom: true,
        nomEn: true,
        nomFr: true,
        pays: true,
        siteWeb: true,
        domaine: true,
        latitude: true,
        longitude: true,
        description: true,
        descriptionEn: true,
        descriptionFr: true,
        fondee: true,
        statut: true,
        classement: true,
        typeEtablissement: true,
        creeA: true,
        modifieA: true,
        villeUniversites: {
          include: {
            ville: {
              select: {
                id: true,
                nom: true,
                nomEn: true,
                nomFr: true,
                latitude: true,
                longitude: true,
              },
            },
          },
        },
        universiteFormations: {
          include: {
            formation: {
              select: {
                id: true,
                nom: true,
                nomEn: true,
                nomFr: true,
                niveau: true,
                domaine: true,
                duree: true,
                diplome: true,
                description: true,
                descriptionEn: true,
                descriptionFr: true,
              },
            },
          },
        },
      },
      orderBy: [{ classement: "asc" }, { nom: "asc" }],
      take: parseInt(limit),
    });

    // Préparer la réponse
    const response = {
      success: true,
      message: "Universités récupérées avec succès",
      universites: universites,
    };

    // Récupérer toutes les villes disponibles pour ce pays si demandé
    if (includeVilles === "true") {
      const villes = await prisma.ville.findMany({
        where: {
          paysVilles: {
            some: {
              pays: {
                nom: paysId, // ou id selon votre structure
              },
            },
          },
          villeUniversites: {
            some: {
              universite: {
                pays: paysId,
                ...(typeEtablissement && { typeEtablissement }),
              },
            },
          },
        },
        select: {
          id: true,
          nom: true,
          nomEn: true,
          nomFr: true,
          latitude: true,
          longitude: true,
        },
        orderBy: {
          nom: "asc",
        },
      });

      response.villes = villes;
    }

    // Récupérer toutes les formations disponibles pour ce pays si demandé
    if (includeFormations === "true") {
      const formations = await prisma.formation.findMany({
        where: {
          universiteFormations: {
            some: {
              universite: {
                pays: paysId,
                ...(typeEtablissement && { typeEtablissement }),
                ...(villeId && {
                  villeUniversites: {
                    some: {
                      villeId: villeId,
                    },
                  },
                }),
              },
            },
          },
        },
        select: {
          id: true,
          nom: true,
          nomEn: true,
          nomFr: true,
          niveau: true,
          domaine: true,
          duree: true,
          diplome: true,
          description: true,
          descriptionEn: true,
          descriptionFr: true,
        },
        orderBy: [{ niveau: "asc" }, { nom: "asc" }],
      });

      response.formations = formations;
    }
    res.status(200).json({ success: true, response });
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des universités par pays :",
      error
    );
    res.status(500).json({
      success: false,
      error: "Erreur lors de la récupération des universités.",
      details: error.message,
    });
  }
});

// Récupérer toutes les formations d'une université spécifique
router.get("/:id/formations", async (req, res) => {
  const { id } = req.params;
  const {
    includeDetails = "false",
    niveau,
    domaine,
    limit = 50,
    userId,
  } = req.query;

  try {
    // Vérifier si l'université existe d'abord
    const universite = await prisma.universiteMondiale.findUnique({
      where: { id },
      select: {
        id: true,
        nom: true,
        nomEn: true,
        nomFr: true,
        pays: true,
        description: true,
        descriptionEn: true,
        descriptionFr: true,
        fondee: true,
        statut: true,
        classement: true,
        typeEtablissement: true,
      },
    });

    if (!universite) {
      return res.status(404).json({
        success: false,
        error: "Université non trouvée.",
      });
    }

    // Construire les filtres pour les formations
    const whereFormations = {
      universite: {
        id: id,
      },
    };

    // Ajouter des filtres optionnels
    if (niveau) {
      whereFormations.formation = {
        ...whereFormations.formation,
        niveau: { contains: niveau },
      };
    }

    if (domaine) {
      whereFormations.formation = {
        ...whereFormations.formation,
        domaine: { contains: domaine },
      };
    }

    // Récupérer les formations avec leurs détails ET les likes de l'utilisateur
    const universiteFormations = await prisma.universiteFormation.findMany({
      where: whereFormations,
      select: {
        id: true,
        capacite: true,
        fraisInscription: true,
        dateDebut: true,
        dateFin: true,
        langueEnseignement: true,
        creeA: true,
        modifieA: true,
        formation: {
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
            descriptionEn: true,
            descriptionFr: true,
            prerequis: true,
            debouches: true,
            creeA: true,
            // Inclure les favoris de l'utilisateur connecté
            utilisateursFavoris: userId
              ? {
                  where: {
                    utilisateurId: parseInt(userId),
                  },
                  select: {
                    id: true,
                    utilisateurId: true,
                  },
                }
              : false,
          },
        },
      },
      orderBy: [
        { formation: { niveau: "asc" } },
        { formation: { domaine: "asc" } },
        { formation: { nom: "asc" } },
      ],
      take: parseInt(limit),
    });

    // Transformer les données pour ajouter hasLike à chaque formation
    const universiteFormationsAvecLikes = universiteFormations.map((uf) => ({
      ...uf,
      formation: {
        ...uf.formation,
        hasLike: userId ? uf.formation.utilisateursFavoris?.length > 0 : false,
        // Supprimer utilisateursFavoris de la réponse finale pour éviter l'encombrement
        utilisateursFavoris: undefined,
      },
    }));

    // Calculer les statistiques incluant les formations aimées
    const formationsAimees = userId
      ? universiteFormationsAvecLikes.filter((uf) => uf.formation.hasLike)
          .length
      : 0;

    // Préparer la réponse pour correspondre au code React Native
    const response = {
      success: true,
      message: "Formations récupérées avec succès",
    };

    if (includeDetails === "true") {
      // Format pour correspondre au code React Native qui attend universiteData?.universiteFormations
      const universiteWithFormations = {
        ...universite,
        universiteFormations: universiteFormationsAvecLikes,
      };

      response.response = {
        success: true,
        message: "Formations récupérées avec succès",
        universite: universiteWithFormations,
        formations: universiteFormationsAvecLikes,
      };
    } else {
      response.response = {
        success: true,
        message: "Formations récupérées avec succès",
        universite: {
          ...universite,
          universiteFormations: universiteFormationsAvecLikes,
        },
        formations: universiteFormationsAvecLikes,
      };
    }

    // Ajouter des statistiques utiles
    response.stats = {
      totalFormations: universiteFormationsAvecLikes.length,
      formationsAimees: formationsAimees,
      niveauxDisponibles: [
        ...new Set(
          universiteFormationsAvecLikes
            .map((uf) => uf.formation.niveau)
            .filter(Boolean)
        ),
      ],
      domainesDisponibles: [
        ...new Set(
          universiteFormationsAvecLikes
            .map((uf) => uf.formation.domaine)
            .filter(Boolean)
        ),
      ],
    };

    res.status(200).json(response);
  } catch (error) {
    console.error("Erreur lors de la récupération des formations :", error);
    res.status(500).json({
      success: false,
      error: "Erreur lors de la récupération des formations de l'université.",
      details: error.message,
    });
  }
});

module.exports = router;
