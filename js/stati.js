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
}

class StatoIdle extends Stato {
    getNome() { return 'IDLE'; }

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
    getNome() { return 'PAGAMENTO_MONETE'; }

    entra(chiosco) {
        // Avvia timeout inattività
        if (chiosco.gestoreTimeout) {
            chiosco.gestoreTimeout.avvia();
        }

        log.info('💰 Pagamento monete iniziato');
    }
}

class StatoPagamentoCarta extends Stato {
    getNome() { return 'PAGAMENTO_CARTA'; }

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
    getNome() { return 'VERIFICA_QR'; }

    entra(chiosco, dati) {
        // Disabilita tutti gli input
        chiosco.abilitaInput(false);

        // Usa helper DRY per verifica
        chiosco.verificaAccessoConCodice(dati.codice, 'QR code');
    }
}

class StatoPortaAperta extends Stato {
    getNome() { return 'PORTA_APERTA'; }

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

        // FEATURE 002: Programma chiusura automatica e salva timer
        const timerChiusuraAuto = setTimeout(() => {
            if (chiosco.porta) {
                chiosco.porta.chiudi();
            }

            // Torna a IDLE dopo chiusura
            setTimeout(() => {
                chiosco.transizione('IDLE');
            }, 1500); // Attendi animazione chiusura
        }, 15000);

        // Salva timer in porta per poterlo cancellare
        if (chiosco.porta) {
            chiosco.porta.timerChiusuraAutomatica = timerChiusuraAuto;
        }
    }
}

class StatoTimeout extends Stato {
    getNome() { return 'TIMEOUT'; }

    entra(chiosco) {
        log.warn('⏱️ Timeout inattività raggiunto');

        // Mostra messaggio timeout
        if (chiosco.display) {
            chiosco.display.mostraMessaggio('Timeout - Operazione annullata', 'warning');
        }

        // Reset e torna a IDLE dopo 2 secondi
        setTimeout(() => {
            chiosco.transizione('IDLE');
        }, 2000);
    }
}

class StatoManutenzioneAuthPending extends Stato {
    getNome() { return 'MANUTENZIONE_AUTH_PENDING'; }

    entra(chiosco) {
        // Disabilita tutti input TRANNE lettore carte (serve per autenticazione operatore)
        chiosco.abilitaInput(false, ['carta']);

        chiosco.operazioneCorrente = chiosco.gestoreManutenzione.iniziaOperazione();

        chiosco.gestoreManutenzione.avviaCountdown(() => {
            if (chiosco.operazioneCorrente) {
                chiosco.operazioneCorrente.logEvento('TIMEOUT');
            }
            chiosco.transizione('FUORI_SERVIZIO');
        });

        if (chiosco.display) {
            chiosco.display.mostraMessaggio('Cassetta aperta - Autenticazione richiesta', 'warning');
        }

        log.info('🔐 Manutenzione: attesa autenticazione operatore (10s)');
    }
}

class StatoManutenzioneAttesaChiusura extends Stato {
    getNome() { return 'MANUTENZIONE_ATTESA_CHIUSURA'; }

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
    getNome() { return 'MANUTENZIONE_SCELTA_AZZERAMENTO'; }

    entra(chiosco) {
        const saldo = chiosco.gettoniera ? chiosco.gettoniera.getSaldoMonete() : 0;

        if (chiosco.display) {
            chiosco.display.mostraPulsantiAzzeramento(saldo);
        }

        log.info(`💰 Scelta azzeramento - Saldo corrente: ${Gettoniera.formattaImporto(saldo)}`);
    }
}

class StatoFuoriServizio extends Stato {
    getNome() { return 'FUORI_SERVIZIO'; }

    entra(chiosco) {
        chiosco.suoneria.attiva();

        // Disabilita tutti input TRANNE lettore carte (serve per reset da operatore)
        chiosco.abilitaInput(false, ['carta']);

        if (chiosco.display) {
            chiosco.display.mostraFuoriServizio();
        }

        if (chiosco.operazioneCorrente) {
            chiosco.operazioneCorrente.logEvento('FUORI_SERVIZIO');
        }

        log.error('🚨 Sistema in FUORI SERVIZIO - Suoneria attivata');
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
