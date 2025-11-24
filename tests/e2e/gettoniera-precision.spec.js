const { test, expect } = require('@playwright/test');

test.describe('Gettoniera - Precisione Valuta', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        // Attendi inizializzazione
        await page.waitForFunction(() => window.app && window.Gettoniera);
    });

    test('Dovrebbe gestire correttamente la somma di 0.10 + 0.20 usando interi', async ({ page }) => {
        const result = await page.evaluate(() => {
            const g = new window.Gettoniera(1.00);
            g.inserisciMoneta(0.10);
            g.inserisciMoneta(0.20);
            return {
                inseritoCents: g.getImportoInseritoCents(),
                rimanenteCents: g.getImportoRimanenteCents(),
                monete: g.getMoneteInserite()
            };
        });

        // Verifica su INTERI: 10 + 20 = 30
        expect(result.inseritoCents).toBe(30);
        expect(result.rimanenteCents).toBe(70); // 100 - 30
        expect(result.monete).toEqual([0.10, 0.20]);
    });

    test('Dovrebbe gestire correttamente il completamento esatto del pagamento', async ({ page }) => {
        const result = await page.evaluate(() => {
            const g = new window.Gettoniera(0.30);
            g.inserisciMoneta(0.10);
            g.inserisciMoneta(0.20);
            return {
                completato: g.isPagamentoCompletato(),
                rimanenteCents: g.getImportoRimanenteCents()
            };
        });

        expect(result.completato).toBe(true);
        expect(result.rimanenteCents).toBe(0);
    });

    test('Dovrebbe gestire correttamente importi complessi', async ({ page }) => {
        const result = await page.evaluate(() => {
            // 1.20 euro
            const g = new window.Gettoniera(1.20);
            // Inseriamo monete che potrebbero causare problemi
            g.inserisciMoneta(0.50);
            g.inserisciMoneta(0.20);
            g.inserisciMoneta(0.20);
            g.inserisciMoneta(0.20);
            g.inserisciMoneta(0.10);
            // Totale: 1.20
            return {
                inseritoCents: g.getImportoInseritoCents(),
                completato: g.isPagamentoCompletato()
            };
        });

        expect(result.inseritoCents).toBe(120);
        expect(result.completato).toBe(true);
    });
});
