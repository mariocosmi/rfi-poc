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
    mostraElemento(this.elementoImporto);

    log.debug(`📺 Display importo: ${importoFormattato} €`);
  }

  /**
   * Nascondi importo
   */
  nascondiImporto() {
    nascondiElemento(this.elementoImporto);
  }

  /**
   * Aggiorna countdown timeout
   * @param {number} secondi - Secondi rimanenti
   */
  aggiornaCountdown(secondi) {
    if (!this.elementoCountdown) return;

    if (secondi > 0) {
      this.elementoCountdown.textContent = `⏱️ Timeout: ${secondi}s`;
      mostraElemento(this.elementoCountdown);
    } else {
      this.nascondiCountdown();
    }
  }

  /**
   * Nascondi countdown
   */
  nascondiCountdown() {
    nascondiElemento(this.elementoCountdown);
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
   * Aggiorna countdown manutenzione (T019)
   * @param {number} secondi - Secondi rimanenti per autenticazione
   */
  aggiornaCountdownManutenzione(secondi) {
    const elementoTimer = document.getElementById('countdown-timer');
    if (!elementoTimer) {
      log.warn('Display: elemento #countdown-timer non trovato');
      return;
    }

    if (secondi > 0) {
      elementoTimer.textContent = `${secondi} secondi rimasti`;
      mostraElemento(elementoTimer);

      // Aggiungi classe 'urgente' se <= 3 secondi (stile rosso)
      if (secondi <= 3) {
        elementoTimer.classList.add('urgente');
      } else {
        elementoTimer.classList.remove('urgente');
      }

      log.debug(`Display: countdown manutenzione aggiornato a ${secondi}s`);
    } else {
      nascondiElemento(elementoTimer);
      elementoTimer.classList.remove('urgente');
    }
  }

  /**
   * Mostra pulsanti azzeramento saldo (T020)
   * @param {number} saldo - Saldo monete corrente in euro
   */
  mostraPulsantiAzzeramento(saldo) {
    const container = document.getElementById('pulsanti-azzeramento');
    const btnSi = document.getElementById('btn-azzera-si');
    const btnNo = document.getElementById('btn-azzera-no');

    if (!container || !btnSi || !btnNo) {
      log.error('Display: elementi pulsanti azzeramento non trovati nel DOM');
      return;
    }

    const saldoFormattato = saldo.toFixed(2).replace('.', ',');
    this.mostraMessaggio(`Azzerare saldo monete (${saldoFormattato} €)?`, 'warning');

    btnSi.disabled = false;
    btnNo.disabled = false;
    mostraElemento(container);

    log.info(`Display: pulsanti azzeramento mostrati (saldo: ${saldoFormattato} €)`);
  }

  /**
   * Nascondi pulsanti azzeramento (T021)
   */
  nascondiPulsantiAzzeramento() {
    const container = document.getElementById('pulsanti-azzeramento');
    const btnSi = document.getElementById('btn-azzera-si');
    const btnNo = document.getElementById('btn-azzera-no');

    if (!container || !btnSi || !btnNo) return;

    btnSi.disabled = true;
    btnNo.disabled = true;
    nascondiElemento(container);

    log.debug('Display: pulsanti azzeramento nascosti');
  }

  /**
   * Mostra schermata fuori servizio (T020)
   */
  mostraFuoriServizio() {
    this.mostraMessaggio('FUORI SERVIZIO - Attendere operatore', 'errore');
    this.nascondiImporto();
    this.nascondiCountdown();
    this.rimuoviClassiStato();
    this.elementoDisplay.classList.add('errore'); // Mantiene stato rosso

    log.warn('Display: modalità FUORI SERVIZIO attivata');
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
  /**
   * Gestisce visibilità e stato del pulsante "Persona passata"
   * @param {boolean} visibile - Se il pulsante deve essere visibile
   * @param {boolean} abilitato - Se il pulsante deve essere abilitato
   */
  gestisciPulsantePassaggio(visibile, abilitato) {
    const btnPassaggio = document.getElementById('btn-passaggio-persona');
    if (!btnPassaggio) return;

    if (visibile) {
      btnPassaggio.classList.remove('hidden');
    } else {
      btnPassaggio.classList.add('hidden');
    }

    btnPassaggio.disabled = !abilitato;
    log.debug(`Display: pulsante passaggio ${visibile ? 'visibile' : 'nascosto'}, ${abilitato ? 'abilitato' : 'disabilitato'}`);
  }

  /**
   * Gestisce stato del pulsante "Chiudi Cassetta"
   * @param {boolean} abilitato - Se il pulsante deve essere abilitato
   */
  gestisciPulsanteChiudiCassetta(abilitato) {
    const btnChiudiCassetta = document.getElementById('btn-chiudi-cassetta');
    if (btnChiudiCassetta) {
      btnChiudiCassetta.disabled = !abilitato;
      log.debug(`Display: pulsante chiudi cassetta ${abilitato ? 'abilitato' : 'disabilitato'}`);
    }
  }

  /**
   * Abilita/disabilita input dell'interfaccia
   * @param {boolean} abilitato - true per abilitare, false per disabilitare
   * @param {string[]} eccezioni - Input da non modificare ('monete', 'pagamento-carta', 'carta', 'qr')
   */
  abilitaInput(abilitato, eccezioni = []) {
    // Pulsanti monete
    if (!eccezioni.includes('monete')) {
      const pulsantiMonete = document.querySelectorAll('.btn-moneta');
      pulsantiMonete.forEach(btn => {
        btn.disabled = !abilitato;
      });
    }

    // Pulsante pagamento carta (VISA)
    if (!eccezioni.includes('pagamento-carta')) {
      const btnPagaCarta = document.getElementById('btn-paga-carta');
      if (btnPagaCarta) btnPagaCarta.disabled = !abilitato;
    }

    // Pulsante carta autorizzata + input (singolo, come QR)
    if (!eccezioni.includes('carta')) {
      const btnVerificaCarta = document.getElementById('btn-verifica-carta');
      const inputCarta = document.getElementById('input-carta');

      if (btnVerificaCarta) btnVerificaCarta.disabled = !abilitato;
      if (inputCarta) inputCarta.disabled = !abilitato;
    }

    // QR
    if (!eccezioni.includes('qr')) {
      const btnQR = document.getElementById('btn-scansiona-qr');
      const inputQR = document.getElementById('input-qr');
      if (btnQR) btnQR.disabled = !abilitato;
      if (inputQR) inputQR.disabled = !abilitato;
    }

    log.debug(`Display: input ${abilitato ? 'abilitati' : 'disabilitati'}${eccezioni.length ? ' (eccezioni: ' + eccezioni.join(', ') + ')' : ''}`);
  }

  /**
   * Mostra uno spinner di caricamento in un container
   * @param {HTMLElement} container - Elemento dove appendere lo spinner
   * @param {string} id - ID da assegnare allo spinner
   */
  mostraSpinner(container, id) {
    if (!container) return;
    const spinner = document.createElement('div');
    spinner.className = 'spinner';
    spinner.id = id;
    container.appendChild(spinner);
  }

  /**
   * Rimuove uno spinner specifico
   * @param {string} id - ID dello spinner da rimuovere
   */
  rimuoviSpinner(id) {
    const spinner = document.getElementById(id);
    if (spinner) spinner.remove();
  }

  // ===== BINDING EVENTI (Refactoring Init) =====

  /**
   * Collega handler ai pulsanti monete
   * @param {Function} handler - Callback (valore) => {}
   */
  bindCoinButtons(handler) {
    const pulsantiMonete = document.querySelectorAll('.btn-moneta');
    pulsantiMonete.forEach(btn => {
      btn.addEventListener('click', function () {
        const valore = parseFloat(this.getAttribute('data-valore'));
        aggiungiAnimazioneClick(this, `Moneta ${valore}€`);
        handler(valore);
      });
    });
  }

  /**
   * Collega handler al pulsante "Paga con Carta"
   * @param {Function} handler - Callback () => {}
   */
  bindCardButton(handler) {
    registraClickHandler('btn-paga-carta', handler, 'Paga con Carta');
  }

  /**
   * Collega handler per verifica carta (input + bottone)
   * @param {Function} handler - Callback (codice) => {}
   */
  bindCardInput(handler) {
    const inputCarta = document.getElementById('input-carta');
    if (!inputCarta) return;

    const wrapperHandler = () => {
      const codice = inputCarta.value.trim();
      if (!codice) {
        log.warn('⚠️ Codice carta vuoto');
        this.mostraMessaggio('Inserisci un codice carta', 'warning');
        return;
      }

      const btnVerificaCarta = document.getElementById('btn-verifica-carta');
      if (btnVerificaCarta) aggiungiAnimazioneClick(btnVerificaCarta);

      handler(codice);
      inputCarta.value = '';
    };

    registraClickHandler('btn-verifica-carta', wrapperHandler, null, false);

    inputCarta.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') wrapperHandler();
    });
  }

  /**
   * Collega handler per scansione QR (input + bottone)
   * @param {Function} handler - Callback (codice) => {}
   */
  bindQRInput(handler) {
    const inputQR = document.getElementById('input-qr');
    if (!inputQR) return;

    const wrapperHandler = () => {
      const codice = inputQR.value.trim();
      if (!codice) {
        log.warn('⚠️ Codice QR vuoto');
        this.mostraMessaggio('Inserisci un codice QR', 'warning');
        return;
      }

      const btnScansioneQR = document.getElementById('btn-scansiona-qr');
      if (btnScansioneQR) aggiungiAnimazioneClick(btnScansioneQR);

      handler(codice);
      inputQR.value = '';
    };

    registraClickHandler('btn-scansiona-qr', wrapperHandler, null, false);

    inputQR.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') wrapperHandler();
    });
  }

  /**
   * Collega handler al pulsante "Persona passata"
   * @param {Function} handler - Callback () => {}
   */
  bindPassaggioPersona(handler) {
    registraClickHandler('btn-passaggio-persona', handler, 'Persona passata');
  }

  /**
   * Collega handler ai pulsanti azzeramento
   * @param {Function} onYes - Callback conferma
   * @param {Function} onNo - Callback annulla
   */
  bindAzzeramentoButtons(onYes, onNo) {
    registraClickHandler('btn-azzera-si', onYes, 'Azzera Saldo - Sì');
    registraClickHandler('btn-azzera-no', onNo, 'Azzera Saldo - No');
  }

  /**
   * Collega handler al pulsante "Chiudi Cassetta"
   * @param {Function} handler - Callback () => {}
   */
  bindChiudiCassetta(handler) {
    // Nota: questo pulsante è gestito da GestoreUICassetta ma lo aggiungiamo per completezza
    // se in futuro volessimo spostare la logica qui
    registraClickHandler('btn-chiudi-cassetta', handler, 'Chiudi Cassetta');
  }
}

// Export globale
window.Display = Display;

log.info('✅ Display caricato');
