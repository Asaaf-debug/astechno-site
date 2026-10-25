import test from "node:test";
import assert from "node:assert/strict";
import { readFile, access } from "node:fs/promises";
import path from "node:path";
import { createHash } from "node:crypto";
import { translations } from "../src/translations.mjs";
import {
  languages,
  pagePath,
  pageUrl,
  projectRoot,
  renderPage,
} from "../tools/build.mjs";

test("every locale has the complete translation contract", () => {
  const expected = Object.keys(translations.en).sort();
  for (const lang of languages) {
    assert.deepEqual(Object.keys(translations[lang]).sort(), expected, lang);
    for (const value of Object.values(translations[lang]))
      assert.ok(value.trim().length > 0);
  }
});

for (const lang of languages) {
  test(`${lang}: static content, metadata, direction and language links agree`, async () => {
    const html = await readFile(path.join(projectRoot, pagePath(lang)), "utf8");
    assert.equal(
      html,
      await renderPage(lang),
      "generated page must be current",
    );
    assert.match(
      html,
      new RegExp(
        `<html lang="${lang}" dir="${lang === "ar" ? "rtl" : "ltr"}">`,
      ),
    );
    assert.equal([...html.matchAll(/<h1\b/g)].length, 1);
    assert.ok(html.includes(translations[lang]["hero.line1"]));
    assert.ok(html.includes(translations[lang]["teaser.soon"]));
    assert.ok(html.includes(`<link rel="canonical" href="${pageUrl(lang)}"`));
    assert.equal(new URL(pageUrl(lang)).hostname, "www.astechno.dev");
    assert.doesNotMatch(html, /https:\/\/astechno\.dev\//);
    assert.equal([...html.matchAll(/aria-current="page"/g)].length, 1);
    assert.ok(html.includes(`data-lang="${lang}"`));
    for (const alternate of languages)
      assert.ok(html.includes(`hreflang="${alternate}"`));
    const structured = JSON.parse(
      html.match(
        /<script type="application\/ld\+json">([\s\S]*?)<\/script>/,
      )[1],
    );
    assert.equal(structured["@graph"][1].inLanguage, lang);
    assert.equal(
      structured["@graph"][1].description,
      translations[lang]["meta.description"],
    );
    assert.equal(structured["@graph"][0].email, "contact@astechno.dev");
    assert.doesNotMatch(
      html,
      /{{|Asaad|Haidar|Somar|founders|\bMVP\b|\b(beta|waitlist)\b/i,
    );
    const header = html.match(/<header\b[\s\S]*?<\/header>/)[0];
    assert.ok(header.includes('class="brand-name">ASTechno</span>'));
    assert.doesNotMatch(header, /AS Technology|V\.O\.F\./);
    assert.equal(
      [...html.matchAll(/href="mailto:/g)].length,
      1,
      "contact belongs only in the footer",
    );
    const status = [
      ...html.matchAll(
        /<p class="teaser-status" id="teaser-status">([\s\S]*?)<\/p>/g,
      ),
    ];
    assert.equal(status.length, 1, "one launch hint per locale");
    assert.equal(status[0][1].trim(), translations[lang]["teaser.soon"]);
    assert.doesNotMatch(
      html,
      /class="(?:orbit|teaser-top|teaser-bottom|logo-glow|ribbon|hero-actions|button|principle-number|section-index)/,
    );
    assert.match(html, /<figure\s+class="teaser"\s+id="decisphere"/);
    assert.match(
      html,
      /<figcaption class="teaser-name" id="teaser-name">[\s\S]*?<bdi>Decisphere<\/bdi>[\s\S]*?<\/figcaption>/,
    );
    assert.doesNotMatch(
      html,
      /product-section|product-intro|product-copy|class="principles"|<h3\b/,
    );
    assert.doesNotMatch(
      html,
      /\bbudget\b|cooking time|recommendations?|receptaanbevelingen|rezeptempfehlungen|zubereitungszeit|ميزانيتك|الميزانية|اقتراحات للوصفات/i,
    );
    assert.ok(html.includes(translations[lang]["hero.description"]));
    assert.ok(html.includes(translations[lang]["footer.contact"]));
    const main = html.match(/<main\b[\s\S]*?<\/main>/)[0];
    assert.doesNotMatch(main, /<(?:a|button)\b/, "no body calls to action");
    const visibleText = html
      .match(/<body\b[\s\S]*?<\/body>/)[0]
      .replace(/<[^>]+>/g, " ");
    assert.equal(
      [...visibleText.matchAll(/\bDecisphere\b/g)].length,
      2,
      "product named intentionally in navigation and teaser caption",
    );
    const year = new Intl.DateTimeFormat("en", {
      year: "numeric",
      timeZone: "Europe/Amsterdam",
    }).format(new Date());
    assert.ok(html.includes(`datetime="${year}">${year}</time>`));
  });

  test(`${lang}: all local navigation and image/script/style references resolve`, async () => {
    const html = await readFile(path.join(projectRoot, pagePath(lang)), "utf8");
    const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);
    assert.equal(new Set(ids).size, ids.length, "no duplicate IDs");
    for (const match of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
      const target = match[1];
      if (target.startsWith("#"))
        assert.ok(ids.includes(target.slice(1)), target);
      else if (target.startsWith("mailto:"))
        assert.equal(target, "mailto:contact@astechno.dev");
      else if (!target.startsWith("https:")) {
        const resolved = path.resolve(
          projectRoot,
          path.dirname(pagePath(lang)),
          target,
          target.endsWith("/") ? "index.html" : "",
        );
        await access(resolved);
      }
    }
    for (const match of html.matchAll(/aria-labelledby="([^"]+)"/g)) {
      for (const id of match[1].split(" ")) assert.ok(ids.includes(id), id);
    }
  });
}

test("rendering escapes copy safely and rejects missing languages", async () => {
  const original = translations.en["hero.line1"];
  try {
    translations.en["hero.line1"] = '<script>"hello" & goodbye</script>';
    assert.ok(
      (await renderPage("en")).includes(
        "&lt;script&gt;&quot;hello&quot; &amp; goodbye&lt;/script&gt;",
      ),
    );
  } finally {
    translations.en["hero.line1"] = original;
  }
  await assert.rejects(() => renderPage("fr"), /Unsupported language/);
});

test("authentic Decisphere logo is unchanged", async () => {
  const asset = await readFile(
    path.join(projectRoot, "assets/decisphere-logo.png"),
  );
  assert.equal(
    createHash("sha256").update(asset).digest("hex"),
    "eaf2833031a2140b76cc80fe1a1ce71122eb94d42119c0f5866a91aad63635a0",
  );
});

test("authentic ASTechno logo is unchanged", async () => {
  const asset = await readFile(path.join(projectRoot, "logo-nav.png"));
  assert.equal(
    createHash("sha256").update(asset).digest("hex"),
    "36e9a72def86fc31aba3e8e373e5c7b9bee382bee68d720d2587d956ab25a60b",
  );
});

test("accessible text palette meets WCAG AA contrast", () => {
  const luminance = (hex) => {
    const rgb = hex
      .match(/\w\w/g)
      .map((value) => parseInt(value, 16) / 255)
      .map((value) =>
        value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4,
      );
    return rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722;
  };
  for (const [foreground, background] of [
    ["23201e", "f6f2eb"],
    ["625a54", "f6f2eb"],
    ["625a54", "ede6dc"],
    ["a6401b", "f6f2eb"],
    ["a6401b", "ede6dc"],
    ["23201e", "f27035"],
    ["ffffff", "23201e"],
  ]) {
    const pair = [luminance(foreground), luminance(background)].sort(
      (a, b) => b - a,
    );
    assert.ok(
      (pair[0] + 0.05) / (pair[1] + 0.05) >= 4.5,
      `${foreground} on ${background}`,
    );
  }
});
