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
  setTimeout(() => elemento.classList.remove('clicked'), 200);
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

  elemento.addEventListener('click', function(e) {
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
