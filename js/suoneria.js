/**
 * Suoneria - Gestisce allarme sonoro per stato FUORI_SERVIZIO
 *
 * Utilizza Web Audio API per generare beep sintetizzato (800Hz, 30% volume)
 * Override test: window.suoneriaEnabled = false disabilita completamente
 */

class Suoneria {
  constructor() {
    // Crea AudioContext (gestisce autoplay policy)
    this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    this.oscillator = null;
    this.gainNode = null;
    this.attiva = false;

    // Resume AudioContext dopo primo user interaction (autoplay policy)
    this._setupAutoplayFix();

    log.debug('Suoneria: inizializzata (Web Audio API)');
  }

  /**
   * Gestisce autoplay policy browser
   * Resume AudioContext su primo click utente
   * @private
   */
  _setupAutoplayFix() {
    if (this.audioContext.state === 'suspended') {
      const resumeAudio = () => {
        this.audioContext.resume().then(() => {
          log.debug('Suoneria: AudioContext resumed dopo user interaction');
        });
        document.removeEventListener('click', resumeAudio);
      };
      document.addEventListener('click', resumeAudio, { once: true });
    }
  }

  /**
   * Attiva suoneria continua
   * - Beep 800Hz, volume 30%, loop continuo
   * - Idempotente: se già attiva, return
   * - Override test: rispetta window.suoneriaEnabled = false
   */
  attiva() {
    // Override per testing silenziosi
    if (typeof window.suoneriaEnabled !== 'undefined' && !window.suoneriaEnabled) {
      log.warn('Suoneria: disabilitata da window.suoneriaEnabled = false (test mode)');
      return;
    }

    if (this.attiva) {
      log.debug('Suoneria: già attiva, skip attivazione');
      return;
    }

    try {
      // Crea oscillatore (genera tono)
      this.oscillator = this.audioContext.createOscillator();
      this.oscillator.type = 'sine'; // Onda sinusoidale pura
      this.oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime); // 800 Hz

      // Crea gain node (controllo volume)
      this.gainNode = this.audioContext.createGain();
      this.gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime); // Volume 30%

      // Collega: oscillator → gainNode → destination (speakers)
      this.oscillator.connect(this.gainNode);
      this.gainNode.connect(this.audioContext.destination);

      // Avvia oscillatore (loop continuo)
      this.oscillator.start();

      this.attiva = true;
      log.info('Suoneria: attivata (800Hz, volume 30%)');
    } catch (error) {
      log.error('Suoneria: errore attivazione:', error);
    }
  }

  /**
   * Disattiva suoneria
   * - Ferma oscillatore e rilascia risorse
   * - Idempotente: se già disattiva, return
   */
  disattiva() {
    if (!this.attiva) {
      log.debug('Suoneria: già disattiva, skip disattivazione');
      return;
    }

    try {
      if (this.oscillator) {
        this.oscillator.stop();
        this.oscillator.disconnect();
        this.oscillator = null;
      }

      if (this.gainNode) {
        this.gainNode.disconnect();
        this.gainNode = null;
      }

      this.attiva = false;
      log.info('Suoneria: disattivata');
    } catch (error) {
      log.error('Suoneria: errore disattivazione:', error);
    }
  }

  /**
   * Verifica se suoneria è attualmente attiva
   * @returns {boolean}
   */
  isAttiva() {
    return this.attiva;
  }
}

// Esporre globalmente per debug
if (typeof window !== 'undefined') {
  window.Suoneria = Suoneria;
}
