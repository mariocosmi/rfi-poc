/**
 * Test E2E - Feature 002: Chiusura Porta su Passaggio Persona
 *
 * Testa le 3 user stories:
 * - US1 (P1): Chiusura manuale porta
 * - US2 (P2): Visibilità pulsante
 * - US3 (P3): Logging completo
 *
 * Riferimenti:
 * - specs/002-la-porta-deve/spec.md
 * - specs/002-la-porta-deve/tasks.md
 * - specs/002-la-porta-deve/quickstart.md
 */

import { test, expect } from '@playwright/test';

test.describe('Feature 002: Passaggio Persona', () => {

  test.beforeEach(async ({ page }) => {
    // Naviga a homepage e attendi caricamento completo
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Verifica componenti base caricati
    await expect(page.locator('#display')).toBeVisible();
    await expect(page.locator('#porta')).toBeVisible();
  });

  // ===== USER STORY 1: Chiusura Manuale =====

  test('US1-T016: Click pulsante chiude porta < 2s (pagamento monete)', async ({ page }) => {
    // Inserisci 1,20€ per aprire porta
    await page.click('button[data-valore="1.00"]');
    await page.click('button[data-valore="0.20"]');

    // Attendi porta aperta
    await expect(page.locator('#porta-status')).toContainText('Aperta', { timeout: 5000 });
    await expect(page.locator('#porta')).toHaveClass(/aperta/);

    // Verifica pulsante visibile
    const btnPassaggio = page.locator('#btn-passaggio-persona');
    await expect(btnPassaggio).toBeVisible();
    await expect(btnPassaggio).toBeEnabled();

    // Click e cronometra chiusura
    const startTime = Date.now();
    await btnPassaggio.click();

    // Attendi porta chiusa (SC-003: < 2s)
    await expect(page.locator('#porta-status')).toContainText('Chiusa', {
      timeout: 2000
    });

    const elapsed = Date.now() - startTime;

    // Verifica tempo chiusura < 2s
    expect(elapsed).toBeLessThan(2000);
    console.log(`✅ Porta chiusa in ${elapsed}ms (< 2000ms)`);

    // Verifica porta ha classe 'chiusa'
    await expect(page.locator('#porta')).toHaveClass(/chiusa/);
  });

  test('US1-T014: Pulsante disabilitato dopo click', async ({ page }) => {
    // Apri porta con QR
    await page.fill('#input-qr', '42');
    await page.click('#btn-scansiona-qr');
    await expect(page.locator('#porta-status')).toContainText('Aperta');

    const btnPassaggio = page.locator('#btn-passaggio-persona');
    await expect(btnPassaggio).toBeVisible();

    // Click pulsante
    await btnPassaggio.click();

    // Verifica immediatamente disabilitato
    await expect(btnPassaggio).toBeDisabled();
  });

  test('US1-T015: Display mostra "Passaggio rilevato"', async ({ page }) => {
    // Apri porta con carta autorizzata
    await page.fill('#input-carta', '50');
    await page.click('#btn-verifica-carta');
    await expect(page.locator('#porta-status')).toContainText('Aperta');

    const btnPassaggio = page.locator('#btn-passaggio-persona');
    await btnPassaggio.click();

    // Verifica messaggio display
    const displayMsg = page.locator('#display-message');
    await expect(displayMsg).toContainText('Passaggio rilevato');
  });

  test('US1-T016: Timer 15s cancellato correttamente', async ({ page }) => {
    // Apri porta
    await page.fill('#input-qr', '42');
    await page.click('#btn-scansiona-qr');
    await expect(page.locator('#porta-status')).toContainText('Aperta');

    // Attendi 5 secondi (meno di 15s)
    await page.waitForTimeout(5000);

    // Click pulsante
    await page.locator('#btn-passaggio-persona').click();

    // Porta deve chiudere immediatamente, non dopo altri 10s
    await expect(page.locator('#porta-status')).toContainText('Chiusa', {
      timeout: 2000
    });

    // Attendi altri 12s per verificare che non si riapra/comportamenti strani
    await page.waitForTimeout(12000);

    // Porta deve rimanere chiusa
    await expect(page.locator('#porta-status')).toContainText('Chiusa');
    await expect(page.locator('#porta')).toHaveClass(/chiusa/);
  });

  // ===== USER STORY 2: Visibilità Pulsante =====

  test('US2-T020: Pulsante nascosto in IDLE, visibile in PORTA_APERTA', async ({ page }) => {
    const btnPassaggio = page.locator('#btn-passaggio-persona');

    // Stato IDLE: pulsante nascosto
    await expect(btnPassaggio).toBeHidden();

    // Apri porta con QR
    await page.fill('#input-qr', '42');
    await page.click('#btn-scansiona-qr');

    // Stato PORTA_APERTA: pulsante visibile
    await expect(page.locator('#porta-status')).toContainText('Aperta');
    await expect(btnPassaggio).toBeVisible();
    await expect(btnPassaggio).toBeEnabled();

    // Click pulsante
    await btnPassaggio.click();

    // Tornato a IDLE: pulsante nascosto
    await expect(page.locator('#porta-status')).toContainText('Chiusa');
    await expect(btnPassaggio).toBeHidden();
  });

  test('US2-T020: Pulsante nascosto durante PAGAMENTO_MONETE', async ({ page }) => {
    const btnPassaggio = page.locator('#btn-passaggio-persona');

    // Inserisci 0.50€ (pagamento incompleto)
    await page.click('button[data-valore="0.50"]');

    // Display dovrebbe mostrare importo rimanente
    await expect(page.locator('#display-amount')).toBeVisible();

    // Pulsante ancora nascosto (porta non ancora aperta)
    await expect(btnPassaggio).toBeHidden();
  });

  test('US2-T017: Tooltip visibile su hover', async ({ page }) => {
    // Apri porta
    await page.fill('#input-qr', '42');
    await page.click('#btn-scansiona-qr');
    await expect(page.locator('#porta-status')).toContainText('Aperta');

    const btnPassaggio = page.locator('#btn-passaggio-persona');

    // Verifica attributo title (tooltip)
    await expect(btnPassaggio).toHaveAttribute('title', 'Clicca dopo aver attraversato');
  });

  // ===== USER STORY 3: Logging =====

  test('US3-T024-T025: Log include tempo apertura e metodo (monete)', async ({ page }) => {
    const logs = [];

    // Cattura log console
    page.on('console', msg => {
      if (msg.type() === 'log' || msg.type() === 'info') {
        logs.push(msg.text());
      }
    });

    // Apri porta con monete
    await page.click('button[data-valore="1.00"]');
    await page.click('button[data-valore="0.20"]');
    await expect(page.locator('#porta-status')).toContainText('Aperta');

    // Attendi 3 secondi
    await page.waitForTimeout(3000);

    // Click pulsante
    await page.locator('#btn-passaggio-persona').click();

    // Attendi log
    await page.waitForTimeout(500);

    // Verifica log contiene tempo (~3s) e metodo (monete)
    const passaggioLog = logs.find(l => l.includes('Passaggio persona rilevato'));
    expect(passaggioLog).toBeTruthy();
    expect(passaggioLog).toMatch(/Porta aperta da [23]s/); // 2-3s accettabile
    expect(passaggioLog).toContain('Metodo: monete');
  });

  test('US3-T026: Log funziona con tutti i metodi', async ({ page }) => {
    const logs = [];

    page.on('console', msg => {
      if (msg.type() === 'log' || msg.type() === 'info') {
        logs.push(msg.text());
      }
    });

    // Test 1: QR
    await page.fill('#input-qr', '42');
    await page.click('#btn-scansiona-qr');
    await expect(page.locator('#porta-status')).toContainText('Aperta');
    await page.locator('#btn-passaggio-persona').click();
    await page.waitForTimeout(2000); // Attendi IDLE

    let log = logs.find(l => l.includes('Passaggio persona') && l.includes('Metodo: qr'));
    expect(log).toBeTruthy();

    logs.length = 0; // Reset logs

    // Test 2: Carta Autorizzata
    await page.fill('#input-carta', '50');
    await page.click('#btn-verifica-carta');
    await expect(page.locator('#porta-status')).toContainText('Aperta');
    await page.locator('#btn-passaggio-persona').click();
    await page.waitForTimeout(2000);

    log = logs.find(l => l.includes('Passaggio persona') && l.includes('Metodo: carta'));
    expect(log).toBeTruthy();
  });

  // ===== CASI LIMITE =====

  test('T033: Click multipli → solo primo elaborato', async ({ page }) => {
    // Apri porta
    await page.fill('#input-qr', '42');
    await page.click('#btn-scansiona-qr');
    await expect(page.locator('#porta-status')).toContainText('Aperta');

    const btn = page.locator('#btn-passaggio-persona');

    // Click 3 volte rapidamente
    await Promise.all([
      btn.click({ force: true }),
      btn.click({ force: true }).catch(() => {}), // Potrebbe fallire se già disabilitato
      btn.click({ force: true }).catch(() => {})
    ]);

    // Verifica pulsante disabilitato (solo primo elaborato)
    await expect(btn).toBeDisabled();

    // Verifica porta si chiude normalmente (1 sola chiusura)
    await expect(page.locator('#porta-status')).toContainText('Chiusa', { timeout: 2000 });
  });

  test('T035: Click immediato (<200ms) → accettato', async ({ page }) => {
    // Apri porta
    await page.fill('#input-qr', '42');
    await page.click('#btn-scansiona-qr');

    // Click immediato appena porta aperta
    await expect(page.locator('#btn-passaggio-persona')).toBeVisible();
    await page.locator('#btn-passaggio-persona').click();

    // Verifica porta chiude correttamente
    await expect(page.locator('#porta-status')).toContainText('Chiusa', { timeout: 2000 });
  });

  test('T036: Click a 14.5s → timer cancellato, chiusura immediata', async ({ page }) => {
    // Apri porta
    await page.fill('#input-qr', '42');
    await page.click('#btn-scansiona-qr');
    await expect(page.locator('#porta-status')).toContainText('Aperta');

    // Attendi 14.5s (poco prima chiusura automatica 15s)
    await page.waitForTimeout(14500);

    // Click pulsante
    const startTime = Date.now();
    await page.locator('#btn-passaggio-persona').click();

    // Porta deve chiudere immediatamente, non aspettare i 500ms residui del timer
    await expect(page.locator('#porta-status')).toContainText('Chiusa', { timeout: 2000 });

    const elapsed = Date.now() - startTime;
    expect(elapsed).toBeLessThan(2000);
  });

  // ===== SUCCESS CRITERIA =====

  test('SC-001: Riduzione tempo ciclo ~40% (15s → ~2-5s)', async ({ page }) => {
    // Apri porta
    await page.fill('#input-qr', '42');
    await page.click('#btn-scansiona-qr');
    await expect(page.locator('#porta-status')).toContainText('Aperta');

    // Attendi 3s (simula persona attraversa)
    await page.waitForTimeout(3000);

    // Click pulsante
    const startClosure = Date.now();
    await page.locator('#btn-passaggio-persona').click();

    // Attendi chiusura completa + IDLE
    await expect(page.locator('#display-message')).toContainText('Benvenuto');

    const totalTime = Date.now() - startClosure;

    // Tempo totale chiusura + reset < 5s (molto meglio di 15s baseline)
    expect(totalTime).toBeLessThan(5000);
    console.log(`✅ Tempo ciclo con passaggio manuale: ${totalTime}ms (baseline 15000ms)`);
  });

  test('SC-002: Pulsante visibile solo quando porta aperta', async ({ page }) => {
    const btn = page.locator('#btn-passaggio-persona');

    // IDLE → nascosto
    await expect(btn).toBeHidden();

    // PAGAMENTO_MONETE → nascosto
    await page.click('button[data-valore="0.50"]');
    await expect(btn).toBeHidden();

    // PORTA_APERTA → visibile (completa pagamento con 0.70€)
    await page.click('button[data-valore="0.20"]');
    await page.click('button[data-valore="0.50"]');
    await expect(page.locator('#porta-status')).toContainText('Aperta');
    await expect(btn).toBeVisible();

    // Dopo click → nascosto
    await btn.click();
    await expect(btn).toBeHidden();
  });

  test('SC-005: Zero breaking changes - feature 001 funziona identicamente', async ({ page }) => {
    // Test pagamento monete senza usare pulsante passaggio

    // Inserisci 1,20€
    await page.click('button[data-valore="1.00"]');
    await page.click('button[data-valore="0.20"]');

    // Porta apre
    await expect(page.locator('#porta-status')).toContainText('Aperta');

    // NON cliccare pulsante passaggio - attendi chiusura automatica 15s
    await expect(page.locator('#porta-status')).toContainText('Chiusa', {
      timeout: 17000 // 15s timer + 1.5s animazione + margine
    });

    // Sistema torna a IDLE
    await expect(page.locator('#display-message')).toContainText('Benvenuto');

    // Feature 001 funziona identicamente! ✅
  });
});
