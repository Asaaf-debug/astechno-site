const I18N = {
  en: {
    "nav.contact": "Contact",
    "hero.title": "Software, built with care.",
    "hero.subtitle": "ASTechno is the trading name of AS Technology V.O.F. in the Netherlands. We build reliable software products with care and long-term intent.",
    "hero.ctaPrimary": "Email us",
    "hero.ctaSecondary": "What we're building",
    "building.title": "What we're building",
    "building.body1": "ASTechno is developing its first product internally. We’re currently focused on designing, validating, and building an MVP.",
    "building.note": "More details will be shared as the product matures.",
    "company.title": "Company",
    "company.legal": "Legal name:",
    "company.trading": "Trading name:",
    "company.founders": "Founders:",
    "company.kvk": "Chamber of Commerce (KvK):",
    "company.vat": "VAT (BTW):",
    "company.contact": "Contact:",
    "footer.copyright": "© AS Technology V.O.F."
  },
  nl: {
    "nav.contact": "Contact",
    "hero.title": "Software, met zorg gebouwd.",
    "hero.subtitle": "ASTechno is de handelsnaam van AS Technology V.O.F. in Nederland. We bouwen betrouwbare softwareproducten met aandacht en met een langetermijnvisie.",
    "hero.ctaPrimary": "Mail ons",
    "hero.ctaSecondary": "Wat we bouwen",
    "building.title": "Wat we bouwen",
    "building.body1": "ASTechno ontwikkelt intern zijn eerste product. We richten ons momenteel op het ontwerpen, valideren en bouwen van een MVP.",
    "building.note": "Meer details volgen zodra het product verder is.",
    "company.title": "Bedrijf",
    "company.legal": "Juridische naam:",
    "company.trading": "Handelsnaam:",
    "company.founders": "Oprichters:",
    "company.kvk": "KvK-nummer:",
    "company.vat": "BTW-id:",
    "company.contact": "Contact:",
    "footer.copyright": "© AS Technology V.O.F."
  },
  ar: {
    "nav.contact": "تواصل",
    "hero.title": "برمجيات تُبنى بعناية.",
    "hero.subtitle": "ASTechno هو الاسم التجاري لشركة AS Technology V.O.F. في هولندا. نبني منتجات برمجية موثوقة بعناية وبرؤية طويلة المدى.",
    "hero.ctaPrimary": "راسلنا",
    "hero.ctaSecondary": "ماذا نبني",
    "building.title": "ماذا نبني",
    "building.body1": "تعمل ASTechno على تطوير أول منتج لها داخليًا. نركز حاليًا على التصميم والتحقق وبناء نسخة MVP.",
    "building.note": "سنشارك المزيد من التفاصيل مع نضوج المنتج.",
    "company.title": "الشركة",
    "company.legal": "الاسم القانوني:",
    "company.trading": "الاسم التجاري:",
    "company.founders": "المؤسسون:",
    "company.kvk": "رقم السجل التجاري (KvK):",
    "company.vat": "رقم ضريبة القيمة المضافة:",
    "company.contact": "التواصل:",
    "footer.copyright": "© AS Technology V.O.F."
  }
};

const DEFAULT_LANG = "en";
const LANG_KEY = "lang";
const SUPPORTED_LANGS = Object.keys(I18N);

function normalizeLang(lang) {
  return SUPPORTED_LANGS.includes(lang) ? lang : DEFAULT_LANG;
}

function setLang(lang) {
  const selectedLang = normalizeLang(lang);
  const dict = I18N[selectedLang] || I18N[DEFAULT_LANG];

  try {
    localStorage.setItem(LANG_KEY, selectedLang);
  } catch (error) {
    // Ignore storage failures in privacy modes.
  }

  document.documentElement.lang = selectedLang;
  document.documentElement.dir = selectedLang === "ar" ? "rtl" : "ltr";

  document.querySelectorAll(".lang-btn").forEach((button) => {
    const isActive = button.dataset.lang === selectedLang;
    button.classList.toggle("active", isActive);
    button.setAttribute("aria-pressed", isActive ? "true" : "false");
  });

  document.querySelectorAll("[data-i18n]").forEach((element) => {
    const key = element.getAttribute("data-i18n");
    const value = dict[key] || I18N[DEFAULT_LANG][key];
    if (typeof value === "string") {
      element.textContent = value;
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".lang-btn").forEach((button) => {
    button.addEventListener("click", () => setLang(button.dataset.lang));
  });

  let savedLang = DEFAULT_LANG;
  try {
    savedLang = localStorage.getItem(LANG_KEY) || DEFAULT_LANG;
  } catch (error) {
    savedLang = DEFAULT_LANG;
  }

  setLang(savedLang);
});
