/**
 * Test E2E - Feature 003: Svuotamento Cassetta Monete
 * USER STORY 1 (MVP): Operazione svuotamento base con autenticazione
 *
 * Test scenari:
 * 1. Svuotamento completo con azzeramento Sì
 * 2. Svuotamento con azzeramento No (mantieni saldo)
 * 3. Timeout 10s senza autenticazione → FUORI_SERVIZIO
 *
 * Riferimenti:
 * - specs/003-aggiungere-operazione-svuotamento/spec.md
 * - specs/003-aggiungere-operazione-svuotamento/tasks.md
 * - specs/003-aggiungere-operazione-svuotamento/quickstart.md
 */

import { test, expect } from '@playwright/test';

test.describe('Feature 003 US1: Operazione Svuotamento Base', () => {

  test.beforeEach(async ({ page }) => {
    // Disabilita suoneria per evitare audio durante test
    await page.addInitScript(() => {
      window.suoneriaEnabled = false;
    });

    // Naviga a homepage e attendi caricamento completo
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Verifica componenti base caricati
    await expect(page.locator('#display')).toBeVisible();
    await expect(page.locator('#pannello-admin')).toBeVisible();
    await expect(page.locator('#btn-apri-cassetta-004')).toBeVisible();
    await expect(page.locator('#btn-chiudi-cassetta-004')).toBeVisible();
    await expect(page.locator('#saldo-cassetta')).toBeVisible();
  });

  // ===== TEST 1: Svuotamento con azzeramento Sì =====

  test('US1-01: Svuotamento completo con azzeramento Sì', async ({ page }) => {
    const logs = [];

    // Cattura log console per verificare eventi
    page.on('console', msg => {
      if (msg.type() === 'log' || msg.type() === 'info' || msg.type() === 'warn' || msg.type() === 'error') {
        logs.push(msg.text());
      }
    });

    // === FASE 1: Inserimento monete per creare saldo ===
    await page.click('button[data-valore="1.00"]');
    await page.click('button[data-valore="0.20"]');

    // Verifica saldo cassetta aggiornato
    await expect(page.locator('#saldo-cassetta-valore')).toContainText('1,20€', { timeout: 2000 });

    // Attendi porta aperta e passaggio persona
    await expect(page.locator('#porta-status')).toContainText('Aperta', { timeout: 5000 });
    await page.locator('#btn-passaggio-persona').click();
    await expect(page.locator('#porta-status')).toContainText('Chiusa', { timeout: 3000 });
    await expect(page.locator('#display-message')).toContainText('Benvenuto', { timeout: 3000 });

    // Verifica saldo cassetta PERSISTE dopo passaggio (non resettato!)
    await expect(page.locator('#saldo-cassetta-valore')).toContainText('1,20€');

    // === FASE 2: Apertura cassetta → MANUTENZIONE_AUTH_PENDING ===
    await page.click('#btn-apri-cassetta-004');

    // Verifica display mostra autenticazione richiesta
    await expect(page.locator('#display-message')).toContainText('Cassetta aperta - Autenticazione richiesta', { timeout: 2000 });

    // Verifica countdown visibile e parte da 10s
    const countdownTimer = page.locator('#countdown-timer');
    await expect(countdownTimer).toBeVisible({ timeout: 1000 });
    await expect(countdownTimer).toContainText('10 secondi rimasti');

    // Attendi 1s per vedere countdown scendere
    await page.waitForTimeout(1100);
    await expect(countdownTimer).toContainText('9 secondi rimasti');

    // === FASE 3: Autenticazione operatore con carta 42 ===
    await page.fill('#input-carta', '42');
    await page.click('#btn-verifica-carta');

    // Verifica display mostra operatore autorizzato
    await expect(page.locator('#display-message')).toContainText('Operatore autorizzato (42)', { timeout: 2000 });
    await expect(page.locator('#display-message')).toContainText('Attesa chiusura cassetta');

    // Verifica pulsante "Chiudi Cassetta" ora abilitato (sempre abilitato in Feature 004)
    await expect(page.locator('#btn-chiudi-cassetta-004')).toBeEnabled();

    // === FASE 4: Chiusura cassetta → MANUTENZIONE_SCELTA_AZZERAMENTO ===
    await page.click('#btn-chiudi-cassetta-004');

    // Verifica pulsanti azzeramento visibili
    await page.waitForTimeout(500);
    const btnSi = page.locator('#btn-azzera-si');
    const btnNo = page.locator('#btn-azzera-no');

    await expect(btnSi).toBeVisible();
    await expect(btnSi).toBeEnabled();
    await expect(btnNo).toBeVisible();
    await expect(btnNo).toBeEnabled();

    // Verifica display mostra domanda azzeramento con saldo
    await expect(page.locator('#display-message')).toContainText('Azzerare saldo monete (1,20');

    // === FASE 5: Click Sì → Azzera saldo ===
    await btnSi.click();

    // Verifica pulsanti nascosti
    await expect(btnSi).toBeHidden();
    await expect(btnNo).toBeHidden();

    // Verifica display mostra conferma azzeramento
    await expect(page.locator('#display-message')).toContainText('Saldo azzerato: 1,20€', { timeout: 2000 });

    // Verifica saldo cassetta azzerato
    await expect(page.locator('#saldo-cassetta-valore')).toContainText('0,00€', { timeout: 1000 });

    // === FASE 6: Ritorno a IDLE dopo 3s ===
    await expect(page.locator('#display-message')).toContainText('Benvenuto', { timeout: 4000 });

    // Verifica stato IDLE ripristinato (pulsanti Feature 004 sempre abilitati)
    await expect(page.locator('#btn-apri-cassetta-004')).toBeEnabled();
    await expect(page.locator('#btn-chiudi-cassetta-004')).toBeEnabled();

    // === VERIFICA LOGGING ===
    await page.waitForTimeout(500);

    // Log eventi critici
    const logApertura = logs.find(l => l.includes('[Manutenzione] APERTURA'));
    const logAuthSuccess = logs.find(l => l.includes('[Manutenzione] AUTH_SUCCESS') && l.includes('42'));
    const logChiusura = logs.find(l => l.includes('[Manutenzione] CHIUSURA'));
    const logAzzeramento = logs.find(l => l.includes('[Manutenzione] AZZERAMENTO') && l.includes('azzerato'));

    expect(logApertura).toBeTruthy();
    expect(logAuthSuccess).toBeTruthy();
    expect(logChiusura).toBeTruthy();
    expect(logAzzeramento).toBeTruthy();

    console.log('✅ Test US1-01: Svuotamento con azzeramento Sì completato');
  });

  // ===== TEST 2: Svuotamento con azzeramento No =====

  test('US1-02: Svuotamento con azzeramento No (mantieni saldo)', async ({ page }) => {
    const logs = [];

    page.on('console', msg => {
      if (msg.type() === 'log' || msg.type() === 'info' || msg.type() === 'warn' || msg.type() === 'error') {
        logs.push(msg.text());
      }
    });

    // === FASE 1: Inserimento monete (saldo 2,00€) ===
    await page.click('button[data-valore="1.00"]');
    await page.click('button[data-valore="1.00"]');

    // Verifica saldo cassetta
    await expect(page.locator('#saldo-cassetta-valore')).toContainText('2,00€');

    await expect(page.locator('#porta-status')).toContainText('Aperta', { timeout: 5000 });
    await page.locator('#btn-passaggio-persona').click();
    await expect(page.locator('#display-message')).toContainText('Benvenuto', { timeout: 4000 });

    // Verifica saldo persiste
    await expect(page.locator('#saldo-cassetta-valore')).toContainText('2,00€');

    // === FASE 2-4: Apertura, autenticazione, chiusura ===
    await page.click('#btn-apri-cassetta-004');
    await expect(page.locator('#display-message')).toContainText('Cassetta aperta - Autenticazione richiesta');

    await page.fill('#input-carta', '50');
    await page.click('#btn-verifica-carta');
    await expect(page.locator('#display-message')).toContainText('Operatore autorizzato (50)');

    // Verifica pulsante "Chiudi Cassetta" abilitato (sempre abilitato in Feature 004)
    await expect(page.locator('#btn-chiudi-cassetta-004')).toBeEnabled();

    await page.click('#btn-chiudi-cassetta-004');

    // === FASE 5: Click No → Mantieni saldo ===
    const btnNo = page.locator('#btn-azzera-no');
    await expect(btnNo).toBeVisible();
    await btnNo.click();

    // Verifica display mostra saldo mantenuto
    await expect(page.locator('#display-message')).toContainText('Saldo mantenuto: 2,00€', { timeout: 2000 });

    // Verifica saldo cassetta NON azzerato
    await expect(page.locator('#saldo-cassetta-valore')).toContainText('2,00€');

    // === FASE 6: Ritorno a IDLE ===
    await expect(page.locator('#display-message')).toContainText('Benvenuto', { timeout: 4000 });

    // === VERIFICA LOGGING ===
    await page.waitForTimeout(500);

    // Ora il log è AZZERAMENTO con azzerato: false, NON NO_AZZERAMENTO
    const logAzzeramentoMantenuto = logs.find(l => l.includes('[Manutenzione] AZZERAMENTO') && l.includes('mantenuto'));
    expect(logAzzeramentoMantenuto).toBeTruthy();

    console.log('✅ Test US1-02: Svuotamento con azzeramento No completato');
  });

  // ===== TEST 3: Timeout 10s → FUORI_SERVIZIO =====

  test('US1-03: Timeout 10s senza autenticazione → FUORI_SERVIZIO + suoneria', async ({ page }) => {
    const logs = [];

    page.on('console', msg => {
      if (msg.type() === 'log' || msg.type() === 'info' || msg.type() === 'warn' || msg.type() === 'error') {
        logs.push(msg.text());
      }
    });

    // === FASE 1: Apertura cassetta ===
    await page.click('#btn-apri-cassetta-004');
    await expect(page.locator('#display-message')).toContainText('Cassetta aperta - Autenticazione richiesta');

    const countdownTimer = page.locator('#countdown-timer');
    await expect(countdownTimer).toBeVisible();
    await expect(countdownTimer).toContainText('10 secondi rimasti');

    // === FASE 2: Attendi 11s senza autenticare → timeout ===

    // Verifica countdown scende a 3s e aggiunge classe 'urgente'
    await page.waitForTimeout(7500); // Attendi 7.5s → countdown a ~2-3s
    await expect(countdownTimer).toHaveClass(/urgente/, { timeout: 3000 });

    // Attendi altri 4s → timeout completo (totale 11.5s)
    await page.waitForTimeout(4000);

    // === FASE 3: Verifica transizione a FUORI_SERVIZIO ===
    await expect(page.locator('#display-message')).toContainText('FUORI SERVIZIO', { timeout: 2000 });
    await expect(page.locator('#display-message')).toContainText('Attendere operatore');

    // Verifica classe errore sul display
    const display = page.locator('#display');
    await expect(display).toHaveClass(/errore/);

    // Verifica input utente disabilitati (pulsanti manutenzione sempre abilitati per Feature 004)
    await expect(page.locator('button[data-valore="1.00"]')).toBeDisabled();

    // === FASE 4: Verifica log TIMEOUT e FUORI_SERVIZIO ===
    await page.waitForTimeout(500);

    const logTimeout = logs.find(l => l.includes('[Manutenzione] TIMEOUT'));
    const logFuoriServizio = logs.find(l => l.includes('[Manutenzione] FUORI_SERVIZIO'));
    const logSuoneria = logs.find(l => l.includes('Sistema in FUORI SERVIZIO'));

    expect(logTimeout).toBeTruthy();
    expect(logFuoriServizio).toBeTruthy();
    expect(logSuoneria).toBeTruthy();

    // === FASE 5: Reset da FUORI_SERVIZIO con carta autorizzata ===
    await page.fill('#input-carta', '99');
    await page.click('#btn-verifica-carta');

    // Verifica display mostra reset
    await expect(page.locator('#display-message')).toContainText('Sistema ripristinato da operatore (99)', { timeout: 2000 });

    // Verifica ritorno a IDLE
    await expect(page.locator('#display-message')).toContainText('Benvenuto', { timeout: 4000 });
    await expect(page.locator('#btn-apri-cassetta-004')).toBeEnabled();

    // Verifica log RESET
    const logReset = logs.find(l => l.includes('[Manutenzione] RESET') && l.includes('99'));
    expect(logReset).toBeTruthy();

    console.log('✅ Test US1-03: Timeout 10s → FUORI_SERVIZIO completato');
  });

  // ===== TEST 4: Verifica countdown urgente (classe CSS) =====

  test('US1-04: Countdown aggiunge classe "urgente" quando ≤ 3s', async ({ page }) => {
    await page.click('#btn-apri-cassetta-004');

    const countdownTimer = page.locator('#countdown-timer');
    await expect(countdownTimer).toBeVisible();

    // Countdown inizia senza classe urgente
    await expect(countdownTimer).not.toHaveClass(/urgente/);

    // Attendi 7s → countdown a 3s
    await page.waitForTimeout(7500);

    // Verifica classe urgente aggiunta
    await expect(countdownTimer).toHaveClass(/urgente/, { timeout: 2000 });

    // Autentica per fermare countdown prima del timeout
    await page.fill('#input-carta', '42');
    await page.click('#btn-verifica-carta');

    console.log('✅ Test US1-04: Classe urgente countdown verificata');
  });

  // ===== TEST 5: Verifica AUTH_FAIL con codice non autorizzato =====

  test('US1-05: Autenticazione fallita con codice non autorizzato (123)', async ({ page }) => {
    const logs = [];

    page.on('console', msg => {
      if (msg.type() === 'log' || msg.type() === 'info' || msg.type() === 'warn' || msg.type() === 'error') {
        logs.push(msg.text());
      }
    });

    await page.click('#btn-apri-cassetta-004');
    await expect(page.locator('#display-message')).toContainText('Cassetta aperta - Autenticazione richiesta');

    const countdownTimer = page.locator('#countdown-timer');
    await expect(countdownTimer).toBeVisible();
    await expect(countdownTimer).toContainText('10 secondi rimasti');

    // Tentativo autenticazione con codice non autorizzato (> 99)
    await page.fill('#input-carta', '123');
    await page.click('#btn-verifica-carta');

    // Verifica display mostra accesso negato
    await expect(page.locator('#display-message')).toContainText('Accesso negato (123)', { timeout: 2000 });

    // Countdown deve continuare (non fermato)
    await page.waitForTimeout(2500); // Attendi 2.5s dopo errore
    await expect(countdownTimer).toBeVisible(); // Countdown ancora attivo

    console.log('✅ Test US1-05: AUTH_FAIL con codice non autorizzato verificato');
  });

  // ===== TEST 6: Regressione feature 001 - pagamento monete normale ===

  test('US1-06: Regressione - Pagamento monete funziona senza interferenze', async ({ page }) => {
    // Verifica feature 001 non influenzata da nuovi pulsanti admin

    // Saldo cassetta inizia a 0
    await expect(page.locator('#saldo-cassetta-valore')).toContainText('0,00€');

    // Test pagamento monete standard
    await page.click('button[data-valore="1.00"]');
    await page.click('button[data-valore="0.20"]');

    // Saldo cassetta aggiornato
    await expect(page.locator('#saldo-cassetta-valore')).toContainText('1,20€');

    // Porta apre normalmente
    await expect(page.locator('#porta-status')).toContainText('Aperta', { timeout: 5000 });

    // Display mostra successo
    await expect(page.locator('#display-message')).toContainText('Accesso consentito');

    // Pulsante passaggio persona visibile (feature 002)
    await expect(page.locator('#btn-passaggio-persona')).toBeVisible();

    // Pulsanti manutenzione sempre abilitati (Feature 004)

    console.log('✅ Test US1-06: Regressione feature 001 verificata');
  });
});
