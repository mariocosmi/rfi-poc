/**
 * Chiosco - Macchina a Stati Finiti (FSM)
 * Coordina tutti i componenti e gestisce le transizioni di stato
 *
 * Stati:
 * - IDLE: Stato iniziale, in attesa di azione utente
 * - PAGAMENTO_MONETE: Inserimento monete in corso
 * - PAGAMENTO_CARTA: Pagamento con carta di credito VISA in corso
 * - VERIFICA_QR: Verifica codice QR autorizzato in corso
 * - PORTA_APERTA: Porta aperta dopo pagamento/autorizzazione
 * - TIMEOUT: Timeout inattività durante operazione
 * - MANUTENZIONE_AUTH_PENDING: Attesa autenticazione operatore (10s countdown)
 * - MANUTENZIONE_ATTESA_CHIUSURA: Operatore autenticato, attesa chiusura cassetta
 * - MANUTENZIONE_SCELTA_AZZERAMENTO: Scelta azzeramento saldo monete
 * - FUORI_SERVIZIO: Sistema non disponibile (timeout auth), richiede reset operatore
 */

class Chiosco {
  constructor() {
    this.stato = 'IDLE';

    // Transizioni permesse
    this.transizioniPermesse = {
      'IDLE': ['PAGAMENTO_MONETE', 'PAGAMENTO_CARTA', 'VERIFICA_QR', 'PORTA_APERTA', 'MANUTENZIONE_AUTH_PENDING'],
      'PAGAMENTO_MONETE': ['PORTA_APERTA', 'TIMEOUT', 'IDLE', 'MANUTENZIONE_AUTH_PENDING'],
      'PAGAMENTO_CARTA': ['PORTA_APERTA', 'IDLE'],
      'VERIFICA_QR': ['PORTA_APERTA', 'IDLE'],
      'PORTA_APERTA': ['IDLE', 'MANUTENZIONE_AUTH_PENDING'],
      'TIMEOUT': ['IDLE'],
      'MANUTENZIONE_AUTH_PENDING': ['MANUTENZIONE_ATTESA_CHIUSURA', 'FUORI_SERVIZIO', 'IDLE'],
      'MANUTENZIONE_ATTESA_CHIUSURA': ['MANUTENZIONE_SCELTA_AZZERAMENTO', 'FUORI_SERVIZIO'],
      'MANUTENZIONE_SCELTA_AZZERAMENTO': ['IDLE'],
      'FUORI_SERVIZIO': ['IDLE']
    };

    // Riferimenti ai componenti (saranno impostati da app.js)
    this.display = null;
    this.porta = null;
    this.gettoniera = null;
    this.lettoreCarte = null;
    this.lettoreQR = null;
    this.gestoreTimeout = null;

    // Feature 003: Componenti manutenzione
    this.sensoreCassetta = new SensoreCassetta();
    this.suoneria = new Suoneria();
    this.gestoreManutenzione = new GestoreManutenzione(this);
    this.operazioneCorrente = null;
    this.pendenteAperturaCassetta = false;

    // Feature 003: Registra listener sensore cassetta
    this.sensoreCassetta.on('cassettaAperta', () => this.onCassettaAperta());
    this.sensoreCassetta.on('cassettaChiusa', () => this.onCassettaChiusa());

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

      case 'PORTA_APERTA':
        this.onEntraPortaAperta(dati.motivo);
        break;

      case 'TIMEOUT':
        this.onEntraTimeout();
        break;

      case 'MANUTENZIONE_AUTH_PENDING':
        this.onEntraManutenzioneAuthPending();
        break;

      case 'MANUTENZIONE_ATTESA_CHIUSURA':
        this.onEntraManutenzioneAttesaChiusura();
        break;

      case 'MANUTENZIONE_SCELTA_AZZERAMENTO':
        this.onEntraManutenzioneSceltaAzzeramento();
        break;

      case 'FUORI_SERVIZIO':
        this.onEntraFuoriServizio();
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
    this.abilitaInput(false);

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

    // FEATURE 003 (T031): Pulsanti admin manutenzione
    if (!eccezioni.includes('admin')) {
      const btnApriCassetta = document.getElementById('btn-apri-cassetta');
      const btnChiudiCassetta = document.getElementById('btn-chiudi-cassetta');
      const btnAzzeraSi = document.getElementById('btn-azzera-si');
      const btnAzzeraNo = document.getElementById('btn-azzera-no');

      // Abilita/disabilita in base allo stato
      // Apri/Chiudi cassetta: sempre abilitati in IDLE, disabilitati altrove
      if (btnApriCassetta) btnApriCassetta.disabled = !abilitato;
      if (btnChiudiCassetta) btnChiudiCassetta.disabled = !abilitato;

      // Pulsanti azzeramento: gestiti da display, non modificare qui
      // (vengono abilitati solo in MANUTENZIONE_SCELTA_AZZERAMENTO)
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
   * FEATURE 003: Handler apertura cassetta
   */
  onCassettaAperta() {
    const statiTransito = ['PORTA_APERTA', 'PAGAMENTO_MONETE'];

    if (statiTransito.includes(this.stato)) {
      log.info('Cassetta aperta durante transito - attesa fine operazione');
      this.pendenteAperturaCassetta = true;

      // Se pagamento monete, annulla
      if (this.stato === 'PAGAMENTO_MONETE') {
        log.warn('Pagamento monete annullato per manutenzione');
        if (this.gettoniera) {
          this.gettoniera.reset();
        }
        this.transizione('MANUTENZIONE_AUTH_PENDING');
      }
    } else if (this.stato === 'IDLE') {
      this.transizione('MANUTENZIONE_AUTH_PENDING');
    } else {
      log.warn('Apertura cassetta ignorata, stato incompatibile: ' + this.stato);
    }
  }

  /**
   * FEATURE 003: Handler chiusura cassetta
   */
  onCassettaChiusa() {
    if (this.stato === 'MANUTENZIONE_ATTESA_CHIUSURA') {
      if (this.operazioneCorrente) {
        this.operazioneCorrente.logEvento('CHIUSURA');
      }
      this.transizione('MANUTENZIONE_SCELTA_AZZERAMENTO');
    }
  }

  /**
   * FEATURE 003: Handler conferma azzeramento (T032)
   * @param {boolean} scelta - true per azzerare, false per mantenere
   */
  confermaAzzeramento(scelta) {
    if (this.stato !== 'MANUTENZIONE_SCELTA_AZZERAMENTO') {
      log.warn('⚠️ Tentativo conferma azzeramento fuori contesto - Ignorato');
      return;
    }

    if (scelta) {
      // Azzera saldo
      const saldoPrecedente = this.gettoniera ? this.gettoniera.azzeraSaldo() : 0;

      if (this.operazioneCorrente) {
        this.operazioneCorrente.logEvento('AZZERAMENTO', {
          azzerato: true,
          saldoPrima: saldoPrecedente,
          saldoDopo: 0
        });
      }

      if (this.display) {
        this.display.nascondiPulsantiAzzeramento();
        this.display.mostraMessaggio(`Saldo azzerato: ${Gettoniera.formattaImporto(saldoPrecedente)}`, 'successo');
      }

      log.info(`✅ Saldo azzerato: ${Gettoniera.formattaImporto(saldoPrecedente)}`);
    } else {
      // Mantieni saldo
      const saldoCorrente = this.gettoniera ? this.gettoniera.getSaldoMonete() : 0;

      if (this.operazioneCorrente) {
        this.operazioneCorrente.logEvento('AZZERAMENTO', {
          azzerato: false,
          saldoPrima: saldoCorrente,
          saldoDopo: saldoCorrente
        });
      }

      if (this.display) {
        this.display.nascondiPulsantiAzzeramento();
        this.display.mostraMessaggio(`Saldo mantenuto: ${Gettoniera.formattaImporto(saldoCorrente)}`, 'info');
      }

      log.info(`ℹ️ Saldo mantenuto: ${Gettoniera.formattaImporto(saldoCorrente)}`);
    }

    // Chiudi operazione manutenzione
    this.operazioneCorrente = null;

    // Torna a IDLE dopo 3 secondi
    setTimeout(() => {
      this.transizione('IDLE');
    }, 3000);
  }

  /**
   * FEATURE 003: Entra in stato MANUTENZIONE_AUTH_PENDING
   */
  onEntraManutenzioneAuthPending() {
    // Disabilita tutti input TRANNE lettore carte (serve per autenticazione operatore)
    this.abilitaInput(false, ['carta']);

    this.operazioneCorrente = this.gestoreManutenzione.iniziaOperazione();

    this.gestoreManutenzione.avviaCountdown(() => {
      if (this.operazioneCorrente) {
        this.operazioneCorrente.logEvento('TIMEOUT');
      }
      this.transizione('FUORI_SERVIZIO');
    });

    if (this.display) {
      this.display.mostraMessaggio('Cassetta aperta - Autenticazione richiesta', 'warning');
    }

    log.info('🔐 Manutenzione: attesa autenticazione operatore (10s)');
  }

  /**
   * FEATURE 003: Entra in stato MANUTENZIONE_ATTESA_CHIUSURA
   */
  onEntraManutenzioneAttesaChiusura() {
    this.gestoreManutenzione.fermaCountdown();

    // Abilita SOLO pulsante "Chiudi Cassetta"
    const btnChiudiCassetta = document.getElementById('btn-chiudi-cassetta');
    if (btnChiudiCassetta) {
      btnChiudiCassetta.disabled = false;
      log.debug('🔧 Pulsante "Chiudi Cassetta" abilitato');
    }

    const codice = this.operazioneCorrente?.codiceOperatore || 'N/A';
    if (this.display) {
      this.display.mostraMessaggio(`Operatore autorizzato (${codice}) - Attesa chiusura cassetta`, 'success');
    }

    log.info(`✅ Operatore ${codice} autenticato - Attesa chiusura cassetta`);
  }

  /**
   * FEATURE 003: Entra in stato MANUTENZIONE_SCELTA_AZZERAMENTO
   */
  onEntraManutenzioneSceltaAzzeramento() {
    const saldo = this.gettoniera ? this.gettoniera.getSaldoMonete() : 0;

    if (this.display) {
      this.display.mostraPulsantiAzzeramento(saldo);
    }

    log.info(`💰 Scelta azzeramento - Saldo corrente: ${Gettoniera.formattaImporto(saldo)}`);
  }

  /**
   * FEATURE 003: Entra in stato FUORI_SERVIZIO
   */
  onEntraFuoriServizio() {
    this.suoneria.attiva();

    // Disabilita tutti input TRANNE lettore carte (serve per reset da operatore)
    this.abilitaInput(false, ['carta']);

    if (this.display) {
      this.display.mostraFuoriServizio();
    }

    if (this.operazioneCorrente) {
      this.operazioneCorrente.logEvento('FUORI_SERVIZIO');
    }

    log.error('🚨 Sistema in FUORI SERVIZIO - Suoneria attivata');
  }

  /**
   * FEATURE 003: Reset da FUORI_SERVIZIO con carta autorizzata
   */
  resetDaFuoriServizio(codiceOperatore) {
    if (!Validatore.isCodiceAutorizzato(codiceOperatore)) {
      if (this.display) {
        this.display.mostraMessaggio(`Accesso negato (${codiceOperatore})`, 'error');
      }
      setTimeout(() => {
        if (this.display) {
          this.display.mostraFuoriServizio();
        }
      }, 2000);
      return;
    }

    // Reset valido
    const operazione = new OperazioneSvuotamento();
    operazione.logEvento('RESET', { codice: codiceOperatore });

    this.suoneria.disattiva();

    if (this.display) {
      this.display.mostraMessaggio(`Sistema ripristinato da operatore (${codiceOperatore})`, 'success');
    }

    setTimeout(() => {
      this.transizione('IDLE');
    }, 3000);

    log.info(`✅ Reset da FUORI_SERVIZIO - Operatore: ${codiceOperatore}`);
  }

  /**
   * FEATURE 003: Modifica verificaCarta per gestire autenticazione operatore
   */
  verificaCarta(codice) {
    // Reset da FUORI_SERVIZIO
    if (this.stato === 'FUORI_SERVIZIO') {
      this.resetDaFuoriServizio(codice);
      return;
    }

    // Autenticazione operatore durante manutenzione
    if (this.stato === 'MANUTENZIONE_AUTH_PENDING') {
      if (Validatore.isCodiceAutorizzato(codice)) {
        this.gestoreManutenzione.fermaCountdown();
        if (this.operazioneCorrente) {
          this.operazioneCorrente.logEvento('AUTH_SUCCESS', { codice });
        }
        this.transizione('MANUTENZIONE_ATTESA_CHIUSURA');
      } else {
        if (this.operazioneCorrente) {
          this.operazioneCorrente.logEvento('AUTH_FAIL', { codice });
        }
        if (this.display) {
          this.display.mostraMessaggio(`Accesso negato (${codice})`, 'error');
        }
        setTimeout(() => {
          if (this.display) {
            this.display.mostraMessaggio('Cassetta aperta - Autenticazione richiesta', 'warning');
          }
        }, 2000);
      }
      return;
    }

    // Verifica carta autorizzata normale (feature 001)
    const autorizzato = Validatore.isCodiceAutorizzato(codice);
    if (autorizzato) {
      log.info(`✅ Carta ${codice}: AUTORIZZATA`);
      this.display.mostraMessaggio('Accesso autorizzato', 'success');
      setTimeout(() => this.transizione('PORTA_APERTA', { motivo: 'carta' }), 1000);
    } else {
      log.warn(`⚠️ Carta ${codice}: NON AUTORIZZATA`);
      this.display.mostraMessaggio('Accesso negato', 'error');
      setTimeout(() => this.transizione('IDLE'), 2000);
    }
  }

  /**
   * Reset completo del chiosco (per debugging)
   */
  reset() {
    log.warn('🔄 Reset manuale chiosco');
    if (this.suoneria?.isAttiva()) {
      this.suoneria.disattiva();
    }
    if (this.gestoreManutenzione) {
      this.gestoreManutenzione.fermaCountdown();
    }
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
