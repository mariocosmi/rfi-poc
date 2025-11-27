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

    // Feature 003: Componenti manutenzione cassetta
    this.sensoreCassetta = new SensoreCassetta();
    this.suoneria = new Suoneria();
    this.gestoreManutenzione = new GestoreManutenzione(this);
    this.operazioneCorrente = null;
    this.pendenteAperturaCassetta = false;

    // Feature 004: Registra listener per eventi cassetta (nuovo pattern)
    this.sensoreCassetta.on('cambioStato', (dati) => {
      if (dati.statoNuovo === 'APERTA') {
        this.onCassettaAperta();
      } else if (dati.statoNuovo === 'CHIUSA') {
        this.onCassettaChiusa();
      }
    });

    // Mappa degli stati (State Pattern)
    this.stati = {
      'IDLE': new StatoIdle(),
      'PAGAMENTO_MONETE': new StatoPagamentoMonete(),
      'PAGAMENTO_CARTA': new StatoPagamentoCarta(),
      'VERIFICA_QR': new StatoVerificaQR(),
      'PORTA_APERTA': new StatoPortaAperta(),
      'TIMEOUT': new StatoTimeout(),
      'MANUTENZIONE_AUTH_PENDING': new StatoManutenzioneAuthPending(),
      'MANUTENZIONE_ATTESA_CHIUSURA': new StatoManutenzioneAttesaChiusura(),
      'MANUTENZIONE_SCELTA_AZZERAMENTO': new StatoManutenzioneSceltaAzzeramento(),
      'FUORI_SERVIZIO': new StatoFuoriServizio()
    };

    this.statoCorrente = this.stati['IDLE'];

    log.info('🏗️ Chiosco inizializzato - Stato: IDLE');
  }

  /**
   * Tenta una transizione di stato
   * @param {string} nuovoStatoNome - Nome dello stato target
   * @param {object} dati - Dati opzionali per la transizione
   * @returns {boolean} true se transizione riuscita
   */
  transizione(nuovoStatoNome, dati = {}) {
    // Verifica se transizione è permessa
    if (!this.transizioniPermesse[this.stato]?.includes(nuovoStatoNome)) {
      log.error(`❌ Transizione non permessa: ${this.stato} → ${nuovoStatoNome}`);
      return false;
    }

    const nuovoStato = this.stati[nuovoStatoNome];
    if (!nuovoStato) {
      log.error(`❌ Stato non trovato: ${nuovoStatoNome}`);
      return false;
    }

    const vecchioStatoNome = this.stato;

    // Esegui uscita stato precedente (opzionale)
    this.statoCorrente.esci(this);

    // Aggiorna stato corrente
    this.stato = nuovoStatoNome; // Mantiene compatibilità stringa
    this.statoCorrente = nuovoStato;

    log.info(`🔄 Transizione: ${vecchioStatoNome} → ${nuovoStatoNome}`);

    // Esegui entrata nuovo stato
    this.statoCorrente.entra(this, dati);

    return true;
  }

  /**
   * Abilita/disabilita input
   * Delega a Display
   */
  abilitaInput(abilitato, eccezioni = []) {
    if (this.display) {
      this.display.abilitaInput(abilitato, eccezioni);
    }
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
    if (this.display) {
      this.display.gestisciPulsantePassaggio(false, false);
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
   * Helper per verifica accesso con codice autorizzato (DRY helper)
   * Centralizza logica comune per QR e carte autorizzate
   *
   * @param {string} codice - Codice da verificare
   * @param {string} tipoIngresso - Tipo ingresso ('QR', 'Carta', ecc.) per logging
   */
  verificaAccessoConCodice(codice, tipoIngresso) {
    if (!this.display) {
      log.warn('verificaAccessoConCodice: display non disponibile');
      return;
    }

    this.display.mostraMessaggio('Verifica in corso...', 'info');

    setTimeout(() => {
      const autorizzato = Validatore.isCodiceAutorizzato(codice);

      if (autorizzato) {
        log.info(`✅ ${tipoIngresso} ${codice}: AUTORIZZATO`);
        this.display.mostraMessaggio('Accesso autorizzato', 'successo');
        setTimeout(() => this.transizione('PORTA_APERTA', { motivo: tipoIngresso.toLowerCase() }), 1000);
      } else {
        log.warn(`⚠️ ${tipoIngresso} ${codice}: NON AUTORIZZATO`);
        this.display.mostraMessaggio('Accesso negato', 'errore');
        setTimeout(() => this.transizione('IDLE'), 2000);
      }
    }, 500);
  }

  /**
   * Gestisce input da lettore carte
   * Delega logica allo stato corrente (State Pattern)
   * @param {string} codice - Codice carta letto
   */
  verificaCarta(codice) {
    this.statoCorrente.gestisciInputCarta(this, codice);
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
 *
 * Refactored per usare CountdownTimer (TD-005)
 */
class GestoreTimeout {
  constructor(chiosco, durataSecondi = 20) {
    this.chiosco = chiosco;
    this.durataSecondi = durataSecondi;

    // Usa CountdownTimer con callbacks
    this.countdown = new CountdownTimer(
      durataSecondi,
      // onTick: aggiorna display ogni secondo
      (secondi) => {
        if (this.chiosco.display) {
          this.chiosco.display.aggiornaCountdown(secondi);
        }
        log.debug(`⏱️ Countdown: ${secondi}s rimanenti`);
      },
      // onComplete: transizione a TIMEOUT
      () => {
        log.warn('⏱️ Timeout scaduto');
        this.chiosco.transizione('TIMEOUT');
      }
    );
  }

  /**
   * Avvia timeout
   */
  avvia() {
    log.debug(`⏱️ Timer timeout avviato: ${this.durataSecondi} secondi`);
    this.countdown.avvia();
  }

  /**
   * Reset timeout
   */
  reset() {
    this.countdown.reset();

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
