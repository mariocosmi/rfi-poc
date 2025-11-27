/**
 * Classi di Stato per il pattern State del Chiosco
 * Ogni stato incapsula la logica di ingresso e comportamento specifico.
 */

class Stato {
    constructor() {
        if (this.constructor === Stato) {
            throw new Error("La classe Stato è astratta e non può essere istanziata direttamente.");
        }
    }

    /**
     * Restituisce il nome dello stato
     * @returns {string}
     */
    getNome() {
        throw new Error("Il metodo getNome() deve essere implementato.");
    }

    /**
     * Logica eseguita all'ingresso nello stato
     * @param {Chiosco} chiosco - Riferimento al contesto
     * @param {object} dati - Dati opzionali passati durante la transizione
     */
    entra(chiosco, dati) {
        // Default: nessuna azione
    }

    /**
     * Logica eseguita all'uscita dallo stato
     * @param {Chiosco} chiosco - Riferimento al contesto
     */
    esci(chiosco) {
        // Default: nessuna azione
    }

    /**
     * Template method: gestisce input da lettore carte
     * Override questo metodo negli stati con comportamento specifico
     * @param {Chiosco} chiosco - Riferimento al contesto
     * @param {string} codice - Codice carta letto
     */
    gestisciInputCarta(chiosco, codice) {
        // Default: usa helper DRY per verifica normale
        chiosco.verificaAccessoConCodice(codice, 'Carta');
    }
}

class StatoIdle extends Stato {
    getNome() { return STATI.IDLE; }

    entra(chiosco) {
        // Reset timeout se attivo
        if (chiosco.gestoreTimeout) {
            chiosco.gestoreTimeout.reset();
        }

        // Reset gettoniera
        if (chiosco.gettoniera) {
            chiosco.gettoniera.reset();
        }

        // Reset display
        if (chiosco.display) {
            chiosco.display.mostraMessaggioIniziale();
            // FEATURE 002: Nascondi e resetta pulsante "Persona passata"
            chiosco.display.gestisciPulsantePassaggio(false, true);
        }

        // Riabilita tutti gli input
        chiosco.abilitaInput(true);

        log.info('🏠 Stato IDLE - Sistema pronto');
    }
}

class StatoPagamentoMonete extends Stato {
    getNome() { return STATI.PAGAMENTO_MONETE; }

    entra(chiosco) {
        // Avvia timeout inattività
        if (chiosco.gestoreTimeout) {
            chiosco.gestoreTimeout.avvia();
        }

        log.info('💰 Pagamento monete iniziato');
    }
}

class StatoPagamentoCarta extends Stato {
    getNome() { return STATI.PAGAMENTO_CARTA; }

    entra(chiosco) {
        // Disabilita altri input
        chiosco.abilitaInput(false);

        // Mostra area avvicinamento carta
        if (chiosco.lettoreCarte) {
            chiosco.lettoreCarte.mostraAreaPagamento();
        }

        // Mostra messaggio su display
        if (chiosco.display) {
            chiosco.display.mostraMessaggio('Avvicina la carta al lettore', 'info');
        }

        log.info('💳 Pagamento carta iniziato');
    }
}

class StatoVerificaQR extends Stato {
    getNome() { return STATI.VERIFICA_QR; }

    entra(chiosco, dati) {
        // Disabilita tutti gli input
        chiosco.abilitaInput(false);

        // Usa helper DRY per verifica
        chiosco.verificaAccessoConCodice(dati.codice, 'QR code');
    }
}

class StatoPortaAperta extends Stato {
    getNome() { return STATI.PORTA_APERTA; }

    entra(chiosco, dati) {
        const motivo = dati.motivo || 'pagamento';

        // Reset timeout
        if (chiosco.gestoreTimeout) {
            chiosco.gestoreTimeout.reset();
        }

        // Disabilita tutti gli input
        chiosco.abilitaInput(false);

        // Apri porta con motivo
        if (chiosco.porta) {
            chiosco.porta.apri(motivo);
        }

        // FEATURE 002: Mostra pulsante "Persona passata"
        if (chiosco.display) {
            chiosco.display.gestisciPulsantePassaggio(true, true);
        }

        // Mostra messaggio successo
        if (chiosco.display) {
            chiosco.display.mostraMessaggio('Accesso consentito - Porta aperta', 'successo');
        }

        log.info(`✅ Porta aperta - Motivo: ${motivo}`);

        // FEATURE 002: Programma chiusura automatica - gestito internamente
        this.timerChiusuraAuto = setTimeout(() => {
            if (chiosco.porta) {
                chiosco.porta.chiudi();
            }

            // Torna a IDLE dopo chiusura
            setTimeout(() => {
                chiosco.transizione(STATI.IDLE);
            }, TIMEOUTS.RITORNO_IDLE_POST_CHIUSURA);
        }, TIMEOUTS.CHIUSURA_PORTA_AUTO);
    }

    esci(chiosco) {
        // Cancella timer se ancora attivo (chiusura manuale)
        if (this.timerChiusuraAuto) {
            clearTimeout(this.timerChiusuraAuto);
            this.timerChiusuraAuto = null;
            log.debug('⏱️ Timer chiusura automatica cancellato (chiusura manuale)');
        }
    }
}

class StatoTimeout extends Stato {
    getNome() { return STATI.TIMEOUT; }

    entra(chiosco) {
        log.warn('⏱️ Timeout inattività raggiunto');

        // Mostra messaggio timeout
        if (chiosco.display) {
            chiosco.display.mostraMessaggio('Timeout - Operazione annullata', 'warning');
        }

        // Reset e torna a IDLE dopo 2 secondi
        setTimeout(() => {
            chiosco.transizione(STATI.IDLE);
        }, TIMEOUTS.RITORNO_IDLE_POST_TIMEOUT);
    }
}

class StatoManutenzioneAuthPending extends Stato {
    getNome() { return STATI.MANUTENZIONE_AUTH_PENDING; }

    entra(chiosco) {
        // Disabilita tutti input TRANNE lettore carte (serve per autenticazione operatore)
        chiosco.abilitaInput(false, ['carta']);

        chiosco.operazioneCorrente = chiosco.gestoreManutenzione.iniziaOperazione();

        chiosco.gestoreManutenzione.avviaCountdown(() => {
            if (chiosco.operazioneCorrente) {
                chiosco.operazioneCorrente.logEvento(STATI.TIMEOUT);
            }
            chiosco.transizione(STATI.FUORI_SERVIZIO);
        });

        if (chiosco.display) {
            chiosco.display.mostraMessaggio('Cassetta aperta - Autenticazione richiesta', 'warning');
        }

        log.info('🔐 Manutenzione: attesa autenticazione operatore (10s)');
    }

    gestisciInputCarta(chiosco, codice) {
        // Autenticazione operatore durante manutenzione
        if (Validatore.isCodiceAutorizzato(codice)) {
            chiosco.gestoreManutenzione.fermaCountdown();
            if (chiosco.operazioneCorrente) {
                chiosco.operazioneCorrente.logEvento('AUTH_SUCCESS', { codice });
            }
            chiosco.transizione(STATI.MANUTENZIONE_ATTESA_CHIUSURA);
        } else {
            if (chiosco.operazioneCorrente) {
                chiosco.operazioneCorrente.logEvento('AUTH_FAIL', { codice });
            }
            if (chiosco.display) {
                chiosco.display.mostraMessaggio(`Accesso negato (${codice})`, 'error');
            }
            setTimeout(() => {
                if (chiosco.display) {
                    chiosco.display.mostraMessaggio('Cassetta aperta - Autenticazione richiesta', 'warning');
                }
            }, TIMEOUTS.MESSAGGIO_ERRORE);
        }
    }
}

class StatoManutenzioneAttesaChiusura extends Stato {
    getNome() { return STATI.MANUTENZIONE_ATTESA_CHIUSURA; }

    entra(chiosco) {
        chiosco.gestoreManutenzione.fermaCountdown();

        // Abilita SOLO pulsante "Chiudi Cassetta"
        if (chiosco.display) {
            chiosco.display.gestisciPulsanteChiudiCassetta(true);
        }

        const codice = chiosco.operazioneCorrente?.codiceOperatore || 'N/A';
        if (chiosco.display) {
            chiosco.display.mostraMessaggio(`Operatore autorizzato (${codice}) - Attesa chiusura cassetta`, 'success');
        }

        log.info(`✅ Operatore ${codice} autenticato - Attesa chiusura cassetta`);
    }
}

class StatoManutenzioneSceltaAzzeramento extends Stato {
    getNome() { return STATI.MANUTENZIONE_SCELTA_AZZERAMENTO; }

    entra(chiosco) {
        const saldo = chiosco.gettoniera ? chiosco.gettoniera.getSaldoMonete() : 0;

        if (chiosco.display) {
            chiosco.display.mostraPulsantiAzzeramento(saldo);
        }

        log.info(`💰 Scelta azzeramento - Saldo corrente: ${Gettoniera.formattaImporto(saldo)}`);
    }
}

class StatoFuoriServizio extends Stato {
    getNome() { return STATI.FUORI_SERVIZIO; }

    entra(chiosco) {
        chiosco.suoneria.attiva();

        // Disabilita tutti input TRANNE lettore carte (serve per reset da operatore)
        chiosco.abilitaInput(false, ['carta']);

        if (chiosco.display) {
            chiosco.display.mostraFuoriServizio();
        }

        if (chiosco.operazioneCorrente) {
            chiosco.operazioneCorrente.logEvento(STATI.FUORI_SERVIZIO);
        }

        log.error('🚨 Sistema in FUORI SERVIZIO - Suoneria attivata');
    }

    gestisciInputCarta(chiosco, codice) {
        // Reset da FUORI_SERVIZIO
        chiosco.resetDaFuoriServizio(codice);
    }
}

// Export globale (pattern attuale)
window.Stato = Stato;
window.StatoIdle = StatoIdle;
window.StatoPagamentoMonete = StatoPagamentoMonete;
window.StatoPagamentoCarta = StatoPagamentoCarta;
window.StatoVerificaQR = StatoVerificaQR;
window.StatoPortaAperta = StatoPortaAperta;
window.StatoTimeout = StatoTimeout;
window.StatoManutenzioneAuthPending = StatoManutenzioneAuthPending;
window.StatoManutenzioneAttesaChiusura = StatoManutenzioneAttesaChiusura;
window.StatoManutenzioneSceltaAzzeramento = StatoManutenzioneSceltaAzzeramento;
window.StatoFuoriServizio = StatoFuoriServizio;

log.info('✅ Classi Stato caricate');
