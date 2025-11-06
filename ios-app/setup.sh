#!/bin/bash

# Script di setup per ChioscoApp iOS
# Genera il progetto Xcode usando XcodeGen

set -e  # Exit on error

echo "🚀 Setup ChioscoApp iOS"
echo "======================"
echo ""

# Colori per output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Directory dello script
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

echo -e "${BLUE}📂 Directory corrente: $SCRIPT_DIR${NC}"
echo ""

# Verifica se XcodeGen è installato
if ! command -v xcodegen &> /dev/null; then
    echo -e "${YELLOW}⚠️  XcodeGen non trovato${NC}"
    echo ""
    echo "XcodeGen è necessario per generare il progetto Xcode."
    echo ""
    echo "Opzioni di installazione:"
    echo ""
    echo "1. Con Homebrew (raccomandato):"
    echo -e "   ${GREEN}brew install xcodegen${NC}"
    echo ""
    echo "2. Con Mint:"
    echo -e "   ${GREEN}mint install yonaskolb/XcodeGen${NC}"
    echo ""
    echo "3. Download manuale:"
    echo "   https://github.com/yonaskolb/XcodeGen/releases"
    echo ""
    echo -e "${BLUE}Dopo l'installazione, esegui di nuovo questo script.${NC}"
    echo ""

    # Chiedi se vuole installare con Homebrew
    read -p "Vuoi installare XcodeGen con Homebrew ora? (s/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Ss]$ ]]; then
        if ! command -v brew &> /dev/null; then
            echo -e "${RED}❌ Homebrew non trovato${NC}"
            echo "Installa Homebrew da: https://brew.sh"
            exit 1
        fi

        echo -e "${BLUE}📦 Installazione XcodeGen...${NC}"
        brew install xcodegen

        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✅ XcodeGen installato con successo${NC}"
        else
            echo -e "${RED}❌ Errore durante installazione XcodeGen${NC}"
            exit 1
        fi
    else
        exit 1
    fi
fi

echo -e "${GREEN}✅ XcodeGen trovato: $(which xcodegen)${NC}"
echo ""

# Verifica file project.yml
if [ ! -f "project.yml" ]; then
    echo -e "${RED}❌ File project.yml non trovato${NC}"
    exit 1
fi

echo -e "${BLUE}📄 File project.yml trovato${NC}"
echo ""

# Rimuovi progetto esistente se presente
if [ -d "ChioscoApp.xcodeproj" ]; then
    echo -e "${YELLOW}⚠️  Progetto esistente trovato, rimozione...${NC}"
    rm -rf ChioscoApp.xcodeproj
fi

# Genera progetto con XcodeGen
echo -e "${BLUE}🔨 Generazione progetto Xcode...${NC}"
xcodegen generate

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✅ Progetto generato con successo!${NC}"
    echo ""
    echo -e "${BLUE}📱 Prossimi passi:${NC}"
    echo ""
    echo "1. Apri il progetto in Xcode:"
    echo -e "   ${GREEN}open ChioscoApp.xcodeproj${NC}"
    echo ""
    echo "2. Seleziona un simulatore (es. iPhone 15 Pro)"
    echo ""
    echo "3. Premi ⌘+R per eseguire l'app"
    echo ""
    echo -e "${YELLOW}📝 Note:${NC}"
    echo "   - Se vedi errori di firma codice, vai in Signing & Capabilities"
    echo "   - Seleziona il tuo Team di sviluppo Apple"
    echo "   - Oppure usa 'None' per testing locale"
    echo ""

    # Chiedi se vuole aprire il progetto
    read -p "Vuoi aprire il progetto in Xcode ora? (s/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Ss]$ ]]; then
        open ChioscoApp.xcodeproj
        echo -e "${GREEN}✅ Progetto aperto in Xcode${NC}"
    fi
else
    echo ""
    echo -e "${RED}❌ Errore durante generazione progetto${NC}"
    echo ""
    echo "Verifica:"
    echo "  - File project.yml è valido"
    echo "  - Tutti i file sorgente esistono in ChioscoApp/"
    echo "  - XcodeGen è aggiornato: brew upgrade xcodegen"
    exit 1
fi

echo ""
echo -e "${GREEN}🎉 Setup completato!${NC}"
