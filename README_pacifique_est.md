# TransPac Pacifique Est — Papeete → Guayaquil ou Panama City (v1, 06/11/2026)

- `TransPac_PacifiqueEst_carte_v1.html` : carte (affichage seul) des deux options, avec jours de campagne et durées par station.
- `planificateur_pacifique_est.html` : planificateur interactif (mêmes fonctions que `planificateur.html`), données par défaut des deux options ;
  sauvegarde locale séparée de celle du planificateur TransPac 2027. Colonne « Jour » = jour de campagne (J53 = départ de Papeete).
- `transpac_pacifique_est_route_v1.json` : données par défaut du planificateur (à réimporter avec « Importer JSON »).
- `TransPac_PacifiqueEst_route_v1.xlsx` : mêmes calculs en Excel (formules), un onglet par option.
- `planner_engine_v2.js` : moteur de calcul (ajout des jours de campagne), déjà intégré au planificateur.

Hypothèses : stations, ordre et opérations de l'onglet TransPac28_Leg3 du fichier des opérations ; profondeurs du même fichier
(TE_105 : GEBCO) ; Calypso = arrondi_sup(2 × profondeur / 3600 + 4,0 h) + 2 h sur Tua_1 et Tua_2 (GENAVIR, N/O Pourquoi Pas ?) ;
10 nds, grand-cercle, opérations H24 ; limite 48 jours (J53 → J101). Date d'appareillage inconnue : la date affichée (22/02/2029) est fictive.
Option B : ordre optimisé après TE_95 (Gua_1 visité entre Gal_3 et Gal_4), arrivée Panama City approximée à Balboa (8,92 N 79,53 W).
