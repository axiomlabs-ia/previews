# Carrello Smart

Scontrino in tempo reale mentre fai la spesa. Scansioni il codice a barre col telefono,
inserisci il prezzo la prima volta (poi lo ricorda), e vedi subito totale, sconto carta
fedeltà e quanti buoni pasto usare senza perdere resto.

Zero backend, zero account, zero AI: tutto gira nel browser del telefono e resta lì.

## Come funziona

1. **Inizia a scansionare** → inquadri il codice. Con codici già visti l'articolo entra al volo (+1 se già in lista).
2. Codice nuovo → cerco il nome su Open Food Facts (6 s di timeout, poi lo scrivi tu) e ti chiedo il prezzo.
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
node test/calc.test.mjs      # 24 test sulla logica: EAN, prezzi, fedeltà, buoni pasto
python3 -m http.server 8765  # poi http://localhost:8765 (la fotocamera funziona anche su localhost)
```

## Struttura

- `index.html` — interfaccia e scanner (BarcodeDetector nativo, fallback ZXing da CDN)
- `calc.js` — logica pura, senza DOM: checksum EAN, parsing prezzi, riepilogo, piano buoni pasto
- `test/calc.test.mjs` — suite Node, nessuna dipendenza
- `sw.js`, `manifest.webmanifest`, `icon-*.png` — PWA installabile, shell offline

## Limiti noti

- I prezzi non arrivano da nessuna API pubblica: li inserisci tu la prima volta. È voluto, non c'è una fonte affidabile per l'Italia.
- La memoria prezzi è del singolo telefono (localStorage). Cambi telefono, la perdi.
- Il nome da Open Food Facts va controllato: l'archivio è collaborativo.
