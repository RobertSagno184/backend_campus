const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const { convertBigIntToNumber } = require("../../utils/constants");
const prisma = new PrismaClient();

// ==================== CREATE ====================

// Créer un pays
router.post("/creer", async (req, res) => {
  const {
    nom,
    nomEn,
    nomFr,
    drapeau,
    continent,
    region,
    avantages,
    avantagesEn,
    avantagesFr,
    popularite,
    cout,
    langue,
    monnaie,
  } = req.body;

  // Validation des champs obligatoires
  if (
    !nom ||
    !nomEn ||
    !nomFr ||
    !drapeau ||
    !continent ||
    !avantages ||
    !avantagesEn ||
    !avantagesFr ||
    !langue ||
    !monnaie
  ) {
    return res.status(400).json({
      error:
        "Les champs nom, nomEn, nomFr, drapeau, continent, avantages (toutes langues), langue et monnaie sont obligatoires.",
    });
  }

  // Validation du continent
  const continentsValides = [
    "AFRIQUE",
    "AMERIQUE",
    "ASIE",
    "EUROPE",
    "OCEANIE",
  ];
  if (!continentsValides.includes(continent)) {
    return res.status(400).json({
      error:
        "Le continent doit être l'un des suivants : " +
        continentsValides.join(", "),
    });
  }

  // Validation du coût (1-5)
  if (cout && (cout < 1 || cout > 5)) {
    return res.status(400).json({
      error: "Le coût doit être compris entre 1 et 5.",
    });
  }

  // Validation de la popularité (1-100)
  if (popularite && (popularite < 1 || popularite > 100)) {
    return res.status(400).json({
      error: "La popularité doit être comprise entre 1 et 100.",
    });
  }

  try {
    // Vérifier si le pays existe déjà
    const paysExistant = await prisma.pays.findUnique({
      where: { nom },
    });

    if (paysExistant) {
      return res.status(400).json({
        error: "Un pays existe déjà avec ce nom.",
      });
    }

    // Créer le pays
    const pays = await prisma.pays.create({
      data: {
        nom,
        nomEn,
        nomFr,
        drapeau,
        continent,
        region,
        avantages,
        avantagesEn,
        avantagesFr,
        popularite: popularite || 50,
        cout: cout || 3,
        langue,
        monnaie,
      },
    });

    res.status(201).json({
      message: "Pays créé avec succès",
      pays,
    });
  } catch (error) {
    console.error("Erreur lors de la création :", error);
    res.status(500).json({
      error: "Erreur lors de la création du pays.",
      details: error.message,
    });
  }
});

// ==================== READ ====================

// Récupérer tous les pays
router.get("/lire", async (req, res) => {
  const { continent, cout, langue, search } = req.query;

  try {
    const filtres = {};

    if (continent) filtres.continent = continent;
    if (cout) filtres.cout = parseInt(cout);
    if (langue) filtres.langue = { contains: langue };
    
    // Ajouter la recherche
    if (search) {
      filtres.OR = [
        { nom: { contains: search } },
        { nomEn: { contains: search } },
        { nomFr: { contains: search } },
        { avantages: { contains: search } },
        { avantagesEn: { contains: search } },
        { avantagesFr: { contains: search } }
      ];
    }

    const pays = await prisma.pays.findMany({
      where: filtres,
      orderBy: [{ popularite: "desc" }, { nom: "asc" }],
      include: {
        guides: {
          select: {
            id: true,
            section: true,
            titre: true,
          },
        },
        lettresMotivation: {
          select: {
            id: true,
            type: true,
            titre: true,
          },
        },
        _count: {
          select: {
            guides: true,
            lettresMotivation: true,
          },
        },
      },
    });

    res.status(200).json({
      message: "Pays récupérés avec succès",
      pays,
      total: pays.length,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération :", error);
    res.status(500).json({
      error: "Erreur lors de la récupération des pays.",
      details: error.message,
    });
  }
});

// Récupérer un pays par ID
router.get("/recuperer/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const pays = await prisma.pays.findUnique({
      where: { id },
      include: {
        guides: {
          orderBy: [{ section: "asc" }, { etape: "asc" }],
        },
        lettresMotivation: {
          orderBy: { type: "asc" },
        },
        paysVilles: {
          include: {
            ville: true,
          },
        },
        _count: {
          select: {
            guides: true,
            lettresMotivation: true,
          },
        },
      },
    });

    if (!pays) {
      return res.status(404).json({
        error: "Pays non trouvé.",
      });
    }

    res.status(200).json({
      message: "Pays récupéré avec succès",
      pays,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération :", error);
    res.status(500).json({
      error: "Erreur lors de la récupération du pays.",
      details: error.message,
    });
  }
});

// Rechercher des pays
router.get("/rechercher/:terme", async (req, res) => {
  const { terme } = req.params;

  try {
    const pays = await prisma.pays.findMany({
      where: {
        OR: [
          { nom: { contains: terme, mode: "insensitive" } },
          { nomEn: { contains: terme, mode: "insensitive" } },
          { nomFr: { contains: terme, mode: "insensitive" } },
          { langue: { contains: terme, mode: "insensitive" } },
          { monnaie: { contains: terme, mode: "insensitive" } },
        ],
      },
      orderBy: [{ popularite: "desc" }, { nom: "asc" }],
      include: {
        _count: {
          select: {
            guides: true,
            lettresMotivation: true,
          },
        },
      },
    });

    res.status(200).json({
      message: "Recherche effectuée avec succès",
      pays,
      total: pays.length,
    });
  } catch (error) {
    console.error("Erreur lors de la recherche :", error);
    res.status(500).json({
      error: "Erreur lors de la recherche de pays.",
      details: error.message,
    });
  }
});

// Récupérer les pays par continent
// Route corrigée pour correspondre à l'appel frontend
router.get("/continent", async (req, res) => {
  console.log("Query params:", req.query);
  const { continent, userId } = req.query;

  // Validation des paramètres requis
  if (!continent) {
    return res.status(400).json({
      error: "Le paramètre 'continent' est requis",
    });
  }

  // Validation du continent
  const continentsValides = [
    "AFRIQUE",
    "AMERIQUE",
    "ASIE",
    "EUROPE",
    "OCEANIE",
  ];

  if (!continentsValides.includes(continent.toUpperCase())) {
    return res.status(400).json({
      error:
        "Le continent doit être l'un des suivants : " +
        continentsValides.join(", "),
    });
  }

  try {
    let langueUtilisateur = "fr"; // Langue par défaut

    // Si un userId est fourni, récupérer la langue préférée de l'utilisateur
    if (userId) {
      const utilisateur = await prisma.utilisateur.findUnique({
        where: { id: parseInt(userId) },
        select: { langue: true },
      });

      if (utilisateur && utilisateur.langue) {
        langueUtilisateur = utilisateur.langue;
      }
    }

    // Déterminer si la langue est l'anglais
    const estAnglais = langueUtilisateur === "en";

    // Récupérer les pays du continent
    const pays = await prisma.pays.findMany({
      where: { continent: continent.toUpperCase() },
      orderBy: [{ popularite: "desc" }, { nom: "asc" }],
      include: {
        _count: {
          select: {
            guides: true,
            lettresMotivation: true,
          },
        },
      },
    });

    // Formater la réponse selon la langue de l'utilisateur
    const paysFormates = pays.map((p) => ({
      id: p.id,
      nom: estAnglais ? p.nomEn : p.nomFr || p.nom,
      nomOriginal: p.nom,
      nomEn: p.nomEn,
      nomFr: p.nomFr,
      drapeau: p.drapeau,
      continent: p.continent,
      region: p.region,
      avantages: estAnglais ? p.avantagesEn : p.avantagesFr || p.avantages,
      popularite: p.popularite,
      cout: p.cout,
      langue: p.langue,
      monnaie: p.monnaie,
      creeA: p.creeA,
      modifieA: p.modifieA,
      _count: p._count,
    }));

    // Message de réponse dans la langue appropriée
    const message = estAnglais
      ? `Countries of continent ${continent} retrieved successfully`
      : `Pays du continent ${continent} récupérés avec succès`;

    res.status(200).json({
      message,
      pays: paysFormates,
      total: paysFormates.length,
      langue: langueUtilisateur,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération :", error);

    res.status(500).json({
      error: "Erreur lors de la récupération des pays par continent.",
      details: error.message,
    });
  }
});

// Alternative : Si vous préférez garder les paramètres d'URL,
// voici comment corriger l'appel frontend :

/* Dans le frontend, remplacez cette ligne :
const response = await axiosInstance.get<PaysResponse>(`/pays/continent`, {
  headers: token ? { Authorization: `Bearer ${token}` } : {},
  params: [effectiveUserId ? { userId: effectiveUserId } : {}, ${continent} ? { continent: CONTINENT_MAP[continent] } : {}],
});

Par :
const response = await axiosInstance.get<PaysResponse>(`/pays/continent/${continent}/${effectiveUserId || 'anonymous'}`, {
  headers: token ? { Authorization: `Bearer ${token}` } : {},
});

Et dans ce cas, gardez votre route backend actuelle avec les paramètres d'URL.
*/

// Récupérer les pays les plus populaires
router.get("/populaires/:limite?", async (req, res) => {
  const { limite } = req.params;
  const limit = limite ? parseInt(limite) : 10;

  // Validation de la limite
  if (limit < 1 || limit > 100) {
    return res.status(400).json({
      error: "La limite doit être comprise entre 1 et 100.",
    });
  }

  try {
    const pays = await prisma.pays.findMany({
      orderBy: { popularite: "desc" },
      take: limit,
      include: {
        _count: {
          select: {
            guides: true,
            lettresMotivation: true,
          },
        },
      },
    });

    res.status(200).json({
      message: `Top ${limit} des pays les plus populaires récupérés avec succès`,
      pays,
      total: pays.length,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération :", error);
    res.status(500).json({
      error: "Erreur lors de la récupération des pays populaires.",
      details: error.message,
    });
  }
});

// ==================== UPDATE ====================

// Modifier un pays
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const {
    nom,
    nomEn,
    nomFr,
    drapeau,
    continent,
    region,
    avantages,
    avantagesEn,
    avantagesFr,
    popularite,
    cout,
    langue,
    monnaie,
  } = req.body;

  try {
    // Vérifier si le pays existe
    const paysExistant = await prisma.pays.findUnique({
      where: { id },
    });

    if (!paysExistant) {
      return res.status(404).json({
        error: "Pays non trouvé.",
      });
    }

    // Validation du continent si fourni
    if (continent) {
      const continentsValides = [
        "AFRIQUE",
        "AMERIQUE",
        "ASIE",
        "EUROPE",
        "OCEANIE",
      ];
      if (!continentsValides.includes(continent)) {
        return res.status(400).json({
          error:
            "Le continent doit être l'un des suivants : " +
            continentsValides.join(", "),
        });
      }
    }

    // Validation du coût si fourni
    if (cout !== undefined && (cout < 1 || cout > 5)) {
      return res.status(400).json({
        error: "Le coût doit être compris entre 1 et 5.",
      });
    }

    // Validation de la popularité si fournie
    if (popularite !== undefined && (popularite < 1 || popularite > 100)) {
      return res.status(400).json({
        error: "La popularité doit être comprise entre 1 et 100.",
      });
    }

    // Vérifier si le nouveau nom n'existe pas déjà
    if (nom && nom !== paysExistant.nom) {
      const nomExiste = await prisma.pays.findUnique({
        where: { nom },
      });

      if (nomExiste) {
        return res.status(400).json({
          error: "Ce nom de pays est déjà utilisé.",
        });
      }
    }

    // Préparer les données à mettre à jour (seulement les champs définis)
    const dataToUpdate = {};
    if (nom !== undefined) dataToUpdate.nom = nom;
    if (nomEn !== undefined) dataToUpdate.nomEn = nomEn;
    if (nomFr !== undefined) dataToUpdate.nomFr = nomFr;
    if (drapeau !== undefined) dataToUpdate.drapeau = drapeau;
    if (continent !== undefined) dataToUpdate.continent = continent;
    if (region !== undefined) dataToUpdate.region = region;
    if (avantages !== undefined) dataToUpdate.avantages = avantages;
    if (avantagesEn !== undefined) dataToUpdate.avantagesEn = avantagesEn;
    if (avantagesFr !== undefined) dataToUpdate.avantagesFr = avantagesFr;
    if (popularite !== undefined) dataToUpdate.popularite = popularite;
    if (cout !== undefined) dataToUpdate.cout = cout;
    if (langue !== undefined) dataToUpdate.langue = langue;
    if (monnaie !== undefined) dataToUpdate.monnaie = monnaie;

    // Vérifier qu'au moins un champ est à mettre à jour
    if (Object.keys(dataToUpdate).length === 0) {
      return res.status(400).json({
        error: "Aucune donnée à mettre à jour fournie.",
      });
    }

    // Mettre à jour le pays
    const paysMisAJour = await prisma.pays.update({
      where: { id },
      data: dataToUpdate,
      include: {
        _count: {
          select: {
            guides: true,
            lettresMotivation: true,
          },
        },
      },
    });

    res.status(200).json({
      message: "Pays modifié avec succès",
      pays: paysMisAJour,
    });
  } catch (error) {
    console.error("Erreur lors de la modification :", error);
    res.status(500).json({
      error: "Erreur lors de la modification du pays.",
      details: error.message,
    });
  }
});

// Mettre à jour la popularité d'un pays
router.put("/:id/popularite", async (req, res) => {
  const { id } = req.params;
  const { popularite } = req.body;

  if (popularite === undefined || popularite < 1 || popularite > 100) {
    return res.status(400).json({
      error: "La popularité doit être comprise entre 1 et 100.",
    });
  }

  try {
    const pays = await prisma.pays.update({
      where: { id },
      data: { popularite },
    });

    res.status(200).json({
      message: "Popularité mise à jour avec succès",
      pays,
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la popularité :", error);
    if (error.code === "P2025") {
      return res.status(404).json({
        error: "Pays non trouvé.",
      });
    }
    res.status(500).json({
      error: "Erreur lors de la mise à jour de la popularité.",
      details: error.message,
    });
  }
});

// ==================== DELETE ====================

// Supprimer un pays
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    // Vérifier si le pays existe et compter les dépendances
    const pays = await prisma.pays.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            guides: true,
            lettresMotivation: true,
            paysVilles: true,
          },
        },
      },
    });

    if (!pays) {
      return res.status(404).json({
        error: "Pays non trouvé.",
      });
    }

    // Vérifier s'il y a des dépendances
    const totalDependances =
      pays._count.guides +
      pays._count.lettresMotivation +
      pays._count.favoris +
      pays._count.paysVilles;

    if (totalDependances > 0) {
      return res.status(400).json({
        error: `Impossible de supprimer ce pays. Il est référencé par ${pays._count.guides} guide(s), ${pays._count.lettresMotivation} lettre(s) de motivation, ${pays._count.favoris} favori(s) et ${pays._count.paysVilles} ville(s).`,
      });
    }

    // Supprimer le pays
    await prisma.pays.delete({
      where: { id },
    });

    res.status(200).json({
      message: "Pays supprimé avec succès",
    });
  } catch (error) {
    console.error("Erreur lors de la suppression :", error);
    res.status(500).json({
      error: "Erreur lors de la suppression du pays.",
      details: error.message,
    });
  }
});

// Supprimer plusieurs pays
router.delete("/", async (req, res) => {
  const { ids } = req.body;

  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({
      error: "Une liste d'IDs valide est requise.",
    });
  }

  try {
    // Vérifier les dépendances pour chaque pays
    const pays = await prisma.pays.findMany({
      where: { id: { in: ids } },
      include: {
        _count: {
          select: {
            guides: true,
            lettresMotivation: true,
            paysVilles: true,
          },
        },
      },
    });

    const paysAvecDependances = pays.filter(
      (p) =>
        p._count.guides > 0 ||
        p._count.lettresMotivation > 0 ||
        p._count.favoris > 0 ||
        p._count.paysVilles > 0
    );

    if (paysAvecDependances.length > 0) {
      return res.status(400).json({
        error: `Impossible de supprimer certains pays car ils ont des dépendances.`,
        paysAvecDependances: paysAvecDependances.map((p) => ({
          id: p.id,
          nom: p.nom,
          guides: p._count.guides,
          lettresMotivation: p._count.lettresMotivation,
          favoris: p._count.favoris,
          villes: p._count.paysVilles,
        })),
      });
    }

    // Supprimer les pays sans dépendances
    const result = await prisma.pays.deleteMany({
      where: { id: { in: ids } },
    });

    res.status(200).json({
      message: `${result.count} pays supprimé(s) avec succès`,
      supprimesCount: result.count,
    });
  } catch (error) {
    console.error("Erreur lors de la suppression multiple :", error);
    res.status(500).json({
      error: "Erreur lors de la suppression des pays.",
      details: error.message,
    });
  }
});

// ==================== UTILITAIRES ====================

// Obtenir les statistiques des pays
router.get("/stats/general", async (req, res) => {
  try {
    const [total, parContinent, parCout, moyennePopularite] = await Promise.all(
      [
        prisma.pays.count(),
        prisma.pays.groupBy({
          by: ["continent"],
          _count: true,
        }),
        prisma.pays.groupBy({
          by: ["cout"],
          _count: true,
        }),
        prisma.pays.aggregate({
          _avg: {
            popularite: true,
          },
        }),
      ]
    );

    res.status(200).json({
      message: "Statistiques récupérées avec succès",
      ...convertBigIntToNumber({
        total,
        parContinent,
        parCout,
        moyennePopularite: Math.round(moyennePopularite._avg.popularite || 0),
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

// Vérifier si un nom de pays existe
router.get("/verifier-nom/:nom", async (req, res) => {
  const { nom } = req.params;

  if (!nom.trim()) {
    return res.status(400).json({
      error: "Le nom du pays ne peut pas être vide.",
    });
  }

  try {
    const pays = await prisma.pays.findUnique({
      where: { nom: nom.trim() },
      select: { id: true, nom: true },
    });

    res.status(200).json({
      existe: !!pays,
      pays: pays || null,
    });
  } catch (error) {
    console.error("Erreur lors de la vérification :", error);
    res.status(500).json({
      error: "Erreur lors de la vérification du nom du pays.",
      details: error.message,
    });
  }
});

module.exports = router;
