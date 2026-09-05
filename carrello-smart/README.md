# Carrello Smart

Scontrino in tempo reale mentre fai la spesa. Inquadri il **cartellino a scaffale** col
telefono: il codice a barre identifica il prodotto, l'OCR legge il prezzo stampato accanto
(e il prezzo barrato o "con carta" se c'è). Vedi subito totale, sconto carta fedeltà e quanti
buoni pasto usare senza perdere resto.

Zero backend, zero account, zero AI: tutto gira nel browser del telefono e resta lì.

## Come funziona

1. **Inizia a scansionare** → inquadri il cartellino. Al bip catturo il fotogramma: codice a barre + OCR del prezzo (Tesseract.js, modalità testo sparso, immagine in scala di grigi).
2. Codice nuovo → in parallelo cerco il nome nei 4 archivi Open*Facts (10 s di timeout) e leggo prezzo/nome dal cartellino. La scheda si apre già compilata: controlli e confermi con un tap.
   Codice già visto → entra al volo; se il cartellino mostra un prezzo diverso da quello ricordato, lo aggiorno e ti avviso.
3. **Digita codice** se il barcode è rovinato, **Senza codice** per frutta, banco, sfuso.
4. Tocchi una riga per correggere prezzo/quantità o eliminarla.
5. ⚙️ Impostazioni: supermercato, carta fedeltà on/off, valore e numero dei buoni pasto.

Regole buoni pasto implementate: massimo 8 per spesa (DM 122/2017), il buono non dà resto,
alcolici e non alimentari esclusi (flag per articolo, gli alcolici vengono riconosciuti in automatico).

## Deploy su GitHub Pages (serve HTTPS per la fotocamera)

1. Su github.com crea un repository vuoto `carrello-smart` (pubblico).
2. Da terminale:

```bash
cd ~/Documents/carrello-smart
git init && git add . && git commit -m "feat: carrello smart v1"
git branch -M main
git remote add origin https://github.com/<utente>/carrello-smart.git
git push -u origin main
```

3. Nel repo: **Settings → Pages → Source: Deploy from a branch → main / (root)**.

Dopo un minuto l'app è su `https://<utente>.github.io/carrello-smart/`. Sul telefono:
Safari → Condividi → **Aggiungi a Home** (iOS) oppure Chrome → menu → **Installa app** (Android).

## Test

```bash
node test/calc.test.mjs      # 34 test sulla logica: EAN, prezzi, fedeltà, buoni pasto, parser cartellino
python3 -m http.server 8765  # poi http://localhost:8765 (la fotocamera funziona anche su localhost)
```

## Struttura

- `index.html` — interfaccia e scanner (BarcodeDetector nativo, fallback ZXing da CDN)
- `calc.js` — logica pura, senza DOM: checksum EAN, parsing prezzi, parser del cartellino OCR, riepilogo, piano buoni pasto
- `test/calc.test.mjs` — suite Node, nessuna dipendenza
- `sw.js`, `manifest.webmanifest`, `icon-*.png` — PWA installabile, shell offline

## Limiti noti

- I prezzi non arrivano da nessuna API pubblica: li leggo dal cartellino con l'OCR. Se la lettura è incerta il campo è evidenziato in giallo, se fallisce lo scrivi tu. Collaudato su cartellini sintetici (Conad giallo, offerta con barrato, etichetta elettronica): 6/6. Sui cartellini veri il collaudo lo fa la prima spesa.
- L'OCR (~2 MB) si scarica dal CDN alla prima accensione della fotocamera e poi resta in cache.
- La memoria prezzi è del singolo telefono (localStorage). Cambi telefono, la perdi.
- Il nome da Open Food Facts va controllato: l'archivio è collaborativo.
