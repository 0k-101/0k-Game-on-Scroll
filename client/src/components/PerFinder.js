import { Button } from 'react-bootstrap'
import Per from '../constants/Per'
// sahte okey ile renkli per 

class Card {
    constructor(cardId, isFakeOkey) {
        this.cardId = cardId
        this.isFakeOkey = isFakeOkey
    }
}

const spliceHand = (hand, okeyId) => {
    let cleanHands = []
    let cleanHand = []
    for (let i = 0; i < hand.length; i++) {
        if (hand[i] !== 0) {
            cleanHand.push(hand[i])
        }
        else if (hand[i] === 0 && cleanHand.length > 2) {
            cleanHands.push(cleanHand)
            cleanHand = []
        }
        else if (hand[i] === 0 && cleanHand.length < 3) {
            cleanHand = []
        }
    }
    if (cleanHand.length > 2) {
        cleanHands.push(cleanHand)
    }
    return cleanHands
}

const checkForSequence = (hand, okeyId) => {
    let cards = []
    let points = 0
    hand.forEach(card => {
        if (card === 53 || card === 106) {
            cards.push(new Card((okeyId % 52 === 0 ? 52 : okeyId % 52), true))
        }
        else {
            cards.push(new Card(card % 52 === 0 ? 52 : card % 52, false))
        }
    })
    for (let i = 0; i < cards.length - 1; i++) {
        if (cards[i].cardId === okeyId && cards[i + 1].cardId === okeyId && cards[i].isFakeOkey === false && cards[i + 1].isFakeOkey === false) {
            if (i === 0) {
                cards[i].cardId = cards[i + 2].cardId - 2
                cards[i + 1].cardId = cards[i + 2].cardId - 1
            }
            else {
                cards[i].cardId = cards[i - 1].cardId + 1
                cards[i + 1].cardId = cards[i - 1].cardId + 2
            }
        }
        else if (cards[i].cardId === okeyId && cards[i + 1].cardId !== okeyId && cards[i].isFakeOkey === false) {
            if (cards[i + 1].cardId % 13 === 1) {
                return false
            }
            cards[i].cardId = cards[i + 1].cardId - 1
        }
        else if (cards[i].cardId !== okeyId && cards[i + 1].cardId === okeyId && cards[i + 1].isFakeOkey === false) {
            if (cards[i].cardId % 13 === 1) {
                return false
            }
            cards[i + 1].cardId = cards[i].cardId + 1
        }
    }

    for (let i = 0; i < cards.length - 1; i++) {
        let leftCardColor = Math.trunc(cards[i].cardId / 13)
        let rightCardColor = Math.trunc(cards[i + 1].cardId / 13)
        if (cards[i].cardId % 13 === 0) {
            leftCardColor = Math.trunc((cards[i].cardId - 1) / 13)
        }
        if (cards[i + 1].cardId % 13 === 0) {
            rightCardColor = Math.trunc((cards[i + 1].cardId - 1) / 13)
        }
        if (leftCardColor !== rightCardColor) {
            return false
        }
        if (cards[i].cardId !== cards[i + 1].cardId - 1) {
            return false
        }
    }
    for (let i = 0; i < cards.length; i++) {
        points += (cards[i].cardId % 13 === 0 ? 13 : cards[i].cardId % 13)
    }
    let per = new Per(false, cards.length, points, hand)
    return per
}


const checkForSameColor = (hand, okeyId) => {
    if (hand.length > 5 || hand.length < 3) {
        return false
    }
    let cards = []
    let okeyCount = 0
    hand.forEach(card => {
        if (card === 53 || card === 106) {
            cards.push(new Card((okeyId % 52 === 0 ? 52 : okeyId % 52), true))
        }
        else if (card === okeyId) {
            okeyCount++
            cards.push(new Card((okeyId % 52 === 0 ? 52 : okeyId % 52), true))
        }
        else {
            cards.push(new Card(card % 52 === 0 ? 52 : card % 52, false))
        }
    })
    let uniqueColors = []
    if (okeyCount === 0) {
        let initialValue = (cards[0].cardId % 13 === 0 ? 13 : cards[0].cardId % 13)
        for (let i = 1; i < cards.length; i++) {
            let cardValue = (cards[i].cardId % 13 === 0 ? 13 : cards[i].cardId % 13)
            if (cardValue !== initialValue) {
                return false
            }
            let cardColor = Math.trunc(cards[i].cardId / 13)
            if (uniqueColors.includes(cardColor)) {
                return false
            }
            else {
                uniqueColors.push(cardColor)
            }
        }
        let points = initialValue * cards.length
        let per = new Per(true, cards.length, points, hand)
        return per
    }
    else if (okeyCount === 1) {
        let okeyIndex = cards.findIndex(card => card.isFakeOkey === true)
        let normalCardIndex = cards.findIndex(card => card.isFakeOkey === false)
        let initialValue = (cards[normalCardIndex].cardId % 13 === 0 ? 13 : cards[0].cardId % 13)
        for (let i = 0; i < cards.length; i++) {
            if (i === okeyIndex) {
                continue
            }
            let cardValue = (cards[i].cardId % 13 === 0 ? 13 : cards[i].cardId % 13)
            if (cardValue !== initialValue) {
                return false
            }
            let cardColor = Math.trunc(cards[i].cardId / 13)
            if (uniqueColors.includes(cardColor)) {
                return false
            }
            else {
                uniqueColors.push(cardColor)
            }
        }
        let points = initialValue * cards.length
        let per = new Per(true, cards.length, points, hand)
        return per
    }
    else if (okeyCount === 2) {
        let okeyIndex1 = cards.findIndex(card => card.isFakeOkey === true)
        let okeyIndex2 = cards.findIndex(card => card.isFakeOkey === true, okeyIndex1 + 1)
        let normalCardIndex = cards.findIndex(card => card.isFakeOkey === false)
        let initialValue = (cards[normalCardIndex].cardId % 13 === 0 ? 13 : cards[0].cardId % 13)
        for (let i = 0; i < cards.length; i++) {
            if (i === okeyIndex1 || i === okeyIndex2) {
                continue
            }
            let cardValue = (cards[i].cardId % 13 === 0 ? 13 : cards[i].cardId % 13)
            if (cardValue !== initialValue) {
                return false
            }
            let cardColor = Math.trunc(cards[i].cardId / 13)
            if (uniqueColors.includes(cardColor)) {
                return false
            }
            else {
                uniqueColors.push(cardColor)
            }
        }
        let points = initialValue * cards.length
        let per = new Per(true, cards.length, points, hand)
        return per
    }
    else {
        return false
    }

}

const perFinder = (hand, okeyId) => {
    let points = 0
    okeyId = 26 // mavi 13 
    let row1 = hand.splice(0, 15)
    let row2 = hand.splice(0, 15)
    let upper = spliceHand(row1, okeyId)
    let lower = spliceHand(row2, okeyId)
    let pers = []

    if (upper.length === 0 && lower.length === 0) {
        return []
    }
    upper.forEach(hand => {
        let possiblePer = checkForSequence(hand, okeyId)
        if (possiblePer) {
            pers.push(possiblePer)
        }
        else {
            possiblePer = checkForSameColor(hand, okeyId)
            if (possiblePer) {
                pers.push(possiblePer)
            }
        }
    })
    lower.forEach(hand => {
        let possiblePer = checkForSequence(hand, okeyId)
        if (possiblePer) {
            pers.push(possiblePer)
        }
        else {
            possiblePer = checkForSameColor(hand, okeyId)
            if (possiblePer) {
                pers.push(possiblePer)
            }
        }
    })
    pers.forEach(per => {
        points += per.perTotalValue
        console.log('Per ', per)
    }
    )
    return ({ pers, points })
}
export default function PerFinder({ hand }) {
    const { pers, points } = perFinder([...hand]);
    return (
        <>
            <h2 style={{ position: 'absolute', left: '20%' }}>Per Finder {pers?.length} , pts: {points} </h2>
            <Button className='btn btn-danger open-hand-btn' disabled>Open your hand!</Button>
        </>
    );
}