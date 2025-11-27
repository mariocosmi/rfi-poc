/**
 * LettoreCarte - Simulazione lettore carte contactless
 * Gestisce pagamenti VISA e verifica carte autorizzate
 *
 * Modalità:
 * - PAGAMENTO: Transazione pagamento 1,20€ con carta VISA
 * - AUTORIZZAZIONE: Verifica codice carta autorizzata (1-99)
 */

class LettoreCarte {
  constructor() {
    this.chiosco = null; // Sarà impostato da app.js
    this.modalita = null; // 'PAGAMENTO' | 'AUTORIZZAZIONE'
    this.statoTransazione = null; // 'ATTESA' | 'ELABORAZIONE' | 'ACCETTATA' | 'RIFIUTATA'

    // Riferimenti DOM
    this.areaCartaPagamento = document.getElementById('carta-area');
    this.inputCartaAutorizzazione = document.getElementById('carta-input');
    this.inputCodice = document.getElementById('input-carta');
    this.btnVerifica = document.getElementById('btn-verifica-carta-submit');

    log.info('💳 LettoreCarte inizializzato');
  }

  /**
   * Mostra area per pagamento carta
   */
  mostraAreaPagamento() {
    if (!this.areaCartaPagamento) return;

    this.modalita = 'PAGAMENTO';
    this.areaCartaPagamento.classList.remove('hidden');
    // inputCartaAutorizzazione rimane sempre visibile (come QR)

    // Event handler per simulazione avvicinamento carta
    const handler = (e) => {
      e.stopPropagation();
      this.areaCartaPagamento.removeEventListener('click', handler);
      this.processaPagamentoCarta();
    };

    this.areaCartaPagamento.addEventListener('click', handler);

    log.debug('💳 Area pagamento carta mostrata');
  }

  /**
   * Abilita input per codice carta autorizzata
   * Nota: campo sempre visibile, gestito da abilitaInput() come QR
   */
  mostraInputCodice() {
    // Campo input carta è sempre visibile (come QR)
    // Solo nasconde area pagamento se attiva
    if (this.areaCartaPagamento) {
      this.areaCartaPagamento.classList.add('hidden');
    }

    this.modalita = 'AUTORIZZAZIONE';

    // Event handler verifica codice
    const handler = () => {
      const codice = this.inputCodice.value.trim();
      this.verificaCartaAutorizzata(codice);
      this.inputCodice.value = '';
    };

    this.btnVerifica.addEventListener('click', handler, { once: true });

    // Enter key
    const keyHandler = (e) => {
      if (e.key === 'Enter') {
        handler();
        this.inputCodice.removeEventListener('keypress', keyHandler);
      }
    };

    this.inputCodice.addEventListener('keypress', keyHandler);

    log.debug('💳 Input codice carta mostrato');
  }

  /**
   * Processa pagamento con carta VISA
   */
  processaPagamentoCarta() {
    if (!this.chiosco) return;

    log.info('💳 Elaborazione pagamento carta...');

    this.statoTransazione = 'ELABORAZIONE';
    this.chiosco.display.mostraMessaggio('Elaborazione...', 'info');

    // Aggiungi spinner
    const spinner = document.createElement('div');
    spinner.className = 'spinner';
    spinner.id = 'spinner-carta';
    this.chiosco.display.elementoDisplay.appendChild(spinner);

    // Simula elaborazione (1.5s) + successo randomizzato 80%
    setTimeout(() => {
      // Rimuovi spinner
      const spinnerEl = document.getElementById('spinner-carta');
      if (spinnerEl) spinnerEl.remove();

      const successo = Math.random() < 0.8;

      if (successo) {
        log.info('✅ Transazione carta: ACCETTATA');
        this.statoTransazione = 'ACCETTATA';
        this.chiosco.display.mostraMessaggio('Pagamento accettato', 'successo');
        setTimeout(() => {
          this.chiosco.transizione('PORTA_APERTA', { motivo: 'carta' });
        }, TIMEOUTS.MESSAGGIO_SUCCESSO);
      } else {
        log.warn('⚠️ Transazione carta: RIFIUTATA');
        this.statoTransazione = 'RIFIUTATA';
        this.chiosco.display.mostraMessaggio('Pagamento rifiutato - Riprova', 'errore');
        setTimeout(() => {
          this.chiosco.transizione('IDLE');
        }, TIMEOUTS.MESSAGGIO_ERRORE);
      }

      // Nascondi area
      this.areaCartaPagamento.classList.add('hidden');
      this.modalita = null;
    }, TIMEOUTS.ELABORAZIONE_PAGAMENTO_CARTA);
  }

  /**
   * Verifica carta autorizzata tramite codice
   * @param {string} codice - Codice carta
   */
  verificaCartaAutorizzata(codice) {
    if (!this.chiosco || !codice) return;

    log.debug(`💳 Verifica carta autorizzata: "${codice}"`);

    // Usa helper DRY centralizzato
    this.chiosco.verificaAccessoConCodice(codice, 'Carta contactless');

    // Input carta rimane sempre visibile (gestito da abilitaInput)
    this.modalita = null;
  }

  /**
   * Reset lettore
   */
  reset() {
    this.modalita = null;
    this.statoTransazione = null;

    // Nascondi solo area pagamento (input carta sempre visibile)
    if (this.areaCartaPagamento) {
      this.areaCartaPagamento.classList.add('hidden');
    }

    log.debug('💳 Lettore carte resettato');
  }
}

// Export globale
window.LettoreCarte = LettoreCarte;

log.info('✅ LettoreCarte caricato');
