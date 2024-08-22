import { Button } from 'react-bootstrap'

const spliceHand = (hand, okeyId) => {
    let cleanHands = []
    let cleanHand = []
    for (let i = 0; i < hand.length; i++) {
        if (hand[i] !== 0) {
            cleanHand.push(hand[i])
        }
        else if (hand[i] == 0 && cleanHand.length > 2) {
            if (cleanHand.includes(okeyId)) {
                cleanHands.push(cleanHand)
            }
            else {
                cleanHands.push(cleanHand.sort((a, b) => a - b))
            }
            cleanHand = []
        }
        else if (hand[i] == 0 && cleanHand.length < 3) {
            cleanHand = []
        }
    }
    if (cleanHand.length > 2) {
        cleanHands.push(cleanHand.sort((a, b) => a - b))
    }
    return cleanHands
}

const checkForSequence = (hand, okeyId) => {
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
        }
        if (rightcard === okeyId) {
            rightcard = hand[i] + 1 % 53
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
    return true
}


const checkForSameColor = (hand, okeyId) => {
    let uniqueColors = []
    let cardValue = hand[0] % 13
    for (let i = 0; i < hand.length - 1; i++) {
        if (hand[i] === 53 || hand[i] === 106) {
            hand[i] = okeyId
        }
        if (hand[i + 1] === 53 || hand[i + 1] === 106) {
            hand[i + 1] = okeyId
        }
        let cardColor = Math.trunc(hand[i] / 13)
        let _cardValue = hand[i] % 13
        if (cardValue != _cardValue) return false
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
        if (checkForSequence(hand, okeyId) || checkForSameColor(hand, okeyId)) {
            pers.push(hand)
        }
    })
    lower.forEach(hand => {
        if (checkForSequence(hand, okeyId) || checkForSameColor(hand, okeyId)) {
            pers.push(hand)
        }
    })
    points = pointCalculator(pers)
    return ({ pers , points })
}
export default function PerFinder({ hand }) {
    const {pers, points} = perFinder([...hand]);
    return (
        <>
            <h2 style={{ position: 'absolute', left: '20%' }}>Per Finder {pers?.length} , pts: {points} </h2>
            <Button className='btn btn-danger open-hand-btn' disabled>Open your hand!</Button>
        </>
    );
}