/**
 * GestoreUICassetta - Gestione UI pannello manutenzione cassetta
 * Feature 004: Visualizzazione Stato Cassetta e Controlli Manutenzione
 *
 * Questo componente gestisce l'interfaccia utente del pannello manutenzione:
 * - Visualizza badge stato cassetta (APERTA/CHIUSA)
 * - Fornisce pulsanti sempre abilitati per simulare eventi apertura/chiusura
 * - Si registra come listener su SensoreCassetta per aggiornare UI automaticamente
 */

class GestoreUICassetta {
  /**
   * Costruttore - Inizializza gestore, trova elementi DOM, registra listener
   * T008: Constructor, riferimenti DOM
   * T010: Registra listener cambioStato
   *
   * @param {SensoreCassetta} sensore - Istanza di SensoreCassetta da monitorare
   * @param {HTMLElement} container - Elemento DOM che contiene pannello manutenzione
   * @throws {TypeError} se sensore non è instanceof SensoreCassetta
   * @throws {TypeError} se container non è instanceof HTMLElement
   * @throws {Error} se elementi DOM richiesti non trovati
   */
  constructor(sensore, container) {
    // Validazione parametri
    if (!(sensore instanceof SensoreCassetta)) {
      throw new TypeError('sensore deve essere instanceof SensoreCassetta');
    }
    if (!(container instanceof HTMLElement)) {
      throw new TypeError('container deve essere instanceof HTMLElement');
    }

    // Salva riferimenti
    this.sensore = sensore;
    this.container = container;

    // Trova elementi DOM richiesti
    this.elementoStato = document.querySelector('#stato-cassetta');
    this.btnApri = document.querySelector('#btn-apri-cassetta-004');
    this.btnChiudi = document.querySelector('#btn-chiudi-cassetta-004');

    // Verifica che elementi DOM esistano (fail-fast)
    if (!this.elementoStato || !this.btnApri || !this.btnChiudi) {
      throw new Error('Elementi DOM manutenzione mancanti (#stato-cassetta, #btn-apri-cassetta-004, #btn-chiudi-cassetta-004)');
    }

    // T010: Registra listener per evento cambioStato
    this.sensore.on('cambioStato', this.aggiornaUI.bind(this));

    // T013: Setup handler click pulsante Apri (US2)
    this.btnApri.addEventListener('click', () => {
      log.info('[GestoreUICassetta] Operatore ha cliccato "Apri Cassetta"');
      this.sensore.notificaApertura();
    });

    // T016: Setup handler click pulsante Chiudi (US3)
    this.btnChiudi.addEventListener('click', () => {
      log.info('[GestoreUICassetta] Operatore ha cliccato "Chiudi Cassetta"');
      this.sensore.notificaChiusura();
    });

    log.debug('[GestoreUICassetta] Inizializzato, listener registrati, pulsanti configurati');

    // Aggiorna UI iniziale per mostrare stato corrente
    this.aggiornaUI({
      timestamp: new Date().toISOString(),
      statoPrec: null,
      statoNuovo: this.sensore.getStato()
    });
  }

  /**
   * T009: Aggiorna badge stato cassetta nel DOM
   * Chiamato automaticamente quando sensore emette evento 'cambioStato'
   *
   * @param {Object} dati - Payload evento cambioStato
   * @param {string} dati.timestamp - ISO 8601 timestamp
   * @param {string} dati.statoPrec - Stato precedente ('APERTA' | 'CHIUSA' | null)
   * @param {string} dati.statoNuovo - Stato nuovo ('APERTA' | 'CHIUSA')
   */
  aggiornaUI(dati) {
    try {
      const { timestamp, statoPrec, statoNuovo } = dati;

      // Aggiorna textContent badge
      this.elementoStato.textContent = statoNuovo;

      // Rimuovi classi CSS esistenti
      this.elementoStato.classList.remove('badge-aperta', 'badge-chiusa');

      // Aggiungi classe CSS appropriata
      if (statoNuovo === 'APERTA') {
        this.elementoStato.classList.add('badge-aperta');
      } else if (statoNuovo === 'CHIUSA') {
        this.elementoStato.classList.add('badge-chiusa');
      }

      log.debug(`[${timestamp}] [GestoreUICassetta] UI aggiornata: badge → ${statoNuovo}`);
    } catch (errore) {
      log.error('[GestoreUICassetta] Errore aggiornamento UI:', errore);
    }
  }

  /**
   * Cleanup listener (opzionale, non critico per SPA)
   * Utile per testing o se componente viene distrutto dinamicamente
   */
  destroy() {
    if (this.sensore) {
      this.sensore.off('cambioStato', this.aggiornaUI.bind(this));
      log.debug('[GestoreUICassetta] Listener rimossi, componente distrutto');
    }
  }
}
