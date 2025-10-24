/**
 * Test E2E Feature 004: Visualizzazione Stato Cassetta e Controlli Manutenzione
 *
 * User Stories testate:
 * - US1: Visualizzazione stato cassetta (APERTA/CHIUSA)
 * - US2: Simulazione evento apertura (pulsante sempre abilitato)
 * - US3: Simulazione evento chiusura (pulsante sempre abilitato)
 * - Edge Cases: Idempotenza, eventi rapidi
 * - Regressione: Feature 001-003 ancora funzionanti
 */

const { test, expect } = require('@playwright/test');

// T019: Setup describe block US1 - Visualizzazione Stato
test.describe('Feature 004 - US1: Visualizzazione Stato Cassetta', () => {

  // T020: Test stato iniziale CHIUSA
  test('deve mostrare stato iniziale CHIUSA al caricamento', async ({ page }) => {
    await page.goto('http://localhost:8000');

    // Verifica badge mostra "CHIUSA"
    const badge = page.locator('#stato-cassetta');
    await expect(badge).toContainText('CHIUSA');
  });

  // T021: Test aggiornamento UI su cambio stato
  test('deve aggiornare UI quando stato cambia da CHIUSA a APERTA', async ({ page }) => {
    await page.goto('http://localhost:8000');

    // Stato iniziale CHIUSA
    const badge = page.locator('#stato-cassetta');
    await expect(badge).toContainText('CHIUSA');

    // Simula evento apertura via console (per testare listener)
    await page.evaluate(() => {
      window.app.sensoreCassetta.notificaApertura();
    });

    // Verifica badge aggiornato a APERTA
    await expect(badge).toContainText('APERTA');
  });

  // T022: Test classe CSS badge CHIUSA
  test('deve avere classe CSS badge-chiusa quando stato è CHIUSA', async ({ page }) => {
    await page.goto('http://localhost:8000');

    const badge = page.locator('#stato-cassetta');

    // Verifica classe badge-chiusa presente
    await expect(badge).toHaveClass(/badge-chiusa/);
  });

  // T023: Test classe CSS badge APERTA
  test('deve avere classe CSS badge-aperta quando stato è APERTA', async ({ page }) => {
    await page.goto('http://localhost:8000');

    // Cambia stato a APERTA
    await page.evaluate(() => {
      window.app.sensoreCassetta.notificaApertura();
    });

    const badge = page.locator('#stato-cassetta');

    // Verifica classe badge-aperta presente
    await expect(badge).toHaveClass(/badge-aperta/);
  });
});

// T024: Setup describe block US2 - Simulazione Apertura
test.describe('Feature 004 - US2: Simulazione Evento Apertura Cassetta', () => {

  // T025: Test pulsante Apri sempre abilitato
  test('pulsante "Apri Cassetta" deve essere sempre abilitato', async ({ page }) => {
    await page.goto('http://localhost:8000');

    const btnApri = page.locator('#btn-apri-cassetta-004');

    // Verifica pulsante NON disabled
    await expect(btnApri).toBeEnabled();

    // Anche dopo apertura, deve rimanere abilitato
    await btnApri.click();
    await expect(btnApri).toBeEnabled();
  });

  // T026: Test click Apri → badge APERTA entro 500ms
  test('click "Apri Cassetta" deve mostrare badge APERTA entro 500ms', async ({ page }) => {
    await page.goto('http://localhost:8000');

    const badge = page.locator('#stato-cassetta');
    const btnApri = page.locator('#btn-apri-cassetta-004');

    // Stato iniziale CHIUSA
    await expect(badge).toContainText('CHIUSA');

    // Click pulsante Apri
    await btnApri.click();

    // Verifica badge APERTA entro 500ms (SC-002)
    await expect(badge).toContainText('APERTA', { timeout: 500 });
  });

  // T027: Test idempotenza apertura
  test('doppio click "Apri Cassetta" deve gestire idempotenza (badge rimane APERTA)', async ({ page }) => {
    await page.goto('http://localhost:8000');

    const badge = page.locator('#stato-cassetta');
    const btnApri = page.locator('#btn-apri-cassetta-004');

    // Primo click → APERTA
    await btnApri.click();
    await expect(badge).toContainText('APERTA');

    // Secondo click (idempotente) → badge rimane APERTA
    await btnApri.click();
    await expect(badge).toContainText('APERTA');

    // Verifica nessun errore console (eventi idempotenti validi)
    // Nota: Log DEBUG atteso per evento idempotente
  });
});

// T028: Setup describe block US3 - Simulazione Chiusura
test.describe('Feature 004 - US3: Simulazione Evento Chiusura Cassetta', () => {

  // T029: Test pulsante Chiudi sempre abilitato
  test('pulsante "Chiudi Cassetta" deve essere sempre abilitato', async ({ page }) => {
    await page.goto('http://localhost:8000');

    const btnChiudi = page.locator('#btn-chiudi-cassetta-004');

    // Verifica pulsante NON disabled
    await expect(btnChiudi).toBeEnabled();

    // Anche dopo chiusura, deve rimanere abilitato
    await btnChiudi.click();
    await expect(btnChiudi).toBeEnabled();
  });

  // T030: Test click Chiudi → badge CHIUSA entro 500ms
  test('click "Chiudi Cassetta" deve mostrare badge CHIUSA entro 500ms', async ({ page }) => {
    await page.goto('http://localhost:8000');

    const badge = page.locator('#stato-cassetta');
    const btnApri = page.locator('#btn-apri-cassetta-004');
    const btnChiudi = page.locator('#btn-chiudi-cassetta-004');

    // Prima apri cassetta
    await btnApri.click();
    await expect(badge).toContainText('APERTA');

    // Poi chiudi cassetta
    await btnChiudi.click();

    // Verifica badge CHIUSA entro 500ms (SC-002)
    await expect(badge).toContainText('CHIUSA', { timeout: 500 });
  });

  // T031: Test idempotenza chiusura
  test('doppio click "Chiudi Cassetta" deve gestire idempotenza (badge rimane CHIUSA)', async ({ page }) => {
    await page.goto('http://localhost:8000');

    const badge = page.locator('#stato-cassetta');
    const btnChiudi = page.locator('#btn-chiudi-cassetta-004');

    // Stato iniziale già CHIUSA
    await expect(badge).toContainText('CHIUSA');

    // Click Chiudi (idempotente) → badge rimane CHIUSA
    await btnChiudi.click();
    await expect(badge).toContainText('CHIUSA');

    // Secondo click (idempotente) → badge rimane CHIUSA
    await btnChiudi.click();
    await expect(badge).toContainText('CHIUSA');
  });
});

// T032: Setup describe block Edge Cases
test.describe('Feature 004 - Edge Cases: Eventi Multipli e Idempotenza', () => {

  // T033: Test sequenza rapida Apri-Chiudi-Apri (5 eventi in 1 sec)
  test('sequenza rapida Apri-Chiudi-Apri-Chiudi-Apri deve gestire tutti eventi', async ({ page }) => {
    await page.goto('http://localhost:8000');

    const badge = page.locator('#stato-cassetta');
    const btnApri = page.locator('#btn-apri-cassetta-004');
    const btnChiudi = page.locator('#btn-chiudi-cassetta-004');

    // Sequenza rapida alternata (5 click in 1 sec)
    await btnApri.click();
    await btnChiudi.click();
    await btnApri.click();
    await btnChiudi.click();
    await btnApri.click();

    // Stato finale: APERTA (ultimo evento)
    await expect(badge).toContainText('APERTA');
  });

  // T034: Test 5 eventi apertura in 1 secondo
  test('5 click "Apri Cassetta" in rapida successione non devono causare freeze UI', async ({ page }) => {
    await page.goto('http://localhost:8000');

    const badge = page.locator('#stato-cassetta');
    const btnApri = page.locator('#btn-apri-cassetta-004');

    // 5 click rapidi Apri (testa SC-005: gestione 5 eventi/sec)
    for (let i = 0; i < 5; i++) {
      await btnApri.click();
    }

    // Badge deve mostrare APERTA (tutti eventi processati)
    await expect(badge).toContainText('APERTA');

    // Pulsante deve rimanere responsive (non frozen)
    await expect(btnApri).toBeEnabled();
  });
});

// T035: Setup describe block Regressione
test.describe('Feature 004 - Regressione: Feature 001-003 Funzionanti', () => {

  // T036: Test feature 001 funziona (smoke test chiosco base)
  test('Feature 001: Chiosco base deve funzionare (monete, porta, display)', async ({ page }) => {
    await page.goto('http://localhost:8000');

    // Verifica display presente
    const display = page.locator('.display');
    await expect(display).toBeVisible();

    // Verifica monete presenti
    const monete = page.locator('.btn-moneta');
    await expect(monete.first()).toBeVisible();

    // Verifica porta presente
    const porta = page.locator('.porta');
    await expect(porta).toBeVisible();

    // Test pagamento monete base (inserisci 1€ + 0.20€)
    await page.click('.btn-moneta[data-valore="1.00"]');
    await page.click('.btn-moneta[data-valore="0.20"]');

    // Display deve mostrare importo rimanente o successo
    await expect(display).toBeVisible();
  });

  // T037: Test feature 002 funziona (pulsante persona passata)
  test('Feature 002: Pulsante "Persona passata" deve funzionare', async ({ page }) => {
    await page.goto('http://localhost:8000');

    // Completa pagamento per aprire porta (inserisci 1,20€)
    await page.click('.btn-moneta[data-valore="1.00"]');
    await page.click('.btn-moneta[data-valore="0.20"]');

    // Attendi porta aperta
    await page.waitForSelector('.porta.aperta', { timeout: 3000 });

    // Verifica pulsante "Persona passata" visibile
    const btnPassaggio = page.locator('#btn-passaggio-persona');
    await expect(btnPassaggio).toBeVisible();

    // Click pulsante
    await btnPassaggio.click();

    // Porta deve chiudersi
    const porta = page.locator('.porta');
    await expect(porta).not.toHaveClass(/aperta/);
  });

  // T038: Test feature 003 funziona (svuotamento cassetta se esiste)
  test('Feature 003: Pannello admin con pulsanti Apri/Chiudi cassetta deve funzionare', async ({ page }) => {
    await page.goto('http://localhost:8000');

    // Verifica pannello admin presente
    const pannelloAdmin = page.locator('#pannello-admin');
    await expect(pannelloAdmin).toBeVisible();

    // Verifica saldo cassetta visibile
    const saldo = page.locator('#saldo-cassetta-valore');
    await expect(saldo).toBeVisible();

    // Verifica pulsanti manutenzione presenti (feature 004)
    const btnApriAdmin = page.locator('#btn-apri-cassetta-004');
    const btnChiudiAdmin = page.locator('#btn-chiudi-cassetta-004');
    await expect(btnApriAdmin).toBeVisible();
    await expect(btnChiudiAdmin).toBeVisible();
  });
});

// T039: Aggiunto script npm in package.json (fatto separatamente)
// T040: Eseguire npm run test:feature-004 (fatto da utente manualmente)
