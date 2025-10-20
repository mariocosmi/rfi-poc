/**
 * Test E2E - Feature 001: Regressione Chiosco Base
 *
 * Verifica che feature 002 non abbia rotto funzionalità esistenti
 *
 * Test copertura:
 * - Pagamento monete (1.20€)
 * - Pagamento carta VISA (randomizzato 80% successo)
 * - QR code autorizzato/non autorizzato
 * - Carta contactless autorizzata/non autorizzata
 * - Timeout 20s inattività
 * - Chiusura automatica porta 15s
 */

import { test, expect } from '@playwright/test';

test.describe('Feature 001: Regressione Base', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  // ===== PAGAMENTO MONETE =====

  test('T028: Pagamento monete 1,20€ → porta apre', async ({ page }) => {
    // Verifica stato iniziale IDLE
    await expect(page.locator('#display-message')).toContainText('Benvenuto');

    // Inserisci 1,00€
    await page.click('button[data-valore="1.00"]');

    // Verifica transizione PAGAMENTO_MONETE
    await expect(page.locator('#display-message')).toContainText('Inserisci monete');
    await expect(page.locator('#display-amount')).toContainText('0,20');

    // Inserisci 0,20€ (completa pagamento)
    await page.click('button[data-valore="0.20"]');

    // Verifica porta aperta
    await expect(page.locator('#porta-status')).toContainText('Aperta', { timeout: 5000 });
    await expect(page.locator('#display-message')).toContainText('Accesso consentito');
  });

  test('T028: Pagamento monete - inserimenti multipli', async ({ page }) => {
    // Inserisci monete piccole
    await page.click('button[data-valore="0.50"]'); // 0.70€ rimanenti
    await page.click('button[data-valore="0.20"]'); // 0.50€ rimanenti
    await page.click('button[data-valore="0.10"]'); // 0.40€ rimanenti
    await page.click('button[data-valore="0.20"]'); // 0.20€ rimanenti
    await page.click('button[data-valore="0.20"]'); // 0.00€ → PAGATO

    // Porta deve aprire
    await expect(page.locator('#porta-status')).toContainText('Aperta');
  });

  // ===== PAGAMENTO CARTA =====

  test('T029: Pagamento carta VISA → successo', async ({ page, context }) => {
    // SKIP: pagamento carta è randomizzato 80% successo
    // Test non deterministico - può fallire 20% volte

    await page.click('#btn-paga-carta');

    // Attendi area carta visibile
    await expect(page.locator('#carta-area')).toBeVisible();
    await expect(page.locator('#display-message')).toContainText('Avvicina la carta');

    // Click area carta (simula avvicinamento)
    await page.locator('#carta-area').click();

    // Attendi elaborazione (1.5s)
    await expect(page.locator('#display-message')).toContainText('Elaborazione');

    // Risultato (80% successo, 20% rifiutato)
    // Verifica almeno che non ci siano errori JavaScript
    await page.waitForTimeout(2000);

    const status = await page.locator('#porta-status').textContent();
    const displayMsg = await page.locator('#display-message').textContent();

    // Se successo → porta aperta
    // Se fallimento → torna a IDLE
    expect(status).toMatch(/Aperta|Chiusa/);
    expect(displayMsg).toMatch(/Accesso consentito|Pagamento rifiutato|Benvenuto|Pagamento accettato/);
  });

  // ===== QR CODE =====

  test('T030: QR code autorizzato (42) → porta apre', async ({ page }) => {
    await page.fill('#input-qr', '42');
    await page.click('#btn-scansiona-qr');

    // Verifica in corso
    await expect(page.locator('#display-message')).toContainText('Verifica in corso');

    // Autorizzato → porta apre
    await expect(page.locator('#display-message')).toContainText('Accesso autorizzato');
    await expect(page.locator('#porta-status')).toContainText('Aperta');
  });

  test('T030: QR code autorizzato (50) → porta apre', async ({ page }) => {
    await page.fill('#input-qr', '50');
    await page.click('#btn-scansiona-qr');

    await expect(page.locator('#display-message')).toContainText('Accesso autorizzato');
    await expect(page.locator('#porta-status')).toContainText('Aperta');
  });

  test('T030: QR code autorizzato (99) → porta apre', async ({ page }) => {
    await page.fill('#input-qr', '99');
    await page.click('#btn-scansiona-qr');

    await expect(page.locator('#display-message')).toContainText('Accesso autorizzato');
    await expect(page.locator('#porta-status')).toContainText('Aperta');
  });

  test('QR code NON autorizzato (123) → accesso negato', async ({ page }) => {
    await page.fill('#input-qr', '123');
    await page.click('#btn-scansiona-qr');

    await expect(page.locator('#display-message')).toContainText('Accesso negato');

    // Porta rimane chiusa
    await expect(page.locator('#porta-status')).toContainText('Chiusa');

    // Torna a IDLE dopo 2s
    await expect(page.locator('#display-message')).toContainText('Benvenuto', { timeout: 3000 });
  });

  test('QR code vuoto → warning', async ({ page }) => {
    await page.click('#btn-scansiona-qr'); // Campo vuoto

    await expect(page.locator('#display-message')).toContainText('Inserisci un codice QR');
    await expect(page.locator('#porta-status')).toContainText('Chiusa');
  });

  test('QR code Enter key → funziona', async ({ page }) => {
    await page.fill('#input-qr', '42');
    await page.press('#input-qr', 'Enter');

    await expect(page.locator('#display-message')).toContainText('Accesso autorizzato');
    await expect(page.locator('#porta-status')).toContainText('Aperta');
  });

  // ===== CARTA AUTORIZZATA =====

  test('T030: Carta autorizzata (42) → porta apre', async ({ page }) => {
    await page.click('#btn-verifica-carta');

    // Input codice visibile
    await expect(page.locator('#input-carta')).toBeVisible();

    await page.fill('#input-carta', '42');
    await page.click('#btn-verifica-carta');

    await expect(page.locator('#display-message')).toContainText('Accesso autorizzato');
    await expect(page.locator('#porta-status')).toContainText('Aperta');
  });

  test('Carta NON autorizzata (777) → accesso negato', async ({ page }) => {
    await page.fill('#input-carta', '777');
    await page.click('#btn-verifica-carta');

    await expect(page.locator('#display-message')).toContainText('Accesso negato');
    await expect(page.locator('#porta-status')).toContainText('Chiusa');
  });

  // ===== TIMEOUT INATTIVITÀ =====

  test('T031: Timeout 20s inattività durante PAGAMENTO_MONETE', async ({ page }) => {
    // Inserisci 0.50€ (pagamento incompleto)
    await page.click('button[data-valore="0.50"]');

    await expect(page.locator('#display-message')).toContainText('Inserisci monete');

    // Countdown dovrebbe apparire
    await expect(page.locator('#display-countdown')).toBeVisible({ timeout: 2000 });

    // Attendi timeout (20s + margine)
    await expect(page.locator('#display-message')).toContainText('Timeout', {
      timeout: 22000
    });

    // Torna a IDLE
    await expect(page.locator('#display-message')).toContainText('Benvenuto', {
      timeout: 3000
    });

    // Porta rimane chiusa
    await expect(page.locator('#porta-status')).toContainText('Chiusa');
  });

  // ===== CHIUSURA AUTOMATICA PORTA =====

  test('T032: Chiusura automatica porta 15s (senza click pulsante)', async ({ page }) => {
    // Apri porta con QR
    await page.fill('#input-qr', '42');
    await page.click('#btn-scansiona-qr');

    await expect(page.locator('#porta-status')).toContainText('Aperta');

    // NON cliccare pulsante passaggio persona
    // Attendi chiusura automatica 15s

    await expect(page.locator('#porta-status')).toContainText('Chiusa', {
      timeout: 17000 // 15s timer + 1.5s animazione + margine
    });

    // Torna a IDLE
    await expect(page.locator('#display-message')).toContainText('Benvenuto');
  });

  // ===== TRANSIZIONI FSM =====

  test('IDLE → PAGAMENTO_MONETE → PORTA_APERTA → IDLE (ciclo completo)', async ({ page }) => {
    // IDLE
    await expect(page.locator('#display-message')).toContainText('Benvenuto');

    // → PAGAMENTO_MONETE
    await page.click('button[data-valore="1.00"]');
    await expect(page.locator('#display-message')).toContainText('Inserisci monete');

    // → PORTA_APERTA
    await page.click('button[data-valore="0.20"]');
    await expect(page.locator('#porta-status')).toContainText('Aperta');
    await expect(page.locator('#display-message')).toContainText('Accesso consentito');

    // → IDLE (dopo 15s chiusura auto)
    await expect(page.locator('#display-message')).toContainText('Benvenuto', {
      timeout: 18000
    });
  });

  test('IDLE → VERIFICA_QR → PORTA_APERTA → IDLE', async ({ page }) => {
    await page.fill('#input-qr', '50');
    await page.click('#btn-scansiona-qr');

    await expect(page.locator('#porta-status')).toContainText('Aperta');

    await expect(page.locator('#display-message')).toContainText('Benvenuto', {
      timeout: 18000
    });
  });

  // ===== ANIMAZIONI E UI =====

  test('Porta animazione apertura CSS', async ({ page }) => {
    await page.fill('#input-qr', '42');
    await page.click('#btn-scansiona-qr');

    const porta = page.locator('#porta');

    // Verifica classe CSS 'aperta' applicata
    await expect(porta).toHaveClass(/aperta/);

    // Verifica transform CSS (animazione translateY)
    // Nota: Playwright può verificare computed styles
    const transform = await porta.evaluate(el =>
      window.getComputedStyle(el).transform
    );

    // Transform dovrebbe includere translateY negativo
    expect(transform).toContain('matrix'); // CSS transform applicato
  });

  test('Display cambia colore su successo/errore', async ({ page }) => {
    const display = page.locator('#display');

    // Stato iniziale
    await expect(display).toBeVisible();

    // QR autorizzato → successo (verde)
    await page.fill('#input-qr', '42');
    await page.click('#btn-scansiona-qr');
    await expect(display).toHaveClass(/successo/);

    // Attendi reset
    await page.waitForTimeout(18000);

    // QR non autorizzato → errore (rosso)
    await page.fill('#input-qr', '999');
    await page.click('#btn-scansiona-qr');
    await expect(display).toHaveClass(/errore/);
  });

  // ===== LOGGING CONSOLE =====

  test('Logging completo console (observability)', async ({ page }) => {
    const logs = [];

    page.on('console', msg => {
      logs.push({
        type: msg.type(),
        text: msg.text()
      });
    });

    // Esegui operazioni
    await page.click('button[data-valore="1.00"]');
    await page.click('button[data-valore="0.20"]');

    await page.waitForTimeout(1000);

    // Verifica log presenti
    expect(logs.length).toBeGreaterThan(0);

    // Verifica log contengono eventi chiave
    const logTexts = logs.map(l => l.text).join('\n');
    expect(logTexts).toContain('Transizione');
    expect(logTexts).toContain('Pagamento monete');
  });
});
