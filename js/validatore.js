/**
 * Validatore - Regole hardcoded per validazione codici e carte
 *
 * Regole:
 * - Codici QR/Carte autorizzate: numeri da 1 a 99
 * - Carte di credito: solo VISA (numero inizia con "4")
 */

class Validatore {
  /**
   * Verifica se un codice QR o carta contactless è autorizzato
   * @param {string} codice - Il codice da verificare
   * @returns {boolean} true se autorizzato (1-99), false altrimenti
   */
  static isCodiceAutorizzato(codice) {
    const num = parseInt(codice, 10);
    const isValid = !isNaN(num) && num >= 1 && num <= 99;

    log.debug(`Validatore.isCodiceAutorizzato("${codice}"): ${isValid ? 'AUTORIZZATO' : 'NON AUTORIZZATO'}`);

    return isValid;
  }

  /**
   * Verifica se una carta di credito è VISA
   * @param {string} numeroCarta - Il numero della carta
   * @returns {boolean} true se VISA (inizia con "4"), false altrimenti
   */
  static isCartaVISA(numeroCarta) {
    if (typeof numeroCarta !== 'string' || numeroCarta.length === 0) {
      log.debug(`Validatore.isCartaVISA: formato non valido`);
      return false;
    }

    const isVisa = numeroCarta.startsWith('4');

    log.debug(`Validatore.isCartaVISA("${numeroCarta}"): ${isVisa ? 'VISA' : 'NON VISA'}`);

    return isVisa;
  }

  /**
   * Verifica se una carta è valida (VISA + lunghezza minima)
   * @param {string} numeroCarta - Il numero della carta
   * @returns {boolean} true se carta valida, false altrimenti
   */
  static isCartaValida(numeroCarta) {
    if (typeof numeroCarta !== 'string') {
      return false;
    }

    const isVisa = this.isCartaVISA(numeroCarta);
    const hasValidLength = numeroCarta.length >= 13 && numeroCarta.length <= 19;
    const isValid = isVisa && hasValidLength;

    log.debug(`Validatore.isCartaValida("${numeroCarta}"): ${isValid}`);

    return isValid;
  }
}

// Export per uso globale
window.Validatore = Validatore;

log.info('✅ Validatore caricato - Regole: codici 1-99, solo VISA per pagamenti');
