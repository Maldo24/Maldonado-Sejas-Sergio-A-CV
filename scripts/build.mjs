#!/usr/bin/env node
// Genera la sección de proyectos de index.html y en/index.html a partir de data/projects.json.
//
// Uso:  node scripts/build.mjs
//
// Solo reescribe lo que está entre los marcadores <!-- proyectos:NOMBRE --> y
// <!-- /proyectos:NOMBRE -->; el resto del HTML no se toca. Es idempotente:
// correrlo dos veces seguidas no cambia nada.

import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DATA = join(ROOT, 'data', 'projects.json');

// ---------- Textos por idioma ----------
const LANGS = {
  es: {
    file: 'index.html',
    assetPrefix: '',
    sheet: 'L',
    plate: 'Lám.',
    live: 'En línea',
    offline: 'Sin despliegue público',
    myPart: 'Mi parte',
    open: 'Abrir el sitio ↗',
    code: 'Código ↗',
    openShort: 'abrir ↗',
    codeShort: 'código ↗',
    plateAlt: (name) => `Lámina genérica de ${name}.`,
    empty: 'Por ahora no hay más proyectos aquí.',
    numbers: ['Ningún', 'Un', 'Dos', 'Tres', 'Cuatro', 'Cinco', 'Seis', 'Siete', 'Ocho', 'Nueve', 'Diez', 'Once', 'Doce'],
    title(n, allLive) {
      const w = this.numbers[n] ?? String(n);
      if (allLive) return n === 1 ? 'Un proyecto en línea' : `${w} proyectos en línea`;
      return n === 1 ? 'Un proyecto destacado' : `${w} proyectos destacados`;
    },
  },
  en: {
    file: 'en/index.html',
    assetPrefix: '../',
    sheet: 'S',
    plate: 'Plate',
    live: 'Live',
    offline: 'Not publicly deployed',
    myPart: 'My part',
    open: 'Open the site ↗',
    code: 'Code ↗',
    openShort: 'open ↗',
    codeShort: 'code ↗',
    plateAlt: (name) => `Generic plate for ${name}.`,
    empty: 'Nothing else here yet.',
    numbers: ['No', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve'],
    title(n, allLive) {
      const w = this.numbers[n] ?? String(n);
      if (allLive) return n === 1 ? 'One project, live' : `${w} projects, all live`;
      return n === 1 ? 'One featured project' : `${w} featured projects`;
    },
  },
};

// ---------- Utilidades ----------
const esc = (s = '') => String(s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const slug = (s) => String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
  .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const pad2 = (n) => String(n).padStart(2, '0');

const link = (href, cls, text) =>
  `<a class="${cls}" href="${esc(href)}" target="_blank" rel="noopener">${text}</a>`;

// Ruta de imagen relativa a la página (los CMS suelen guardar "/assets/...").
function assetUrl(path, prefix) {
  if (!path) return '';
  if (/^https?:\/\//.test(path)) return path;
  return prefix + path.replace(/^\/+/, '');
}

// Lámina generada para proyectos sin imagen: curvas de nivel alrededor de una cima,
// distintas para cada proyecto (se derivan de su nombre).
function generatedPlate(name, label) {
  let h = 2166136261;
  for (const c of name) h = Math.imul(h ^ c.charCodeAt(0), 16777619) >>> 0;
  const rnd = () => ((h = Math.imul(h ^ (h >>> 15), 2246822507) >>> 0) / 4294967296);
  const cx = 110 + rnd() * 100, cy = 80 + rnd() * 40, rot = Math.round(rnd() * 60 - 30);
  let rings = '';
  for (let i = 1; i <= 7; i++) {
    const rx = 14 * i + rnd() * 6, ry = 9 * i + rnd() * 5;
    rings += `<ellipse class="${i % 5 === 0 ? 'gi' : 'gm'}" cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" rx="${rx.toFixed(1)}" ry="${ry.toFixed(1)}" transform="rotate(${rot} ${cx.toFixed(1)} ${cy.toFixed(1)})"/>`;
  }
  return `<svg class="plate-gen" viewBox="0 0 320 200" role="img" aria-label="${esc(label)}">${rings}`
    + `<path class="ga" d="M${cx.toFixed(1)} ${(cy - 6).toFixed(1)} l5 9 h-10 z"/>`
    + `<text class="gt" x="16" y="186">${esc(name.toUpperCase())}</text></svg>`;
}

// ---------- Validación ----------
function load() {
  let data;
  try {
    data = JSON.parse(readFileSync(DATA, 'utf8'));
  } catch (err) {
    throw new Error(`No se pudo leer data/projects.json: ${err.message}`);
  }
  if (!Array.isArray(data)) throw new Error('data/projects.json debe ser una lista [ ... ] de proyectos.');

  const seen = new Set();
  return data.map((p, i) => {
    if (!p || !p.name) throw new Error(`El proyecto #${i + 1} no tiene "name".`);
    const id = p.id ? slug(p.id) : slug(p.name);
    if (seen.has(id)) throw new Error(`Hay dos proyectos con el id "${id}". Cambia el nombre o el id de uno.`);
    seen.add(id);
    return {
      ...p,
      id,
      stack: Array.isArray(p.stack) ? p.stack.filter(Boolean) : [],
      es: p.es || {},
      en: p.en || {},
    };
  });
}

// ---------- Plantillas ----------
function featuredItem(p, n, L, lang) {
  const t = { ...p[lang] };
  // Si falta la traducción, usa el español como respaldo.
  const fb = (k) => t[k] || p.es[k] || '';
  const name = t.name || p.name;
  const stack = (t.stack && t.stack.length ? t.stack : p.stack).map(esc).join(' · ');
  const status = p.live
    ? `<i class="sym sym-live"></i>${L.live}`
    : `<i class="sym sym-offline"></i>${L.offline}`;
  const img = p.image
    ? `<img src="${esc(assetUrl(p.image, L.assetPrefix))}" alt="${esc(fb('alt'))}" width="320" height="200" loading="lazy">`
    : generatedPlate(name, L.plateAlt(name));
  const caption = fb('caption') || name;
  const role = fb('role') || fb('roleTitle')
    ? `\n            <div><dt class="k">${L.myPart}</dt><dd>${fb('roleTitle') ? `<b>${esc(fb('roleTitle'))}</b> ` : ''}${esc(fb('role'))}</dd></div>`
    : '';
  const stackRow = stack ? `\n            <div><dt class="k">Stack</dt><dd class="stack">${stack}</dd></div>` : '';
  const links = [p.url && link(p.url, 'lnk primary', L.open), p.repo && link(p.repo, 'lnk', L.code)].filter(Boolean).join('');

  return `
      <li class="p" id="${p.id}">
        <figure class="plate">
          ${img}
          <figcaption><b>${L.plate} ${n}</b> — ${esc(caption)}</figcaption>
        </figure>
        <div class="p-body">
          <div class="p-meta"><span class="no">${L.sheet}·${pad2(n)}</span>${p.year ? `<span>${esc(p.year)}</span>` : ''}<span>${status}</span></div>
          <h3>${esc(name)}</h3>${fb('context') ? `\n          <p class="where">${esc(fb('context'))}</p>` : ''}
          <p class="lede">${esc(fb('summary'))}</p>${role || stackRow ? `
          <dl class="facts">${role}${stackRow}
          </dl>` : ''}${links ? `\n          <p class="links">${links}</p>` : ''}
        </div>
      </li>`;
}

function otherRow(p, n, L, lang) {
  const t = p[lang];
  const name = t.name || p.name;
  const stack = (t.stack && t.stack.length ? t.stack : p.stack).map(esc).join(' · ');
  const sym = p.live ? 'sym-live' : 'sym-offline';
  const a = p.url
    ? ` ${link(p.url, 'lnk primary', L.openShort)}`
    : p.repo ? ` ${link(p.repo, 'lnk', L.codeShort)}` : '';
  return `
        <tr id="${p.id}">
          <td class="no">${L.sheet}·${pad2(n)}</td>
          <td class="nm"><i class="sym ${sym}"></i>${esc(name)}${a}</td>
          <td class="ds">${esc(t.summary || p.es.summary || '')}</td>
          <td class="st">${stack}</td>
          <td class="yr">${esc(p.year ?? '')}</td>
        </tr>`;
}

// ---------- Ensamblado ----------
function replaceRegion(html, name, content, file) {
  const re = new RegExp(`(<!-- proyectos:${name} -->)[\\s\\S]*?(<!-- /proyectos:${name} -->)`);
  if (!re.test(html)) throw new Error(`Falta el marcador <!-- proyectos:${name} --> en ${file}.`);
  return html.replace(re, (_, open, close) => `${open}${content}${close}`);
}

function build() {
  const projects = load();
  const featured = projects.filter((p) => p.featured);
  const others = projects.filter((p) => !p.featured);
  const allLive = featured.length > 0 && featured.every((p) => p.live);

  for (const [lang, L] of Object.entries(LANGS)) {
    const path = join(ROOT, L.file);
    let html = readFileSync(path, 'utf8');

    const title = L.title(featured.length, allLive);
    const items = featured.map((p, i) => featuredItem(p, i + 1, L, lang)).join('\n');
    const rows = others.length
      ? others.map((p, i) => otherRow(p, featured.length + i + 1, L, lang)).join('')
      : `\n        <tr><td colspan="5" class="ds">${L.empty}</td></tr>`;

    html = replaceRegion(html, 'titulo', title, L.file);
    html = replaceRegion(html, 'destacados', `${items}\n      `, L.file);
    html = replaceRegion(html, 'otros', `${rows}\n        `, L.file);

    writeFileSync(path, html);
    console.log(`✓ ${L.file}: ${featured.length} destacados, ${others.length} en el índice`);
  }
}

try {
  build();
} catch (err) {
  console.error(`✗ ${err.message}`);
  process.exit(1);
}
