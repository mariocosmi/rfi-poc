/**
 * GestoreManutenzione - Coordina operazioni manutenzione cassetta
 *
 * Funzionalità:
 * - Countdown 10s autenticazione
 * - Tracking operazione svuotamento corrente
 * - Logging eventi manutenzione
 */

class GestoreManutenzione {
  constructor(chiosco) {
    this.chiosco = chiosco;
    this.operazioneCorrente = null;
    this.countdown = null;

    log.debug('GestoreManutenzione: inizializzato');
  }

  /**
   * Avvia countdown 10 secondi
   * @param {Function} callback - Chiamato quando countdown raggiunge 0 (timeout)
   *
   * Refactored per usare CountdownTimer (TD-005)
   */
  avviaCountdown(callback) {
    // Ferma countdown precedente se presente
    if (this.countdown) {
      this.fermaCountdown();
    }

    log.debug('GestoreManutenzione: countdown avviato (10s)');

    // Crea nuovo CountdownTimer
    this.countdown = new CountdownTimer(
      10,
      // onTick: aggiorna display e log warnings
      (secondi) => {
        if (this.chiosco?.display) {
          this.chiosco.display.aggiornaCountdownManutenzione(secondi);
        }

        log.debug(`GestoreManutenzione: countdown ${secondi}s rimasti`);

        if (secondi <= 3 && secondi > 0) {
          log.warn(`GestoreManutenzione: countdown urgente - ${secondi}s rimasti`);
        }
      },
      // onComplete: chiama callback timeout
      () => {
        log.error('GestoreManutenzione: timeout countdown (0s) - chiamata callback');
        callback();
      }
    );

    this.countdown.avvia();
  }

  /**
   * Ferma countdown e pulisce timer
   */
  fermaCountdown() {
    if (this.countdown) {
      this.countdown.ferma();
      this.countdown = null;

      // Nascondi countdown dal DOM quando fermato
      if (this.chiosco?.display) {
        this.chiosco.display.aggiornaCountdownManutenzione(0);
      }

      log.debug('GestoreManutenzione: countdown fermato e nascosto');
    }
  }

  /**
   * Inizia nuova operazione svuotamento
   * @returns {OperazioneSvuotamento}
   */
  iniziaOperazione() {
    this.operazioneCorrente = new OperazioneSvuotamento();
    this.operazioneCorrente.logEvento('APERTURA');
    return this.operazioneCorrente;
  }

  /**
   * Completa operazione svuotamento
   * @param {boolean} azzerato - Saldo è stato azzerato
   * @param {number} saldoPrima - Saldo prima azzeramento
   * @param {number} saldoDopo - Saldo dopo azzeramento
   */
  completaOperazione(azzerato, saldoPrima, saldoDopo) {
    if (this.operazioneCorrente) {
      this.operazioneCorrente.logEvento('AZZERAMENTO', { azzerato, saldoPrima, saldoDopo });
    }
  }
}

/**
 * OperazioneSvuotamento - Entità di processo per tracciamento operazione
 *
 * Traccia:
 * - Timestamp apertura/autenticazione/chiusura
 * - Codice operatore
 * - Saldo prima/dopo
 * - Scelta azzeramento
 */
class OperazioneSvuotamento {
  constructor() {
    this.timestampApertura = null;
    this.timestampAutenticazione = null;
    this.codiceOperatore = null;
    this.timestampChiusura = null;
    this.saldoPrima = null;
    this.saldoDopo = null;
    this.azzerato = null;
  }

  /**
   * Logga evento manutenzione con timestamp
   * @param {string} tipo - APERTURA | AUTH_SUCCESS | AUTH_FAIL | TIMEOUT | CHIUSURA | AZZERAMENTO | FUORI_SERVIZIO | RESET
   * @param {Object} dettagli - Dati aggiuntivi evento
   */
  logEvento(tipo, dettagli = {}) {
    const timestamp = new Date().toISOString();

    switch(tipo) {
      case 'APERTURA':
        this.timestampApertura = timestamp;
        log.info(`[Manutenzione] APERTURA - Cassetta aperta`, { timestamp });
        break;

      case 'AUTH_SUCCESS':
        this.timestampAutenticazione = timestamp;
        this.codiceOperatore = dettagli.codice;
        log.info(`[Manutenzione] AUTH_SUCCESS - Operatore autenticato: ${dettagli.codice}`, { timestamp });
        break;

      case 'AUTH_FAIL':
        log.warn(`[Manutenzione] AUTH_FAIL - Accesso negato: ${dettagli.codice}`, { timestamp });
        break;

      case 'TIMEOUT':
        log.error(`[Manutenzione] TIMEOUT - Timeout autenticazione`, { timestamp });
        break;

      case 'CHIUSURA':
        this.timestampChiusura = timestamp;
        log.info(`[Manutenzione] CHIUSURA - Cassetta chiusa`, { timestamp });
        break;

      case 'AZZERAMENTO':
        this.saldoPrima = dettagli.saldoPrima;
        this.saldoDopo = dettagli.saldoDopo;
        this.azzerato = dettagli.azzerato;
        const azione = dettagli.azzerato ? 'azzerato' : 'mantenuto';
        log.info(`[Manutenzione] AZZERAMENTO - Saldo ${azione}: ${dettagli.saldoPrima.toFixed(2)}€ → ${dettagli.saldoDopo.toFixed(2)}€`, { timestamp });
        break;

      case 'FUORI_SERVIZIO':
        log.error(`[Manutenzione] FUORI_SERVIZIO - Sistema in FUORI SERVIZIO - Suoneria attivata`, { timestamp });
        break;

      case 'RESET':
        log.info(`[Manutenzione] RESET - Reset sistema da operatore: ${dettagli.codice}`, { timestamp });
        break;

      default:
        log.warn(`[Manutenzione] Evento sconosciuto: ${tipo}`, { timestamp, dettagli });
    }
  }
}

// Esporre globalmente per debug
if (typeof window !== 'undefined') {
  window.GestoreManutenzione = GestoreManutenzione;
  window.OperazioneSvuotamento = OperazioneSvuotamento;
}
