/**
 * utils.js - Utility functions riutilizzabili
 *
 * Raccolta di helper generici per operazioni comuni nel codebase.
 * Creato per eliminare duplicazioni e centralizzare logica condivisa.
 */

/**
 * Aggiunge animazione click visiva a un elemento
 *
 * @param {HTMLElement} elemento - Elemento da animare
 * @param {string} nomeAzione - Nome azione per logging (opzionale)
 */
function aggiungiAnimazioneClick(elemento, nomeAzione = null) {
  if (!elemento) {
    log.warn('aggiungiAnimazioneClick: elemento nullo');
    return;
  }

  // Log opzionale dell'azione
  if (nomeAzione) {
    log.debug(`🖱️ Click "${nomeAzione}"`);
  }

  // Animazione CSS
  elemento.classList.add('clicked');
  setTimeout(() => elemento.classList.remove('clicked'), TIMEOUTS.ANIMAZIONE_CLICK);
}

/**
 * Registra un click handler su un elemento DOM con gestione sicura
 * Include automaticamente animazione click e logging
 *
 * @param {string} elementId - ID elemento DOM (senza #)
 * @param {Function} handler - Funzione handler da eseguire al click
 * @param {string} nomeAzione - Nome azione per logging
 * @param {boolean} animazione - Abilita animazione click (default: true)
 * @returns {HTMLElement|null} - Riferimento elemento o null se non trovato
 */
function registraClickHandler(elementId, handler, nomeAzione = null, animazione = true) {
  const elemento = document.getElementById(elementId);

  if (!elemento) {
    log.warn(`registraClickHandler: elemento #${elementId} non trovato nel DOM`);
    return null;
  }

  elemento.addEventListener('click', function (e) {
    // Animazione + log (se richiesti)
    if (animazione) {
      aggiungiAnimazioneClick(this, nomeAzione);
    } else if (nomeAzione) {
      log.debug(`🖱️ Click "${nomeAzione}"`);
    }

    // Esegui handler con contesto corretto
    handler.call(this, e);
  });

  return elemento;
}

/**
 * Abilita o disabilita una lista di elementi DOM
 *
 * @param {string[]} elementIds - Array di ID elementi
 * @param {boolean} abilitato - true = abilita, false = disabilita
 */
function abilitaElementi(elementIds, abilitato) {
  elementIds.forEach(id => {
    const elemento = document.getElementById(id);
    if (elemento) {
      elemento.disabled = !abilitato;
    }
  });
}

/**
 * Nasconde un elemento aggiungendo classe 'hidden'
 *
 * @param {HTMLElement} elemento - Elemento da nascondere
 */
function nascondiElemento(elemento) {
  if (elemento) {
    elemento.classList.add('hidden');
  }
}

/**
 * Mostra un elemento rimuovendo classe 'hidden'
 *
 * @param {HTMLElement} elemento - Elemento da mostrare
 */
function mostraElemento(elemento) {
  if (elemento) {
    elemento.classList.remove('hidden');
  }
}

/**
 * CountdownTimer - Classe base riutilizzabile per gestione countdown
 *
 * Centralizza la logica comune per timer con countdown visibile.
 * Elimina duplicazione tra GestoreTimeout, GestoreManutenzione e timeout porta.
 *
 * @example
 * const timer = new CountdownTimer(20, (secondi) => {
 *   console.log(`Rimangono ${secondi}s`);
 * }, () => {
 *   console.log('Timeout scaduto!');
 * });
 * timer.avvia();
 */
class CountdownTimer {
  /**
   * @param {number} durataSecondi - Durata countdown in secondi
   * @param {Function} onTick - Callback chiamato ogni secondo con secondi rimanenti
   * @param {Function} onComplete - Callback chiamato al termine del countdown
   */
  constructor(durataSecondi, onTick = null, onComplete = null) {
    this.durata = durataSecondi;
    this.onTick = onTick;
    this.onComplete = onComplete;
    this.timer = null;
    this.intervallo = null;
    this.secondiRimanenti = durataSecondi;
    this._isRunning = false;
  }

  /**
   * Avvia il countdown
   * Se già in esecuzione, viene prima fermato e poi riavviato
   */
  avvia() {
    // Se già in esecuzione, ferma prima
    if (this._isRunning) {
      this.ferma();
    }

    this.secondiRimanenti = this.durata;
    this._isRunning = true;

    // Chiama onTick immediatamente per mostrare stato iniziale
    if (this.onTick) {
      this.onTick(this.secondiRimanenti);
    }

    // Timer principale: scatta al termine del countdown
    this.timer = setTimeout(() => {
      this._isRunning = false;
      if (this.onComplete) {
        this.onComplete();
      }
    }, this.durata * 1000);

    // Intervallo: aggiorna ogni secondo
    this.intervallo = setInterval(() => {
      this.secondiRimanenti--;

      if (this.onTick) {
        this.onTick(this.secondiRimanenti);
      }

      // Ferma intervallo quando raggiunge 0
      if (this.secondiRimanenti <= 0) {
        if (this.intervallo) {
          clearInterval(this.intervallo);
          this.intervallo = null;
        }
      }
    }, 1000);

    log.debug(`⏱️ CountdownTimer avviato: ${this.durata}s`);
  }

  /**
   * Ferma il countdown e pulisce i timer
   * Alias per reset() per compatibilità con codice esistente
   */
  ferma() {
    this.reset();
  }

  /**
   * Resetta il countdown e pulisce i timer
   */
  reset() {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }

    if (this.intervallo) {
      clearInterval(this.intervallo);
      this.intervallo = null;
    }

    this._isRunning = false;
    this.secondiRimanenti = this.durata;

    log.debug('⏱️ CountdownTimer fermato');
  }

  /**
   * Verifica se il countdown è in esecuzione
   * @returns {boolean}
   */
  isRunning() {
    return this._isRunning;
  }

  /**
   * Ottiene i secondi rimanenti
   * @returns {number}
   */
  getSecondiRimanenti() {
    return this.secondiRimanenti;
  }
}
