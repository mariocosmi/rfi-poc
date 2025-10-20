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

      log.info('✅ Componenti creati e collegati');

      // ===== EVENT HANDLERS =====

      // Event handler pulsanti monete
      const pulsantiMonete = document.querySelectorAll('.btn-moneta');
      pulsantiMonete.forEach(btn => {
        btn.addEventListener('click', function() {
          const valore = parseFloat(this.getAttribute('data-valore'));

          log.debug(`🖱️ Click pulsante moneta: ${valore}€`);

          // Aggiungi animazione click
          this.classList.add('clicked');
          setTimeout(() => this.classList.remove('clicked'), 200);

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

      // Event handler "Verifica Carta" (logica contestuale come QR)
      const btnVerificaCarta = document.getElementById('btn-verifica-carta');
      const inputCarta = document.getElementById('input-carta');

      if (btnVerificaCarta && inputCarta) {
        const verificaCarta = () => {
          const codice = inputCarta.value.trim();

          if (!codice) {
            log.warn('⚠️ Codice carta vuoto');
            display.mostraMessaggio('Inserisci un codice carta', 'warning');
            return;
          }

          log.debug(`🖱️ Verifica carta: "${codice}"`);

          // Aggiungi animazione click
          btnVerificaCarta.classList.add('clicked');
          setTimeout(() => btnVerificaCarta.classList.remove('clicked'), 200);

          // Chiama verificaCarta che gestisce logica contestuale
          chiosco.verificaCarta(codice);

          // Pulisci input
          inputCarta.value = '';
        };

        btnVerificaCarta.addEventListener('click', verificaCarta);

        // Enter key su input carta
        inputCarta.addEventListener('keypress', function(e) {
          if (e.key === 'Enter') {
            verificaCarta();
          }
        });
      }

      // Event handler "Scansiona QR"
      const btnScansioneQR = document.getElementById('btn-scansiona-qr');
      const inputQR = document.getElementById('input-qr');

      if (btnScansioneQR && inputQR) {
        const scansioneQR = () => {
          const codice = inputQR.value.trim();

          if (!codice) {
            log.warn('⚠️ Codice QR vuoto');
            display.mostraMessaggio('Inserisci un codice QR', 'warning');
            return;
          }

          log.debug(`🖱️ Scansione QR: "${codice}"`);

          // Aggiungi animazione click
          btnScansioneQR.classList.add('clicked');
          setTimeout(() => btnScansioneQR.classList.remove('clicked'), 200);

          // Transizione a VERIFICA_QR
          chiosco.transizione('VERIFICA_QR', { codice });

          // Pulisci input
          inputQR.value = '';
        };

        btnScansioneQR.addEventListener('click', scansioneQR);

        // Enter key su input QR
        inputQR.addEventListener('keypress', function(e) {
          if (e.key === 'Enter') {
            scansioneQR();
          }
        });
      }

      // FEATURE 002: Event handler "Persona passata"
      const btnPassaggioPersona = document.getElementById('btn-passaggio-persona');
      if (btnPassaggioPersona) {
        btnPassaggioPersona.addEventListener('click', function() {
          log.debug('🖱️ Click "Persona passata"');

          // Aggiungi animazione click
          this.classList.add('clicked');
          setTimeout(() => this.classList.remove('clicked'), 200);

          // Chiama handler chiosco
          chiosco.onPassaggioPersona();
        });
      }

      // FEATURE 003: Event handler "Apri Cassetta" (T030)
      const btnApriCassetta = document.getElementById('btn-apri-cassetta');
      if (btnApriCassetta) {
        btnApriCassetta.addEventListener('click', function() {
          log.debug('🖱️ Click "Apri Cassetta"');

          // Aggiungi animazione click
          this.classList.add('clicked');
          setTimeout(() => this.classList.remove('clicked'), 200);

          // Simula apertura fisica cassetta → trigger evento sensoreCassetta
          chiosco.sensoreCassetta.apri();
        });
      }

      // FEATURE 003: Event handler "Chiudi Cassetta" (T030)
      const btnChiudiCassetta = document.getElementById('btn-chiudi-cassetta');
      if (btnChiudiCassetta) {
        btnChiudiCassetta.addEventListener('click', function() {
          log.debug('🖱️ Click "Chiudi Cassetta"');

          // Aggiungi animazione click
          this.classList.add('clicked');
          setTimeout(() => this.classList.remove('clicked'), 200);

          // Simula chiusura fisica cassetta → trigger evento sensoreCassetta
          chiosco.sensoreCassetta.chiudi();
        });
      }

      // FEATURE 003: Event handler "Azzera Saldo - Sì" (T030)
      const btnAzzeraSi = document.getElementById('btn-azzera-si');
      if (btnAzzeraSi) {
        btnAzzeraSi.addEventListener('click', function() {
          log.debug('🖱️ Click "Azzera Saldo - Sì"');

          // Aggiungi animazione click
          this.classList.add('clicked');
          setTimeout(() => this.classList.remove('clicked'), 200);

          // Chiama handler chiosco per azzeramento
          chiosco.confermaAzzeramento(true);
        });
      }

      // FEATURE 003: Event handler "Azzera Saldo - No" (T030)
      const btnAzzeraNo = document.getElementById('btn-azzera-no');
      if (btnAzzeraNo) {
        btnAzzeraNo.addEventListener('click', function() {
          log.debug('🖱️ Click "Azzera Saldo - No"');

          // Aggiungi animazione click
          this.classList.add('clicked');
          setTimeout(() => this.classList.remove('clicked'), 200);

          // Chiama handler chiosco per rifiuto azzeramento
          chiosco.confermaAzzeramento(false);
        });
      }

      // Esponi istanze globalmente per debugging
      window.app = {
        chiosco,
        display,
        porta,
        gettoniera,
        lettoreCarte,
        lettoreQR,
        gestoreTimeout
      };

      log.info('✅ Event handlers collegati');
      log.info('🎉 Applicazione pronta!');
      log.info('💡 Debug: accedi a window.app per ispezionare componenti');

    } catch (error) {
      log.error('❌ Errore inizializzazione applicazione:', error);
    }
  }
})();
