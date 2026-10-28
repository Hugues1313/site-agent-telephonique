/* ==========================================================================
   CONFIGURATION DU SITE
   --------------------------------------------------------------------------
   C'est le SEUL fichier à modifier pour le nom du produit, le logo, les
   captures d'écran et les coordonnées.
   ========================================================================== */

window.SITE_CONFIG = {
  /* Nom du produit.
     Remplacez "[NOM DU PRODUIT]" par le vrai nom : il sera mis à jour
     partout (titres, textes, menu, pied de page, onglet du navigateur). */
  nomProduit: "[NOM DU PRODUIT]",

  /* Logo.
     Laissez vide ("") tant que le fichier n'existe pas : un cadre « Logo »
     s'affiche. Quand vous avez déposé le fichier, écrivez "logo.svg". */
  logo: "",

  /* Vraies captures de l'application (remplacent les maquettes des onglets).
     Passez à true quand le fichier correspondant est déposé dans . */
  captures: {
    "capture-resumes.png": false,
    "capture-infos-entreprise.png": false,
    "capture-transcriptions.png": false
  },

  /* Coordonnées affichées dans la section « Demander une démo ».
     Laissez vide ("") pour afficher l'emplacement [À COMPLÉTER]. */
  contact: {
    email: "",
    telephone: ""
  },

  /* Surligne en doré les emplacements encore à remplir ([NOM DU PRODUIT],
     [À COMPLÉTER]…). Pratique pendant la construction : passez à false
     avant la mise en ligne. */
  surlignerEmplacements: true
};
