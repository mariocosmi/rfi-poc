/**
 * Chiosco - Macchina a Stati Finiti (FSM)
 * Coordina tutti i componenti e gestisce le transizioni di stato
 *
 * Stati:
 * - IDLE: Stato iniziale, in attesa di azione utente
 * - PAGAMENTO_MONETE: Inserimento monete in corso
 * - PAGAMENTO_CARTA: Pagamento con carta di credito in corso
 * - VERIFICA_QR: Verifica codice QR in corso
 * - VERIFICA_CARTA: Verifica carta contactless autorizzata in corso
 * - PORTA_APERTA: Porta aperta dopo pagamento/autorizzazione
 * - TIMEOUT: Timeout inattività durante operazione
 */

class Chiosco {
  constructor() {
    this.stato = 'IDLE';

    // Transizioni permesse
    this.transizioniPermesse = {
      'IDLE': ['PAGAMENTO_MONETE', 'PAGAMENTO_CARTA', 'VERIFICA_QR', 'VERIFICA_CARTA'],
      'PAGAMENTO_MONETE': ['PORTA_APERTA', 'TIMEOUT', 'IDLE', 'PAGAMENTO_CARTA'],
      'PAGAMENTO_CARTA': ['PORTA_APERTA', 'IDLE'],
      'VERIFICA_QR': ['PORTA_APERTA', 'IDLE'],
      'VERIFICA_CARTA': ['PORTA_APERTA', 'IDLE'],
      'PORTA_APERTA': ['IDLE'],
      'TIMEOUT': ['IDLE']
    };

    // Riferimenti ai componenti (saranno impostati da app.js)
    this.display = null;
    this.porta = null;
    this.gettoniera = null;
    this.lettoreCarte = null;
    this.lettoreQR = null;
    this.gestoreTimeout = null;

    log.info('🏗️ Chiosco inizializzato - Stato: IDLE');
  }

  /**
   * Tenta una transizione di stato
   * @param {string} nuovoStato - Lo stato target
   * @param {object} dati - Dati opzionali per la transizione
   * @returns {boolean} true se transizione riuscita
   */
  transizione(nuovoStato, dati = {}) {
    // Verifica se transizione è permessa
    if (!this.transizioniPermesse[this.stato]?.includes(nuovoStato)) {
      log.error(`❌ Transizione non permessa: ${this.stato} → ${nuovoStato}`);
      return false;
    }

    const vecchioStato = this.stato;
    this.stato = nuovoStato;

    log.info(`🔄 Transizione: ${vecchioStato} → ${nuovoStato}`);

    // Gestisci cambio stato
    this.onCambioStato(nuovoStato, vecchioStato, dati);

    return true;
  }

  /**
   * Handler per cambio di stato
   * @param {string} nuovoStato - Nuovo stato attivo
   * @param {string} vecchioStato - Stato precedente
   * @param {object} dati - Dati della transizione
   */
  onCambioStato(nuovoStato, vecchioStato, dati) {
    switch (nuovoStato) {
      case 'IDLE':
        this.onEntraIDLE();
        break;

      case 'PAGAMENTO_MONETE':
        this.onEntraPagamentoMonete();
        break;

      case 'PAGAMENTO_CARTA':
        this.onEntraPagamentoCarta();
        break;

      case 'VERIFICA_QR':
        this.onEntraVerificaQR(dati.codice);
        break;

      case 'VERIFICA_CARTA':
        this.onEntraVerificaCarta();
        break;

      case 'PORTA_APERTA':
        this.onEntraPortaAperta(dati.motivo);
        break;

      case 'TIMEOUT':
        this.onEntraTimeout();
        break;
    }
  }

  /**
   * Entra in stato IDLE
   */
  onEntraIDLE() {
    // Reset timeout se attivo
    if (this.gestoreTimeout) {
      this.gestoreTimeout.reset();
    }

    // Reset gettoniera
    if (this.gettoniera) {
      this.gettoniera.reset();
    }

    // Reset display
    if (this.display) {
      this.display.mostraMessaggioIniziale();
    }

    // FEATURE 002: Nascondi e resetta pulsante "Persona passata"
    const btnPassaggio = document.getElementById('btn-passaggio-persona');
    if (btnPassaggio) {
      btnPassaggio.classList.add('hidden');
      btnPassaggio.disabled = false;
      log.debug('🚶 Pulsante "Persona passata" nascosto e resettato');
    }

    // Riabilita tutti gli input
    this.abilitaInput(true);

    log.info('🏠 Stato IDLE - Sistema pronto');
  }

  /**
   * Entra in stato PAGAMENTO_MONETE
   */
  onEntraPagamentoMonete() {
    // Avvia timeout inattività
    if (this.gestoreTimeout) {
      this.gestoreTimeout.avvia();
    }

    log.info('💰 Pagamento monete iniziato');
  }

  /**
   * Entra in stato PAGAMENTO_CARTA
   */
  onEntraPagamentoCarta() {
    // Disabilita altri input
    this.abilitaInput(false, ['carta']);

    // Mostra area avvicinamento carta
    if (this.lettoreCarte) {
      this.lettoreCarte.mostraAreaPagamento();
    }

    // Mostra messaggio su display
    if (this.display) {
      this.display.mostraMessaggio('Avvicina la carta al lettore', 'info');
    }

    log.info('💳 Pagamento carta iniziato');
  }

  /**
   * Entra in stato VERIFICA_QR
   * @param {string} codice - Codice QR scansionato
   */
  onEntraVerificaQR(codice) {
    // Disabilita tutti gli input
    this.abilitaInput(false);

    // Mostra verifica in corso
    if (this.display) {
      this.display.mostraMessaggio('Verifica in corso...', 'info');
    }

    // Verifica codice
    setTimeout(() => {
      const autorizzato = Validatore.isCodiceAutorizzato(codice);

      if (autorizzato) {
        log.info(`✅ QR code ${codice}: AUTORIZZATO`);
        this.display.mostraMessaggio('Accesso autorizzato', 'successo');
        setTimeout(() => this.transizione('PORTA_APERTA', { motivo: 'qr' }), 1000);
      } else {
        log.warn(`⚠️ QR code ${codice}: NON AUTORIZZATO`);
        this.display.mostraMessaggio('Accesso negato', 'errore');
        setTimeout(() => this.transizione('IDLE'), 2000);
      }
    }, 500);
  }

  /**
   * Entra in stato VERIFICA_CARTA
   */
  onEntraVerificaCarta() {
    // Disabilita altri input
    this.abilitaInput(false, ['carta']);

    // Mostra input codice
    if (this.lettoreCarte) {
      this.lettoreCarte.mostraInputCodice();
    }

    // Mostra messaggio su display
    if (this.display) {
      this.display.mostraMessaggio('Inserisci codice carta autorizzata', 'info');
    }

    log.info('🔐 Verifica carta autorizzata iniziata');
  }

  /**
   * Entra in stato PORTA_APERTA
   * @param {string} motivo - Motivo apertura (pagamento, qr, carta)
   */
  onEntraPortaAperta(motivo = 'pagamento') {
    // Reset timeout
    if (this.gestoreTimeout) {
      this.gestoreTimeout.reset();
    }

    // Disabilita tutti gli input
    this.abilitaInput(false);

    // Apri porta con motivo
    if (this.porta) {
      this.porta.apri(motivo);
    }

    // FEATURE 002: Mostra pulsante "Persona passata"
    const btnPassaggio = document.getElementById('btn-passaggio-persona');
    if (btnPassaggio) {
      btnPassaggio.classList.remove('hidden');
      btnPassaggio.disabled = false;
      log.debug('🚶 Pulsante "Persona passata" visibile');
    }

    // Mostra messaggio successo
    if (this.display) {
      this.display.mostraMessaggio('Accesso consentito - Porta aperta', 'successo');
    }

    log.info(`✅ Porta aperta - Motivo: ${motivo}`);

    // FEATURE 002: Programma chiusura automatica e salva timer
    const timerChiusuraAuto = setTimeout(() => {
      if (this.porta) {
        this.porta.chiudi();
      }

      // Torna a IDLE dopo chiusura
      setTimeout(() => {
        this.transizione('IDLE');
      }, 1500); // Attendi animazione chiusura
    }, 15000);

    // Salva timer in porta per poterlo cancellare
    if (this.porta) {
      this.porta.timerChiusuraAutomatica = timerChiusuraAuto;
    }
  }

  /**
   * Entra in stato TIMEOUT
   */
  onEntraTimeout() {
    log.warn('⏱️ Timeout inattività raggiunto');

    // Mostra messaggio timeout
    if (this.display) {
      this.display.mostraMessaggio('Timeout - Operazione annullata', 'warning');
    }

    // Reset e torna a IDLE dopo 2 secondi
    setTimeout(() => {
      this.transizione('IDLE');
    }, 2000);
  }

  /**
   * Abilita/disabilita input
   * @param {boolean} abilitato - true per abilitare, false per disabilitare
   * @param {string[]} eccezioni - Input da non modificare
   */
  abilitaInput(abilitato, eccezioni = []) {
    // Pulsanti monete
    if (!eccezioni.includes('monete')) {
      const pulsantiMonete = document.querySelectorAll('.btn-moneta');
      pulsantiMonete.forEach(btn => {
        btn.disabled = !abilitato;
      });
    }

    // Pulsanti carte
    if (!eccezioni.includes('carta')) {
      const btnPagaCarta = document.getElementById('btn-paga-carta');
      const btnVerificaCarta = document.getElementById('btn-verifica-carta');
      if (btnPagaCarta) btnPagaCarta.disabled = !abilitato;
      if (btnVerificaCarta) btnVerificaCarta.disabled = !abilitato;
    }

    // QR
    if (!eccezioni.includes('qr')) {
      const btnQR = document.getElementById('btn-scansiona-qr');
      const inputQR = document.getElementById('input-qr');
      if (btnQR) btnQR.disabled = !abilitato;
      if (inputQR) inputQR.disabled = !abilitato;
    }

    log.debug(`Input ${abilitato ? 'abilitati' : 'disabilitati'}${eccezioni.length ? ' (eccezioni: ' + eccezioni.join(', ') + ')' : ''}`);
  }

  /**
   * Verifica pagamento completato
   */
  verificaPagamento() {
    if (this.stato !== 'PAGAMENTO_MONETE') {
      return;
    }

    const rimanente = this.gettoniera.getImportoRimanente();

    if (rimanente <= 0) {
      log.info('✅ Pagamento completato');
      this.transizione('PORTA_APERTA', { motivo: 'monete' });
    }
  }

  /**
   * FEATURE 002: Handler passaggio persona
   * Chiamato quando utente clicca pulsante "Persona passata"
   */
  onPassaggioPersona() {
    if (this.stato !== 'PORTA_APERTA') {
      log.warn('⚠️ Tentativo passaggio persona con porta non aperta - Ignorato');
      return;
    }

    log.debug('🚶 Click pulsante "Persona passata"');

    // Disabilita e nascondi pulsante immediatamente
    const btnPassaggio = document.getElementById('btn-passaggio-persona');
    if (btnPassaggio) {
      btnPassaggio.disabled = true;
      btnPassaggio.classList.add('hidden');
      log.debug('🚶 Pulsante "Persona passata" disabilitato e nascosto');
    }

    // Mostra feedback su display
    if (this.display) {
      this.display.mostraMessaggio('Passaggio rilevato - Porta in chiusura', 'info');
    }

    // Chiusura manuale porta (cancella timer e chiude)
    if (this.porta) {
      this.porta.chiudiManuale();
    }

    // Torna a IDLE dopo animazione chiusura (1.5s)
    setTimeout(() => {
      this.transizione('IDLE');
    }, 1500);
  }

  /**
   * Reset completo del chiosco (per debugging)
   */
  reset() {
    log.warn('🔄 Reset manuale chiosco');
    this.transizione('IDLE');
  }
}

/**
 * GestoreTimeout - Gestisce timeout inattività con countdown
 */
class GestoreTimeout {
  constructor(chiosco, durataSecondi = 20) {
    this.chiosco = chiosco;
    this.durata = durataSecondi * 1000;
    this.durataSecondi = durataSecondi;
    this.timer = null;
    this.intervalloConto = null;
    this.secondiRimanenti = durataSecondi;
  }

  /**
   * Avvia timeout
   */
  avvia() {
    this.reset();
    this.secondiRimanenti = this.durataSecondi;

    log.debug(`⏱️ Timer timeout avviato: ${this.durataSecondi} secondi`);

    // Timer principale per timeout
    this.timer = setTimeout(() => {
      log.warn('⏱️ Timeout scaduto');
      this.chiosco.transizione('TIMEOUT');
    }, this.durata);

    // Intervallo per aggiornare countdown display
    this.intervalloConto = setInterval(() => {
      this.secondiRimanenti--;

      if (this.chiosco.display) {
        this.chiosco.display.aggiornaCountdown(this.secondiRimanenti);
      }

      log.debug(`⏱️ Countdown: ${this.secondiRimanenti}s rimanenti`);

      if (this.secondiRimanenti <= 0) {
        clearInterval(this.intervalloConto);
      }
    }, 1000);
  }

  /**
   * Reset timeout
   */
  reset() {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }

    if (this.intervalloConto) {
      clearInterval(this.intervalloConto);
      this.intervalloConto = null;
    }

    // Nascondi countdown su display
    if (this.chiosco?.display) {
      this.chiosco.display.nascondiCountdown();
    }

    log.debug('⏱️ Timer timeout resettato');
  }
}

// Export globale
window.Chiosco = Chiosco;
window.GestoreTimeout = GestoreTimeout;

log.info('✅ Chiosco e GestoreTimeout caricati');
