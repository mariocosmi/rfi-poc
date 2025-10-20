/**
 * Gettoniera - Simulazione gettoniera per pagamento con monete
 * Gestisce inserimento monete e calcolo importo rimanente
 */

class Gettoniera {
  constructor(importoRichiesto = 1.20) {
    this.importoRichiesto = importoRichiesto;
    this.importoInserito = 0;
    this.moneteInserite = [];

    // FEATURE 003: Saldo totale cassetta (non si azzera al reset)
    this.saldoCassetta = 0;

    // Tagli monete disponibili (in euro)
    this.tagliDisponibili = [1.00, 0.50, 0.20, 0.10, 0.05, 0.02, 0.01];

    log.info(`💰 Gettoniera inizializzata - Importo richiesto: ${Gettoniera.formattaImporto(this.importoRichiesto)}`);
  }

  /**
   * Inserisci una moneta
   * @param {number} valore - Valore moneta in euro
   * @returns {boolean} true se inserimento riuscito
   */
  inserisciMoneta(valore) {
    // Verifica che sia un taglio valido
    if (!this.tagliDisponibili.includes(valore)) {
      log.warn(`⚠️ Taglio moneta non valido: ${Gettoniera.formattaImporto(valore)}`);
      return false;
    }

    // Inserisci moneta (pagamento corrente + cassetta)
    this.importoInserito += valore;
    this.moneteInserite.push(valore);
    this.saldoCassetta += valore;

    const rimanente = this.getImportoRimanente();

    log.info(`💰 Moneta inserita: ${Gettoniera.formattaImporto(valore)} | Totale: ${Gettoniera.formattaImporto(this.importoInserito)} | Rimanente: ${Gettoniera.formattaImporto(rimanente)} | Saldo cassetta: ${Gettoniera.formattaImporto(this.saldoCassetta)}`);

    // Aggiorna display saldo cassetta
    this.aggiornaSaldoCassetta();

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
   * NOTA: Azzera solo importo corrente, NON il saldo cassetta
   */
  reset() {
    const vecchioImporto = this.importoInserito;

    this.importoInserito = 0;
    this.moneteInserite = [];
    // NON azzerare this.saldoCassetta - rimane in cassetta!

    if (vecchioImporto > 0) {
      log.debug(`💰 Gettoniera resettata (importo precedente: ${Gettoniera.formattaImporto(vecchioImporto)}) - Saldo cassetta: ${Gettoniera.formattaImporto(this.saldoCassetta)}`);
    }
  }

  /**
   * Formatta importo per display
   * @param {number} importo - Importo da formattare
   * @returns {string} Importo formattato (es. "1,20 €")
   */
  static formattaImporto(importo) {
    return importo.toFixed(2).replace('.', ',') + '€';
  }

  /**
   * FEATURE 003 (T022): Ottieni saldo monete corrente nella cassetta
   * @returns {number} Saldo totale monete in cassetta (euro)
   */
  getSaldoMonete() {
    const saldo = this.saldoCassetta;
    log.debug(`💰 Saldo monete cassetta: ${Gettoniera.formattaImporto(saldo)}`);
    return Math.round(saldo * 100) / 100;
  }

  /**
   * FEATURE 003 (T023): Azzera saldo cassetta monete
   * Simula svuotamento fisico della cassetta
   * @returns {number} Saldo azzerato (per logging operazione)
   */
  azzeraSaldo() {
    const saldoPrecedente = this.getSaldoMonete();

    if (saldoPrecedente <= 0) {
      log.info(`💰 Azzeramento saldo cassetta: già a ${Gettoniera.formattaImporto(0)}`);
      return 0;
    }

    // Azzera SOLO saldo cassetta, non importo corrente
    this.saldoCassetta = 0;

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

log.info('✅ Gettoniera caricata');
