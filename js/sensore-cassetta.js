/**
 * SensoreCassetta - Simula sensore hardware apertura/chiusura cassetta monete
 *
 * Funzionalità:
 * - Stato aperta/chiusa
 * - Eventi cassettaAperta/cassettaChiusa
 * - Pattern Observer per notifica listener
 */

class SensoreCassetta {
  constructor() {
    this.stato = 'chiusa'; // 'aperta' | 'chiusa'
    this.listeners = {
      cassettaAperta: [],
      cassettaChiusa: []
    };

    log.debug('SensoreCassetta: inizializzato, stato iniziale: chiusa');
  }

  /**
   * Apre la cassetta monete
   * - Cambia stato a 'aperta'
   * - Notifica tutti i listener registrati per evento 'cassettaAperta'
   * - Idempotente: se già aperta, logga warning e return
   */
  apri() {
    if (this.stato === 'aperta') {
      log.warn('SensoreCassetta: tentativo apertura cassetta già aperta');
      return;
    }

    this.stato = 'aperta';
    log.info('SensoreCassetta: cassetta aperta');
    this.notifica('cassettaAperta');
  }

  /**
   * Chiude la cassetta monete
   * - Cambia stato a 'chiusa'
   * - Notifica tutti i listener registrati per evento 'cassettaChiusa'
   * - Idempotente: se già chiusa, logga warning e return
   */
  chiudi() {
    if (this.stato === 'chiusa') {
      log.warn('SensoreCassetta: tentativo chiusura cassetta già chiusa');
      return;
    }

    this.stato = 'chiusa';
    log.info('SensoreCassetta: cassetta chiusa');
    this.notifica('cassettaChiusa');
  }

  /**
   * Registra un listener per un evento
   * @param {string} evento - 'cassettaAperta' | 'cassettaChiusa'
   * @param {Function} callback - Funzione da chiamare quando evento si verifica
   */
  on(evento, callback) {
    if (this.listeners[evento]) {
      this.listeners[evento].push(callback);
      log.debug(`SensoreCassetta: listener registrato per evento '${evento}'`);
    } else {
      log.error(`SensoreCassetta: evento '${evento}' non riconosciuto`);
    }
  }

  /**
   * Notifica tutti i listener registrati per un evento
   * @param {string} evento - Nome evento da notificare
   * @private
   */
  notifica(evento) {
    if (this.listeners[evento]) {
      this.listeners[evento].forEach(callback => {
        try {
          callback();
        } catch (error) {
          log.error(`SensoreCassetta: errore in listener per evento '${evento}':`, error);
        }
      });
    }
  }

  /**
   * Ritorna stato corrente della cassetta
   * @returns {string} 'aperta' | 'chiusa'
   */
  getStato() {
    return this.stato;
  }
}

// Esporre globalmente per debug
if (typeof window !== 'undefined') {
  window.SensoreCassetta = SensoreCassetta;
}
