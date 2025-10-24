/**
 * SensoreCassetta - Gestione stato cassetta e notifiche eventi
 * Feature 004: Visualizzazione Stato Cassetta e Controlli Manutenzione
 *
 * Questo componente mantiene lo stato corrente della cassetta (APERTA/CHIUSA)
 * e implementa il pattern Observer per notificare i listener quando lo stato cambia.
 * Eventi di apertura/chiusura sono idempotenti (FR-008, FR-009).
 */

class SensoreCassetta {
  /**
   * Costruttore - Inizializza sensore con stato default CHIUSA
   * T003: Constructor, stato, listeners Map
   */
  constructor() {
    // Stato corrente: 'CHIUSA' (default) o 'APERTA'
    this.stato = 'CHIUSA';

    // Map per gestire eventi e listener: { nomeEvento: [callback1, callback2, ...] }
    this.listeners = new Map();

    log.debug('[SensoreCassetta] Inizializzato (stato: CHIUSA)');
  }

  /**
   * T004: Registra un listener per un evento specifico
   * @param {string} evento - Nome evento (es. 'cambioStato')
   * @param {Function} callback - Funzione da chiamare quando evento emesso
   * @throws {TypeError} se callback non è una funzione
   */
  on(evento, callback) {
    if (typeof callback !== 'function') {
      throw new TypeError('Callback deve essere una funzione');
    }

    if (!this.listeners.has(evento)) {
      this.listeners.set(evento, []);
    }

    this.listeners.get(evento).push(callback);
    log.debug(`[SensoreCassetta] Listener registrato per evento '${evento}'`);
  }

  /**
   * T004: Rimuove un listener precedentemente registrato (opzionale)
   * @param {string} evento - Nome evento
   * @param {Function} callback - Funzione da rimuovere
   */
  off(evento, callback) {
    if (!this.listeners.has(evento)) {
      return;
    }

    const callbacks = this.listeners.get(evento);
    const index = callbacks.indexOf(callback);

    if (index !== -1) {
      callbacks.splice(index, 1);
      log.debug(`[SensoreCassetta] Listener rimosso per evento '${evento}'`);
    }

    // Cleanup: rimuovi evento se array vuoto
    if (callbacks.length === 0) {
      this.listeners.delete(evento);
    }
  }

  /**
   * T004: Restituisce lo stato corrente della cassetta
   * @returns {string} 'APERTA' o 'CHIUSA'
   */
  getStato() {
    return this.stato;
  }

  /**
   * T004: Emette un evento notificando tutti i listener registrati (metodo privato)
   * @param {string} evento - Nome evento da emettere
   * @param {object} dati - Payload da passare ai listener
   */
  emit(evento, dati) {
    if (!this.listeners.has(evento)) {
      return;
    }

    const callbacks = this.listeners.get(evento);

    for (const callback of callbacks) {
      try {
        callback(dati);
      } catch (errore) {
        log.error(`[SensoreCassetta] Errore in listener '${evento}':`, errore);
      }
    }
  }

  /**
   * T005: Simula evento di apertura fisica della cassetta
   * Aggiorna stato a APERTA e notifica listener.
   * Idempotente: può essere chiamato anche se già aperta (FR-008)
   */
  notificaApertura() {
    const timestamp = new Date().toISOString();
    const statoPrec = this.stato;

    // Gestione idempotenza: log DEBUG se già aperta, INFO se cambio effettivo
    if (statoPrec === 'APERTA') {
      log.debug(`[${timestamp}] [SensoreCassetta] Evento apertura idempotente (già APERTA)`);
    } else {
      log.info(`[${timestamp}] [SensoreCassetta] Cassetta aperta: ${statoPrec} → APERTA`);
    }

    // Aggiorna stato
    this.stato = 'APERTA';

    // Emetti evento cambioStato
    this.emit('cambioStato', {
      timestamp,
      statoPrec,
      statoNuovo: 'APERTA'
    });
  }

  /**
   * T006: Simula evento di chiusura fisica della cassetta
   * Aggiorna stato a CHIUSA e notifica listener.
   * Idempotente: può essere chiamato anche se già chiusa (FR-009)
   */
  notificaChiusura() {
    const timestamp = new Date().toISOString();
    const statoPrec = this.stato;

    // Gestione idempotenza: log DEBUG se già chiusa, INFO se cambio effettivo
    if (statoPrec === 'CHIUSA') {
      log.debug(`[${timestamp}] [SensoreCassetta] Evento chiusura idempotente (già CHIUSA)`);
    } else {
      log.info(`[${timestamp}] [SensoreCassetta] Cassetta chiusa: ${statoPrec} → CHIUSA`);
    }

    // Aggiorna stato
    this.stato = 'CHIUSA';

    // Emetti evento cambioStato
    this.emit('cambioStato', {
      timestamp,
      statoPrec,
      statoNuovo: 'CHIUSA'
    });
  }
}
