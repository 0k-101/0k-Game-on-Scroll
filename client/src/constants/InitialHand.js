const InitialHand = {
    playerIdx: -1,
    whoseTurn: 0,
    isTurn: false,
    didDrawCard: false,
    hasOpened:false,
    tables:[
        Array.from({length: 50}, () => 0),
        Array.from({length: 50}, () => 0),
        Array.from({length: 50}, () => 0),
        Array.from({length: 50}, () => 0)
    ],
    cardSlots:Array.from({length: 30}, () => 0),
    leftPile: [],
    rightPile: [],
    oppRightPile: [],
    oppLeftPile: [],
}

export default InitialHand;