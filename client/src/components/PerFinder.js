import { Button } from 'react-bootstrap'
import Per from '../constants/Per'
// sahte okey ile renkli per 
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
    let hasOkey = false
    let okeyValue = 0
    let points = 0
    for (let i = 0; i < hand.length - 1; i++) {
        if (hand[i] === 53 || hand[i] === 106) {
            hand[i] = okeyId
        }
        if (hand[i + 1] === 53 || hand[i + 1] === 106) {
            hand[i + 1] = okeyId
        }
        let leftcard = hand[i] % 53
        let rightcard = hand[i + 1] % 53
        if (leftcard === okeyId) {
            leftcard = ((hand[i + 1]) % 53) - 1
            hasOkey = true
            okeyValue = Math.trunc(leftcard / 13)
        }
        if (rightcard === okeyId) {
            rightcard = hand[i] + 1 % 53
            hasOkey = true
            okeyValue = Math.trunc(rightcard / 13)
        }
        if (Math.trunc(leftcard / 13) === Math.trunc(rightcard / 13)) {
            if ((leftcard % 13) + 1 !== rightcard % 13) {
                return false
            }
            else if (leftcard % 13 === 0 && rightcard % 13 === 1) {
                return false
            }
        }
        else if (leftcard % 13 === 12 && rightcard % 13 === 0) {
            continue
        }
        else return false
    }
    if (hasOkey) {
        let cardValue = 0
        for (let i = 0; i < hand.length; i++) {
            if (!hand[i] === okeyId) {
                cardValue = (hand[i] % 13 === 0 ? 13 : hand[i] % 13)
            }
            else if (hand[i] === okeyId && i === 0) {
                cardValue = (hand[i] % 13 === 0 ? 13 : hand[i] % 13) - 1
            }
            points += cardValue
        }
    }
    else {
        for (let i = 0; i < hand.length; i++) {
            let cardValue = (hand[i] % 13 === 0 ? 13 : hand[i] % 13)
            points += cardValue
        }
    }
    return new Per(false, hasOkey, okeyValue, points, hand, hand.length)
}


const checkForSameColor = (hand, okeyId) => {
    let hasOkey = false
    let okeyValue = 0
    let points = 0
    let cardValue = 0
    const cardColors = ['gray', 'blue', 'pink', 'orange']
    if (hand.length > 5 || hand.length < 3) {
        return false
    }
    let uniqueColors = []
    if (hand[0] === okeyId && hand[1] === okeyId) {
        cardValue = hand[2] % 13
    }
    else if (hand[0] === okeyId && hand[1] !== okeyId) {
        cardValue = hand[1] % 13
    }
    else if (hand[0] !== okeyId && hand[1] !== okeyId) {
        cardValue = hand[0] % 13
    }
    for (let i = 0; i < hand.length; i++) {
        if (hand[i] === 53 || hand[i] === 106) {
            let cardColor = cardColors[(Math.trunc(okeyId / 13))]
            let _cardValue = okeyId % 13
            if (cardValue !== _cardValue) return false
            if (uniqueColors.includes(cardColor)) {
                return false
            }
            else uniqueColors.push(cardColor)
        }
        else if (hand[i] === okeyId) {
            if (i === 0) {
                cardValue = hand[i + 1] % 13
                okeyValue = cardValue
            }
            else {
                cardValue = hand[i - 1] % 13
                okeyValue = cardValue
            }
            hasOkey = true
        }
        let cardColor = cardColors[(Math.trunc(hand[i] / 13))]
        let _cardValue = hand[i] % 13
        if (cardValue !== _cardValue) return false
        if (uniqueColors.includes(cardColor)) {
            return false
        }
        else uniqueColors.push(cardColor)
    }
    return true
}

const pointCalculator = (pers) => {
    let points = 0
    pers.forEach(hand => {
        hand.forEach(card => {
            // if (cardId === okeyId) {

            // }
            let cardValue = card % 13
            if (cardValue === 0) cardValue = 13
            points += cardValue
        })
    }
    )
    return points
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