import { Button } from 'react-bootstrap'
const spliceHand = (hand) => {
    let cleanHands = []
    let cleanHand = []
    for (let i = 0; i < hand.length; i++) {
        if (hand[i] !== 0) {
            cleanHand.push(hand[i])
        }
        else if (cleanHand.length > 2) {
            cleanHands.push(cleanHand.sort((a, b) => a - b))
            cleanHand = []
        }
    }
    return cleanHands
}

const checkForSequence = (hand, okeyId) => {
    for (let i = 0; i < hand.length - 1; i++) {
        let leftcard = hand[i] % 53
        let rightcard = hand[i + 1] % 53
        if (leftcard === okeyId) {
            leftcard = hand[i + 1] - 1 % 53

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
    }
    return true
}


const checkForSameColor = (hand, okeyId) => {
    let uniqueColors = []
    for (let i = 0; i < hand.length - 1; i++) {
        let leftcard = hand[i] % 53
        let rightcard = hand[i + 1] % 53
        let leftColor = Math.trunc(leftcard / 13)
        let rightColor = Math.trunc(rightcard / 13)
        if (leftColor == rightColor) {
            return false
        }
        else if (leftcard % 13 === rightcard % 13) {
            uniqueColors.push(leftColor)
            uniqueColors.push(rightColor)
        }
        else if (leftcard === okeyId || rightcard === okeyId) {
            uniqueColors.push(rightColor)
            uniqueColors.push(5)
        }
    }
    for (let i = 0; i < uniqueColors.length - 1; i++) {
        if (uniqueColors[i] === uniqueColors[i + 1]) {
            return false
        }
    }
}

const perFinder = (hand, okeyId) => {
    okeyId = 26 // mavi 13 
    let row1 = hand.splice(0, 15)
    let row2 = hand.splice(0, 15)
    let upper = spliceHand(row1)
    let lower = spliceHand(row2)
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
    // console.log('Possible pers', pers)
    return pers
}
export default function PerFinder({ hand }) {
    const pers = perFinder([...hand]);
    console.log(pers);
    return (
        <>
            <h2 style={{ position: 'absolute', left: '20%' }}>Path Finder {pers.length} </h2>
            <Button className='btn btn-danger open-hand-btn' disabled>Open your hand!</Button>
        </>
    );
}