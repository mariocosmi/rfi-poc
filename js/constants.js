/**
 * constants.js - Costanti globali del progetto
 *
 * Centralizza magic numbers e magic strings per:
 * - Facile configurazione
 * - Manutenibilità
 * - Autocomplete IDE
 * - Testing semplificato
 */

/**
 * Stati della FSM (Finite State Machine)
 * Usati in chiosco.js e stati.js
 */
const STATI = Object.freeze({
  IDLE: 'IDLE',
  PAGAMENTO_MONETE: 'PAGAMENTO_MONETE',
  PAGAMENTO_CARTA: 'PAGAMENTO_CARTA',
  VERIFICA_QR: 'VERIFICA_QR',
  VERIFICA_CARTA: 'VERIFICA_CARTA',
  PORTA_APERTA: 'PORTA_APERTA',
  TIMEOUT: 'TIMEOUT',
  MANUTENZIONE_AUTH_PENDING: 'MANUTENZIONE_AUTH_PENDING',
  MANUTENZIONE_ATTESA_CHIUSURA: 'MANUTENZIONE_ATTESA_CHIUSURA',
  MANUTENZIONE_SCELTA_AZZERAMENTO: 'MANUTENZIONE_SCELTA_AZZERAMENTO',
  FUORI_SERVIZIO: 'FUORI_SERVIZIO'
});

/**
 * Timeout e durate (in millisecondi)
 * Centralizza tutti i magic numbers temporali
 */
const TIMEOUTS = Object.freeze({
  // Animazioni UI
  ANIMAZIONE_CLICK: 200,                    // Feedback visivo click pulsante
  ANIMAZIONE_PORTA: 1500,                   // Durata animazione apertura/chiusura porta

  // Operazioni sistema
  VERIFICA_ACCESSO: 500,                    // Simulazione verifica QR/carta
  ELABORAZIONE_CARTA: 2000,                 // Simulazione elaborazione pagamento carta
  ELABORAZIONE_PAGAMENTO_CARTA: 1500,       // Durata elaborazione pagamento carta (spinner + validazione)

  // Messaggi temporanei
  MESSAGGIO_SUCCESSO: 1000,                 // Durata messaggio "Accesso autorizzato" prima apertura porta
  MESSAGGIO_ERRORE: 2000,                   // Durata messaggio errore prima ritorno IDLE

  // Transizioni stato
  TRANSIZIONE_IDLE: 3000,                   // Pausa prima ritorno a IDLE (dopo conferma azzeramento, reset fuori servizio)
  RITORNO_IDLE_POST_TIMEOUT: 2000,          // Pausa dopo timeout inattività prima ritorno IDLE

  // Timeout inattività
  TIMEOUT_INATTIVITA: 20000,                // 20s - Timeout durante pagamento monete (millisecondi)
  TIMEOUT_INATTIVITA_SECONDI: 20,           // 20s - Timeout durante pagamento monete (secondi, per GestoreTimeout)
  COUNTDOWN_MANUTENZIONE: 10000,            // 10s - Timeout autenticazione operatore

  // Porta
  CHIUSURA_PORTA_AUTO: 15000,               // 15s - Chiusura automatica porta dopo apertura
  RITORNO_IDLE_POST_CHIUSURA: 1500          // Pausa dopo chiusura porta prima ritorno IDLE (attende animazione)
});

// Export globale
window.STATI = STATI;
window.TIMEOUTS = TIMEOUTS;

log.info('✅ Constants caricato');
