/**
 * Display - Gestione display chiosco
 * Mostra messaggi, importi, countdown
 */

class Display {
  constructor() {
    this.elementoDisplay = document.getElementById('display');
    this.elementoMessaggio = document.getElementById('display-message');
    this.elementoImporto = document.getElementById('display-amount');
    this.elementoCountdown = document.getElementById('display-countdown');

    if (!this.elementoDisplay) {
      log.error('❌ Elemento display non trovato nel DOM');
      return;
    }

    log.info('📺 Display inizializzato');
  }

  /**
   * Mostra messaggio iniziale
   */
  mostraMessaggioIniziale() {
    this.mostraMessaggio('Benvenuto - Scegli modalità di accesso', 'info');
    this.nascondiImporto();
    this.nascondiCountdown();
    this.rimuoviClassiStato();
  }

  /**
   * Mostra un messaggio sul display
   * @param {string} messaggio - Il messaggio da mostrare
   * @param {string} tipo - Tipo messaggio: 'info', 'successo', 'errore', 'warning'
   */
  mostraMessaggio(messaggio, tipo = 'info') {
    if (!this.elementoMessaggio) return;

    this.elementoMessaggio.textContent = messaggio;
    this.rimuoviClassiStato();

    // Applica classe per tipo
    switch (tipo) {
      case 'successo':
        this.elementoDisplay.classList.add('successo', 'pulse-success');
        setTimeout(() => {
          this.elementoDisplay.classList.remove('pulse-success');
        }, 1500);
        break;

      case 'errore':
        this.elementoDisplay.classList.add('errore', 'pulse-error');
        setTimeout(() => {
          this.elementoDisplay.classList.remove('pulse-error');
        }, 1500);
        break;

      case 'warning':
        this.elementoDisplay.classList.add('pulse-warning');
        setTimeout(() => {
          this.elementoDisplay.classList.remove('pulse-warning');
        }, 1500);
        break;

      default:
        // Info - nessuna classe speciale
        break;
    }

    log.debug(`📺 Display aggiornato: "${messaggio}" (${tipo})`);
  }

  /**
   * Mostra importo rimanente
   * @param {number} importo - Importo in euro
   */
  mostraImporto(importo) {
    if (!this.elementoImporto) return;

    const importoFormattato = importo.toFixed(2).replace('.', ',');
    this.elementoImporto.textContent = `Rimanente: ${importoFormattato} €`;
    this.elementoImporto.classList.remove('hidden');

    log.debug(`📺 Display importo: ${importoFormattato} €`);
  }

  /**
   * Nascondi importo
   */
  nascondiImporto() {
    if (this.elementoImporto) {
      this.elementoImporto.classList.add('hidden');
    }
  }

  /**
   * Aggiorna countdown timeout
   * @param {number} secondi - Secondi rimanenti
   */
  aggiornaCountdown(secondi) {
    if (!this.elementoCountdown) return;

    if (secondi > 0) {
      this.elementoCountdown.textContent = `⏱️ Timeout: ${secondi}s`;
      this.elementoCountdown.classList.remove('hidden');
    } else {
      this.nascondiCountdown();
    }
  }

  /**
   * Nascondi countdown
   */
  nascondiCountdown() {
    if (this.elementoCountdown) {
      this.elementoCountdown.classList.add('hidden');
    }
  }

  /**
   * Rimuovi tutte le classi di stato
   */
  rimuoviClassiStato() {
    if (this.elementoDisplay) {
      this.elementoDisplay.classList.remove('successo', 'errore', 'pulse-success', 'pulse-error', 'pulse-warning');
    }
  }

  /**
   * Mostra messaggio + importo
   * @param {string} messaggio - Messaggio
   * @param {number} importo - Importo rimanente
   */
  mostraMessaggioConImporto(messaggio, importo) {
    this.mostraMessaggio(messaggio, 'info');
    this.mostraImporto(importo);
  }
}

// Export globale
window.Display = Display;

log.info('✅ Display caricato');
