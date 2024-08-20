import { Button } from 'react-bootstrap'

const spliceHand = (hand, okeyId) => {
    let cleanHands = []
    let cleanHand = []
    for (let i = 0; i < hand.length; i++) {
        if (hand[i] !== 0) {
            cleanHand.push(hand[i])
        }
        else if (hand[i] == 0 && cleanHand.length > 2) {
            console.log('Cleanhand', cleanHand)
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
    console.log('Hand', hand)
    for (let i = 0; i < hand.length - 1; i++) {
        if (hand[i] === 53 || hand[i] === 106) {
            console.log('fake okey found, new hand is', hand)
            hand[i] = okeyId
        }
        if (hand[i + 1] === 53 || hand[i + 1] === 106) {
            console.log('fake okey found')
            hand[i + 1] = okeyId
            console.log('fake okey found, new hand is', hand)

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
                console.log('Leftcard', leftcard)
                console.log('Rightcard', rightcard)
                return false
            }
            else if (leftcard % 13 === 0 && rightcard % 13 === 1) {
                console.log('Leftcard1', leftcard)
                console.log('Rightcard1', rightcard)
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
    console.log('Unique colors', uniqueColors)
    return true
}

const perFinder = (hand, okeyId) => {
    okeyId = 26 // mavi 13 
    let row1 = hand.splice(0, 15)
    let row2 = hand.splice(0, 15)
    let upper = spliceHand(row1, okeyId)
    let lower = spliceHand(row2, okeyId)
    console.log('Upper', upper)
    console.log('Lower', lower)
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
    console.log('Possible pers', pers)
    return pers
}
export default function PerFinder({ hand }) {
    const pers = perFinder([...hand]);
    console.log(pers);
    return (
        <>
            <h2 style={{ position: 'absolute', left: '20%' }}>Per Finder {pers.length} </h2>
            <Button className='btn btn-danger open-hand-btn' disabled>Open your hand!</Button>
        </>
    );
}