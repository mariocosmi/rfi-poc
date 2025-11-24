/**
 * Gettoniera - Simulazione gettoniera per pagamento con monete
 * Gestisce inserimento monete e calcolo importo rimanente
 * 
 * Refactoring: Usa centesimi internamente per evitare errori floating point
 */

class Gettoniera {
  constructor(importoRichiesto = 1.20) {
    // Converti importo richiesto in centesimi
    this.importoRichiestoCents = Math.round(importoRichiesto * 100);
    this.importoInseritoCents = 0;
    this.moneteInserite = []; // Mantiene valori originali in Euro per log/display

    // FEATURE 003: Saldo totale cassetta (non si azzera al reset)
    this.saldoCassettaCents = 0;

    // Tagli monete disponibili (in centesimi)
    this.tagliDisponibiliCents = [100, 50, 20, 10, 5, 2, 1];

    log.info(`💰 Gettoniera inizializzata - Importo richiesto: ${Gettoniera.formattaImporto(this.importoRichiestoCents / 100)}`);
  }

  /**
   * Inserisci una moneta
   * @param {number} valore - Valore moneta in euro (es. 0.50)
   * @returns {boolean} true se inserimento riuscito
   */
  inserisciMoneta(valore) {
    // Converti in centesimi per validazione e calcoli
    const valoreCents = Math.round(valore * 100);

    // Verifica che sia un taglio valido
    if (!this.tagliDisponibiliCents.includes(valoreCents)) {
      log.warn(`⚠️ Taglio moneta non valido: ${Gettoniera.formattaImporto(valore)}`);
      return false;
    }

    // Inserisci moneta (pagamento corrente + cassetta)
    this.importoInseritoCents += valoreCents;
    this.moneteInserite.push(valore);
    this.saldoCassettaCents += valoreCents;

    const rimanente = this.getImportoRimanente();

    log.info(`💰 Moneta inserita: ${Gettoniera.formattaImporto(valore)} | Totale: ${Gettoniera.formattaImporto(this.importoInseritoCents / 100)} | Rimanente: ${Gettoniera.formattaImporto(rimanente)} | Saldo cassetta: ${Gettoniera.formattaImporto(this.saldoCassettaCents / 100)}`);

    // Aggiorna display saldo cassetta
    this.aggiornaSaldoCassetta();

    return true;
  }

  /**
   * Ottieni importo rimanente da versare
   * @returns {number} Importo rimanente in Euro (0 se pagamento completato)
   */
  getImportoRimanente() {
    const rimanenteCents = this.importoRichiestoCents - this.importoInseritoCents;
    return Math.max(0, rimanenteCents / 100);
  }

  /**
   * Verifica se pagamento è completato
   * @returns {boolean} true se importo inserito >= importo richiesto
   */
  isPagamentoCompletato() {
    return this.importoInseritoCents >= this.importoRichiestoCents;
  }

  /**
   * Ottieni importo inserito
   * @returns {number} Importo totale inserito in Euro
   */
  getImportoInserito() {
    return this.importoInseritoCents / 100;
  }

  /**
   * Ottieni lista monete inserite
   * @returns {number[]} Array di valori monete inserite (in Euro)
   */
  getMoneteInserite() {
    return [...this.moneteInserite];
  }

  /**
   * Reset gettoniera (nuovo pagamento)
   * NOTA: Azzera solo importo corrente, NON il saldo cassetta
   */
  reset() {
    const vecchioImportoCents = this.importoInseritoCents;

    this.importoInseritoCents = 0;
    this.moneteInserite = [];
    // NON azzerare this.saldoCassettaCents - rimane in cassetta!

    if (vecchioImportoCents > 0) {
      log.debug(`💰 Gettoniera resettata (importo precedente: ${Gettoniera.formattaImporto(vecchioImportoCents / 100)}) - Saldo cassetta: ${Gettoniera.formattaImporto(this.saldoCassettaCents / 100)}`);
    }
  }

  /**
   * Formatta importo per display
   * @param {number} importo - Importo da formattare in Euro
   * @returns {string} Importo formattato (es. "1,20 €")
   */
  static formattaImporto(importo) {
    return importo.toFixed(2).replace('.', ',') + '€';
  }

  /**
   * Ottieni importo inserito in centesimi (per testing/precisione)
   * @returns {number} Importo in centesimi (intero)
   */
  getImportoInseritoCents() {
    return this.importoInseritoCents;
  }

  /**
   * Ottieni importo rimanente in centesimi (per testing/precisione)
   * @returns {number} Importo rimanente in centesimi (intero)
   */
  getImportoRimanenteCents() {
    return this.importoRichiestoCents - this.importoInseritoCents;
  }

  /**
   * FEATURE 003 (T022): Ottieni saldo monete corrente nella cassetta
   * @returns {number} Saldo totale monete in cassetta (euro)
   */
  getSaldoMonete() {
    const saldo = this.saldoCassettaCents / 100;
    log.debug(`💰 Saldo monete cassetta: ${Gettoniera.formattaImporto(saldo)}`);
    return saldo;
  }

  /**
   * FEATURE 003 (T023): Azzera saldo cassetta monete
   * Simula svuotamento fisico della cassetta
   * @returns {number} Saldo azzerato (per logging operazione)
   */
  azzeraSaldo() {
    const saldoPrecedente = this.getSaldoMonete();

    if (this.saldoCassettaCents <= 0) {
      log.info(`💰 Azzeramento saldo cassetta: già a ${Gettoniera.formattaImporto(0)}`);
      return 0;
    }

    // Azzera SOLO saldo cassetta, non importo corrente
    this.saldoCassettaCents = 0;

    // Aggiorna display saldo cassetta
    this.aggiornaSaldoCassetta();

    log.warn(`💰 Saldo cassetta azzerato: ${Gettoniera.formattaImporto(saldoPrecedente)} → ${Gettoniera.formattaImporto(0)}`);
    return saldoPrecedente;
  }

  /**
   * Aggiorna display saldo cassetta nel pannello admin
   */
  aggiornaSaldoCassetta() {
    const elementoSaldo = document.getElementById('saldo-cassetta-valore');
    if (elementoSaldo) {
      const saldo = this.getSaldoMonete();
      const saldoFormattato = Gettoniera.formattaImporto(saldo);
      elementoSaldo.textContent = `${saldoFormattato}`;
      log.debug(`💰 Display saldo cassetta aggiornato: ${saldoFormattato}`);
    }
  }
}

// Export globale
window.Gettoniera = Gettoniera;

log.info('✅ Gettoniera caricata (versione precisione centesimi)');

