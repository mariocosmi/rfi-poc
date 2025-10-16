/**
 * LettoreQR - Simulazione scanner QR code
 * Verifica codici QR autorizzati (1-99)
 */

class LettoreQR {
  constructor() {
    this.chiosco = null; // Sarà impostato da app.js
    this.codiceScansionato = null;
    this.statoVerifica = null; // 'ATTESA' | 'VERIFICA' | 'AUTORIZZATO' | 'NEGATO' | 'ERRORE'

    log.info('📱 LettoreQR inizializzato');
  }

  /**
   * Scansiona codice QR
   * @param {string} codice - Codice QR scansionato
   * @returns {boolean} true se verifica avviata
   */
  scansionaCodice(codice) {
    if (!codice || typeof codice !== 'string') {
      log.warn('⚠️ Codice QR vuoto o non valido');
      return false;
    }

    this.codiceScansionato = codice.trim();
    this.statoVerifica = 'VERIFICA';

    log.debug(`📱 Scansione QR: "${this.codiceScansionato}"`);

    return true;
  }

  /**
   * Verifica codice QR autorizzato
   * @param {string} codice - Codice da verificare
   * @returns {boolean} true se autorizzato
   */
  verificaCodice(codice) {
    try {
      const autorizzato = Validatore.isCodiceAutorizzato(codice);

      if (autorizzato) {
        this.statoVerifica = 'AUTORIZZATO';
        log.info(`✅ QR code ${codice}: AUTORIZZATO`);
      } else {
        this.statoVerifica = 'NEGATO';
        log.warn(`⚠️ QR code ${codice}: NON AUTORIZZATO`);
      }

      return autorizzato;

    } catch (error) {
      this.statoVerifica = 'ERRORE';
      log.error(`❌ Errore verifica QR code ${codice}:`, error);
      return false;
    }
  }

  /**
   * Reset lettore
   */
  reset() {
    this.codiceScansionato = null;
    this.statoVerifica = null;
    log.debug('📱 Lettore QR resettato');
  }

  /**
   * Ottieni stato verifica
   * @returns {string|null} Stato corrente
   */
  getStatoVerifica() {
    return this.statoVerifica;
  }
}

// Export globale
window.LettoreQR = LettoreQR;

log.info('✅ LettoreQR caricato');
