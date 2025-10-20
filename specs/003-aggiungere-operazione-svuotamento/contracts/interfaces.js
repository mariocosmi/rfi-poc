/**
 * Interfacce JavaScript per Feature 003 - Svuotamento Cassetta Monete
 *
 * Questo file definisce i contratti di interfaccia tra componenti.
 * NON è codice eseguibile - è documentazione TypeScript-style per sviluppo.
 *
 * Riferimenti:
 * - data-model.md: Schema entità completo
 * - research.md: Decisioni implementazione
 */

// ==============================================================================
// INTERFACCE NUOVI COMPONENTI
// ==============================================================================

/**
 * @interface ISensoreCassetta
 * @description Simula sensore hardware apertura/chiusura cassetta monete
 */
class ISensoreCassetta {
  /**
   * @type {string} 'aperta' | 'chiusa'
   */
  stato;

  /**
   * @type {Object.<string, Function[]>}
   */
  listeners;

  /**
   * Apre la cassetta e notifica listener
   * @returns {void}
   */
  apri() {}

  /**
   * Chiude la cassetta e notifica listener
   * @returns {void}
   */
  chiudi() {}

  /**
   * Registra listener per evento
   * @param {string} evento - 'cassettaAperta' | 'cassettaChiusa'
   * @param {Function} callback - Handler evento
   * @returns {void}
   */
  on(evento, callback) {}

  /**
   * Ritorna stato corrente
   * @returns {string} 'aperta' | 'chiusa'
   */
  getStato() {}
}

// ------------------------------------------------------------------------------

/**
 * @interface ISuoneria
 * @description Gestisce allarme sonoro per stato FUORI_SERVIZIO
 */
class ISuoneria {
  /**
   * @type {AudioContext}
   */
  audioContext;

  /**
   * @type {OscillatorNode|null}
   */
  oscillator;

  /**
   * @type {GainNode|null}
   */
  gainNode;

  /**
   * @type {boolean}
   */
  attiva;

  /**
   * Attiva suoneria continua (800Hz, volume 30%)
   * @returns {void}
   */
  attiva() {}

  /**
   * Disattiva suoneria e rilascia risorse
   * @returns {void}
   */
  disattiva() {}

  /**
   * Verifica se suoneria è attiva
   * @returns {boolean}
   */
  isAttiva() {}
}

// ------------------------------------------------------------------------------

/**
 * @interface IGestoreManutenzione
 * @description Coordina operazioni manutenzione cassetta
 */
class IGestoreManutenzione {
  /**
   * @type {Chiosco}
   */
  chiosco;

  /**
   * @type {number|null} setInterval ID
   */
  timerCountdown;

  /**
   * @type {number} 0-10
   */
  secondiRimanenti;

  /**
   * @type {OperazioneSvuotamento|null}
   */
  operazioneCorrente;

  /**
   * Avvia countdown 10 secondi
   * @param {Function} callback - Chiamato al timeout (0 secondi)
   * @returns {void}
   */
  avviaCountdown(callback) {}

  /**
   * Ferma countdown e pulisce timer
   * @returns {void}
   */
  fermaCountdown() {}

  /**
   * Aggiorna display con secondi rimanenti
   * @returns {void}
   */
  aggiornaDisplay() {}

  /**
   * Inizia nuova operazione svuotamento
   * @returns {OperazioneSvuotamento}
   */
  iniziaOperazione() {}

  /**
   * Completa operazione e logga risultato
   * @param {boolean} azzerato - Saldo è stato azzerato
   * @param {number} saldoPrima - Saldo prima azzeramento
   * @param {number} saldoDopo - Saldo dopo azzeramento
   * @returns {void}
   */
  completaOperazione(azzerato, saldoPrima, saldoDopo) {}
}

// ------------------------------------------------------------------------------

/**
 * @interface IOperazioneSvuotamento
 * @description Entità di processo per tracciamento operazione svuotamento
 */
class IOperazioneSvuotamento {
  /**
   * @type {string|null} ISO 8601 timestamp
   */
  timestampApertura;

  /**
   * @type {string|null} ISO 8601 timestamp
   */
  timestampAutenticazione;

  /**
   * @type {string|null} Codice numerico (1-99)
   */
  codiceOperatore;

  /**
   * @type {string|null} ISO 8601 timestamp
   */
  timestampChiusura;

  /**
   * @type {number|null} Saldo >= 0
   */
  saldoPrima;

  /**
   * @type {number|null} Saldo >= 0
   */
  saldoDopo;

  /**
   * @type {boolean|null}
   */
  azzerato;

  /**
   * Logga evento manutenzione su console
   * @param {string} tipo - 'APERTURA' | 'AUTH_SUCCESS' | 'AUTH_FAIL' | 'TIMEOUT' | 'CHIUSURA' | 'AZZERAMENTO' | 'FUORI_SERVIZIO' | 'RESET'
   * @param {Object} dettagli - Dati aggiuntivi evento
   * @returns {void}
   */
  logEvento(tipo, dettagli) {}
}

// ==============================================================================
// MODIFICHE INTERFACCE ESISTENTI
// ==============================================================================

/**
 * @interface IChiosco (MODIFICHE)
 * @description Aggiunte a FSM esistente
 */
class IChiosco_Modifiche {
  /**
   * @type {GestoreManutenzione} NUOVO
   */
  gestoreManutenzione;

  /**
   * @type {SensoreCassetta} NUOVO
   */
  sensoreCassetta;

  /**
   * @type {Suoneria} NUOVO
   */
  suoneria;

  /**
   * Handler ingresso stato MANUTENZIONE_AUTH_PENDING
   * @returns {void}
   * NUOVO
   */
  onEntraManutenzioneAuthPending() {}

  /**
   * Handler ingresso stato MANUTENZIONE_ATTESA_CHIUSURA
   * @returns {void}
   * NUOVO
   */
  onEntraManutenzioneAttesaChiusura() {}

  /**
   * Handler ingresso stato MANUTENZIONE_SCELTA_AZZERAMENTO
   * @returns {void}
   * NUOVO
   */
  onEntraManutenzioneSceltaAzzeramento() {}

  /**
   * Handler ingresso stato FUORI_SERVIZIO
   * @returns {void}
   * NUOVO
   */
  onEntraFuoriServizio() {}

  /**
   * Handler uscita da stato FUORI_SERVIZIO
   * @returns {void}
   * NUOVO
   */
  onEsceFuoriServizio() {}

  /**
   * Gestisce reset manuale da FUORI_SERVIZIO
   * @param {string} codiceOperatore - Codice carta autorizzata
   * @returns {void}
   * NUOVO
   */
  resetDaFuoriServizio(codiceOperatore) {}
}

// ------------------------------------------------------------------------------

/**
 * @interface IGettoniera (MODIFICHE)
 * @description Aggiunte a Gettoniera esistente
 */
class IGettoniera_Modifiche {
  /**
   * Valida saldo corrente (previene NaN/negativo)
   * @returns {number} Saldo validato >= 0
   * NUOVO
   */
  validaSaldo() {}

  /**
   * Azzera saldo gettoniera a 0.00€
   * @returns {number} Saldo precedente prima azzeramento
   * NUOVO
   */
  azzeraSaldo() {}
}

// ------------------------------------------------------------------------------

/**
 * @interface IDisplay (MODIFICHE)
 * @description Aggiunte a Display esistente
 */
class IDisplay_Modifiche {
  /**
   * Mostra stato FUORI_SERVIZIO con stile rosso/allarme
   * @returns {void}
   * NUOVO
   */
  mostraFuoriServizio() {}

  /**
   * Aggiorna countdown visivo (numero grande + colore)
   * @param {number} secondi - Secondi rimanenti (0-10)
   * @returns {void}
   * NUOVO
   */
  aggiornaCountdown(secondi) {}

  /**
   * Mostra pulsanti "Sì"/"No" per azzeramento saldo
   * @param {number} saldo - Saldo corrente da mostrare
   * @returns {void}
   * NUOVO
   */
  mostraPulsantiAzzeramento(saldo) {}

  /**
   * Nasconde pulsanti azzeramento dopo scelta
   * @returns {void}
   * NUOVO
   */
  nascondiPulsantiAzzeramento() {}
}

// ==============================================================================
// EVENTI
// ==============================================================================

/**
 * @typedef {Object} EventiSensoreCassetta
 * @property {Function} cassettaAperta - Emesso quando cassetta aperta
 * @property {Function} cassettaChiusa - Emesso quando cassetta chiusa
 */

/**
 * @typedef {Object} EventiUI
 * @property {Function} btnApriCassettaClick - Click pulsante "Apri Cassetta"
 * @property {Function} btnChiudiCassettaClick - Click pulsante "Chiudi Cassetta"
 * @property {Function} btnAzzeraSiClick - Click pulsante "Sì" azzeramento
 * @property {Function} btnAzzeraNoClick - Click pulsante "No" azzeramento
 */

// ==============================================================================
// STATI FSM
// ==============================================================================

/**
 * @typedef {string} StatoFSM
 * @enum
 * - 'IDLE'
 * - 'PAGAMENTO_MONETE'
 * - 'PAGAMENTO_CARTA'
 * - 'VERIFICA_QR'
 * - 'VERIFICA_CARTA'
 * - 'PORTA_APERTA'
 * - 'TIMEOUT'
 * - 'MANUTENZIONE_AUTH_PENDING' [NUOVO]
 * - 'MANUTENZIONE_ATTESA_CHIUSURA' [NUOVO]
 * - 'MANUTENZIONE_SCELTA_AZZERAMENTO' [NUOVO]
 * - 'FUORI_SERVIZIO' [NUOVO]
 */

/**
 * @typedef {Object} TransizioniFSM
 * @description Transizioni permesse da ogni stato
 */
const TRANSIZIONI_MANUTENZIONE = {
  'MANUTENZIONE_AUTH_PENDING': [
    'MANUTENZIONE_ATTESA_CHIUSURA', // Auth valida
    'FUORI_SERVIZIO',               // Timeout 10s
    'IDLE'                          // Annullamento operatore
  ],
  'MANUTENZIONE_ATTESA_CHIUSURA': [
    'MANUTENZIONE_SCELTA_AZZERAMENTO', // Cassetta chiusa
    'FUORI_SERVIZIO'                   // Errore critico
  ],
  'MANUTENZIONE_SCELTA_AZZERAMENTO': [
    'IDLE' // Sempre ritorna a IDLE dopo scelta
  ],
  'FUORI_SERVIZIO': [
    'IDLE' // Solo tramite reset autorizzato
  ]
};

// ==============================================================================
// VALIDAZIONI
// ==============================================================================

/**
 * @typedef {Object} ValidazioniManutenzione
 */
const VALIDAZIONI = {
  /**
   * Codice autorizzato valido (riusa Validatore.isCodiceAutorizzato)
   * @param {string} codice
   * @returns {boolean}
   */
  isCodiceAutorizzato: (codice) => {
    const num = parseInt(codice, 10);
    return num >= 1 && num <= 99;
  },

  /**
   * Saldo gettoniera valido
   * @param {number} saldo
   * @returns {boolean}
   */
  isSaldoValido: (saldo) => {
    return !isNaN(saldo) && saldo >= 0;
  },

  /**
   * Timestamp ISO 8601 valido
   * @param {string} timestamp
   * @returns {boolean}
   */
  isTimestampValido: (timestamp) => {
    return !isNaN(Date.parse(timestamp));
  },

  /**
   * Stato cassetta valido
   * @param {string} stato
   * @returns {boolean}
   */
  isStatoCassettaValido: (stato) => {
    return stato === 'aperta' || stato === 'chiusa';
  }
};

// ==============================================================================
// COSTANTI
// ==============================================================================

/**
 * @typedef {Object} CostantiManutenzione
 */
const COSTANTI = {
  /** Timeout autenticazione in millisecondi */
  TIMEOUT_AUTENTICAZIONE_MS: 10000,

  /** Timeout autenticazione in secondi (per countdown) */
  TIMEOUT_AUTENTICAZIONE_SEC: 10,

  /** Frequenza beep suoneria in Hz */
  SUONERIA_FREQUENZA: 800,

  /** Volume suoneria (0-1) */
  SUONERIA_VOLUME: 0.3,

  /** Forma d'onda suoneria */
  SUONERIA_WAVEFORM: 'sine',

  /** Durata messaggio "Operazione completata" in ms */
  DURATA_MESSAGGIO_COMPLETAMENTO: 3000,

  /** Durata messaggio "Accesso negato" in ms */
  DURATA_MESSAGGIO_NEGATO: 2000,

  /** Soglia countdown urgente (secondi) */
  COUNTDOWN_URGENTE_THRESHOLD: 3
};

// ==============================================================================
// ESEMPIO UTILIZZO (DOCUMENTAZIONE)
// ==============================================================================

/**
 * Esempio flusso completo operazione svuotamento:
 *
 * 1. Operatore clicca "Apri Cassetta" → SensoreCassetta.apri()
 * 2. SensoreCassetta emette evento 'cassettaAperta'
 * 3. Chiosco riceve evento → transizione('MANUTENZIONE_AUTH_PENDING')
 * 4. onEntraManutenzioneAuthPending():
 *    - GestoreManutenzione.avviaCountdown(() => transizione('FUORI_SERVIZIO'))
 *    - Display.mostraMessaggio('Cassetta aperta - Autenticazione richiesta')
 * 5. Operatore avvicina carta → LettoreCarteContactless legge codice
 * 6. Chiosco verifica Validatore.isCodiceAutorizzato(codice)
 * 7. Se valido:
 *    - GestoreManutenzione.fermaCountdown()
 *    - OperazioneSvuotamento.logEvento('AUTH_SUCCESS', { codice })
 *    - transizione('MANUTENZIONE_ATTESA_CHIUSURA')
 * 8. Operatore clicca "Chiudi Cassetta" → SensoreCassetta.chiudi()
 * 9. SensoreCassetta emette evento 'cassettaChiusa'
 * 10. Chiosco riceve evento → transizione('MANUTENZIONE_SCELTA_AZZERAMENTO')
 * 11. onEntraManutenzioneSceltaAzzeramento():
 *     - saldo = Gettoniera.validaSaldo()
 *     - Display.mostraPulsantiAzzeramento(saldo)
 * 12. Operatore clicca "Sì" o "No"
 * 13. Se "Sì": Gettoniera.azzeraSaldo()
 * 14. OperazioneSvuotamento.logEvento('AZZERAMENTO', { azzerato, saldoPrima, saldoDopo })
 * 15. Display.mostraMessaggio('Operazione completata')
 * 16. setTimeout(() => transizione('IDLE'), 3000)
 *
 * Flusso timeout:
 * 1-4. Come sopra
 * 5. Countdown raggiunge 0 secondi
 * 6. GestoreManutenzione chiama callback timeout
 * 7. transizione('FUORI_SERVIZIO')
 * 8. onEntraFuoriServizio():
 *    - Suoneria.attiva()
 *    - Display.mostraFuoriServizio()
 *    - OperazioneSvuotamento.logEvento('FUORI_SERVIZIO')
 * 9. Sistema rimane in FUORI_SERVIZIO fino a reset autorizzato
 * 10. Operatore avvicina carta autorizzata
 * 11. Chiosco.resetDaFuoriServizio(codice)
 * 12. onEsceFuoriServizio():
 *     - Suoneria.disattiva()
 *     - OperazioneSvuotamento.logEvento('RESET', { codice })
 * 13. transizione('IDLE')
 */

// ==============================================================================
// NOTE IMPLEMENTAZIONE
// ==============================================================================

/**
 * IMPORTANTE:
 * - Questo file NON è eseguibile - è solo documentazione
 * - Le interfacce definite qui devono essere implementate in:
 *   - js/sensore-cassetta.js (SensoreCassetta)
 *   - js/suoneria.js (Suoneria)
 *   - js/gestore-manutenzione.js (GestoreManutenzione + OperazioneSvuotamento)
 *   - js/chiosco.js (modifiche Chiosco)
 *   - js/gettoniera.js (modifiche Gettoniera)
 *   - js/display.js (modifiche Display)
 *
 * - Rispettare Constitution Principles:
 *   - I. Lingua Italiana (commenti, log, UI)
 *   - II. Static-First (no backend)
 *   - III. JavaScript Vanilla (no framework)
 *   - IV. Build-Free (no transpiling)
 *   - V. Osservabilità (logging completo)
 *
 * - Testing:
 *   - Unit test: Mock interfacce per testare componenti isolati
 *   - Integration test: Verificare flussi end-to-end
 *   - Acceptance test: Scenari spec.md
 */
