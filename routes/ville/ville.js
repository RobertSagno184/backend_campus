const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const { convertBigIntToNumber } = require("../../utils/constants");
const prisma = new PrismaClient();

// ==================== CREATE ====================

// Créer une ville
router.post("/creer", async (req, res) => {
  const {
    nom,
    nomEn,
    nomFr,
    latitude,
    longitude,
    population,
    paysIds, // Array d'IDs de pays à associer à la ville
  } = req.body;

  // Validation des champs obligatoires
  if (!nom || !nomEn || !nomFr) {
    return res.status(400).json({
      error: "Les champs nom, nomEn et nomFr sont obligatoires.",
    });
  }

  // Validation des coordonnées si fournies
  if (latitude && (latitude < -90 || latitude > 90)) {
    return res.status(400).json({
      error: "La latitude doit être comprise entre -90 et 90.",
    });
  }

  if (longitude && (longitude < -180 || longitude > 180)) {
    return res.status(400).json({
      error: "La longitude doit être comprise entre -180 et 180.",
    });
  }

  // Validation de la population
  if (population && population < 0) {
    return res.status(400).json({
      error: "La population ne peut pas être négative.",
    });
  }

  try {
    // Vérifier si la ville existe déjà (même nom)
    const villeExistante = await prisma.ville.findFirst({
      where: {
        OR: [{ nom }, { nomEn }, { nomFr }],
      },
    });

    if (villeExistante) {
      return res.status(400).json({
        error: "Une ville existe déjà avec ce nom dans l'une des langues.",
      });
    }

    // Vérifier que les pays existent si des IDs sont fournis
    if (paysIds && Array.isArray(paysIds) && paysIds.length > 0) {
      const paysExistants = await prisma.pays.findMany({
        where: { id: { in: paysIds } },
        select: { id: true, nom: true },
      });

      if (paysExistants.length !== paysIds.length) {
        const paysNonTrouves = paysIds.filter(
          (id) => !paysExistants.find((p) => p.id === id)
        );
        return res.status(400).json({
          error: "Certains pays n'existent pas.",
          paysNonTrouves,
        });
      }
    }

    // Créer la ville
    const ville = await prisma.ville.create({
      data: {
        nom,
        nomEn,
        nomFr,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        population: population ? parseInt(population) : null,
        // Créer les relations avec les pays
        paysVilles:
          paysIds && paysIds.length > 0
            ? {
                create: paysIds.map((paysId) => ({
                  paysId,
                })),
              }
            : undefined,
      },
      include: {
        paysVilles: {
          include: {
            pays: {
              select: {
                id: true,
                nom: true,
                nomEn: true,
                nomFr: true,
                drapeau: true,
                continent: true,
              },
            },
          },
        },
        _count: {
          select: {
            paysVilles: true,
            villeUniversites: true,
          },
        },
      },
    });

    res.status(201).json({
      message: "Ville créée avec succès",
      ville,
    });
  } catch (error) {
    console.error("Erreur lors de la création :", error);
    res.status(500).json({
      error: "Erreur lors de la création de la ville.",
      details: error.message,
    });
  }
});

// ==================== READ ====================

// Récupérer toutes les villes
router.get("/lire", async (req, res) => {
  const { pays, continent, population_min, population_max, search, page, limite } =
    req.query;

  try {
    const pageNum = page ? parseInt(page) : 1;
    const limitNum = limite ? parseInt(limite) : 50;
    const skip = (pageNum - 1) * limitNum;

    const filtres = {};

    // Filtre par recherche de nom de ville
    if (search) {
      filtres.OR = [
        { nom: { contains: search } },
        { nomEn: { contains: search } },
        { nomFr: { contains: search } },
      ];
    }

    // Filtre par pays
    if (pays) {
      filtres.paysVilles = {
        some: {
          pays: {
            nom: { contains: pays },
          },
        },
      };
    }

    // Filtre par continent
    if (continent) {
      filtres.paysVilles = {
        some: {
          pays: {
            continent: continent.toUpperCase(),
          },
        },
      };
    }

    // Filtres par population
    if (population_min || population_max) {
      filtres.population = {};
      if (population_min) filtres.population.gte = parseInt(population_min);
      if (population_max) filtres.population.lte = parseInt(population_max);
    }

    const [villes, total] = await Promise.all([
      prisma.ville.findMany({
        where: filtres,
        orderBy: [{ population: "desc" }, { nom: "asc" }],
        skip,
        take: limitNum,
        include: {
          paysVilles: {
            include: {
              pays: {
                select: {
                  id: true,
                  nom: true,
                  nomEn: true,
                  nomFr: true,
                  drapeau: true,
                  continent: true,
                },
              },
            },
          },
          _count: {
            select: {
              paysVilles: true,
              villeUniversites: true,
            },
          },
        },
      }),
      prisma.ville.count({ where: filtres }),
    ]);

    res.status(200).json({
      message: "Villes récupérées avec succès",
      villes,
      pagination: {
        page: pageNum,
        limite: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error("Erreur lors de la récupération :", error);
    res.status(500).json({
      error: "Erreur lors de la récupération des villes.",
      details: error.message,
    });
  }
});

// Récupérer une ville par ID
router.get("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const ville = await prisma.ville.findUnique({
      where: { id },
      include: {
        paysVilles: {
          include: {
            pays: {
              select: {
                id: true,
                nom: true,
                nomEn: true,
                nomFr: true,
                drapeau: true,
                continent: true,
              },
            },
          },
        },
        villeUniversites: {
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
        _count: {
          select: {
            paysVilles: true,
            villeUniversites: true,
          },
        },
      },
    });

    if (!ville) {
      return res.status(404).json({
        error: "Ville non trouvée.",
      });
    }

    res.status(200).json({
      message: "Ville récupérée avec succès",
      ville,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération :", error);
    res.status(500).json({
      error: "Erreur lors de la récupération de la ville.",
      details: error.message,
    });
  }
});

// Rechercher des villes
router.get("/rechercher/:terme", async (req, res) => {
  const { terme } = req.params;
  const { pays, continent } = req.query;

  try {
    const filtres = {
      OR: [
        { nom: { contains: terme } },
        { nomEn: { contains: terme } },
        { nomFr: { contains: terme } },
      ],
    };

    // Ajouter des filtres supplémentaires
    if (pays || continent) {
      filtres.paysVilles = {
        some: {},
      };

      if (pays) {
        filtres.paysVilles.some.pays = {
          nom: { contains: pays },
        };
      }

      if (continent) {
        filtres.paysVilles.some.pays = {
          ...filtres.paysVilles.some.pays,
          continent: continent.toUpperCase(),
        };
      }
    }

    const villes = await prisma.ville.findMany({
      where: filtres,
      orderBy: [{ population: "desc" }, { nom: "asc" }],
      take: 20, // Limiter les résultats de recherche
      include: {
        paysVilles: {
          include: {
            pays: {
              select: {
                id: true,
                nom: true,
                nomEn: true,
                nomFr: true,
                drapeau: true,
                continent: true,
              },
            },
          },
        },
        _count: {
          select: {
            paysVilles: true,
            villeUniversites: true,
          },
        },
      },
    });

    res.status(200).json({
      message: "Recherche effectuée avec succès",
      villes,
      total: villes.length,
    });
  } catch (error) {
    console.error("Erreur lors de la recherche :", error);
    res.status(500).json({
      error: "Erreur lors de la recherche de villes.",
      details: error.message,
    });
  }
});

// Récupérer les villes d'un pays
router.get("/pays/:paysId", async (req, res) => {
  const { paysId } = req.params;

  try {
    // Vérifier que le pays existe
    const pays = await prisma.pays.findUnique({
      where: { id: paysId },
      select: { id: true, nom: true },
    });

    if (!pays) {
      return res.status(404).json({
        error: "Pays non trouvé.",
      });
    }

    const villes = await prisma.ville.findMany({
      where: {
        paysVilles: {
          some: {
            paysId,
          },
        },
      },
      orderBy: [{ population: "desc" }, { nom: "asc" }],
      include: {
        _count: {
          select: {
            villeUniversites: true,
          },
        },
      },
    });

    res.status(200).json({
      message: `Villes du pays ${pays.nom} récupérées avec succès`,
      pays: pays,
      villes,
      total: villes.length,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération :", error);
    res.status(500).json({
      error: "Erreur lors de la récupération des villes par pays.",
      details: error.message,
    });
  }
});

// Récupérer les villes les plus peuplées
router.get("/populees/:limite?", async (req, res) => {
  const { limite } = req.params;
  const limit = limite ? parseInt(limite) : 10;

  try {
    const villes = await prisma.ville.findMany({
      where: {
        population: {
          not: null,
        },
      },
      orderBy: { population: "desc" },
      take: limit,
      include: {
        paysVilles: {
          include: {
            pays: {
              select: {
                id: true,
                nom: true,
                nomEn: true,
                nomFr: true,
                drapeau: true,
                continent: true,
              },
            },
          },
        },
        _count: {
          select: {
            villeUniversites: true,
          },
        },
      },
    });

    res.status(200).json({
      message: `Top ${limit} des villes les plus peuplées récupérées avec succès`,
      villes,
      total: villes.length,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération :", error);
    res.status(500).json({
      error: "Erreur lors de la récupération des villes les plus peuplées.",
      details: error.message,
    });
  }
});

// Récupérer les villes proches d'une position
router.get("/proches/:latitude/:longitude/:rayon?", async (req, res) => {
  const { latitude, longitude, rayon } = req.params;
  const rayonKm = rayon ? parseFloat(rayon) : 100; // Rayon par défaut: 100km

  const lat = parseFloat(latitude);
  const lng = parseFloat(longitude);

  // Validation des coordonnées
  if (isNaN(lat) || lat < -90 || lat > 90) {
    return res.status(400).json({
      error: "La latitude doit être un nombre entre -90 et 90.",
    });
  }

  if (isNaN(lng) || lng < -180 || lng > 180) {
    return res.status(400).json({
      error: "La longitude doit être un nombre entre -180 et 180.",
    });
  }

  try {
    // Calcul approximatif des limites (formule simple)
    const latDiff = rayonKm / 111; // 1 degré ≈ 111km
    const lngDiff = rayonKm / (111 * Math.cos((lat * Math.PI) / 180));

    const villes = await prisma.ville.findMany({
      where: {
        latitude: {
          gte: lat - latDiff,
          lte: lat + latDiff,
        },
        longitude: {
          gte: lng - lngDiff,
          lte: lng + lngDiff,
        },
      },
      orderBy: { population: "desc" },
      include: {
        paysVilles: {
          include: {
            pays: {
              select: {
                id: true,
                nom: true,
                nomEn: true,
                nomFr: true,
                drapeau: true,
                continent: true,
              },
            },
          },
        },
        _count: {
          select: {
            villeUniversites: true,
          },
        },
      },
    });

    res.status(200).json({
      message: `Villes dans un rayon de ${rayonKm}km récupérées avec succès`,
      centre: { latitude: lat, longitude: lng },
      rayonKm,
      villes,
      total: villes.length,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération :", error);
    res.status(500).json({
      error: "Erreur lors de la récupération des villes proches.",
      details: error.message,
    });
  }
});

// ==================== UPDATE ====================

// Modifier une ville
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { nom, nomEn, nomFr, latitude, longitude, population, paysIds } =
    req.body;

  try {
    // Vérifier si la ville existe
    const villeExistante = await prisma.ville.findUnique({
      where: { id },
    });

    if (!villeExistante) {
      return res.status(404).json({
        error: "Ville non trouvée.",
      });
    }

    // Validation des coordonnées si fournies
    if (latitude && (latitude < -90 || latitude > 90)) {
      return res.status(400).json({
        error: "La latitude doit être comprise entre -90 et 90.",
      });
    }

    if (longitude && (longitude < -180 || longitude > 180)) {
      return res.status(400).json({
        error: "La longitude doit être comprise entre -180 et 180.",
      });
    }

    // Validation de la population
    if (population && population < 0) {
      return res.status(400).json({
        error: "La population ne peut pas être négative.",
      });
    }

    // Vérifier l'unicité du nom si modifié
    if (
      (nom && nom !== villeExistante.nom) ||
      (nomEn && nomEn !== villeExistante.nomEn) ||
      (nomFr && nomFr !== villeExistante.nomFr)
    ) {
      const nomExiste = await prisma.ville.findFirst({
        where: {
          id: { not: id },
          OR: [
            nom ? { nom } : {},
            nomEn ? { nomEn } : {},
            nomFr ? { nomFr } : {},
          ].filter((obj) => Object.keys(obj).length > 0),
        },
      });

      if (nomExiste) {
        return res.status(400).json({
          error: "Une ville existe déjà avec ce nom dans l'une des langues.",
        });
      }
    }

    // Préparer les données à mettre à jour
    const dataToUpdate = {};
    if (nom) dataToUpdate.nom = nom;
    if (nomEn) dataToUpdate.nomEn = nomEn;
    if (nomFr) dataToUpdate.nomFr = nomFr;
    if (latitude !== undefined)
      dataToUpdate.latitude = latitude ? parseFloat(latitude) : null;
    if (longitude !== undefined)
      dataToUpdate.longitude = longitude ? parseFloat(longitude) : null;
    if (population !== undefined)
      dataToUpdate.population = population ? parseInt(population) : null;

    // Gérer les relations avec les pays si spécifiées
    if (paysIds !== undefined) {
      if (Array.isArray(paysIds) && paysIds.length > 0) {
        // Vérifier que les pays existent
        const paysExistants = await prisma.pays.findMany({
          where: { id: { in: paysIds } },
          select: { id: true },
        });

        if (paysExistants.length !== paysIds.length) {
          return res.status(400).json({
            error: "Certains pays n'existent pas.",
          });
        }

        // Supprimer les anciennes relations et créer les nouvelles
        dataToUpdate.paysVilles = {
          deleteMany: {},
          create: paysIds.map((paysId) => ({ paysId })),
        };
      } else {
        // Supprimer toutes les relations si array vide
        dataToUpdate.paysVilles = {
          deleteMany: {},
        };
      }
    }

    // Mettre à jour la ville
    const villeMiseAJour = await prisma.ville.update({
      where: { id },
      data: dataToUpdate,
      include: {
        paysVilles: {
          include: {
            pays: {
              select: {
                id: true,
                nom: true,
                nomEn: true,
                nomFr: true,
                drapeau: true,
                continent: true,
              },
            },
          },
        },
        _count: {
          select: {
            paysVilles: true,
            villeUniversites: true,
          },
        },
      },
    });

    res.status(200).json({
      message: "Ville modifiée avec succès",
      ville: villeMiseAJour,
    });
  } catch (error) {
    console.error("Erreur lors de la modification :", error);
    res.status(500).json({
      error: "Erreur lors de la modification de la ville.",
      details: error.message,
    });
  }
});

// Associer une ville à un pays
router.post("/:villeId/associer-pays/:paysId", async (req, res) => {
  const { villeId, paysId } = req.params;

  try {
    // Vérifier que la ville et le pays existent
    const [ville, pays] = await Promise.all([
      prisma.ville.findUnique({ where: { id: villeId } }),
      prisma.pays.findUnique({ where: { id: paysId } }),
    ]);

    if (!ville) {
      return res.status(404).json({ error: "Ville non trouvée." });
    }

    if (!pays) {
      return res.status(404).json({ error: "Pays non trouvé." });
    }

    // Vérifier que l'association n'existe pas déjà
    const associationExistante = await prisma.paysVille.findUnique({
      where: {
        paysId_villeId: {
          paysId,
          villeId,
        },
      },
    });

    if (associationExistante) {
      return res.status(400).json({
        error: "Cette ville est déjà associée à ce pays.",
      });
    }

    // Créer l'association
    await prisma.paysVille.create({
      data: {
        paysId,
        villeId,
      },
    });

    res.status(201).json({
      message: `Ville ${ville.nom} associée au pays ${pays.nom} avec succès`,
    });
  } catch (error) {
    console.error("Erreur lors de l'association :", error);
    res.status(500).json({
      error: "Erreur lors de l'association ville-pays.",
      details: error.message,
    });
  }
});

// Dissocier une ville d'un pays
router.delete("/:villeId/dissocier-pays/:paysId", async (req, res) => {
  const { villeId, paysId } = req.params;

  try {
    // Supprimer l'association
    const result = await prisma.paysVille.deleteMany({
      where: {
        paysId,
        villeId,
      },
    });

    if (result.count === 0) {
      return res.status(404).json({
        error: "Association ville-pays non trouvée.",
      });
    }

    res.status(200).json({
      message: "Association ville-pays supprimée avec succès",
    });
  } catch (error) {
    console.error("Erreur lors de la dissociation :", error);
    res.status(500).json({
      error: "Erreur lors de la dissociation ville-pays.",
      details: error.message,
    });
  }
});

// ==================== DELETE ====================

// Supprimer une ville
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    // Vérifier si la ville existe
    const ville = await prisma.ville.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            villeUniversites: true,
          },
        },
      },
    });

    if (!ville) {
      return res.status(404).json({
        error: "Ville non trouvée.",
      });
    }

    // Vérifier s'il y a des universités associées
    if (ville._count.villeUniversites > 0) {
      return res.status(400).json({
        error: `Impossible de supprimer cette ville. Elle est associée à ${ville._count.villeUniversites} université(s).`,
      });
    }

    // Supprimer la ville (les associations pays-ville seront supprimées automatiquement avec onDelete: Cascade)
    await prisma.ville.delete({
      where: { id },
    });

    res.status(200).json({
      message: "Ville supprimée avec succès",
    });
  } catch (error) {
    console.error("Erreur lors de la suppression :", error);
    res.status(500).json({
      error: "Erreur lors de la suppression de la ville.",
      details: error.message,
    });
  }
});

// Supprimer plusieurs villes
router.delete("/", async (req, res) => {
  const { ids } = req.body;

  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({
      error: "Une liste d'IDs valide est requise.",
    });
  }

  try {
    // Vérifier les dépendances pour chaque ville
    const villes = await prisma.ville.findMany({
      where: { id: { in: ids } },
      include: {
        _count: {
          select: {
            villeUniversites: true,
          },
        },
      },
    });

    const villesAvecDependances = villes.filter(
      (v) => v._count.villeUniversites > 0
    );

    if (villesAvecDependances.length > 0) {
      return res.status(400).json({
        error: `Impossible de supprimer certaines villes car elles ont des universités associées.`,
        villesAvecDependances: villesAvecDependances.map((v) => ({
          id: v.id,
          nom: v.nom,
          universites: v._count.villeUniversites,
        })),
      });
    }

    // Supprimer les villes
    const result = await prisma.ville.deleteMany({
      where: { id: { in: ids } },
    });

    res.status(200).json({
      message: `${result.count} ville(s) supprimée(s) avec succès`,
      supprimesCount: result.count,
    });
  } catch (error) {
    console.error("Erreur lors de la suppression multiple :", error);
    res.status(500).json({
      error: "Erreur lors de la suppression des villes.",
      details: error.message,
    });
  }
});

// ==================== UTILITAIRES ====================

// Obtenir les statistiques des villes
router.get("/stats/general", async (req, res) => {
  try {
    const total = await prisma.ville.count();

    const totalAvecPopulation = await prisma.ville.count({
      where: {
        population: { not: null },
      },
    });

    const totalAvecCoordonnees = await prisma.ville.count({
      where: {
        AND: [{ latitude: { not: null } }, { longitude: { not: null } }],
      },
    });

    const populationStats = await prisma.ville.aggregate({
      _avg: { population: true },
      _max: { population: true },
      _min: { population: true },
      _sum: { population: true },
      where: {
        population: { not: null },
      },
    });

    const parContinent = await prisma.$queryRaw`
      SELECT p.continent, COUNT(DISTINCT v.id) as count
      FROM ville v
      JOIN paysville pv ON v.id = pv.villeId
      JOIN pays p ON pv.paysId = p.id
      GROUP BY p.continent
      ORDER BY count DESC
    `;

    res.status(200).json({
      message: "Statistiques récupérées avec succès",
      ...convertBigIntToNumber({
        total,
        totalAvecPopulation,
        totalAvecCoordonnees,
        populationStats,
        parContinent,
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

// Vérifier si une ville existe
router.get("/verifier-nom/:nom", async (req, res) => {
  const { nom } = req.params;
  const { langue } = req.query; // 'fr', 'en', ou pas spécifié pour toutes

  try {
    let where;

    if (langue === "fr") {
      where = { nomFr: nom };
    } else if (langue === "en") {
      where = { nomEn: nom };
    } else {
      where = {
        OR: [{ nom }, { nomEn: nom }, { nomFr: nom }],
      };
    }

    const ville = await prisma.ville.findFirst({
      where,
      select: { id: true, nom: true, nomEn: true, nomFr: true },
    });

    res.status(200).json({
      existe: !!ville,
      ville: ville || null,
    });
  } catch (error) {
    console.error("Erreur lors de la vérification :", error);
    res.status(500).json({
      error: "Erreur lors de la vérification du nom de la ville.",
      details: error.message,
    });
  }
});

module.exports = router;
