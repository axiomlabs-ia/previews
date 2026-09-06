# Carrello Smart

Scontrino in tempo reale mentre fai la spesa. Inquadri il **cartellino a scaffale** col
telefono: il codice a barre identifica il prodotto, l'OCR legge il prezzo stampato accanto
(e il prezzo barrato o "con carta" se c'è). Vedi subito totale, sconto carta fedeltà e quanti
buoni pasto usare senza perdere resto.

Zero backend, zero account, zero AI: tutto gira nel browser del telefono e resta lì.

## Come funziona

1. **Inizia a scansionare** → inquadri il cartellino e premi **Leggi cartellino**. Se c'è un codice a barre leggibile, parte da solo al bip.
2. La scheda si apre subito e si riempie man mano: prezzo e nome dall'OCR (Tesseract.js, testo sparso, due scale: 900 px per il testo piccolo e 450 px per le cifre giganti), codice dalle cifre stampate sotto il barcode delle etichette elettroniche, nome dagli archivi Open*Facts se il codice c'è, prezzo ricordato se il prodotto è già passato (anche senza codice: memoria per nome).
   Codice già visto → entra al volo; se il cartellino mostra un prezzo diverso, lo aggiorno e ti avviso.
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
node test/calc.test.mjs      # 45 test sulla logica: EAN, prezzi, fedeltà, buoni pasto, parser cartellino
python3 -m http.server 8765  # poi http://localhost:8765 (la fotocamera funziona anche su localhost)
```

## Struttura

- `index.html` — interfaccia e scanner (BarcodeDetector nativo, fallback ZXing da CDN)
- `calc.js` — logica pura, senza DOM: checksum EAN, parsing prezzi, parser del cartellino OCR, riepilogo, piano buoni pasto
- `test/calc.test.mjs` — suite Node, nessuna dipendenza
- `sw.js`, `manifest.webmanifest`, `icon-*.png` — PWA installabile, shell offline

## Limiti noti

- I prezzi non arrivano da nessuna API pubblica: li leggo dal cartellino con l'OCR. Se la lettura è incerta il campo è evidenziato in giallo, se fallisce lo scrivi tu. Collaudato su 4 foto reali di cartellini PIM (carta senza codice, etichette elettroniche), 2 inquadrature ciascuna: 8/8 prezzi corretti. Regole imparate dalle foto: cifre senza virgola ("€249"), "2.99 €/Pz." vale come prezzo, "2:99" con i due punti, prezzo al kg escluso.
- L'OCR (~2 MB) si scarica dal CDN alla prima accensione della fotocamera e poi resta in cache.
- La qualità del fotogramma conta più del motore: stesse foto, a piena risoluzione 8/8, a 720p 4/8, con mosso 2/8. Per questo l'app chiede video 1080p con fuoco continuo, usa la foto vera (ImageCapture) dove c'è, tiene il più nitido di 3 fotogrammi e riprova una volta da sola se non legge il prezzo. Avvicinati: il cartellino deve riempire il riquadro.
- La memoria prezzi è del singolo telefono (localStorage). Cambi telefono, la perdi.
- Il nome da Open Food Facts va controllato: l'archivio è collaborativo.
