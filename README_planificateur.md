# TransPac 27 — planificateur de route (v4, 05/11/2026)

- `planificateur.html` : planificateur interactif (page autonome, Leaflet via unpkg). Modifier stations, profondeurs,
  opérations, ordre, dates d'appareillage ; distances, transits, durées Calypso (règle GENAVIR), dates locales/UTC,
  marges et nombre d'opérations sont recalculés. Sauvegarde automatique dans le navigateur (localStorage) ;
  « Exporter JSON » pour partager une version, « Importer JSON » pour la recharger, « Exporter CSV » pour Excel.
- `TransPac_carte_bathy_v3.html` : carte statique mise à jour (NT_3 activée).
- `transpac_route_v4.json` : données par défaut du planificateur (identiques à `20261105_TransPac_route_v4.xlsx`).
- `planner_engine.js` : moteur de calcul (copie lisible ; déjà intégré dans index.html).

Règle Calypso (N/O Pourquoi Pas ?, GENAVIR Guide carottiers V4.0 p.13) :
durée = arrondi_sup(2 × profondeur / 3600 + 4,0 h) + bonus (2 h pour Loy1, OJP_1, MH_3).
Hypothèses : 10 nds, grand-cercle, opérations enchaînées H24 ; départ Nouméa 14/07/2027 08:00 (UTC+11),
départ Apia 31/08/2027 08:00 (UTC+13).
