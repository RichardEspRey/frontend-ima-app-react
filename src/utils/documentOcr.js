// Extrae texto (con posiciones) de una imagen o PDF para luego interpretarlo con parseLoadDocument.
// - PDF digital: se lee el texto directo con pdfjs (exacto, sin OCR).
// - Imagen o PDF escaneado: OCR con Tesseract.js (se carga solo cuando se necesita).
import * as pdfjsLib from 'pdfjs-dist';
import { groupRows, parseLoadDocument } from './parseLoadDocument';

pdfjsLib.GlobalWorkerOptions.workerSrc = './pdf.worker.min.mjs';

const MAX_PDF_PAGES = 3;
const KEY_FIELDS = ['name', 'city', 'state', 'zip', 'date', 'time'];

// ── PDF con texto ──────────────────────────────────────────────────────────

function wordsFromPdfItem(item) {
    const x = item.transform[4];
    const h = Math.abs(item.transform[3]) || item.height || 10;
    const charW = item.str.length ? item.width / item.str.length : 0;
    const words = [];
    for (const m of item.str.matchAll(/\S+/g)) {
        words.push({
            text: m[0],
            x0: x + m.index * charW,
            x1: x + (m.index + m[0].length) * charW,
            yc: -item.transform[5], // PDF mide Y de abajo hacia arriba
            h,
        });
    }
    return words;
}

async function linesFromPdfText(pdf) {
    const lines = [];
    for (let p = 1; p <= Math.min(pdf.numPages, MAX_PDF_PAGES); p++) {
        const content = await (await pdf.getPage(p)).getTextContent();
        lines.push(...groupRows(content.items.filter(i => i.str?.trim()).flatMap(wordsFromPdfItem)));
    }
    return lines;
}

async function pdfPagesToCanvases(pdf) {
    const canvases = [];
    for (let p = 1; p <= Math.min(pdf.numPages, MAX_PDF_PAGES); p++) {
        const page = await pdf.getPage(p);
        const viewport = page.getViewport({ scale: 2.5 });
        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise;
        canvases.push(canvas);
    }
    return canvases;
}

// ── Imágenes / OCR ─────────────────────────────────────────────────────────

// Agranda las capturas pequeñas (Tesseract lee mal debajo de ~300 DPI) y convierte a gris.
// mode 'max': usa el canal más claro de cada píxel, así fondos de color, líneas de tabla
// y marcas de resaltado se vuelven blancos y solo queda el texto oscuro.
// mode 'gray': luminancia normal, por si el dato importante está en texto de color.
function prepareCanvas(source, mode) {
    const w = source.width, h = source.height;
    const scale = w < 1600 ? 2 : 1;
    const canvas = document.createElement('canvas');
    canvas.width = w * scale;
    canvas.height = h * scale;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(source, 0, 0, canvas.width, canvas.height);

    const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const d = img.data;
    for (let i = 0; i < d.length; i += 4) {
        const v = mode === 'max'
            ? Math.max(d[i], d[i + 1], d[i + 2])
            : 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
        d[i] = d[i + 1] = d[i + 2] = v;
    }
    ctx.putImageData(img, 0, 0);
    return canvas;
}

async function ocrLines(worker, canvas) {
    const { data } = await worker.recognize(canvas, {}, { blocks: true });
    const words = [];
    for (const block of data.blocks || []) {
        for (const para of block.paragraphs) {
            for (const line of para.lines) {
                for (const w of line.words) {
                    const text = w.text.trim();
                    if (!text) continue;
                    words.push({ text, x0: w.bbox.x0, x1: w.bbox.x1, yc: (w.bbox.y0 + w.bbox.y1) / 2, h: w.bbox.y1 - w.bbox.y0 });
                }
            }
        }
    }
    return groupRows(words);
}

const filled = (rec) => (rec ? KEY_FIELDS.filter(k => rec[k]).length : 0);
const score = (res) => filled(res.pickup) + filled(res.delivery);

function mergeRecords(a, b) {
    if (!a) return b;
    if (!b) return a;
    const out = { ...a };
    KEY_FIELDS.forEach(k => { if (!out[k]) out[k] = b[k]; });
    return out;
}

async function parseFromCanvases(sources, onProgress) {
    const { createWorker } = await import('tesseract.js');
    const total = sources.length * 2;
    let done = 0;
    const worker = await createWorker('eng', 1, {
        logger: (m) => {
            if (m.status === 'recognizing text') onProgress?.('Leyendo texto…', (done + m.progress) / total);
            else if (done === 0) onProgress?.('Preparando OCR (la primera vez descarga el idioma)…', null);
        },
    });
    try {
        const run = async (mode) => {
            const lines = [];
            for (const src of sources) {
                lines.push(...await ocrLines(worker, prepareCanvas(src, mode)));
                done++;
            }
            return parseLoadDocument(lines);
        };

        const primary = await run('max');
        // Si faltaron datos, una segunda pasada en gris normal y se completan huecos.
        if (score(primary) >= 5) return primary;
        const secondary = await run('gray');
        const [best, other] = score(secondary) > score(primary) ? [secondary, primary] : [primary, secondary];
        return {
            pickup: mergeRecords(best.pickup, other.pickup),
            delivery: mergeRecords(best.delivery, other.delivery),
            rawText: best.rawText,
        };
    } finally {
        await worker.terminate();
    }
}

/**
 * Lee un archivo (imagen o PDF) y devuelve los datos de recolección/entrega detectados.
 * @param {File|Blob} file
 * @param {(status: string, progress: number|null) => void} [onProgress]
 */
export async function readLoadDocument(file, onProgress) {
    if (file.type === 'application/pdf' || /\.pdf$/i.test(file.name || '')) {
        onProgress?.('Leyendo PDF…', null);
        const pdf = await pdfjsLib.getDocument({ data: await file.arrayBuffer() }).promise;
        const lines = await linesFromPdfText(pdf);
        if (lines.reduce((n, l) => n + l.text.length, 0) > 40) {
            const result = parseLoadDocument(lines);
            if (score(result) > 0) return result;
        }
        // PDF escaneado (sin capa de texto): se renderiza y se pasa por OCR.
        return parseFromCanvases(await pdfPagesToCanvases(pdf), onProgress);
    }

    if (!file.type.startsWith('image/')) throw new Error('Formato no soportado. Usa una imagen (PNG/JPG) o un PDF.');
    const bitmap = await createImageBitmap(file);
    try {
        return await parseFromCanvases([bitmap], onProgress);
    } finally {
        bitmap.close();
    }
}
