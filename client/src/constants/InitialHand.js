const InitialHand = {
    playerIdx: -1,
    whoseTurn: 0,
    isTurn: false,
    didDrawCard: false,
    cardSlots:Array.from({length: 30}, () => 0),
    leftPile: [],
    rightPile: [],
    oppRightPile: [],
    oppLeftPile: [],
}

export default InitialHand;