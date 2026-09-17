# TransPac 27 — Feuille de route de campagne

Découpage de la campagne océanographique TransPac 27 en deux *legs* avec escale imposée à **Apia** (Samoa), sous contraintes de durée (transit + opérations).

## Contenu du dépôt

| Fichier | Description |
|---|---|
| `TransPac_carte_bathy_v2.html` | Carte interactive (Leaflet) : bathymétrie GEBCO, route des 2 legs, stations cliquables avec instruments, frontières et noms de ZEE. À ouvrir dans un navigateur. |
| `20260916_TransPac_route.xlsx` | Classeur maître : onglets `20260916_TransPac_leg1`, `20260916_leg2`, et une feuille `Légende`. Contient les formules de calcul des temps. |
| `leg1.csv` / `leg2.csv` | Export texte des deux legs, pour un suivi des modifications lisible ligne à ligne sous Git. |
| `export_csv.py` | Régénère `leg1.csv` / `leg2.csv` depuis le classeur. À lancer après chaque modification du `.xlsx`. |

> Les CSV sont régénérés depuis le classeur — le `.xlsx` reste la source de vérité (il porte les formules). En cas de divergence, se fier au classeur.

### Mettre à jour les CSV après modification du classeur

Le workflow recommandé à chaque révision :

1. Modifier `20260916_TransPac_route.xlsx` dans ton tableur.
2. **L'enregistrer** (le recalcul des formules se fait à l'ouverture/enregistrement).
3. Régénérer les CSV :
   ```bash
   python export_csv.py
   ```
4. Committer :
   ```bash
   git add -A && git commit -m "Décris le changement" && git push
   ```

Prérequis du script : `pip install openpyxl`. Si les colonnes calculées (Ops total) apparaissent vides dans les CSV, c'est que le classeur n'a pas été recalculé — ouvre-le et réenregistre-le avant de relancer le script.

## Découpage retenu

- **Leg 1 — Nouméa → Apia** : Loy1, OJP_1 à OJP_9 (réordonné), NT_1, NT_2, NT_3.
- **Leg 2 — Apia → Papeete** : ESAM, groupe ManiHiki (réordonné), Line Islands (réordonné), Challenger, Vostok, Fa'aroa.

### Bilan de faisabilité (état courant)

| Leg | Transit | Opérations | Total | Limite | Marge |
|---|---|---|---|---|---|
| Leg 1 | ~410 h | 191 h | **25,03 j** | 26 j | +0,97 j |
| Leg 2 | ~359 h | 143 h | **20,90 j** | 23 j | +2,10 j |

## Hypothèses de calcul

- **Vitesse de transit** : 10 nœuds (240 nm / 24 h, déduite de la feuille d'origine).
- **Distances** : grand-cercle (haversine). Approximation ; le routage réel diffère de quelques heures.
- **Ordre des stations** : optimisé pour minimiser le transit (recherche exhaustive, ports fixes).
- **Carottier Calypso** : 3 h de manipulation + aller-retour surface↔fond à 1 m/s.
- **MultiTube** : 1 h de manipulation + aller-retour surface↔fond à 1 m/s.
- **Arrondi** : tous les temps de manipulation sont arrondis à l'heure supérieure (conservatif).

Codes instruments : `CS` site survey · `C1` CTD/Rosette phyto · `C2` CTD/Rosette hydro · `MN` MultiNet · `NP` filet phyto/ADN · `NM` filet mésozooplancton · `CA` Calypso · `MT` MultiTube.

## Stations ajoutées / modifiées par rapport à l'original

- **Loy1** — bassin des Loyautés (20°44'26.51"S 165°50'53.72"E), station test carottier, début Leg 1.
- **NT_3** — sur la route NT_2→Apia, limite Est de la ZEE de Tuvalu. Initialement joker (0 op.), **activée** en station complète (profil = NT_2).
- **ESAM** (ex-WTOK) — renommée « East Samoa » et recalée à l'Est (~168°W) sur la route Apia→MH_3.
- **Fa'aroa** — baie de Fa'aroa, Raiatea, fin Leg 2, carotte côtière (~50 m).

## Points à valider (⚠️)

1. L'ordre optimisé **casse la logique de certains transects** (ManiHiki 3→4→1→2, Line 2→1) — à valider avec les responsables scientifiques.
2. **ESAM** : ZEE à confirmer (probable haute mer ; zone frontière Samoa / Tokelau-NZ).
3. **NT_3** : limite Est de la ZEE de Tuvalu approximative ; profondeur 5000 m en hypothèse.
4. **Profondeurs** d'ESAM, CHAL, VOST fixées à 4500 m par défaut — à remplacer par les valeurs réelles.
5. **Fa'aroa** : coordonnées de baie approximatives ; autorisation locale et adéquation du Calypso en petit-fond à vérifier.
6. ZEE et profondeurs à recouper avec les sources officielles (Marine Regions / VLIZ, GEBCO) avant toute demande d'autorisation.

## Carte en ligne (optionnel)

Pour publier la carte via GitHub Pages : *Settings → Pages → Source : `main` / `root`*.
La carte sera accessible à `https://<utilisateur>.github.io/<dépôt>/TransPac_carte_bathy_v2.html`.

---

*Généré à partir de la feuille `20260827_TransPac27_operations`. Temps estimés, à affiner avec le routage réel et les profondeurs mesurées.*
