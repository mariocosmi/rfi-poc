/**
 * Gettoniera - Simulazione gettoniera per pagamento con monete
 * Gestisce inserimento monete e calcolo importo rimanente
 */

class Gettoniera {
  constructor(importoRichiesto = 1.20) {
    this.importoRichiesto = importoRichiesto;
    this.importoInserito = 0;
    this.moneteInserite = [];

    // Tagli monete disponibili (in euro)
    this.tagliDisponibili = [1.00, 0.50, 0.20, 0.10, 0.05, 0.02, 0.01];

    log.info(`💰 Gettoniera inizializzata - Importo richiesto: ${this.importoRichiesto.toFixed(2)}€`);
  }

  /**
   * Inserisci una moneta
   * @param {number} valore - Valore moneta in euro
   * @returns {boolean} true se inserimento riuscito
   */
  inserisciMoneta(valore) {
    // Verifica che sia un taglio valido
    if (!this.tagliDisponibili.includes(valore)) {
      log.warn(`⚠️ Taglio moneta non valido: ${valore}€`);
      return false;
    }

    // Inserisci moneta
    this.importoInserito += valore;
    this.moneteInserite.push(valore);

    const rimanente = this.getImportoRimanente();

    log.info(`💰 Moneta inserita: ${valore.toFixed(2)}€ | Totale: ${this.importoInserito.toFixed(2)}€ | Rimanente: ${rimanente.toFixed(2)}€`);

    return true;
  }

  /**
   * Ottieni importo rimanente da versare
   * @returns {number} Importo rimanente (0 se pagamento completato)
   */
  getImportoRimanente() {
    const rimanente = this.importoRichiesto - this.importoInserito;
    // Arrotonda a 2 decimali per evitare problemi float
    return Math.max(0, Math.round(rimanente * 100) / 100);
  }

  /**
   * Verifica se pagamento è completato
   * @returns {boolean} true se importo inserito >= importo richiesto
   */
  isPagamentoCompletato() {
    return this.getImportoRimanente() <= 0;
  }

  /**
   * Ottieni importo inserito
   * @returns {number} Importo totale inserito
   */
  getImportoInserito() {
    return Math.round(this.importoInserito * 100) / 100;
  }

  /**
   * Ottieni lista monete inserite
   * @returns {number[]} Array di valori monete inserite
   */
  getMoneteInserite() {
    return [...this.moneteInserite];
  }

  /**
   * Reset gettoniera (nuovo pagamento)
   */
  reset() {
    const vecchioImporto = this.importoInserito;

    this.importoInserito = 0;
    this.moneteInserite = [];

    if (vecchioImporto > 0) {
      log.debug(`💰 Gettoniera resettata (importo precedente: ${vecchioImporto.toFixed(2)}€)`);
    }
  }

  /**
   * Formatta importo per display
   * @param {number} importo - Importo da formattare
   * @returns {string} Importo formattato (es. "1,20 €")
   */
  static formattaImporto(importo) {
    return importo.toFixed(2).replace('.', ',') + ' €';
  }

  /**
   * Ottieni saldo monete corrente (T022)
   * @returns {number} Saldo totale monete in cassetta (euro)
   */
  getSaldoMonete() {
    const saldo = this.importoInserito;
    log.debug(`💰 Saldo monete richiesto: ${saldo.toFixed(2)}€`);
    return Math.round(saldo * 100) / 100;
  }

  /**
   * Azzera saldo monete (T023)
   * Simula svuotamento fisico della cassetta
   * @returns {number} Saldo azzerato (per logging operazione)
   */
  azzeraSaldo() {
    const saldoPrecedente = this.getSaldoMonete();

    if (saldoPrecedente <= 0) {
      log.info('💰 Azzeramento saldo: già a 0€');
      return 0;
    }

    this.importoInserito = 0;
    this.moneteInserite = [];

    log.warn(`💰 Saldo azzerato: ${saldoPrecedente.toFixed(2)}€ → 0,00€`);
    return saldoPrecedente;
  }
}

// Export globale
window.Gettoniera = Gettoniera;

log.info('✅ Gettoniera caricata');
