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
    Array.from({length: 60}, () => 0),
    Array.from({length: 60}, () => 0),
    Array.from({length: 60}, () => 0),
    Array.from({length: 60}, () => 0)
];

export { InitialTables };
