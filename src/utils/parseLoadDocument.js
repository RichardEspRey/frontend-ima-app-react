// Interpreta el texto de un documento de carga (rate confirmation, BOL, pickup sheet)
// usando reglas. Recibe renglones con posición X de cada palabra para poder leer tablas.
//
// Palabra: { text, x0, x1, yc, h }   Renglón: { words, cells, text }

const US_STATES = new Set('AL AK AZ AR CA CO CT DE FL GA HI ID IL IN IA KS KY LA ME MD MA MI MN MS MO MT NE NV NH NJ NM NY NC ND OH OK OR PA RI SC SD TN TX UT VT VA WA WV WI WY DC'.split(' '));
const STREET_TOKEN = /^(dr|drive|rd|road|st|street|ave|avenue|blvd|hwy|highway|ln|lane|pkwy|parkway|way|ct|court|cir|pl|ter|trl|loop|fwy|sw|se|nw|ne|suite|ste|unit|address)\.?$/i;
const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

// Exigen ":" (o que la etiqueta sea todo el renglón) para no confundirse con encabezados de tabla.
const PICKUP_LABEL = /\b(shipper|shed|ship\s*from|pick\s*-?\s*up\s*(?:location|facility|at)|origin)\b\s*(?:#\s*\d+)?\s*(?::|$)/i;
const DELIVERY_LABEL = /\b(consignee|receiver|ship\s*to|deliver(?:y)?\s*(?:to|location|facility)|destination)\b\s*(?:#\s*\d+)?\s*(?::|$)/i;

const HEADER_FIELDS = [
    ['name', /^(shed|shipper|consignee|receiver|facility|location|name|company|pickup|pick up|customer)$/],
    ['city', /^city$/],
    ['state', /^(state|st)$/],
    ['zip', /^(zip|zip code|zipcode|postal code)$/],
    ['date', /^(date|pu date|pick up date|pickup date|delivery date|del date|appt date)$/],
    ['time', /^(time|appt|appt time|appointment|hours)$/],
];

// ── Armado de renglones ────────────────────────────────────────────────────

// Agrupa palabras en renglones por su posición vertical, sin importar cómo
// las haya segmentado el OCR (Tesseract suele separar columnas de una tabla).
export function groupRows(words) {
    const sorted = [...words].sort((a, b) => a.yc - b.yc);
    const rows = [];
    for (const w of sorted) {
        const row = rows[rows.length - 1];
        if (row && Math.abs(w.yc - row.yc) < Math.min(w.h, row.h) * 0.6) {
            row.words.push(w);
            row.yc = (row.yc * (row.words.length - 1) + w.yc) / row.words.length;
        } else {
            rows.push({ yc: w.yc, h: w.h, words: [w] });
        }
    }
    return rows.map(r => buildLine(r.words));
}

// Une palabras cercanas en "celdas"; un hueco grande indica otra columna.
function buildLine(words) {
    const sorted = [...words].sort((a, b) => a.x0 - b.x0);
    const cells = [];
    for (const w of sorted) {
        const last = cells[cells.length - 1];
        if (last && w.x0 - last.x1 < Math.max(w.h, last.h) * 1.2) {
            last.text += ' ' + w.text;
            last.x1 = w.x1;
            last.h = Math.max(last.h, w.h);
        } else {
            cells.push({ ...w });
        }
    }
    return { words: sorted, cells, text: cells.map(c => c.text).join(' | ') };
}

// ── Valores sueltos ────────────────────────────────────────────────────────

// Corrige confusiones típicas del OCR en valores que deben ser numéricos.
const fixDigits = (s) => s.replace(/[Oo]/g, '0').replace(/[Il|]/g, '1');

const titleCase = (s) => s.toLowerCase().replace(/\b[a-z]/g, c => c.toUpperCase());

export function parseDate(text) {
    if (!text) return '';
    let m = text.match(/\b(\d{1,2})\s*[/\-.]\s*(\d{1,2})\s*[/\-.]\s*(\d{4}|\d{2})\b/);
    if (m) {
        const [, mo, d, y] = m.map(Number);
        const year = y < 100 ? 2000 + y : y;
        if (mo >= 1 && mo <= 12 && d >= 1 && d <= 31) return `${year}-${String(mo).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    }
    m = text.match(/\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s+(\d{1,2}),?\s+(\d{4})\b/i);
    if (m) {
        const mo = MONTHS.indexOf(m[1].toLowerCase()) + 1;
        return `${m[3]}-${String(mo).padStart(2, '0')}-${m[2].padStart(2, '0')}`;
    }
    return '';
}

export function parseTime(text) {
    if (!text) return '';
    const m = text.match(/\b([01]?\d|2[0-3])\s*:\s*([0-5]\d)(?:\s*([AaPp])\.?\s*[Mm]\.?)?/);
    if (!m) return '';
    let h = Number(m[1]);
    const ampm = m[3]?.toLowerCase();
    if (ampm === 'p' && h < 12) h += 12;
    if (ampm === 'a' && h === 12) h = 0;
    return `${String(h).padStart(2, '0')}:${m[2]}`;
}

// Limpia lo que el regex tomó como ciudad: quita calle, números y etiquetas previas.
function cleanCity(raw) {
    const words = raw.trim().split(/\s+/);
    let start = 0;
    words.forEach((w, i) => {
        // "St." al inicio de la ciudad es "Saint" (St. Louis), no "Street".
        if (/^st\.?$/i.test(w) && i === start && i < words.length - 1) return;
        if (STREET_TOKEN.test(w) || /\d/.test(w) || /[:#|]/.test(w)) start = i + 1;
    });
    return titleCase(words.slice(start).slice(-3).join(' '));
}

// Busca "Ciudad, ST 12345" (con o sin coma, zip de 5 o 9 dígitos).
// Primero dentro de una sola celda (bloque de dirección); si no, a lo ancho del renglón,
// donde es más fácil que el "nombre" de otra columna se tome como ciudad.
const CSZ_RE = /([A-Za-z][A-Za-z.'\- ]*?)\s*,?\s+([A-Z]{2})\.?\s*,?\s+([0-9OoIl]{5})(?:\s*[-\]}]?\s*\d{4})?(?![0-9])/g;

function matchCityStateZip(text) {
    for (const m of text.matchAll(CSZ_RE)) {
        if (!US_STATES.has(m[2])) continue;
        const city = cleanCity(m[1]);
        if (city) return { city, state: m[2], zip: fixDigits(m[3]) };
    }
    return null;
}

function findCityStateZip(lines) {
    for (const line of lines) {
        for (const cell of line.cells) {
            const hit = matchCityStateZip(cell.text);
            if (hit) return hit;
        }
    }
    for (const line of lines) {
        const hit = matchCityStateZip(line.cells.map(c => c.text).join(' '));
        if (hit) return hit;
    }
    return null;
}

// Fila de tabla sin encabezado legible: "Nombre | [Ciudad] | ST | 12345 | ...".
// El nombre es la primera celda con letras que no sea la ciudad ni el estado.
function findRowName(lines, csz) {
    for (const line of lines) {
        if (line.cells.length < 3) continue;
        if (!line.cells.some(c => c.text.trim() === csz.state)) continue;
        const first = line.cells[0].text.trim();
        if (/[A-Za-z]{3}/.test(first) && titleCase(first) !== csz.city && first !== csz.state) return first;
    }
    return '';
}

function findLabeled(lines, labelRe, parse) {
    for (const line of lines) {
        const m = line.text.match(labelRe);
        if (m) {
            const value = parse(line.text.slice(m.index + m[0].length));
            if (value) return value;
        }
    }
    return '';
}

function findFirst(lines, parse) {
    for (const line of lines) {
        const value = parse(line.text);
        if (value) return value;
    }
    return '';
}

// ── Tablas (encabezados en un renglón, valores en el siguiente) ────────────

function headerField(text) {
    const key = text.toLowerCase().replace(/[:#.]/g, '').trim();
    const hit = HEADER_FIELDS.find(([, re]) => re.test(key));
    return hit ? hit[0] : null;
}

function headerColumns(line) {
    for (const parts of [line.cells, line.words]) {
        const cols = parts.map(p => ({ field: headerField(p.text), x0: p.x0, h: p.h, text: p.text }));
        const distinct = new Set(cols.map(c => c.field).filter(Boolean));
        if (distinct.size >= 3) return cols;
    }
    return null;
}

function readTableRow(line, cols) {
    const values = {};
    for (const w of line.words) {
        let idx = -1;
        cols.forEach((c, i) => { if (c.x0 - c.h * 0.8 <= w.x0) idx = i; });
        const field = cols[Math.max(idx, 0)].field;
        if (field) values[field] = values[field] ? `${values[field]} ${w.text}` : w.text;
    }
    const state = values.state?.toUpperCase().replace(/[^A-Z]/g, '');
    const zip = values.zip && fixDigits(values.zip).match(/\d{5}/)?.[0];
    return {
        name: values.name?.trim() || '',
        city: values.city ? titleCase(values.city.trim()) : '',
        state: US_STATES.has(state) ? state : '',
        zip: zip || '',
        date: values.date ? parseDate(fixDigits(values.date)) : '',
        time: parseTime(values.time),
    };
}

const filledCount = (rec) => ['city', 'state', 'zip', 'date', 'name'].filter(k => rec[k]).length;

function parseTables(lines) {
    const found = [];
    lines.forEach((line, i) => {
        const cols = headerColumns(line);
        if (!cols) return;
        const nameHeader = cols.find(c => c.field === 'name')?.text || '';
        const context = [nameHeader, lines[i - 1]?.text, lines[i - 2]?.text].join(' ');
        const kind = /consignee|receiver|deliver|drop/i.test(context) ? 'delivery' : 'pickup';
        for (const next of lines.slice(i + 1, i + 3)) {
            const rec = readTableRow(next, cols);
            if (filledCount(rec) >= 2) { found.push({ kind, rec, headerIndex: i }); break; }
        }
    });
    return found;
}

// ── Secciones con etiqueta ("SHIPPER: ...", "CONSIGNEE: ...") ──────────────

function parseSection(lines, start, end, kind) {
    const window = lines.slice(start, end);
    const labelRe = kind === 'pickup' ? PICKUP_LABEL : DELIVERY_LABEL;
    const first = lines[start];
    const m = first.text.match(labelRe);
    let name = first.text.slice(m.index + m[0].length).replace(/^[\s:|-]+/, '').split('|')[0].trim();
    if (!name && lines[start + 1]) name = lines[start + 1].cells[0]?.text.trim() || '';

    const dateLabel = kind === 'pickup' ? /(pick\s*-?\s*up|pu|ship)\s*date/i : /(deliver(?:y)?|del|drop)\s*date/i;
    const timeLabel = kind === 'pickup' ? /(pick\s*-?\s*up|pu|appt|appointment)\s*time/i : /(deliver(?:y)?|del|appt|appointment)\s*time/i;

    const csz = findCityStateZip(window);
    return {
        name,
        city: csz?.city || '',
        state: csz?.state || '',
        zip: csz?.zip || '',
        date: findLabeled(window, dateLabel, parseDate) || findLabeled(lines, dateLabel, parseDate) || findFirst(window, parseDate),
        time: findLabeled(window, timeLabel, parseTime) || findLabeled(lines, timeLabel, parseTime),
    };
}

function parseLabeledSections(lines, skip) {
    const marks = [];
    lines.forEach((line, i) => {
        if (skip.has(i)) return;
        if (PICKUP_LABEL.test(line.text)) marks.push({ i, kind: 'pickup' });
        else if (DELIVERY_LABEL.test(line.text)) marks.push({ i, kind: 'delivery' });
    });
    const result = {};
    marks.forEach((mark, k) => {
        if (result[mark.kind]) return; // solo la primera parada de cada tipo
        const end = Math.min(marks[k + 1]?.i ?? lines.length, mark.i + 7);
        result[mark.kind] = parseSection(lines, mark.i, end, mark.kind);
    });
    return result;
}

// Combina: lo que vino de tabla tiene prioridad, la sección con etiqueta rellena huecos.
function merge(a, b) {
    if (!a) return b || null;
    if (!b) return a;
    const out = { ...a };
    Object.keys(b).forEach(k => { if (!out[k]) out[k] = b[k]; });
    return out;
}

/**
 * @param {Array} lines  renglones generados con groupRows()
 * @returns {{ pickup: object|null, delivery: object|null, rawText: string }}
 */
export function parseLoadDocument(lines) {
    const tables = parseTables(lines);
    const skip = new Set(tables.map(t => t.headerIndex));
    const labeled = parseLabeledSections(lines, skip);

    let pickup = merge(tables.find(t => t.kind === 'pickup')?.rec, labeled.pickup);
    let delivery = merge(tables.find(t => t.kind === 'delivery')?.rec, labeled.delivery);

    // Sin estructura reconocible: tomamos lo primero que parezca dirección/fecha/hora.
    if (!pickup && !delivery) {
        const csz = findCityStateZip(lines);
        const generic = {
            name: csz ? findRowName(lines, csz) : '',
            ...(csz || { city: '', state: '', zip: '' }),
            date: findFirst(lines, parseDate),
            time: findFirst(lines, parseTime),
        };
        if (filledCount(generic) > 0) pickup = generic;
    }

    // Si la tabla no traía ciudad/estado/zip, buscarlos cerca (bloque "Information" de abajo).
    for (const t of tables) {
        const rec = t.kind === 'pickup' ? pickup : delivery;
        if (rec && (!rec.city || !rec.zip)) {
            const csz = findCityStateZip(lines.slice(t.headerIndex + 1, t.headerIndex + 8));
            if (csz) Object.keys(csz).forEach(k => { if (!rec[k]) rec[k] = csz[k]; });
        }
    }

    return { pickup, delivery, rawText: lines.map(l => l.cells.map(c => c.text).join('    ')).join('\n') };
}
