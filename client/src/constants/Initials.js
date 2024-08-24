export const InitialHand = {
    playerIdx: -1,
    whoseTurn: 0,
    isTurn: false,
    didDrawCard: true,
    hasOpened:false,
    
    cardSlots:Array.from({length: 30}, () => 0),
    leftPile: [],
    rightPile: [],
    oppRightPile: [],
    oppLeftPile: [],
}

const InitialTables = [
    Array.from({length: 50}, () => 0),
    Array.from({length: 50}, () => 0),
    Array.from({length: 50}, () => 0),
    Array.from({length: 50}, () => 0)
];

InitialTables[2][5] = 70;
InitialTables[2][6] = 71;
InitialTables[2][7] = 72;
InitialTables[2][14] = 53;
InitialTables[2][15] = 105;
InitialTables[2][16] = 105;
InitialTables[2][17] = 105;
InitialTables[2][18] = 105;
InitialTables[2][19] = 105;
InitialTables[2][20] = 105;
InitialTables[2][21] = 105;
InitialTables[2][22] = 105;



export { InitialTables };
