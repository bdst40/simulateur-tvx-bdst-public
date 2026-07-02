import { useState, useMemo } from "react";

const LOGO_SRC = "/logo-bdst.jpg";

const BG_IMAGES = {
  chambre: "/img/chambre.jpg",
  salon: "/img/salon.jpg",
  cuisine: "/img/cuisine.jpg",
  sdb: "/img/sdb.jpg",
  bureau: "/img/bureau.jpg",
  entree: "/img/entree.jpg",
  wc: "/img/wc.jpg",
  jardin: "/img/jardin.jpg",
};

const MARINE = "#000131";
const OR = "#D4AF37";
const BLANC = "#FFFFFF";

const EMAILJS_SERVICE_ID = "service_t51wus8";
const EMAILJS_TEMPLATE_ADMIN = "template_slix1ni";
const EMAILJS_TEMPLATE_PROSPECT = "template_6zrwttl";
const EMAILJS_PUBLIC_KEY = "H456JnEh4IFv_91wc";

// ─── BASE DE PRIX ──────────────────────────────────────────────────────────
// "moy" = prix moyen constaté (issu de la base interne BDS pour les postes
// marqués source:"interne" ; issu de références marché 2026 pour ceux
// marqués source:"externe", à valider/ajuster par BDS).
// Affichage = moy × 1,075 (marge "bonne surprise"), fourchette ±15%
// (±25% pour les postes "large" = techniques/complexes, cf. wide:true).
const PRICES = {
  // --- Intérieur : peinture ---
  peintureMur: { label: "Peinture des murs", unite: "m²", moy: 22, source: "interne" },
  peinturePlafond: { label: "Peinture du plafond", unite: "m²", moy: 25, source: "interne" },
  // --- Intérieur : sol ---
  solRetrait: { label: "Retrait du sol existant", unite: "m²", moy: 22.5, source: "interne" },
  solParquet: { label: "Parquet flottant (F&P)", unite: "m²", moy: 40, source: "interne" },
  solSouple: { label: "Sol souple / lino (F&P)", unite: "m²", moy: 25, source: "interne" },
  solVinyle: { label: "Sol vinyle / PVC (F&P)", unite: "m²", moy: 35, source: "interne" },
  solCarrelage: { label: "Carrelage grès cérame (F&P)", unite: "m²", moy: 75, source: "interne" },
  // --- Intérieur : électricité ---
  priseElec: { label: "Point prise (F&P)", unite: "U", moy: 90, source: "interne" },
  pointLumineux: { label: "Point lumineux (F&P)", unite: "U", moy: 130, source: "interne" },
  radiateurElec: { label: "Radiateur électrique à inertie (F&P)", unite: "U", moy: 180, source: "interne" },
  // --- Intérieur : plomberie / chauffage local ---
  chauffeEauThermo: { label: "Chauffe-eau thermodynamique (F&P)", unite: "U", moy: 3500, source: "interne", wide: true },
  secheServiette: { label: "Sèche-serviettes (F&P)", unite: "U", moy: 350, source: "interne" },
  climSplit: { label: "Climatisation réversible - split (F&P)", unite: "U", moy: 2500, source: "interne", wide: true },
  douche: { label: "Douche italienne complète (F&P)", unite: "U", moy: 2000, source: "interne", wide: true },
  wcPose: { label: "WC posé (F&P)", unite: "U", moy: 350, source: "interne" },
  // --- Intérieur : menuiserie intérieure / agencement ---
  porteInt: { label: "Bloc-porte intérieur (F&P)", unite: "U", moy: 250, source: "interne" },
  porteplacard: { label: "Placard portes coulissantes (F&P)", unite: "ml", moy: 350, source: "interne" },
  dressing: { label: "Dressing sur mesure (F&P)", unite: "ml", moy: 700, source: "interne" },
  cuisineEntree: { label: "Cuisine entrée de gamme (F&P)", unite: "ml", moy: 500, source: "interne" },
  cuisineMilieu: { label: "Cuisine milieu de gamme (F&P)", unite: "ml", moy: 1000, source: "interne" },
  cuisineHaut: { label: "Cuisine haut de gamme (F&P)", unite: "ml", moy: 2000, source: "interne" },

  // --- Extérieur/Global : isolation ---
  isolationCombles: { label: "Isolation combles (soufflage)", unite: "m²", moy: 25, source: "interne" },
  isolationRampants: { label: "Isolation rampants", unite: "m²", moy: 70, source: "interne" },
  isolationITI: { label: "Isolation par l'intérieur (ITI, doublage)", unite: "m²", moy: 50, source: "interne" },
  isolationITE: { label: "Isolation par l'extérieur (ITE, enduit)", unite: "m²", moy: 150, source: "interne", wide: true },
  // --- Extérieur/Global : menuiseries extérieures ---
  fenetre: { label: "Fenêtre PVC 2 vantaux (F&P)", unite: "U", moy: 650, source: "interne" },
  portefenetre: { label: "Porte-fenêtre PVC 2 vantaux (F&P)", unite: "U", moy: 850, source: "interne" },
  porteEntree: { label: "Porte d'entrée PVC (F&P)", unite: "U", moy: 1000, source: "interne" },
  porteService: { label: "Porte de service (F&P)", unite: "U", moy: 630, source: "externe" },
  porteGarage: { label: "Porte de garage sectionnelle (F&P)", unite: "U", moy: 1500, source: "interne" },
  voletBattant: { label: "Volet battant PVC (F&P)", unite: "U", moy: 400, source: "externe" },
  voletRoulant: { label: "Volet roulant alu (F&P)", unite: "U", moy: 380, source: "interne" },
  storeBanne: { label: "Store banne motorisé (F&P)", unite: "U", moy: 1800, source: "externe" },
  moustiquaire: { label: "Moustiquaire enroulable (F&P)", unite: "U", moy: 180, source: "externe" },
  // --- Extérieur/Global : toiture ---
  tuiles: { label: "Réfection couverture tuiles", unite: "m²", moy: 70, source: "interne" },
  gouttiere: { label: "Remplacement gouttière", unite: "ml", moy: 40, source: "interne" },
  velux: { label: "Velux (F&P)", unite: "U", moy: 800, source: "interne" },
  nettoyageToiture: { label: "Nettoyage / démoussage toiture", unite: "m²", moy: 22, source: "externe" },
  sousFaceToiture: { label: "Sous-face d'avancée de toit", unite: "m²", moy: 55, source: "interne" },
  // --- Extérieur/Global : chauffage lourd / technique ---
  pacAirEau: { label: "PAC air-eau (F&P, forfait)", unite: "forfait", moy: 12000, source: "interne", wide: true },
  chaudiereGaz: { label: "Chaudière gaz condensation (F&P, forfait)", unite: "forfait", moy: 5000, source: "interne", wide: true },
  poeleBois: { label: "Poêle bois/granulés (F&P)", unite: "U", moy: 4000, source: "interne", wide: true },
  vmc: { label: "VMC simple flux hygro B (F&P, forfait)", unite: "forfait", moy: 800, source: "interne" },
  tableauElec: { label: "Mise aux normes tableau électrique (forfait)", unite: "forfait", moy: 1500, source: "interne" },
  photovoltaique: { label: "Panneaux photovoltaïques", unite: "kWc", moy: 2300, source: "interne", wide: true },
  // --- Extérieur/Global : extérieur / terrain ---
  dalleBeton: { label: "Dalle béton extérieure", unite: "m²", moy: 60, source: "interne" },
  terrasseBois: { label: "Terrasse bois (F&P)", unite: "m²", moy: 100, source: "interne" },
  clotureGrillage: { label: "Clôture grillage souple", unite: "ml", moy: 35, source: "interne" },
  clotureRigide: { label: "Clôture rigide occultante", unite: "ml", moy: 100, source: "externe" },
  portail: { label: "Portail alu motorisé (F&P)", unite: "U", moy: 2500, source: "interne" },
  assainissement: { label: "Assainissement individuel (fosse)", unite: "forfait", moy: 7000, source: "interne", wide: true },
  terrassement: { label: "Terrassement", unite: "m³", moy: 30, source: "interne", wide: true },
};

function calcPoste(key, qte) {
  const p = PRICES[key];
  const unitaireMajore = p.moy * 1.075;
  const total = unitaireMajore * qte;
  const marge = p.wide ? 0.25 : 0.15;
  return {
    label: p.label,
    unite: p.unite,
    qte,
    total,
    bas: total * (1 - marge),
    haut: total * (1 + marge),
    wide: !!p.wide,
  };
}

const TYPES_PIECE = [
  { id: "chambre", label: "Chambre", icon: "🛏️" },
  { id: "salon", label: "Salon / Séjour", icon: "🛋️" },
  { id: "cuisine", label: "Cuisine", icon: "🍳" },
  { id: "sdb", label: "Salle de bain", icon: "🛁" },
  { id: "bureau", label: "Bureau", icon: "💼" },
  { id: "entree", label: "Couloir / Entrée", icon: "🚪" },
  { id: "wc", label: "WC", icon: "🚽" },
];

const CAT_INTERIEUR = [
  {
    id: "peinture",
    label: "🎨 Peinture",
    nota: "Le devis final de l'artisan peut évoluer selon l'état des murs et la présence ou non de tapisserie à retirer.",
    items: [
      { key: "peintureMur", label: "Peinture des murs", auto: "surface" },
      { key: "peinturePlafond", label: "Peinture du plafond", auto: "surface" },
    ],
  },
  {
    id: "sol",
    label: "🧱 Sol",
    nota: "Un ragréage du sol existant peut être nécessaire selon l'état du support, ce qui peut faire évoluer le devis final.",
    items: [
      { key: "solRetrait", label: "Retrait du sol existant", auto: "surface" },
      { key: "solParquet", label: "Parquet flottant", auto: "surface", group: "revetement", pieces: ["chambre", "salon", "bureau", "entree"] },
      { key: "solSouple", label: "Sol souple / lino", auto: "surface", group: "revetement" },
      { key: "solVinyle", label: "Sol vinyle / PVC", auto: "surface", group: "revetement" },
      { key: "solCarrelage", label: "Carrelage", auto: "surface", group: "revetement" },
    ],
  },
  {
    id: "electricite",
    label: "💡 Électricité",
    items: [
      { key: "priseElec", label: "Prises électriques" },
      { key: "pointLumineux", label: "Points lumineux" },
      { key: "radiateurElec", label: "Radiateur électrique" },
    ],
  },
  {
    id: "plomberie",
    label: "🚿 Plomberie / chauffage",
    nota: "Climatisation, PAC et douche italienne sont des postes techniques : la fourchette affichée est volontairement plus large, un passage sur site reste nécessaire pour un chiffrage précis.",
    items: [
      { key: "chauffeEauThermo", label: "Chauffe-eau thermodynamique", pieces: ["cuisine", "sdb", "wc", "entree"] },
      { key: "secheServiette", label: "Sèche-serviettes", pieces: ["sdb"] },
      { key: "climSplit", label: "Climatisation réversible (split)", pieces: ["chambre", "salon", "bureau", "cuisine"] },
      { key: "douche", label: "Douche italienne", pieces: ["sdb"] },
      { key: "wcPose", label: "WC", pieces: ["wc", "sdb"] },
    ],
  },
  {
    id: "menuiserieInt",
    label: "🚪 Menuiserie intérieure / agencement",
    items: [
      { key: "porteInt", label: "Porte intérieure" },
      { key: "porteplacard", label: "Portes de placard", pieces: ["chambre", "entree", "bureau"] },
      { key: "dressing", label: "Dressing sur mesure", pieces: ["chambre"] },
      { key: "cuisineEntree", label: "Cuisine entrée de gamme", group: "cuisineNiveau", pieces: ["cuisine"] },
      { key: "cuisineMilieu", label: "Cuisine milieu de gamme", group: "cuisineNiveau", pieces: ["cuisine"] },
      { key: "cuisineHaut", label: "Cuisine haut de gamme", group: "cuisineNiveau", pieces: ["cuisine"] },
    ],
  },
];

const CAT_GLOBAL = [
  {
    id: "isolation",
    label: "🧊 Isolation",
    items: [
      { key: "isolationCombles", label: "Combles (soufflage)" },
      { key: "isolationRampants", label: "Rampants" },
      { key: "isolationITI", label: "Murs par l'intérieur (ITI)" },
      { key: "isolationITE", label: "Murs par l'extérieur (ITE)" },
    ],
  },
  {
    id: "menuiExt",
    label: "🪟 Menuiseries extérieures",
    items: [
      { key: "fenetre", label: "Fenêtre" },
      { key: "portefenetre", label: "Porte-fenêtre" },
      { key: "porteEntree", label: "Porte d'entrée" },
      { key: "porteService", label: "Porte de service" },
      { key: "porteGarage", label: "Porte de garage" },
      { key: "voletBattant", label: "Volet battant" },
      { key: "voletRoulant", label: "Volet roulant" },
      { key: "storeBanne", label: "Store banne" },
      { key: "moustiquaire", label: "Moustiquaire" },
    ],
  },
  {
    id: "toiture",
    label: "🏠 Toiture",
    items: [
      { key: "tuiles", label: "Remplacement des tuiles" },
      { key: "gouttiere", label: "Gouttière" },
      { key: "velux", label: "Velux" },
      { key: "nettoyageToiture", label: "Nettoyage toiture" },
      { key: "sousFaceToiture", label: "Sous-face de toit" },
    ],
  },
  {
    id: "chauffageLourd",
    label: "🔥 Chauffage / technique",
    nota: "PAC, chaudière, poêle et photovoltaïque nécessitent une étude sur site : la fourchette affichée est volontairement plus large.",
    items: [
      { key: "pacAirEau", label: "PAC air-eau" },
      { key: "chaudiereGaz", label: "Chaudière gaz condensation" },
      { key: "poeleBois", label: "Poêle bois / granulés" },
      { key: "vmc", label: "VMC" },
      { key: "tableauElec", label: "Mise aux normes du tableau électrique" },
      { key: "photovoltaique", label: "Panneaux photovoltaïques (kWc)" },
    ],
  },
  {
    id: "exterieur",
    label: "🌳 Extérieur",
    nota: "Assainissement et terrassement dépendent fortement de la nature du sol et de l'accès chantier : fourchette large, étude nécessaire.",
    items: [
      { key: "dalleBeton", label: "Dalle béton" },
      { key: "terrasseBois", label: "Terrasse bois" },
      { key: "clotureGrillage", label: "Clôture grillage" },
      { key: "clotureRigide", label: "Clôture rigide" },
      { key: "portail", label: "Portail" },
      { key: "assainissement", label: "Assainissement individuel" },
      { key: "terrassement", label: "Terrassement" },
    ],
  },
];

export default function EstimateurBDS() {
  const [etape, setEtape] = useState("intro");
  const [contact, setContact] = useState({
    prenom: "", nom: "", email: "", telephone: "", delai: "", statut: "", optin: false,
  });
  const [erreurs, setErreurs] = useState({});

  const [pieces, setPieces] = useState([]);
  const [pieceCourante, setPieceCourante] = useState(null);
  const [catOuverte, setCatOuverte] = useState(null);

  const [globalOps, setGlobalOps] = useState({});
  const [catGlobaleOuverte, setCatGlobaleOuverte] = useState(null);

  const [envoiEnCours, setEnvoiEnCours] = useState(false);
  const [envoiStatut, setEnvoiStatut] = useState(null);

  function nouvellePiece() {
    setPieceCourante({ type: null, surface: "", ops: {} });
    setCatOuverte(null);
    setEtape("piece");
  }

  function setOpQte(key, qte) {
    setPieceCourante((pc) => ({ ...pc, ops: { ...pc.ops, [key]: qte } }));
  }
  function setGlobalQte(key, qte) {
    setGlobalOps((g) => ({ ...g, [key]: qte }));
  }

  function toggleGroupItem(itemKey, group, isPiece) {
    if (isPiece) {
      setPieceCourante((pc) => {
        const ops = { ...pc.ops };
        if (group) {
          const catDef = CAT_INTERIEUR.find((c) => c.items.some((i) => i.key === itemKey));
          catDef.items.filter((i) => i.group === group).forEach((i) => delete ops[i.key]);
        }
        if (ops[itemKey] !== undefined) {
          delete ops[itemKey];
        } else {
          ops[itemKey] = pc.surface ? parseFloat(pc.surface) || 0 : 1;
        }
        return { ...pc, ops };
      });
    }
  }

  function calculPiece(p) {
    let bas = 0, haut = 0, moyen = 0;
    const detail = [];
    Object.entries(p.ops).forEach(([key, qte]) => {
      if (!qte || qte <= 0) return;
      const c = calcPoste(key, qte);
      bas += c.bas; haut += c.haut; moyen += c.total;
      detail.push(c);
    });
    return { bas, haut, moyen, detail };
  }

  function calculGlobal() {
    let bas = 0, haut = 0, moyen = 0;
    const detail = [];
    Object.entries(globalOps).forEach(([key, qte]) => {
      if (!qte || qte <= 0) return;
      const c = calcPoste(key, qte);
      bas += c.bas; haut += c.haut; moyen += c.total;
      detail.push(c);
    });
    return { bas, haut, moyen, detail };
  }

  const totalGeneral = useMemo(() => {
    let bas = 0, haut = 0, moyen = 0;
    pieces.forEach((p) => {
      const c = calculPiece(p);
      bas += c.bas; haut += c.haut; moyen += c.moyen;
    });
    const g = calculGlobal();
    bas += g.bas; haut += g.haut; moyen += g.moyen;
    return { bas, haut, moyen };
  }, [pieces, globalOps]);

  const auMoinsUneChose = pieces.length > 0 || Object.values(globalOps).some((q) => q > 0);

  function validerContact() {
    const err = {};
    if (!contact.prenom.trim()) err.prenom = "Prénom requis";
    if (!contact.nom.trim()) err.nom = "Nom requis";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email)) err.email = "Email invalide";
    if (!contact.telephone.trim()) err.telephone = "Téléphone requis";
    if (!contact.delai) err.delai = "Sélectionnez un délai";
    if (!contact.statut) err.statut = "Sélectionnez un statut";
    if (!contact.optin) err.optin = "Consentement requis pour continuer";
    setErreurs(err);
    if (Object.keys(err).length === 0) setEtape("hub");
  }

  function validerPiece() {
    const err = {};
    if (!pieceCourante.type) err.type = "Choisissez un type de pièce";
    if (!pieceCourante.surface || parseFloat(pieceCourante.surface) <= 0) err.surface = "Surface requise";
    const auMoinsUnPoste = Object.values(pieceCourante.ops).some((q) => q > 0);
    if (!auMoinsUnPoste) err.ops = "Sélectionnez au moins un poste de travaux";
    setErreurs(err);
    if (Object.keys(err).length === 0) {
      setPieces([...pieces, pieceCourante]);
      setEtape("hub");
    }
  }

  async function envoyerRecap() {
    setEnvoiEnCours(true);
    setEnvoiStatut(null);
    try {
      const lignesPieces = pieces
        .map((p, i) => {
          const c = calculPiece(p);
          const label = TYPES_PIECE.find((t) => t.id === p.type)?.label || p.type;
          const lignes = c.detail
            .map((d) => `   • ${d.label} : ${d.qte} ${d.unite} → ${Math.round(d.bas)}-${Math.round(d.haut)} €${d.wide ? " (sur devis)" : ""}`)
            .join("\n");
          return `Pièce ${i + 1} — ${label} (${p.surface} m²)\n${lignes}\n   Sous-total : ${Math.round(c.bas)} € - ${Math.round(c.haut)} €`;
        })
        .join("\n\n");

      const g = calculGlobal();
      const ligneGlobal = g.detail.length
        ? "Opérations extérieures / globales :\n" +
          g.detail
            .map((d) => `   • ${d.label} : ${d.qte} ${d.unite} → ${Math.round(d.bas)}-${Math.round(d.haut)} €${d.wide ? " (sur devis)" : ""}`)
            .join("\n") +
          `\n   Sous-total : ${Math.round(g.bas)} € - ${Math.round(g.haut)} €`
        : "";

      const recapTexte = [lignesPieces, ligneGlobal].filter(Boolean).join("\n\n");

      // Version HTML stylée (mail prospect uniquement)
      const blocPieceHtml = (titre, detail) => `
        <div style="margin-bottom:18px;padding-bottom:14px;border-bottom:1px solid #EEEEEE;">
          <div style="font-weight:700;color:#000131;font-size:15px;margin-bottom:8px;">${titre}</div>
          ${detail
            .map(
              (d) =>
                `<div style="font-size:13px;color:#555555;padding:3px 0;">• ${d.label} (${d.qte} ${d.unite})${d.wide ? " ⚠️ sur devis" : ""} : ${Math.round(d.bas)}-${Math.round(d.haut)} €</div>`
            )
            .join("")}
        </div>`;

      const recapHtml =
        pieces
          .map((p, i) => {
            const c = calculPiece(p);
            const label = TYPES_PIECE.find((t) => t.id === p.type)?.label || p.type;
            return blocPieceHtml(`${label} — ${p.surface} m²`, c.detail);
          })
          .join("") + (g.detail.length ? blocPieceHtml("🌳 Extérieur / global", g.detail) : "");

      const templateParams = {
        prenom: contact.prenom,
        nom: contact.nom,
        email: contact.email,
        telephone: contact.telephone,
        delai: contact.delai,
        statut: contact.statut,
        nb_pieces: pieces.length,
        recap_detail: recapTexte,
        recap_html: recapHtml,
        budget_bas: Math.round(totalGeneral.bas),
        budget_haut: Math.round(totalGeneral.haut),
        date: new Date().toLocaleDateString("fr-FR"),
      };

      if (!window.emailjs) {
        await new Promise((resolve, reject) => {
          const script = document.createElement("script");
          script.src = "https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js";
          script.onload = resolve;
          script.onerror = reject;
          document.head.appendChild(script);
        });
        window.emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });
      }

      await window.emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ADMIN, templateParams);
      await window.emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_PROSPECT, templateParams);

      setEnvoiStatut("ok");
      setEtape("fin");
    } catch (e) {
      console.error("Erreur envoi EmailJS:", e);
      const detail = e?.text || e?.message || (typeof e === "string" ? e : JSON.stringify(e));
      setEnvoiStatut(detail || "Erreur inconnue");
    } finally {
      setEnvoiEnCours(false);
    }
  }

  const s = {
    page: { minHeight: "100vh", background: "#F7F7F9", fontFamily: "'Montserrat','Helvetica Neue',Arial,sans-serif", display: "flex", flexDirection: "column", alignItems: "center", padding: "0 0 40px 0" },
    header: { width: "100%", background: "rgba(0,1,49,0.55)", backdropFilter: "blur(6px)", padding: "20px 24px", display: "flex", alignItems: "center", gap: 16, boxSizing: "border-box" },
    logo: { height: 52 },
    headerTitle: { color: BLANC, fontSize: 18, fontWeight: 600, margin: 0 },
    headerSub: { color: OR, fontSize: 12, margin: 0, fontWeight: 500 },
    card: { background: "rgba(255,255,255,0.96)", backdropFilter: "blur(10px)", borderRadius: 20, padding: 32, maxWidth: 600, width: "100%", boxShadow: "0 8px 32px rgba(0,1,49,0.25)", marginTop: 32, boxSizing: "border-box" },
    h2: { color: MARINE, fontSize: 22, fontWeight: 700, marginTop: 0, marginBottom: 8 },
    p: { color: "#444", fontSize: 14, lineHeight: 1.6, marginTop: 0, marginBottom: 20 },
    label: { display: "block", color: MARINE, fontSize: 13, fontWeight: 600, marginBottom: 6, marginTop: 16 },
    input: { width: "100%", padding: "12px 14px", borderRadius: 8, border: "1.5px solid #DDD", fontSize: 14, fontFamily: "inherit", boxSizing: "border-box", outline: "none" },
    inputErr: { borderColor: "#C0392B" },
    err: { color: "#C0392B", fontSize: 12, marginTop: 4 },
    select: { width: "100%", padding: "12px 14px", borderRadius: 8, border: "1.5px solid #DDD", fontSize: 14, fontFamily: "inherit", boxSizing: "border-box", background: BLANC },
    btnPrimary: { background: MARINE, color: BLANC, border: "none", borderRadius: 8, padding: "14px 28px", fontSize: 15, fontWeight: 700, cursor: "pointer", width: "100%", marginTop: 20, fontFamily: "inherit" },
    btnSecondary: { background: "transparent", color: MARINE, border: `1.5px solid ${MARINE}`, borderRadius: 8, padding: "12px 24px", fontSize: 14, fontWeight: 600, cursor: "pointer", width: "100%", marginTop: 10, fontFamily: "inherit" },
    btnGold: { background: OR, color: MARINE, border: "none", borderRadius: 8, padding: "14px 28px", fontSize: 15, fontWeight: 700, cursor: "pointer", width: "100%", marginTop: 20, fontFamily: "inherit" },
    tileGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 8 },
    tile: (active) => ({ border: `1.5px solid ${active ? MARINE : "#DDD"}`, background: active ? MARINE : BLANC, color: active ? BLANC : MARINE, borderRadius: 10, padding: "16px 12px", textAlign: "center", cursor: "pointer", fontSize: 13, fontWeight: 600 }),
    checkboxRow: { display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", border: "1.5px solid #DDD", borderRadius: 8, marginTop: 8, cursor: "pointer" },
    checkboxRowActive: { borderColor: MARINE, background: "#F0F0F5" },
    qtyRow: { display: "flex", alignItems: "center", gap: 10, marginTop: 6, marginLeft: 28 },
    qtyInput: { width: 80, padding: "8px 10px", borderRadius: 6, border: "1.5px solid #DDD", fontSize: 13, fontFamily: "inherit" },
    catHeader: (open) => ({ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 16px", background: open ? MARINE : "#F0F0F5", color: open ? BLANC : MARINE, borderRadius: 8, cursor: "pointer", fontWeight: 700, fontSize: 14, marginTop: 12 }),
    catBody: { padding: "12px 4px 4px 4px" },
    nota: { fontSize: 12.5, color: "#5A5A2E", background: "#FBF6E7", border: "1px solid #E8DBA8", borderRadius: 8, padding: "10px 12px", marginTop: 8, marginBottom: 10, lineHeight: 1.6 },
    notaInfo: { fontSize: 13, color: MARINE, background: "#EEF0F7", border: `1px solid ${MARINE}22`, borderRadius: 8, padding: "14px 16px", marginTop: 10, lineHeight: 1.6, textAlign: "center" },
    badge: { display: "inline-block", background: "#F0F0F5", color: MARINE, fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 20, marginBottom: 12 },
    footer: { width: "100%", maxWidth: 600, background: "rgba(0,1,49,0.55)", backdropFilter: "blur(6px)", color: "rgba(255,255,255,0.9)", fontSize: 11, textAlign: "center", marginTop: 32, lineHeight: 1.6, padding: "16px 20px", boxSizing: "border-box", borderRadius: 12 },
    hubCard: (color) => ({ border: `2px solid ${color}`, borderRadius: 12, padding: "20px", marginTop: 14, cursor: "pointer", textAlign: "center" }),
    contactLink: { fontSize: 12.5, color: "#666", textAlign: "center", marginTop: 20, padding: "12px", background: "#F7F7F9", borderRadius: 8, lineHeight: 1.6 },
  };

  const surfaceNum = pieceCourante ? parseFloat(pieceCourante.surface) || 0 : 0;

  // Fond photo contextuel selon l'étape
  function fondActuel() {
    if (etape === "intro") return BG_IMAGES.jardin;
    if (etape === "contact") return BG_IMAGES.entree;
    if (etape === "hub") return BG_IMAGES.salon;
    if (etape === "piece") return pieceCourante?.type ? BG_IMAGES[pieceCourante.type] : BG_IMAGES.salon;
    if (etape === "global") return BG_IMAGES.jardin;
    if (etape === "resultat") return pieces.length > 0 ? BG_IMAGES[pieces[pieces.length - 1].type] : BG_IMAGES.jardin;
    if (etape === "fin") return BG_IMAGES.jardin;
    return BG_IMAGES.salon;
  }
  const pageStyle = {
    ...s.page,
    backgroundImage: `url(${fondActuel()})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundAttachment: "fixed",
  };

  return (
    <div style={pageStyle}>
      <div style={s.header}>
        <img src={LOGO_SRC} alt="BD Solutions Travaux" style={s.logo} />
        <div>
          <p style={s.headerTitle}>BD Solutions Travaux</p>
          <p style={s.headerSub}>Estimateur de budget travaux — gratuit &amp; sans engagement</p>
        </div>
      </div>

      <div style={s.card}>
        {etape === "intro" && (
          <>
            <h2 style={s.h2}>Un projet de rénovation en tête ?</h2>
            <p style={{ ...s.p, fontSize: 15 }}>
              Vous souhaitez changer la déco de votre chambre, installer la clim dans votre salon, changer votre
              cuisine ou rénover entièrement votre logement ? Vous êtes au bon endroit : cet outil est fait pour vous.
            </p>
            <p style={s.p}>
              En quelques clics, obtenez une estimation budgétaire indicative de vos travaux, pièce par pièce ou pour
              des travaux extérieurs. Sans engagement, gratuit, et vous recevez le résultat directement par email.
            </p>
            <button style={s.btnPrimary} onClick={() => setEtape("contact")}>Commencer →</button>
          </>
        )}

        {etape === "contact" && (
          <>
            <span style={s.badge}>VOS COORDONNÉES</span>
            <h2 style={s.h2}>Avant de commencer</h2>
            <p style={s.p}>Renseignez vos informations pour recevoir votre estimation par email.</p>

            <label style={s.label}>Prénom *</label>
            <input style={{ ...s.input, ...(erreurs.prenom ? s.inputErr : {}) }} value={contact.prenom} onChange={(e) => setContact({ ...contact, prenom: e.target.value })} />
            {erreurs.prenom && <div style={s.err}>{erreurs.prenom}</div>}

            <label style={s.label}>Nom *</label>
            <input style={{ ...s.input, ...(erreurs.nom ? s.inputErr : {}) }} value={contact.nom} onChange={(e) => setContact({ ...contact, nom: e.target.value })} />
            {erreurs.nom && <div style={s.err}>{erreurs.nom}</div>}

            <label style={s.label}>Email *</label>
            <input type="email" style={{ ...s.input, ...(erreurs.email ? s.inputErr : {}) }} value={contact.email} onChange={(e) => setContact({ ...contact, email: e.target.value })} />
            {erreurs.email && <div style={s.err}>{erreurs.email}</div>}

            <label style={s.label}>Téléphone *</label>
            <input type="tel" style={{ ...s.input, ...(erreurs.telephone ? s.inputErr : {}) }} value={contact.telephone} onChange={(e) => setContact({ ...contact, telephone: e.target.value })} />
            {erreurs.telephone && <div style={s.err}>{erreurs.telephone}</div>}

            <label style={s.label}>Délai envisagé pour le projet *</label>
            <select style={{ ...s.select, ...(erreurs.delai ? s.inputErr : {}) }} value={contact.delai} onChange={(e) => setContact({ ...contact, delai: e.target.value })}>
              <option value="">Sélectionnez...</option>
              <option value="Moins de 3 mois">Moins de 3 mois</option>
              <option value="3 à 6 mois">3 à 6 mois</option>
              <option value="6 à 12 mois">6 à 12 mois</option>
              <option value="Plus d'un an / pas encore défini">Plus d'un an / pas encore défini</option>
            </select>
            {erreurs.delai && <div style={s.err}>{erreurs.delai}</div>}

            <label style={s.label}>Vous êtes *</label>
            <select style={{ ...s.select, ...(erreurs.statut ? s.inputErr : {}) }} value={contact.statut} onChange={(e) => setContact({ ...contact, statut: e.target.value })}>
              <option value="">Sélectionnez...</option>
              <option value="Propriétaire">Propriétaire</option>
              <option value="Futur propriétaire (achat en cours)">Futur propriétaire (achat en cours)</option>
              <option value="Locataire">Locataire</option>
            </select>
            {erreurs.statut && <div style={s.err}>{erreurs.statut}</div>}

            <div style={{ ...s.checkboxRow, ...(contact.optin ? s.checkboxRowActive : {}) }} onClick={() => setContact({ ...contact, optin: !contact.optin })}>
              <input type="checkbox" checked={contact.optin} onChange={() => {}} style={{ width: 18, height: 18 }} />
              <span style={{ fontSize: 12.5, color: "#444" }}>
                J'accepte d'être recontacté(e) par BD Solutions Travaux au sujet de mon projet. *
              </span>
            </div>
            {erreurs.optin && <div style={s.err}>{erreurs.optin}</div>}

            <button style={s.btnPrimary} onClick={validerContact}>Continuer →</button>
          </>
        )}

        {etape === "hub" && (
          <>
            <h2 style={s.h2}>Que souhaitez-vous chiffrer ?</h2>
            <p style={s.p}>Ajoutez autant de pièces et d'opérations extérieures que nécessaire.</p>

            <div style={s.hubCard(MARINE)} onClick={nouvellePiece}>
              <div style={{ fontSize: 28 }}>🏠</div>
              <div style={{ fontWeight: 700, color: MARINE, marginTop: 6 }}>Ajouter une pièce</div>
              <div style={{ fontSize: 12.5, color: "#666", marginTop: 4 }}>Peinture, sol, électricité, plomberie, agencement...</div>
            </div>

            <div style={s.hubCard(OR)} onClick={() => { setCatGlobaleOuverte(null); setEtape("global"); }}>
              <div style={{ fontSize: 28 }}>🌳</div>
              <div style={{ fontWeight: 700, color: MARINE, marginTop: 6 }}>Travaux extérieurs / globaux</div>
              <div style={{ fontSize: 12.5, color: "#666", marginTop: 4 }}>Toiture, isolation, menuiseries, extérieur, chauffage...</div>
            </div>

            {pieces.length > 0 && (
              <div style={{ marginTop: 20, fontSize: 13, color: "#666" }}>
                {pieces.length} pièce(s) déjà ajoutée(s)
                {Object.values(globalOps).some((q) => q > 0) ? " + opérations extérieures" : ""}.
              </div>
            )}

            {auMoinsUneChose && (
              <button style={s.btnGold} onClick={() => setEtape("resultat")}>Voir mon estimation →</button>
            )}

            <div style={s.contactLink}>
              Vous ne trouvez pas ce que vous cherchez dans la liste ? Pas de souci — contactez-nous directement, on
              en discute ensemble.
              <br />
              📞 06 85 27 10 42 · ✉️ contact@bd-solutions-travaux.fr
            </div>
          </>
        )}

        {etape === "piece" && pieceCourante && (
          <>
            <span style={s.badge}>PIÈCE {pieces.length + 1}</span>
            <h2 style={s.h2}>Quelle pièce ?</h2>

            <div style={s.tileGrid}>
              {TYPES_PIECE.map((t) => (
                <div key={t.id} style={s.tile(pieceCourante.type === t.id)} onClick={() => setPieceCourante({ ...pieceCourante, type: t.id })}>
                  <div style={{ fontSize: 22, marginBottom: 4 }}>{t.icon}</div>
                  {t.label}
                </div>
              ))}
            </div>
            {erreurs.type && <div style={s.err}>{erreurs.type}</div>}

            <label style={s.label}>Surface de la pièce (m²) *</label>
            <input
              type="number" min="1"
              style={{ ...s.input, ...(erreurs.surface ? s.inputErr : {}) }}
              value={pieceCourante.surface}
              onChange={(e) => setPieceCourante({ ...pieceCourante, surface: e.target.value })}
              placeholder="Ex : 12"
            />
            {erreurs.surface && <div style={s.err}>{erreurs.surface}</div>}

            <label style={s.label}>Travaux envisagés</label>
            {!pieceCourante.type && (
              <div style={s.notaInfo}>👆 Choisissez d'abord le type de pièce ci-dessus pour voir les travaux disponibles.</div>
            )}
            {pieceCourante.type && CAT_INTERIEUR.map((cat) => {
              const itemsVisibles = cat.items.filter((item) => !item.pieces || item.pieces.includes(pieceCourante.type));
              if (itemsVisibles.length === 0) return null;
              const open = catOuverte === cat.id;
              return (
                <div key={cat.id}>
                  <div style={s.catHeader(open)} onClick={() => setCatOuverte(open ? null : cat.id)}>
                    <span>{cat.label}</span>
                    <span>{open ? "−" : "+"}</span>
                  </div>
                  {open && (
                    <div style={s.catBody}>
                      {cat.nota && <div style={s.nota}>ℹ️ {cat.nota}</div>}
                      {itemsVisibles.map((item) => {
                        const active = pieceCourante.ops[item.key] !== undefined;
                        if (item.auto) {
                          return (
                            <div key={item.key} style={{ ...s.checkboxRow, ...(active ? s.checkboxRowActive : {}) }} onClick={() => toggleGroupItem(item.key, item.group, true)}>
                              <input type="checkbox" checked={active} onChange={() => {}} style={{ width: 18, height: 18 }} />
                              <span style={{ fontSize: 13.5, color: MARINE, fontWeight: 600 }}>{item.label}</span>
                              {active && <span style={{ marginLeft: "auto", fontSize: 12, color: "#666" }}>{surfaceNum} m²</span>}
                            </div>
                          );
                        }
                        return (
                          <div key={item.key}>
                            <div style={{ ...s.checkboxRow, ...(active ? s.checkboxRowActive : {}) }} onClick={() => {
                              if (item.group) toggleGroupItem(item.key, item.group, true);
                              else setOpQte(item.key, active ? undefined : 1);
                            }}>
                              <input type="checkbox" checked={active} onChange={() => {}} style={{ width: 18, height: 18 }} />
                              <span style={{ fontSize: 13.5, color: MARINE, fontWeight: 600 }}>{item.label}</span>
                            </div>
                            {active && !item.group && (
                              <div style={s.qtyRow}>
                                <span style={{ fontSize: 12, color: "#666" }}>Quantité ({PRICES[item.key].unite})</span>
                                <input
                                  type="number" min="0" style={s.qtyInput}
                                  value={pieceCourante.ops[item.key]}
                                  onChange={(e) => setOpQte(item.key, parseFloat(e.target.value) || 0)}
                                />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
            {erreurs.ops && <div style={s.err}>{erreurs.ops}</div>}

            <button style={s.btnPrimary} onClick={validerPiece}>Valider cette pièce →</button>
            <button style={s.btnSecondary} onClick={() => setEtape("hub")}>← Retour</button>
          </>
        )}

        {etape === "global" && (
          <>
            <span style={s.badge}>TRAVAUX EXTÉRIEURS / GLOBAUX</span>
            <h2 style={s.h2}>Isolation, toiture, extérieur...</h2>
            <p style={s.p}>Ces opérations concernent le bâtiment ou le terrain, pas une pièce en particulier.</p>

            {CAT_GLOBAL.map((cat) => {
              const open = catGlobaleOuverte === cat.id;
              return (
                <div key={cat.id}>
                  <div style={s.catHeader(open)} onClick={() => setCatGlobaleOuverte(open ? null : cat.id)}>
                    <span>{cat.label}</span>
                    <span>{open ? "−" : "+"}</span>
                  </div>
                  {open && (
                    <div style={s.catBody}>
                      {cat.nota && <div style={s.nota}>{cat.nota}</div>}
                      {cat.items.map((item) => {
                        const active = globalOps[item.key] !== undefined && globalOps[item.key] > 0;
                        return (
                          <div key={item.key}>
                            <div style={{ ...s.checkboxRow, ...(active ? s.checkboxRowActive : {}) }} onClick={() => setGlobalQte(item.key, active ? undefined : 1)}>
                              <input type="checkbox" checked={active} onChange={() => {}} style={{ width: 18, height: 18 }} />
                              <span style={{ fontSize: 13.5, color: MARINE, fontWeight: 600 }}>
                                {item.label}{PRICES[item.key].wide ? " ⚠️" : ""}
                              </span>
                            </div>
                            {active && (
                              <div style={s.qtyRow}>
                                <span style={{ fontSize: 12, color: "#666" }}>Quantité ({PRICES[item.key].unite})</span>
                                <input
                                  type="number" min="0" style={s.qtyInput}
                                  value={globalOps[item.key]}
                                  onChange={(e) => setGlobalQte(item.key, parseFloat(e.target.value) || 0)}
                                />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}

            <div style={s.nota}>⚠️ = poste technique complexe, fourchette élargie, étude sur site recommandée.</div>

            <button style={s.btnPrimary} onClick={() => setEtape("hub")}>Valider →</button>
            <button style={s.btnSecondary} onClick={() => setEtape("hub")}>← Retour</button>
          </>
        )}

        {etape === "resultat" && (
          <>
            <h2 style={s.h2}>Votre estimation</h2>

            {pieces.map((p, i) => {
              const c = calculPiece(p);
              const label = TYPES_PIECE.find((t) => t.id === p.type)?.label || p.type;
              return (
                <div key={i} style={{ marginBottom: 18, paddingBottom: 14, borderBottom: "1px solid #EEE" }}>
                  <div style={{ fontWeight: 700, color: MARINE, fontSize: 14, marginBottom: 6 }}>{label} — {p.surface} m²</div>
                  {c.detail.map((d, j) => (
                    <div key={j} style={{ fontSize: 12.5, color: "#666", display: "flex", justifyContent: "space-between" }}>
                      <span>{d.label} ({d.qte} {d.unite}){d.wide ? " ⚠️" : ""}</span>
                      <span>{Math.round(d.bas)}-{Math.round(d.haut)} €</span>
                    </div>
                  ))}
                  <div style={{ fontSize: 13, fontWeight: 700, color: OR, marginTop: 6 }}>
                    Sous-total : {Math.round(c.bas).toLocaleString("fr-FR")} € – {Math.round(c.haut).toLocaleString("fr-FR")} €
                  </div>
                </div>
              );
            })}

            {(() => {
              const g = calculGlobal();
              if (!g.detail.length) return null;
              return (
                <div style={{ marginBottom: 18, paddingBottom: 14, borderBottom: "1px solid #EEE" }}>
                  <div style={{ fontWeight: 700, color: MARINE, fontSize: 14, marginBottom: 6 }}>🌳 Extérieur / global</div>
                  {g.detail.map((d, j) => (
                    <div key={j} style={{ fontSize: 12.5, color: "#666", display: "flex", justifyContent: "space-between" }}>
                      <span>{d.label} ({d.qte} {d.unite}){d.wide ? " ⚠️" : ""}</span>
                      <span>{Math.round(d.bas)}-{Math.round(d.haut)} €</span>
                    </div>
                  ))}
                  <div style={{ fontSize: 13, fontWeight: 700, color: OR, marginTop: 6 }}>
                    Sous-total : {Math.round(g.bas).toLocaleString("fr-FR")} € – {Math.round(g.haut).toLocaleString("fr-FR")} €
                  </div>
                </div>
              );
            })()}

            <div style={{ background: MARINE, borderRadius: 10, padding: "18px 20px", textAlign: "center", marginTop: 8 }}>
              <div style={{ color: OR, fontSize: 12, fontWeight: 700, letterSpacing: 0.5 }}>BUDGET TOTAL ESTIMÉ</div>
              <div style={{ color: BLANC, fontSize: 26, fontWeight: 800, marginTop: 6 }}>
                {Math.round(totalGeneral.bas).toLocaleString("fr-FR")} € – {Math.round(totalGeneral.haut).toLocaleString("fr-FR")} €
              </div>
            </div>

            <div style={{ border: "1px solid #DDD", borderRadius: 8, padding: "12px 14px", marginTop: 16 }}>
              <p style={{ ...s.p, fontSize: 11.5, color: "#888", marginTop: 0, marginBottom: 0 }}>
                Estimation indicative non contractuelle, basée sur une grille tarifaire locale (zone Mont-de-Marsan et
                80 km alentours). Le prix réel peut varier selon la localisation exacte, l'état du support et
                l'accessibilité du chantier. Les postes marqués ⚠️ nécessitent une étude sur site pour un chiffrage
                précis. Seul un devis d'artisan fait foi.
              </p>
            </div>

            <button style={s.btnGold} onClick={() => setEtape("hub")}>+ Ajouter pièce ou opération</button>
            <button style={s.btnPrimary} onClick={envoyerRecap} disabled={envoiEnCours}>
              {envoiEnCours ? "Envoi en cours..." : "Recevoir mon récapitulatif par email"}
            </button>
            {envoiStatut && envoiStatut !== "ok" && (
              <div style={s.err}>Erreur lors de l'envoi : {envoiStatut}</div>
            )}
          </>
        )}

        {etape === "fin" && (
          <>
            <div style={{ fontSize: 48, textAlign: "center", marginBottom: 12 }}>✅</div>
            <h2 style={{ ...s.h2, textAlign: "center" }}>Merci {contact.prenom} !</h2>
            <p style={{ ...s.p, textAlign: "center" }}>
              Votre récapitulatif vient de vous être envoyé par email. Notre équipe a également été notifiée et
              reviendra vers vous rapidement pour affiner votre projet.
            </p>
            <div style={{ background: "#F0F0F5", borderRadius: 10, padding: 16, textAlign: "center", fontSize: 13, color: MARINE }}>
              📞 06 85 27 10 42<br />✉️ contact@bd-solutions-travaux.fr
            </div>
          </>
        )}
      </div>

      <div style={s.footer}>
        BD Solutions Travaux — 63 rue Jean-Pierre Labarbe, 40000 Mont-de-Marsan
        <br />
        Cet outil fournit une estimation indicative et ne remplace pas un devis d'artisan.
      </div>
    </div>
  );
}
