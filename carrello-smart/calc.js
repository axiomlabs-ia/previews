/* calc.js — logica pura di Carrello Smart (nessuna dipendenza dal DOM).
   Caricata sia dal browser (window.Calc) sia dai test Node (module.exports). */
(function (root) {
  'use strict';
  const C = {};

  C.round2 = (x) => Math.round((Number(x) + Number.EPSILON) * 100) / 100;

  C.fmtEUR = (x) => {
    const n = Number.isFinite(Number(x)) ? Number(x) : 0;
    return n.toFixed(2).replace('.', ',') + ' \u20AC';
  };

  /* ---- Codici a barre -------------------------------------------------- */
  // Normalizza e valida EAN-8, UPC-A (12 → EAN-13 con zero davanti), EAN-13.
  // Ritorna la stringa normalizzata oppure null se il checksum non torna.
  C.normalizeEAN = (raw) => {
    if (raw == null) return null;
    let s = String(raw).replace(/\D/g, '');
    if (s.length === 12) s = '0' + s;
    if (s.length !== 8 && s.length !== 13) return null;
    const digits = s.split('').map(Number);
    const check = digits.pop();
    let sum = 0;
    // Da destra: pesi alternati 3,1,3,1...
    for (let i = digits.length - 1, w = 3; i >= 0; i--, w = 4 - w) sum += digits[i] * w;
    const expected = (10 - (sum % 10)) % 10;
    return expected === check ? s : null;
  };

  /* ---- Validazione input utente --------------------------------------- */
  C.parsePrice = (raw) => {
    if (raw == null) return null;
    const s = String(raw).trim().replace(/\u20AC/g, '').replace(/\s/g, '').replace(',', '.');
    if (!/^\d+(\.\d{0,2})?$/.test(s)) return null;
    const n = Number(s);
    if (!(n >= 0 && n <= 999.99)) return null;
    return C.round2(n);
  };

  C.parseQty = (raw) => {
    const n = Number(String(raw).trim());
    if (!Number.isInteger(n) || n < 1 || n > 99) return null;
    return n;
  };

  /* ---- Righe scontrino ------------------------------------------------- */
  // item: { name, price, loyaltyPrice|null, qty, voucherOk }
  C.unitPrice = (item, loyaltyOn) => {
    const lp = item.loyaltyPrice;
    if (loyaltyOn && lp != null && Number.isFinite(lp) && lp >= 0 && lp < item.price) return lp;
    return item.price;
  };

  C.lineTotal = (item, loyaltyOn) => C.round2(C.unitPrice(item, loyaltyOn) * item.qty);

  /* ---- Buoni pasto ----------------------------------------------------- */
  // In Italia (DM 122/2017) al supermercato si possono cumulare fino a 8 buoni
  // per transazione e il buono non dà resto. Beni non alimentari/alcolici
  // spesso non sono pagabili col buono: l'item ha il flag voucherOk.
  // Ritorna il piano che minimizza il contante SENZA perdere valore, più
  // l'alternativa "un buono in più" con l'importo che si perderebbe.
  C.voucherPlan = (eligibleTotal, total, opts) => {
    const value = Number(opts && opts.value);
    const max = Math.min(Math.max(Number(opts && opts.max) || 0, 0), 8);
    const owned = Math.max(Number(opts && opts.owned) || 0, 0);
    const T = C.round2(total);
    const E = C.round2(Math.min(eligibleTotal, T));
    const none = { n: 0, covered: 0, cash: T, extra: null, value: 0 };
    if (!(value > 0) || max === 0 || owned === 0 || E <= 0) return none;

    const n = Math.min(Math.floor(E / value + 1e-9), max, owned);
    const covered = C.round2(n * value);
    const cash = C.round2(T - covered);
    let extra = null;
    const remainingEligible = C.round2(E - covered);
    if (remainingEligible > 0 && n + 1 <= max && n + 1 <= owned) {
      extra = {
        n: n + 1,
        covered: E,                                   // copre tutto l'idoneo
        cash: C.round2(T - E),                        // resta solo il non idoneo
        lost: C.round2((n + 1) * value - E),          // resto non restituito
      };
    }
    return { n, covered, cash, extra, value };
  };

  /* ---- Cartellino a scaffale (OCR) ------------------------------------ */
  // Input: righe OCR [{ text, height }] (height = altezza del riquadro in px, serve a
  // capire quale prezzo è "grande"). Output: { price, fullPrice, loyaltyPrice, name, confidence }.
  // Regole: il prezzo con il carattere più grande è quello che paghi; un prezzo più alto
  // scritto piccolo è il prezzo pieno barrato; se il cartellino parla di carta/soci il prezzo
  // grande vale solo con la carta. Prezzi al kg/litro/100 g vengono ignorati.
  const PRICE_RE = /(?:\u20AC\s*)?(\d{1,3})\s*[,.:;]\s*(\d{2})(?!\d)(\s*\u20AC)?/g;   // OCR a volte legge la virgola come : o ;
  // Prezzo per unità di misura (al kg, al litro, ai 100 g): NON è il prezzo del pezzo. "/pz" invece è al pezzo = quello che paghi.
  const UNIT_RE = /\/\s*(kg|l|lt|litro|100\s*g)\b|al\s+(kg|litro)\b|\bkg\b|\blitro\b|(price|prezzo|preis)[^a-z0-9]{0,2}l?(kg|lt?)\b|\beur\W{0,2}(kg|l)\b/i;
  const PER_PIECE_RE = /\/\s*pz\b|al\s+pezzo|\/\s*pezzo/i;
  // Cifre grandi lette senza separatore ("€249", "249 €"): 3-4 cifre attaccate al simbolo euro → ultime due sono i centesimi
  const NOSEP_RE = /(?:\u20AC\s*(\d{3,4})(?!\d)|(?<!\d)(\d{3,4})\s*\u20AC)/g;
  const NOISE_RE = /offerta|sconto|promo|prezzo|price|euro|risparm|valid[oa]|dal\b|fino|soci|carta|card|fidelity|fedelt|tessera|out of stock|vat|iva|conad|coop|sisa|sidis|dimeglio|esselunga|carrefour|lidl|eurospin|pam|despar|md\b|\bcod\b|\bart\b/i;
  C.parseShelfLabel = (lines) => {
    const out = { price: null, fullPrice: null, loyaltyPrice: null, name: '', confidence: 'none' };
    if (!Array.isArray(lines) || !lines.length) return out;
    const prices = [];
    lines.forEach((l, idx) => {
      const text = String((l && l.text) || '');
      if (UNIT_RE.test(text)) return;                       // prezzo al kg: non è il prezzo del pezzo
      const perPiece = PER_PIECE_RE.test(text);             // "2.99 €/Pz.": piccolo ma affidabile, vale come conferma
      let found = false;
      for (const m of text.matchAll(PRICE_RE)) {
        const v = Number(m[1] + '.' + m[2]);
        if (v > 0 && v < 1000) { found = true; prices.push({ value: v, height: Number(l.height) || 0, euro: !!(m[0].includes('\u20AC')), perPiece, idx }); }
      }
      if (!found) for (const m of text.matchAll(NOSEP_RE)) {   // "€249" → 2,49
        const digits = m[1] || m[2]; const v = Number(digits.slice(0, -2) + '.' + digits.slice(-2));
        if (v > 0 && v < 1000) prices.push({ value: v, height: Number(l.height) || 0, euro: true, nosep: true, perPiece, idx });
      }
    });
    const all = lines.map(l => String((l && l.text) || '')).join(' ').toLowerCase();
    const loyalty = /soci|carta|card|fidelity|fedelt|tessera|club/.test(all);
    if (prices.length) {
      prices.sort((a, b) => (b.height - a.height) || (b.euro - a.euro));
      let main = prices[0];
      // Se c'è un prezzo "al pezzo" e il grande non c'è o è diverso, il prezzo al pezzo è più affidabile del big-digit OCR
      const pp = prices.find(p => p.perPiece);
      if (pp && (main.perPiece || Math.abs(pp.value - main.value) > 0.004)) main = pp;
      const distinct = prices.filter(p => Math.abs(p.value - main.value) > 0.004);
      const higher = distinct.filter(p => p.value > main.value);
      const full = higher.length ? Math.max(...higher.map(p => p.value)) : null;
      if (full != null && loyalty) { out.price = full; out.loyaltyPrice = main.value; out.fullPrice = full; }
      else { out.price = main.value; out.fullPrice = full; }
      // Fiducia: alta se c'è un solo prezzo (o il principale è nettamente più grande), bassa se ambiguo
      const second = distinct[0];
      const confirmed = prices.some(p => p !== main && Math.abs(p.value - main.value) <= 0.004);   // stesso prezzo letto due volte
      out.confidence = (confirmed || main.perPiece || !second || (main.height > 0 && second.height > 0 && main.height >= second.height * 1.25)) ? 'high' : 'low';
      if (main.nosep && !confirmed) out.confidence = 'low';
    }
    // Nome: tra le righe "di testo" scelgo quella con il miglior punteggio altezza × plausibilità.
    // Plausibilità = quota di token che sembrano parole (≥3 lettere con una vocale). Così "SUSINE" (grande, una
    // parola vera) batte "WE WB WEEE NE NAA" (la scritta stilizzata "LA FRUTTERIA" letta male, più lunga).
    const wordish = (tok) => /^[A-Za-z\u00C0-\u00FF]{3,}$/.test(tok) && /[aeiouAEIOU\u00C0-\u00FF]/.test(tok) && !/[^aeiouAEIOU\u00C0-\u00FF]{4}/.test(tok) && !/(.)\1\1/.test(tok);   // 4 consonanti di fila o 3 lettere uguali = spazzatura OCR
    let best = null, bestScore = 0;
    for (const l of lines) {
      const t = String((l && l.text) || '').replace(/[|_~^`"'«»*@#&=<>{}\[\]]/g, ' ').replace(/\s+/g, ' ').trim();
      const letters = (t.match(/[A-Za-z\u00C0-\u00FF]/g) || []).length;
      if (letters < 5 || PRICE_RE.test(t) || NOSEP_RE.test(t) || NOISE_RE.test(t) || UNIT_RE.test(t) || PER_PIECE_RE.test(t)) { PRICE_RE.lastIndex = 0; NOSEP_RE.lastIndex = 0; continue; }
      PRICE_RE.lastIndex = 0; NOSEP_RE.lastIndex = 0;
      if (letters < t.replace(/\s/g, '').length * 0.6) continue;
      const toks = t.split(' ').filter(Boolean);
      const good = toks.filter(wordish).length, frac = good / toks.length;
      if (good === 0 || (toks.length === 1 && toks[0].length < 5)) continue;
      // sqrt(altezza): il testo grande conta, ma non domina; più parole vere = più credibile
      const score = Math.sqrt(Number(l.height) || 1) * (0.3 + frac) * (1 + 0.3 * Math.min(good, 3));
      if (score > bestScore) { bestScore = score; best = t; }
    }
    if (best) out.name = best.replace(/^[^A-Za-z\u00C0-\u00FF0-9]+|[^A-Za-z\u00C0-\u00FF0-9.)]+$/g, '').slice(0, 60);
    return out;
  };

  C.findEAN = (lines) => {
    if (!Array.isArray(lines)) return null;
    for (const l of lines) {
      const text = String((l && l.text) || '');
      for (const run of text.replace(/[ .\-]/g, '').match(/\d{8,13}/g) || []) {
        for (const cand of [run, run.length === 13 && run.startsWith('00000') ? run.slice(5) : null, run.length > 13 ? run.slice(-13) : null]) {
          if (!cand) continue;
          const n = C.normalizeEAN(cand);
          if (n) return n.length === 13 && n.startsWith('00000') ? n.slice(5) : n;
        }
      }
    }
    return null;
  };

  // Chiave di memoria per prodotti senza codice (frutta, banco, cartelli di carta): nome normalizzato
  C.nameKey = (name) => {
    const k = String(name || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, ' ').trim().replace(/\s+/g, ' ');
    return k.length >= 3 ? 'n:' + k : null;
  };

  /* ---- Riepilogo ------------------------------------------------------- */
  C.summary = (items, settings) => {
    const loyaltyOn = !!(settings && settings.loyaltyOn);
    let full = 0, total = 0, eligible = 0, count = 0;
    for (const it of items) {
      const qty = Number(it.qty) || 0;
      const price = Number(it.price) || 0;
      full += price * qty;
      const lt = C.lineTotal({ ...it, qty, price }, loyaltyOn);
      total += lt;
      if (it.voucherOk !== false) eligible += lt;
      count += qty;
    }
    full = C.round2(full); total = C.round2(total); eligible = C.round2(eligible);
    const savings = C.round2(full - total);
    const vouchers = C.voucherPlan(eligible, total, settings && settings.voucher);
    return { full, total, savings, eligible, nonEligible: C.round2(total - eligible), count, vouchers, loyaltyOn };
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = C;
  else root.Calc = C;
})(typeof window !== 'undefined' ? window : globalThis);
