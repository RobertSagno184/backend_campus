const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const { convertBigIntToNumber } = require("../../utils/constants");
const prisma = new PrismaClient();

// =============================================================================
// CRUD THEME
// =============================================================================

// ==================== CREATE ====================

// Créer un thème
router.post("/theme/creer", async (req, res) => {
  const { contenuFr, contenuEn, paysId } = req.body;

  // Validation des champs obligatoires
  if (!contenuFr || !paysId) {
    return res.status(400).json({
      error: "Les champs contenuFr et paysId sont obligatoires.",
    });
  }

  // Utiliser contenuFr comme valeur par défaut pour contenuEn si vide
  const finalContenuEn = contenuEn || contenuFr;

  try {
    // Vérifier si le pays existe
    const paysExistant = await prisma.pays.findUnique({
      where: { id: paysId },
    });

    if (!paysExistant) {
      return res.status(404).json({
        error: "Le pays spécifié n'existe pas.",
      });
    }

    // Créer le thème
    const theme = await prisma.theme.create({
      data: {
        contenuFr,
        contenuEn: finalContenuEn,
        paysId,
      },
      include: {
        pays: {
          select: {
            id: true,
            nom: true,
            nomFr: true,
            nomEn: true,
          },
        },
        details: {
          include: {
            liens: true,
          },
        },
      },
    });

    res.status(201).json(convertBigIntToNumber({
      message: "Thème créé avec succès",
      theme,
    }));
  } catch (error) {
    console.error("Erreur lors de la création du thème :", error);
    res.status(500).json({
      error: "Erreur lors de la création du thème.",
      details: error.message,
    });
  }
});

// ==================== READ ====================

// Récupérer tous les thèmes
router.get("/theme/lire", async (req, res) => {
  try {
    const themes = await prisma.theme.findMany({
      include: {
        pays: {
          select: {
            id: true,
            nom: true,
            nomFr: true,
            nomEn: true,
            drapeau: true,
          },
        },
        details: {
          include: {
            liens: true,
          },
        },
      },
      orderBy: { contenuFr: "asc" },
    });

    res.status(200).json(convertBigIntToNumber({
      message: "Thèmes récupérés avec succès",
      themes,
      total: themes.length,
    }));
  } catch (error) {
    console.error("Erreur lors de la récupération des thèmes :", error);
    res.status(500).json({
      error: "Erreur lors de la récupération des thèmes.",
      details: error.message,
    });
  }
});

// Récupérer un thème par ID
router.get("/theme/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const theme = await prisma.theme.findUnique({
      where: { id },
      include: {
        pays: {
          select: {
            id: true,
            nom: true,
            nomFr: true,
            nomEn: true,
            drapeau: true,
          },
        },
        details: {
          include: {
            liens: true,
          },
        },
      },
    });

    if (!theme) {
      return res.status(404).json({
        error: "Thème non trouvé.",
      });
    }

    res.status(200).json(convertBigIntToNumber({
      message: "Thème récupéré avec succès",
      theme,
    }));
  } catch (error) {
    console.error("Erreur lors de la récupération du thème :", error);
    res.status(500).json({
      error: "Erreur lors de la récupération du thème.",
      details: error.message,
    });
  }
});

// Récupérer les thèmes par pays
router.get("/theme/pays/:paysId", async (req, res) => {
  const { paysId } = req.params;

  try {
    const themes = await prisma.theme.findMany({
      where: { paysId },
      include: {
        pays: {
          select: {
            id: true,
            nom: true,
            nomFr: true,
            nomEn: true,
            drapeau: true,
          },
        },
        details: {
          include: {
            liens: true,
          },
        },
      },
      orderBy: { contenuFr: "asc" },
    });

    res.status(200).json({
      message: "Thèmes récupérés avec succès",
      success: true,
      themes,
      total: themes.length,
    });
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des thèmes par pays :",
      error
    );
    res.status(500).json({
      error: "Erreur lors de la récupération des thèmes par pays.",
      details: error.message,
    });
  }
});

// ==================== UPDATE ====================

// Modifier un thème
router.put("/theme/:id", async (req, res) => {
  const { id } = req.params;
  const { contenuFr, contenuEn, paysId } = req.body;

  try {
    // Vérifier si le thème existe
    const themeExistant = await prisma.theme.findUnique({
      where: { id },
    });

    if (!themeExistant) {
      return res.status(404).json({
        error: "Thème non trouvé.",
      });
    }

    // Si paysId est fourni, vérifier que le pays existe
    if (paysId) {
      const paysExistant = await prisma.pays.findUnique({
        where: { id: paysId },
      });

      if (!paysExistant) {
        return res.status(404).json({
          error: "Le pays spécifié n'existe pas.",
        });
      }
    }

    // Préparer les données à mettre à jour
    const dataToUpdate = {};
    if (contenuFr) dataToUpdate.contenuFr = contenuFr;
    if (contenuEn) dataToUpdate.contenuEn = contenuEn;
    if (paysId) dataToUpdate.paysId = paysId;

    // Mettre à jour le thème
    const themeMisAJour = await prisma.theme.update({
      where: { id },
      data: dataToUpdate,
      include: {
        pays: {
          select: {
            id: true,
            nom: true,
            nomFr: true,
            nomEn: true,
            drapeau: true,
          },
        },
        details: {
          include: {
            liens: true,
          },
        },
      },
    });

    res.status(200).json(convertBigIntToNumber({
      message: "Thème modifié avec succès",
      theme: themeMisAJour,
    }));
  } catch (error) {
    console.error("Erreur lors de la modification du thème :", error);
    res.status(500).json({
      error: "Erreur lors de la modification du thème.",
      details: error.message,
    });
  }
});

// ==================== DELETE ====================

// Supprimer un thème
router.delete("/theme/:id", async (req, res) => {
  const { id } = req.params;

  try {
    // Vérifier si le thème existe
    const theme = await prisma.theme.findUnique({
      where: { id },
      include: {
        details: {
          include: {
            liens: true,
          },
        },
      },
    });

    if (!theme) {
      return res.status(404).json({
        error: "Thème non trouvé.",
      });
    }

    // Supprimer le thème (cascade supprimera automatiquement les détails et liens)
    await prisma.theme.delete({
      where: { id },
    });

    res.status(200).json({
      message: "Thème supprimé avec succès",
    });
  } catch (error) {
    console.error("Erreur lors de la suppression du thème :", error);
    res.status(500).json({
      error: "Erreur lors de la suppression du thème.",
      details: error.message,
    });
  }
});

// =============================================================================
// CRUD DETAIL THEME
// =============================================================================

// ==================== CREATE ====================

// Créer un détail de thème
router.post("/detail/creer", async (req, res) => {
  const { contenuFr, contenuEn, themeId, liens } = req.body;

  // Validation des champs obligatoires
  if (!contenuFr || !contenuEn || !themeId) {
    return res.status(400).json({
      error: "Les champs contenuFr, contenuEn et themeId sont obligatoires.",
    });
  }

  try {
    // Vérifier si le thème existe
    const themeExistant = await prisma.theme.findUnique({
      where: { id: themeId },
    });

    if (!themeExistant) {
      return res.status(404).json({
        error: "Le thème spécifié n'existe pas.",
      });
    }

    // Créer le détail de thème avec transaction pour gérer les liens
    const result = await prisma.$transaction(async (tx) => {
      // Créer le détail de thème
      const detailTheme = await tx.detailTheme.create({
        data: {
          contenuFr,
          contenuEn,
          themeId,
        },
      });

      // Créer les liens s'ils sont fournis
      if (liens && Array.isArray(liens) && liens.length > 0) {
        const liensData = liens.map((url) => ({
          url,
          detailThemeId: detailTheme.id,
        }));

        await tx.lien.createMany({
          data: liensData,
        });
      }

      // Récupérer le détail créé avec les liens
      return await tx.detailTheme.findUnique({
        where: { id: detailTheme.id },
        include: {
          theme: {
            select: {
              id: true,
              contenuFr: true,
              contenuEn: true,
            },
          },
          liens: true,
        },
      });
    });

    res.status(201).json(convertBigIntToNumber({
      message: "Détail de thème créé avec succès",
      detailTheme: result,
    }));
  } catch (error) {
    console.error("Erreur lors de la création du détail de thème :", error);
    res.status(500).json({
      error: "Erreur lors de la création du détail de thème.",
      details: error.message,
    });
  }
});

// ==================== READ ====================

// Récupérer tous les détails de thème
router.get("/detail/lire", async (req, res) => {
  try {
    const detailsTheme = await prisma.detailTheme.findMany({
      include: {
        theme: {
          select: {
            id: true,
            contenuFr: true,
            contenuEn: true,
            pays: {
              select: {
                id: true,
                nom: true,
                nomFr: true,
                nomEn: true,
                drapeau: true,
              },
            },
          },
        },
        liens: true,
      },
      orderBy: { contenuFr: "asc" },
    });

    res.status(200).json(convertBigIntToNumber({
      message: "Détails de thème récupérés avec succès",
      detailsTheme,
      total: detailsTheme.length,
    }));
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des détails de thème :",
      error
    );
    res.status(500).json({
      error: "Erreur lors de la récupération des détails de thème.",
      details: error.message,
    });
  }
});

// Récupérer un détail de thème par ID
router.get("/detail/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const detailTheme = await prisma.detailTheme.findUnique({
      where: { id },
      include: {
        theme: {
          select: {
            id: true,
            contenuFr: true,
            contenuEn: true,
            pays: {
              select: {
                id: true,
                nom: true,
                nomFr: true,
                nomEn: true,
                drapeau: true,
              },
            },
          },
        },
        liens: true,
      },
    });

    if (!detailTheme) {
      return res.status(404).json({
        error: "Détail de thème non trouvé.",
      });
    }

    res.status(200).json({
      message: "Détail de thème récupéré avec succès",
      detailTheme,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération du détail de thème :", error);
    res.status(500).json({
      error: "Erreur lors de la récupération du détail de thème.",
      details: error.message,
    });
  }
});

// Récupérer les détails par thème
router.get("/detail/theme/:themeId", async (req, res) => {
  const { themeId } = req.params;

  try {
    const detailsTheme = await prisma.detailTheme.findMany({
      where: { themeId },
      include: {
        theme: {
          select: {
            id: true,
            contenuFr: true,
            contenuEn: true,
          },
        },
        liens: true,
      },
      orderBy: { contenuFr: "asc" },
    });

    res.status(200).json(convertBigIntToNumber({
      success: true,
      message: "Détails de thème récupérés avec succès",
      detailsTheme,
      total: detailsTheme.length,
    }));
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des détails par thème :",
      error
    );
    res.status(500).json({
      error: "Erreur lors de la récupération des détails par thème.",
      details: error.message,
    });
  }
});

// ==================== UPDATE ====================

// Modifier un détail de thème
router.put("/detail/:id", async (req, res) => {
  const { id } = req.params;
  const { contenuFr, contenuEn, themeId, liens } = req.body;

  try {
    // Vérifier si le détail existe
    const detailExistant = await prisma.detailTheme.findUnique({
      where: { id },
      include: { liens: true },
    });

    if (!detailExistant) {
      return res.status(404).json({
        error: "Détail de thème non trouvé.",
      });
    }

    // Si themeId est fourni, vérifier que le thème existe
    if (themeId) {
      const themeExistant = await prisma.theme.findUnique({
        where: { id: themeId },
      });

      if (!themeExistant) {
        return res.status(404).json({
          error: "Le thème spécifié n'existe pas.",
        });
      }
    }

    // Utiliser une transaction pour mettre à jour le détail et les liens
    const result = await prisma.$transaction(async (tx) => {
      // Préparer les données à mettre à jour
      const dataToUpdate = {};
      if (contenuFr) dataToUpdate.contenuFr = contenuFr;
      if (contenuEn) dataToUpdate.contenuEn = contenuEn;
      if (themeId) dataToUpdate.themeId = themeId;

      // Mettre à jour le détail
      const detailMisAJour = await tx.detailTheme.update({
        where: { id },
        data: dataToUpdate,
      });

      // Gérer les liens si fournis
      if (liens && Array.isArray(liens)) {
        // Supprimer tous les anciens liens
        await tx.lien.deleteMany({
          where: { detailThemeId: id },
        });

        // Créer les nouveaux liens
        if (liens.length > 0) {
          const liensData = liens.map((url) => ({
            url,
            detailThemeId: id,
          }));

          await tx.lien.createMany({
            data: liensData,
          });
        }
      }

      // Récupérer le détail mis à jour avec les liens
      return await tx.detailTheme.findUnique({
        where: { id },
        include: {
          theme: {
            select: {
              id: true,
              contenuFr: true,
              contenuEn: true,
            },
          },
          liens: true,
        },
      });
    });

    res.status(200).json(convertBigIntToNumber({
      message: "Détail de thème modifié avec succès",
      detailTheme: result,
    }));
  } catch (error) {
    console.error("Erreur lors de la modification du détail de thème :", error);
    res.status(500).json({
      error: "Erreur lors de la modification du détail de thème.",
      details: error.message,
    });
  }
});

// ==================== DELETE ====================

// Supprimer un détail de thème
router.delete("/detail/:id", async (req, res) => {
  const { id } = req.params;

  try {
    // Vérifier si le détail existe
    const detailTheme = await prisma.detailTheme.findUnique({
      where: { id },
      include: { liens: true },
    });

    if (!detailTheme) {
      return res.status(404).json({
        error: "Détail de thème non trouvé.",
      });
    }

    // Supprimer d'abord tous les liens associés
    await prisma.lien.deleteMany({
      where: { detailThemeId: id },
    });

    // Puis supprimer le détail de thème
    await prisma.detailTheme.delete({
      where: { id },
    });

    res.status(200).json({
      message: "Détail de thème supprimé avec succès",
    });
  } catch (error) {
    console.error("Erreur lors de la suppression du détail de thème :", error);
    res.status(500).json({
      error: "Erreur lors de la suppression du détail de thème.",
      details: error.message,
    });
  }
});

// =============================================================================
// CRUD LIEN
// =============================================================================

// ==================== CREATE ====================

// Créer un lien
router.post("/lien/creer", async (req, res) => {
  const { url, detailThemeId } = req.body;

  // Validation des champs obligatoires
  if (!url || !detailThemeId) {
    return res.status(400).json({
      error: "Les champs url et detailThemeId sont obligatoires.",
    });
  }

  try {
    // Vérifier si le détail de thème existe
    const detailThemeExistant = await prisma.detailTheme.findUnique({
      where: { id: detailThemeId },
    });

    if (!detailThemeExistant) {
      return res.status(404).json({
        error: "Le détail de thème spécifié n'existe pas.",
      });
    }

    // Créer le lien
    const lien = await prisma.lien.create({
      data: {
        url,
        detailThemeId,
      },
      include: {
        detailTheme: {
          select: {
            id: true,
            contenuFr: true,
            contenuEn: true,
            theme: {
              select: {
                id: true,
                contenuFr: true,
                contenuEn: true,
              },
            },
          },
        },
      },
    });

    res.status(201).json({
      message: "Lien créé avec succès",
      lien,
    });
  } catch (error) {
    console.error("Erreur lors de la création du lien :", error);
    res.status(500).json({
      error: "Erreur lors de la création du lien.",
      details: error.message,
    });
  }
});

// ==================== READ ====================

// Récupérer tous les liens
router.get("/lien/lire", async (req, res) => {
  try {
    const liens = await prisma.lien.findMany({
      include: {
        detailTheme: {
          select: {
            id: true,
            contenuFr: true,
            contenuEn: true,
            theme: {
              select: {
                id: true,
                contenuFr: true,
                contenuEn: true,
              },
            },
          },
        },
      },
      orderBy: { url: "asc" },
    });

    res.status(200).json({
      message: "Liens récupérés avec succès",
      liens,
      total: liens.length,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des liens :", error);
    res.status(500).json({
      error: "Erreur lors de la récupération des liens.",
      details: error.message,
    });
  }
});

// Récupérer un lien par ID
router.get("/lien/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const lien = await prisma.lien.findUnique({
      where: { id },
      include: {
        detailTheme: {
          select: {
            id: true,
            contenuFr: true,
            contenuEn: true,
            theme: {
              select: {
                id: true,
                contenuFr: true,
                contenuEn: true,
              },
            },
          },
        },
      },
    });

    if (!lien) {
      return res.status(404).json({
        error: "Lien non trouvé.",
      });
    }

    res.status(200).json({
      message: "Lien récupéré avec succès",
      lien,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération du lien :", error);
    res.status(500).json({
      error: "Erreur lors de la récupération du lien.",
      details: error.message,
    });
  }
});

// Récupérer les liens par détail de thème
router.get("/lien/detail/:detailThemeId", async (req, res) => {
  const { detailThemeId } = req.params;

  try {
    const liens = await prisma.lien.findMany({
      where: { detailThemeId },
      include: {
        detailTheme: {
          select: {
            id: true,
            contenuFr: true,
            contenuEn: true,
          },
        },
      },
      orderBy: { url: "asc" },
    });

    res.status(200).json({
      message: "Liens récupérés avec succès",
      liens,
      total: liens.length,
    });
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des liens par détail :",
      error
    );
    res.status(500).json({
      error: "Erreur lors de la récupération des liens par détail.",
      details: error.message,
    });
  }
});

// ==================== UPDATE ====================

// Modifier un lien
router.put("/lien/:id", async (req, res) => {
  const { id } = req.params;
  const { url, detailThemeId } = req.body;

  try {
    // Vérifier si le lien existe
    const lienExistant = await prisma.lien.findUnique({
      where: { id },
    });

    if (!lienExistant) {
      return res.status(404).json({
        error: "Lien non trouvé.",
      });
    }

    // Si detailThemeId est fourni, vérifier que le détail existe
    if (detailThemeId) {
      const detailThemeExistant = await prisma.detailTheme.findUnique({
        where: { id: detailThemeId },
      });

      if (!detailThemeExistant) {
        return res.status(404).json({
          error: "Le détail de thème spécifié n'existe pas.",
        });
      }
    }

    // Préparer les données à mettre à jour
    const dataToUpdate = {};
    if (url) dataToUpdate.url = url;
    if (detailThemeId) dataToUpdate.detailThemeId = detailThemeId;

    // Mettre à jour le lien
    const lienMisAJour = await prisma.lien.update({
      where: { id },
      data: dataToUpdate,
      include: {
        detailTheme: {
          select: {
            id: true,
            contenuFr: true,
            contenuEn: true,
            theme: {
              select: {
                id: true,
                contenuFr: true,
                contenuEn: true,
              },
            },
          },
        },
      },
    });

    res.status(200).json({
      message: "Lien modifié avec succès",
      lien: lienMisAJour,
    });
  } catch (error) {
    console.error("Erreur lors de la modification du lien :", error);
    res.status(500).json({
      error: "Erreur lors de la modification du lien.",
      details: error.message,
    });
  }
});

// ==================== DELETE ====================

// Supprimer un lien
router.delete("/lien/:id", async (req, res) => {
  const { id } = req.params;

  try {
    // Vérifier si le lien existe
    const lien = await prisma.lien.findUnique({
      where: { id },
    });

    if (!lien) {
      return res.status(404).json({
        error: "Lien non trouvé.",
      });
    }

    // Supprimer le lien
    await prisma.lien.delete({
      where: { id },
    });

    res.status(200).json({
      message: "Lien supprimé avec succès",
    });
  } catch (error) {
    console.error("Erreur lors de la suppression du lien :", error);
    res.status(500).json({
      error: "Erreur lors de la suppression du lien.",
      details: error.message,
    });
  }
});

// Supprimer plusieurs liens
router.delete("/lien", async (req, res) => {
  const { ids } = req.body;

  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({
      error: "Une liste d'IDs valide est requise.",
    });
  }

  try {
    // Supprimer les liens
    const result = await prisma.lien.deleteMany({
      where: { id: { in: ids } },
    });

    res.status(200).json({
      message: `${result.count} lien(s) supprimé(s) avec succès`,
      supprimesCount: result.count,
    });
  } catch (error) {
    console.error("Erreur lors de la suppression multiple des liens :", error);
    res.status(500).json({
      error: "Erreur lors de la suppression des liens.",
      details: error.message,
    });
  }
});

// =============================================================================
// ROUTES UTILITAIRES
// =============================================================================

// Obtenir les statistiques
router.get("/stats/total", async (req, res) => {
  try {
    const [totalThemes, totalDetails, totalLiens] = await Promise.all([
      prisma.theme.count(),
      prisma.detailTheme.count(),
      prisma.lien.count(),
    ]);

    res.status(200).json({
      message: "Statistiques récupérées avec succès",
      stats: {
        totalThemes,
        totalDetails,
        totalLiens,
      },
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des statistiques :", error);
    res.status(500).json({
      error: "Erreur lors de la récupération des statistiques.",
      details: error.message,
    });
  }
});

// Recherche globale
router.get("/rechercher/:terme", async (req, res) => {
  const { terme } = req.params;

  try {
    const [themes, details] = await Promise.all([
      // Rechercher dans les thèmes
      prisma.theme.findMany({
        where: {
          OR: [
            { contenuFr: { contains: terme, mode: "insensitive" } },
            { contenuEn: { contains: terme, mode: "insensitive" } },
          ],
        },
        include: {
          pays: {
            select: {
              id: true,
              nom: true,
              nomFr: true,
              nomEn: true,
              drapeau: true,
            },
          },
          details: {
            include: {
              liens: true,
            },
          },
        },
      }),
      // Rechercher dans les détails de thème
      prisma.detailTheme.findMany({
        where: {
          OR: [
            { contenuFr: { contains: terme, mode: "insensitive" } },
            { contenuEn: { contains: terme, mode: "insensitive" } },
          ],
        },
        include: {
          theme: {
            include: {
              pays: {
                select: {
                  id: true,
                  nom: true,
                  nomFr: true,
                  nomEn: true,
                  drapeau: true,
                },
              },
            },
          },
          liens: true,
        },
      }),
    ]);

    res.status(200).json({
      message: "Recherche globale avec succès",
      themes,
      details,
    });
  } catch (error) {
    console.error("Erreur lors de la recherche globale :", error);
    res.status(500).json({
      error: "Erreur lors de la recherche globale.",
      details: error.message,
    });
  }
});

module.exports = router;
