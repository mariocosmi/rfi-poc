/**
 * Logger - Wrapper per loglevel
 * Configura il sistema di logging per l'applicazione
 *
 * Livelli disponibili:
 * - TRACE (0): Dettagli minuti
 * - DEBUG (1): Informazioni di debug
 * - INFO (2): Informazioni generali (default)
 * - WARN (3): Warning
 * - ERROR (4): Errori
 * - SILENT (5): Nessun log
 */

(function() {
  // Verifica che loglevel sia caricato
  if (typeof log === 'undefined') {
    console.error('❌ ERRORE: loglevel non caricato! Verifica che assets/lib/loglevel.min.js sia presente');
    return;
  }

  // Configura livello di default: INFO
  // Mostra: INFO, WARN, ERROR
  // Nasconde: DEBUG, TRACE
  const defaultLevel = 'INFO';

  // Recupera livello salvato in localStorage (se esiste)
  const savedLevel = localStorage.getItem('chiosco-log-level');
  const level = savedLevel || defaultLevel;

  // Imposta livello
  log.setLevel(level);

  // Personalizza output con prefissi colorati
  const originalFactory = log.methodFactory;
  log.methodFactory = function(methodName, logLevel, loggerName) {
    const rawMethod = originalFactory(methodName, logLevel, loggerName);

    return function() {
      const timestamp = new Date().toLocaleTimeString('it-IT');
      const prefix = `[${timestamp}] [${methodName.toUpperCase()}]`;

      // Prepend timestamp e livello
      const args = [prefix, ...arguments];
      rawMethod.apply(undefined, args);
    };
  };

  // Riapplica livello per attivare methodFactory personalizzato
  log.setLevel(log.getLevel());

  // Salva livello quando cambiato
  const originalSetLevel = log.setLevel;
  log.setLevel = function(level) {
    originalSetLevel.call(log, level);
    localStorage.setItem('chiosco-log-level', log.getLevel());
  };

  // Log iniziale
  log.info('✅ Logger inizializzato');
  log.info(`📊 Livello logging: ${level}`);
  log.info('💡 Per cambiare livello: log.setLevel("debug") | "info" | "warn" | "error"');

  // Helper per debugging rapido
  window.setLogDebug = () => {
    log.setLevel('debug');
    log.info('🔧 Livello logging cambiato a DEBUG');
  };

  window.setLogInfo = () => {
    log.setLevel('info');
    log.info('📊 Livello logging cambiato a INFO');
  };

  window.setLogWarn = () => {
    log.setLevel('warn');
    log.warn('⚠️ Livello logging cambiato a WARN');
  };

  // Export globale
  window.logger = log;
})();
