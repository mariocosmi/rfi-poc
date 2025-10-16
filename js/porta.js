/**
 * Porta - Simulazione porta controllata
 * Gestisce apertura/chiusura con animazioni CSS
 */

class Porta {
  constructor() {
    this.elementoPorta = document.getElementById('porta');
    this.elementoStatus = document.getElementById('porta-status');
    this.stato = 'chiusa'; // 'aperta' | 'chiusa'
    this.timerChiusura = null;

    // NUOVI ATTRIBUTI FEATURE 002
    this.timestampApertura = null;  // Timestamp Unix (ms) apertura porta
    this.motivoApertura = null;     // 'monete' | 'carta' | 'qr' | 'carta-autorizzata'
    this.timerChiusuraAutomatica = null;  // Timer 15s chiusura automatica

    if (!this.elementoPorta) {
      log.error('❌ Elemento porta non trovato nel DOM');
      return;
    }

    log.info('🚪 Porta inizializzata - Stato: CHIUSA');
  }

  /**
   * Apri porta
   * @param {string} motivo - Motivo apertura: 'monete', 'carta', 'qr', 'carta-autorizzata'
   */
  apri(motivo = 'pagamento') {
    if (this.stato === 'aperta') {
      log.debug('🚪 Porta già aperta');
      return;
    }

    log.info(`🚪 Apertura porta - Motivo: ${motivo}`);

    this.stato = 'aperta';

    // FEATURE 002: Salva timestamp e motivo apertura
    this.timestampApertura = Date.now();
    this.motivoApertura = motivo;

    // Aggiungi classe CSS per animazione
    this.elementoPorta.classList.remove('chiusa');
    this.elementoPorta.classList.add('aperta');

    // Aggiorna status
    if (this.elementoStatus) {
      this.elementoStatus.textContent = '🔓 Aperta';
      this.elementoStatus.classList.remove('chiusa');
      this.elementoStatus.classList.add('aperta');
    }

    log.debug('🚪 Animazione apertura avviata');
  }

  /**
   * Chiudi porta
   */
  chiudi() {
    if (this.stato === 'chiusa') {
      log.debug('🚪 Porta già chiusa');
      return;
    }

    log.info('🚪 Chiusura porta...');

    this.stato = 'chiusa';

    // FEATURE 002: Reset timestamp e motivo
    this.timestampApertura = null;
    this.motivoApertura = null;
    this.timerChiusuraAutomatica = null;

    // Rimuovi classe CSS
    this.elementoPorta.classList.remove('aperta');
    this.elementoPorta.classList.add('chiusa');

    // Aggiorna status
    if (this.elementoStatus) {
      this.elementoStatus.textContent = '🔒 Chiusa';
      this.elementoStatus.classList.remove('aperta');
      this.elementoStatus.classList.add('chiusa');
    }

    log.debug('🚪 Animazione chiusura avviata');
  }

  /**
   * Programma chiusura automatica
   * @param {number} secondi - Secondi dopo cui chiudere (default 15)
   */
  programmaChiusura(secondi = 15) {
    // Cancella timer precedente se esiste
    if (this.timerChiusura) {
      clearTimeout(this.timerChiusura);
    }

    log.debug(`🚪 Timer chiusura impostato: ${secondi} secondi`);

    this.timerChiusura = setTimeout(() => {
      this.chiudi();
      this.timerChiusura = null;
    }, secondi * 1000);
  }

  /**
   * Cancella timer chiusura automatica
   */
  cancellaTimerChiusura() {
    if (this.timerChiusura) {
      clearTimeout(this.timerChiusura);
      this.timerChiusura = null;
      log.debug('🚪 Timer chiusura cancellato');
    }
  }

  /**
   * Ottieni stato corrente
   * @returns {string} 'aperta' | 'chiusa'
   */
  getStato() {
    return this.stato;
  }

  /**
   * Verifica se porta è aperta
   * @returns {boolean}
   */
  isAperta() {
    return this.stato === 'aperta';
  }

  /**
   * Verifica se porta è chiusa
   * @returns {boolean}
   */
  isChiusa() {
    return this.stato === 'chiusa';
  }

  /**
   * FEATURE 002: Calcola tempo apertura in secondi
   * @returns {number} Secondi trascorsi dall'apertura (0 se porta chiusa)
   */
  getTempoAperturaSeconds() {
    if (!this.timestampApertura || this.stato === 'chiusa') {
      return 0;
    }
    return Math.floor((Date.now() - this.timestampApertura) / 1000);
  }

  /**
   * FEATURE 002: Chiusura manuale su passaggio persona
   * Cancella timer automatico, logga evento, chiude porta
   */
  chiudiManuale() {
    if (this.stato !== 'aperta') {
      log.warn('⚠️ Tentativo chiusura manuale con porta non aperta');
      return;
    }

    const tempoApertura = this.getTempoAperturaSeconds();
    const motivo = this.motivoApertura || 'sconosciuto';

    log.info(`🚶 Passaggio persona rilevato - Porta aperta da ${tempoApertura}s - Metodo: ${motivo}`);

    // Cancella timer chiusura automatica se attivo
    if (this.timerChiusuraAutomatica) {
      clearTimeout(this.timerChiusuraAutomatica);
      this.timerChiusuraAutomatica = null;
      log.debug('⏱️ Timer chiusura automatica cancellato');
    }

    // Chiudi porta
    this.chiudi();
  }
}

// Export globale
window.Porta = Porta;

log.info('✅ Porta caricata');
