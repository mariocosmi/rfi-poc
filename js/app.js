/**
 * App - Inizializzazione applicazione
 * Crea istanze componenti e collega event handlers
 */

(function() {
  'use strict';

  log.info('🚀 Inizializzazione applicazione...');

  // Verifica che il DOM sia caricato
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  function init() {
    log.info('📦 DOM caricato, creazione componenti...');

    try {
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

      // Mostra messaggio iniziale
      display.mostraMessaggioIniziale();

      // Inizializza display saldo cassetta
      gettoniera.aggiornaSaldoCassetta();

      log.info('✅ Componenti creati e collegati');

      // ===== EVENT HANDLERS =====

      // Event handler pulsanti monete
      const pulsantiMonete = document.querySelectorAll('.btn-moneta');
      pulsantiMonete.forEach(btn => {
        btn.addEventListener('click', function() {
          const valore = parseFloat(this.getAttribute('data-valore'));
          aggiungiAnimazioneClick(this, `Moneta ${valore}€`);

          // Se siamo in IDLE, passa a PAGAMENTO_MONETE
          if (chiosco.stato === 'IDLE') {
            chiosco.transizione('PAGAMENTO_MONETE');
          }

          // Se siamo in PAGAMENTO_MONETE, inserisci moneta
          if (chiosco.stato === 'PAGAMENTO_MONETE') {
            const successo = gettoniera.inserisciMoneta(valore);

            if (successo) {
              // Resetta timeout (nuovo inserimento)
              gestoreTimeout.reset();
              gestoreTimeout.avvia();

              // Aggiorna display con importo rimanente
              const rimanente = gettoniera.getImportoRimanente();
              display.mostraMessaggio('Inserisci monete', 'info');
              display.mostraImporto(rimanente);

              // Verifica se pagamento completato
              chiosco.verificaPagamento();
            }
          }
        });
      });

      // Event handler "Paga con Carta" (pagamento VISA)
      registraClickHandler('btn-paga-carta', function() {
        if (chiosco.stato === 'IDLE') {
          chiosco.transizione('PAGAMENTO_CARTA');
        } else {
          log.warn('⚠️ Pagamento carta richiesto ma stato non è IDLE');
        }
      }, 'Paga con Carta');

      // Event handler "Verifica Carta" (logica contestuale)
      const inputCarta = document.getElementById('input-carta');
      if (inputCarta) {
        const verificaCarta = () => {
          const codice = inputCarta.value.trim();

          if (!codice) {
            log.warn('⚠️ Codice carta vuoto');
            display.mostraMessaggio('Inserisci un codice carta', 'warning');
            return;
          }

          log.debug(`🖱️ Verifica carta: "${codice}"`);

          const btnVerificaCarta = document.getElementById('btn-verifica-carta');
          if (btnVerificaCarta) {
            aggiungiAnimazioneClick(btnVerificaCarta);
          }

          // Chiama verificaCarta che gestisce logica contestuale
          chiosco.verificaCarta(codice);

          // Pulisci input
          inputCarta.value = '';
        };

        registraClickHandler('btn-verifica-carta', verificaCarta, null, false);

        // Enter key su input carta
        inputCarta.addEventListener('keypress', function(e) {
          if (e.key === 'Enter') {
            verificaCarta();
          }
        });
      }

      // Event handler "Scansiona QR"
      const inputQR = document.getElementById('input-qr');
      if (inputQR) {
        const scansioneQR = () => {
          const codice = inputQR.value.trim();

          if (!codice) {
            log.warn('⚠️ Codice QR vuoto');
            display.mostraMessaggio('Inserisci un codice QR', 'warning');
            return;
          }

          log.debug(`🖱️ Scansione QR: "${codice}"`);

          const btnScansioneQR = document.getElementById('btn-scansiona-qr');
          if (btnScansioneQR) {
            aggiungiAnimazioneClick(btnScansioneQR);
          }

          // Transizione a VERIFICA_QR
          chiosco.transizione('VERIFICA_QR', { codice });

          // Pulisci input
          inputQR.value = '';
        };

        registraClickHandler('btn-scansiona-qr', scansioneQR, null, false);

        // Enter key su input QR
        inputQR.addEventListener('keypress', function(e) {
          if (e.key === 'Enter') {
            scansioneQR();
          }
        });
      }

      // FEATURE 002: Event handler "Persona passata"
      registraClickHandler('btn-passaggio-persona', function() {
        chiosco.onPassaggioPersona();
      }, 'Persona passata');

      // FEATURE 003: Event handler "Apri Cassetta"
      registraClickHandler('btn-apri-cassetta', function() {
        // Simula apertura fisica cassetta → trigger evento sensoreCassetta (Feature 004 API)
        chiosco.sensoreCassetta.notificaApertura();
      }, 'Apri Cassetta');

      // FEATURE 003: Event handler "Chiudi Cassetta"
      registraClickHandler('btn-chiudi-cassetta', function() {
        // Simula chiusura fisica cassetta → trigger evento sensoreCassetta (Feature 004 API)
        chiosco.sensoreCassetta.notificaChiusura();
      }, 'Chiudi Cassetta');

      // FEATURE 003: Event handler "Azzera Saldo - Sì"
      registraClickHandler('btn-azzera-si', function() {
        // Chiama handler chiosco per azzeramento
        chiosco.confermaAzzeramento(true);
      }, 'Azzera Saldo - Sì');

      // FEATURE 003: Event handler "Azzera Saldo - No"
      registraClickHandler('btn-azzera-no', function() {
        // Chiama handler chiosco per rifiuto azzeramento
        chiosco.confermaAzzeramento(false);
      }, 'Azzera Saldo - No');

      // Feature 004 (T011): Inizializza GestoreUICassetta usando sensoreCassetta del chiosco
      const gestoreUICassetta = new GestoreUICassetta(
        chiosco.sensoreCassetta,
        document.querySelector('.manutenzione-panel')
      );

      log.info('✅ Feature 004: GestoreUICassetta inizializzato');

      // Esponi istanze globalmente per debugging
      window.app = {
        chiosco,
        display,
        porta,
        gettoniera,
        lettoreCarte,
        lettoreQR,
        gestoreTimeout,
        sensoreCassetta: chiosco.sensoreCassetta,  // Feature 004 - usa istanza del chiosco
        gestoreUICassetta                           // Feature 004
      };

      log.info('✅ Event handlers collegati');
      log.info('🎉 Applicazione pronta!');
      log.info('💡 Debug: accedi a window.app per ispezionare componenti');

    } catch (error) {
      log.error('❌ Errore inizializzazione applicazione:', error);
    }
  }
})();
