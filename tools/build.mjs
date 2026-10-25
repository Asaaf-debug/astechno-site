import { mkdir, readFile, writeFile, copyFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { translations, localeCodes } from "../src/translations.mjs";

export const projectRoot = fileURLToPath(new URL("../", import.meta.url));
export const languages = Object.keys(translations);
export const pagePath = (lang) =>
  lang === "en" ? "index.html" : `${lang}/index.html`;
export const pageUrl = (lang) =>
  `https://astechno.dev/${lang === "en" ? "" : `${lang}/`}`;
const escapeHtml = (value) =>
  value.replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );

export async function renderPage(lang) {
  const template = await readFile(
    path.join(projectRoot, "src/page.html"),
    "utf8",
  );
  const dict = translations[lang];
  if (!dict) throw new Error(`Unsupported language: ${lang}`);
  const values = {
    ...dict,
    lang,
    dir: lang === "ar" ? "rtl" : "ltr",
    root: lang === "en" ? "./" : "../",
    home: "./",
    canonical: pageUrl(lang),
    locale: localeCodes[lang],
    year: new Intl.DateTimeFormat("en", {
      year: "numeric",
      timeZone: "Europe/Amsterdam",
    }).format(new Date()),
  };
  const raw = {
    ...Object.fromEntries(
      languages.map((key) => [
        `current.${key}`,
        lang === key ? 'aria-current="page"' : "",
      ]),
    ),
    alternateLocales: languages
      .filter((key) => key !== lang)
      .map(
        (key) =>
          `<meta property="og:locale:alternate" content="${localeCodes[key]}" />`,
      )
      .join("\n    "),
    structuredData: JSON.stringify({
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "Organization",
          "@id": "https://astechno.dev/#organization",
          name: "ASTechno",
          legalName: "AS Technology V.O.F.",
          url: "https://astechno.dev/",
          logo: "https://astechno.dev/logo-nav.png",
          email: "contact@astechno.dev",
          vatID: "NL869102801B01",
          identifier: {
            "@type": "PropertyValue",
            propertyID: "KvK",
            value: "99714922",
          },
        },
        {
          "@type": "WebPage",
          "@id": `${pageUrl(lang)}#webpage`,
          url: pageUrl(lang),
          name: dict["meta.title"],
          description: dict["meta.description"],
          inLanguage: lang,
          about: { "@id": "https://astechno.dev/#organization" },
        },
      ],
    }).replace(/</g, "\\u003c"),
  };
  return template
    .replace(/{{([\w.]+)}}/g, (_, key) => {
      if (Object.hasOwn(raw, key)) return raw[key];
      if (typeof values[key] !== "string")
        throw new Error(`Missing ${lang} translation: ${key}`);
      return escapeHtml(values[key]);
    })
    .replace(/[\t ]+$/gm, "");
}

async function putFile(relativePath, content, check) {
  const target = path.join(projectRoot, relativePath);
  if (check) {
    if ((await readFile(target, "utf8")) !== content)
      throw new Error(
        `Generated file is stale: ${relativePath}. Run node tools/build.mjs.`,
      );
    return;
  }
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, content);
  const packaged = path.join(projectRoot, "dist", relativePath);
  await mkdir(path.dirname(packaged), { recursive: true });
  await writeFile(packaged, content);
}

async function build() {
  const check = process.argv.includes("--check");
  for (const lang of languages)
    await putFile(pagePath(lang), await renderPage(lang), check);
  const urls = languages
    .map(
      (lang) =>
        `  <url><loc>${pageUrl(lang)}</loc>${languages.map((alternate) => `<xhtml:link rel="alternate" hreflang="${alternate}" href="${pageUrl(alternate)}" />`).join("")}<xhtml:link rel="alternate" hreflang="x-default" href="https://astechno.dev/" /></url>`,
    )
    .join("\n");
  await putFile(
    "sitemap.xml",
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urls}\n</urlset>\n`,
    check,
  );
  await putFile(
    "robots.txt",
    "User-agent: *\nAllow: /\nSitemap: https://astechno.dev/sitemap.xml\n",
    check,
  );
  if (!check) {
    for (const file of [
      "styles.css",
      "script.js",
      "logo-nav.png",
      "assets/decisphere-logo.png",
    ]) {
      const target = path.join(projectRoot, "dist", file);
      await mkdir(path.dirname(target), { recursive: true });
      await copyFile(path.join(projectRoot, file), target);
    }
  }
  console.log(
    check
      ? "Generated pages and metadata are current."
      : "Built four localized pages and the static dist/ package.",
  );
}

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
)
  await build();
