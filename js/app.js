/**
 * App - Inizializzazione applicazione
 * Crea istanze componenti e collega event handlers
 */

(function () {
  'use strict';

  log.info('🚀 Inizializzazione applicazione...');

  // Verifica che il DOM sia caricato
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  function init() {
    log.info('📦 DOM caricato, inizializzazione...');

    try {
      // 1. Crea e collega componenti
      const app = createAppComponents();

      // 2. Registra event listeners (usando Display per il binding)
      registerEventListeners(app);

      // 3. Avvio
      app.display.mostraMessaggioIniziale();
      app.gettoniera.aggiornaSaldoCassetta();

      // Esponi globalmente
      window.app = app;

      log.info('✅ Event handlers collegati');
      log.info('🎉 Applicazione pronta!');
      log.info('💡 Debug: accedi a window.app per ispezionare componenti');

    } catch (error) {
      log.error('❌ Errore inizializzazione applicazione:', error);
    }
  }

  /**
   * Crea istanze componenti e gestisce le dipendenze
   * @returns {Object} Oggetto contenente tutti i componenti
   */
  function createAppComponents() {
    // Crea istanze componenti
    const display = new Display();
    const porta = new Porta();
    const gettoniera = new Gettoniera(1.20);
    const lettoreCarte = new LettoreCarte();
    const lettoreQR = new LettoreQR();

    // Crea chiosco (FSM principale)
    const chiosco = new Chiosco();
    const gestoreTimeout = new GestoreTimeout(chiosco, 20);

    // Collega componenti al chiosco
    chiosco.display = display;
    chiosco.porta = porta;
    chiosco.gettoniera = gettoniera;
    chiosco.lettoreCarte = lettoreCarte;
    chiosco.lettoreQR = lettoreQR;
    chiosco.gestoreTimeout = gestoreTimeout;

    // Collega chiosco ai componenti che ne hanno bisogno
    lettoreCarte.chiosco = chiosco;
    lettoreQR.chiosco = chiosco;

    // Feature 004: GestoreUICassetta
    const gestoreUICassetta = new GestoreUICassetta(
      chiosco.sensoreCassetta,
      document.querySelector('#pannello-admin')
    );

    log.info('✅ Componenti creati e collegati');

    return {
      chiosco,
      display,
      porta,
      gettoniera,
      lettoreCarte,
      lettoreQR,
      gestoreTimeout,
      sensoreCassetta: chiosco.sensoreCassetta,
      gestoreUICassetta
    };
  }

  /**
   * Registra tutti gli event listeners usando i metodi di binding del Display
   * @param {Object} app - Oggetto componenti
   */
  function registerEventListeners(app) {
    const { chiosco, gettoniera, gestoreTimeout, display } = app;

    // 1. Pulsanti Monete
    display.bindCoinButtons((valore) => {
      // Se siamo in IDLE, passa a PAGAMENTO_MONETE
      if (chiosco.stato === 'IDLE') {
        chiosco.transizione('PAGAMENTO_MONETE');
      }

      // Se siamo in PAGAMENTO_MONETE, inserisci moneta
      if (chiosco.stato === 'PAGAMENTO_MONETE') {
        const successo = gettoniera.inserisciMoneta(valore);

        if (successo) {
          // Resetta timeout
          gestoreTimeout.reset();
          gestoreTimeout.avvia();

          // Aggiorna display
          const rimanente = gettoniera.getImportoRimanente();
          display.mostraMessaggio('Inserisci monete', 'info');
          display.mostraImporto(rimanente);

          // Verifica completamento
          chiosco.verificaPagamento();
        }
      }
    });

    // 2. Pagamento Carta (VISA)
    display.bindCardButton(() => {
      if (chiosco.stato === 'IDLE') {
        chiosco.transizione('PAGAMENTO_CARTA');
      } else {
        log.warn('⚠️ Pagamento carta richiesto ma stato non è IDLE');
      }
    });

    // 3. Verifica Carta (Input + Bottone)
    display.bindCardInput((codice) => {
      log.debug(`🖱️ Verifica carta: "${codice}"`);
      chiosco.verificaCarta(codice);
    });

    // 4. Scansione QR (Input + Bottone)
    display.bindQRInput((codice) => {
      log.debug(`🖱️ Scansione QR: "${codice}"`);
      chiosco.transizione('VERIFICA_QR', { codice });
    });

    // 5. Passaggio Persona
    display.bindPassaggioPersona(() => {
      chiosco.onPassaggioPersona();
    });

    // 6. Azzeramento Saldo (Sì/No)
    display.bindAzzeramentoButtons(
      () => chiosco.confermaAzzeramento(true),  // Sì
      () => chiosco.confermaAzzeramento(false)  // No
    );
  }
})();
