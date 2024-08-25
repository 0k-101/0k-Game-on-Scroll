import { useDrag } from 'react-dnd';
import { HandContext } from '../routes/GameRoute';
import { useContext } from 'react';
import CardTypes from '../constants/CardTypes';

// will be deleted
//import { HandContext } from '../routes/TestRoute';

export default function Card(props) {
    const { hand, setHand, socket } = useContext(HandContext);

    const [{ isDragging }, drag] = useDrag(() => ({
        type: props.cardType,
        item: { cardId: props.cardId },
        canDrag: !props.undraggable,
        collect: monitor => ({
            isDragging: !!monitor.isDragging(),
        }),
        end: (item, monitor) => {
            const dropResult = monitor.getDropResult();

            if (!dropResult && (props.cardType === CardTypes.IN_LEFT_PILE || props.cardType === CardTypes.IN_MID_PILE)) {
                // If the card is not dropped on a valid slot, place it to the first availiable space on the hand
                if (hand.didDrawCard) {
                    // trigger alert 1
                    return;
                }
                if (!hand.isTurn) {
                    // trigger alert 2
                    return;
                }

                const newHand = { ...hand };
                for (let idx = 0; idx < newHand.cardSlots.length; idx++) {
                    if (newHand.cardSlots[idx] === 0) {
                        if (props.cardType === CardTypes.IN_MID_PILE) {
                            newHand.cardSlots[idx] = 200;
                            newHand.didDrawCard = true;
                            drawCardFromMid(socket, newHand);
                        } else {
                            newHand.cardSlots[idx] = item.cardId;
                            newHand.leftPile.splice(-1, 1); // Remove the last card from the left pile
                            newHand.didDrawCard = true;
                            emitDrawCardLeft(socket, newHand);
                        }
                        break;
                    }
                }
                return;
            } else if (dropResult) {
                if ((!hand.isTurn || hand.didDrawCard) && (props.cardType === CardTypes.IN_MID_PILE || props.cardType === CardTypes.IN_LEFT_PILE)) {
                    // @TODO:
                    // trigger alert 1
                    return;
                }

                const { slotIdx: targetSlotIdx } = dropResult;
                const newHand = { ...hand };
                const cardId = props.cardId;

                // If the card is drawn from left or mid pile
                if (props.cardType === CardTypes.IN_LEFT_PILE) {
                    newHand.leftPile.splice(newHand.leftPile.length - 1, 1); // Remove the last card from the left pile
                    newHand.didDrawCard = true;
                    // edited : emitDrawCardLeft(socket,newHand);
                } else if (props.cardType === CardTypes.IN_HAND || props.cardType === CardTypes.IN_MID_PILE) {
                    let sourceSlotIdx;
                    if (props.cardType === CardTypes.IN_MID_PILE) {
                        // if card drawn from mid
                        sourceSlotIdx = -1;
                    } else {
                        // If the card is moved from one slot to another
                        sourceSlotIdx = newHand.cardSlots.findIndex(slot => slot === item.cardId);
                    }

                    // If the card is dropped to the discard pile
                    if (targetSlotIdx === `discard_pile_slot_idx`) {

                        if (sourceSlotIdx === -1) {
                            // trigger alert 0
                            return
                        }

                        if (!newHand.isTurn) {
                            // trigger alert 1
                            return;
                        }
                        if (!newHand.didDrawCard) {
                            // trigger alert 2
                            return;
                        }

                        // Remove the card from the source slot
                        newHand.cardSlots[sourceSlotIdx] = 0;
                        newHand.rightPile.push(cardId);
                        newHand.isTurn = false;
                        setHand(newHand);
                        emitNextTurn(socket, newHand, item.cardId);
                        return;
                    } else if (sourceSlotIdx !== -1) {
                        // Remove the card from the source slot
                        newHand.cardSlots[sourceSlotIdx] = 0;
                    }

                }

                // If the target slot is empty
                if (newHand.cardSlots[targetSlotIdx] === 0) {
                    newHand.cardSlots[targetSlotIdx] = cardId;
                    if (props.cardType === CardTypes.IN_MID_PILE) {
                        newHand.didDrawCard = true;
                        drawCardFromMid(socket, newHand, targetSlotIdx);
                        return;
                    } else if (props.cardType === CardTypes.IN_LEFT_PILE) {
                        newHand.didDrawCard = true;
                        emitDrawCardLeft(socket, newHand);
                        setHand(newHand);
                        return;
                    }
                } else {
                    // If the target slot is not empty
                    // Shift cards to right or left
                    // To decide the direction, assess the weight of the both sides
                    let leftIdx = targetSlotIdx - 1;
                    let rightIdx = targetSlotIdx + 1;
                    // To determine the row that card's being dropped
                    const leftBoundary = targetSlotIdx > 14 ? 14 : -1;
                    const rightBoundary = targetSlotIdx > 14 ? 30 : 15;

                    // Find the left weight
                    for (leftIdx; leftIdx > leftBoundary; leftIdx--) {
                        if (newHand.cardSlots[leftIdx] === 0) {
                            break;
                        }
                    }
                    // Find the right weight
                    for (rightIdx; rightIdx < rightBoundary; rightIdx++) {
                        if (newHand.cardSlots[rightIdx] === 0) {
                            break;
                        }
                    }
                    // Decide the direction
                    if (rightIdx === rightBoundary || leftIdx === leftBoundary) {
                        // if one of the sides are out of boundary
                        if (rightIdx === rightBoundary && leftIdx !== leftBoundary) {
                            // shift to left 
                            newHand.cardSlots.splice(leftIdx, 1);
                            newHand.cardSlots.splice(targetSlotIdx, 0, cardId);
                        } else if (rightIdx !== rightBoundary && leftIdx === leftBoundary) {
                            // shift to right 
                            newHand.cardSlots.splice(rightIdx, 1);
                            newHand.cardSlots.splice(targetSlotIdx, 0, cardId);
                        } else {
                            // row is full, need to overflow to the right
                            const tempLastCardId = rightIdx === 30 ? newHand.cardSlots[29] : newHand.cardSlots[14];

                            newHand.cardSlots.splice(rightIdx === 30 ? 29 : 14, 1);
                            newHand.cardSlots.splice(targetSlotIdx, 0, cardId);

                            rightIdx %= 30;
                            while (newHand.cardSlots[rightIdx]) {
                                rightIdx++;
                            }
                            newHand.cardSlots[rightIdx] = tempLastCardId;
                        }

                    } else if (rightIdx - targetSlotIdx <= targetSlotIdx - leftIdx) {
                        // Shift to right
                        newHand.cardSlots.splice(rightIdx, 1);
                        newHand.cardSlots.splice(targetSlotIdx, 0, cardId);

                    } else {
                        // shift to left 
                        newHand.cardSlots.splice(leftIdx, 1);
                        newHand.cardSlots.splice(targetSlotIdx, 0, cardId);
                    }

                }
                // set the newHand
                if (props.cardType === CardTypes.IN_MID_PILE) {
                    newHand.didDrawCard = true;
                    drawCardFromMid(socket, newHand);
                } else if (props.cardType === CardTypes.IN_LEFT_PILE) {
                    newHand.didDrawCard = true;
                    emitDrawCardLeft(socket, newHand);
                }
                setHand(newHand);

            }
        }
    }), [hand, setHand, props.cardId, props.cardType, props.undraggable]);

    function emitNextTurn(socket, hand, cardId) {
        socket.emit('next-turn-from-client', hand, cardId);
    }

    function emitDrawCardLeft(socket, newHand) {
        socket.emit('draw-card-left-from-client', newHand);
    }

    function drawCardFromMid(socket, newHand, targetSlotIdx) {
        socket.emit('draw-card-mid-request', newHand, targetSlotIdx);
    }

    const colorStrId = props.cardId % 53;
    const colorStr =
        props.cardId === 200 ? 'back-turned' :
            colorStrId === 0 ? 'joker' :
                colorStrId <= 13 ? 'gri' :
                    colorStrId <= 26 ? 'mavi' :
                        colorStrId <= 39 ? 'yesil' : 'turuncu'


    const cardImg = require(`../assets/cards/${colorStr}${colorStr === `back-turned` || colorStr === `joker` ? `` : props.cardId % 13 === 0 ? 13 : props.cardId % 13}.png`);

    const handleClick =
        props.cardType === CardTypes.IN_DISCARD ? () => alert(`You cannot pick a card from the discard pile! ${props.cardType}`) :
            !hand.isTurn ? (props.cardType === CardTypes.IN_HAND ? null : () => alert('It is not your turn!')) :
                props.undraggable ? () => alert('You can only draw one card per turn!') : null

    return (
        <div className={props.cardType === CardTypes.OKEY_CARD ? 'game-card okey-card' : 'game-card'}
            ref={drag}
            style={{
                opacity: isDragging ? 0 : 1,
                transform: isDragging ? 'translateY(-10%)' : 'translateY(0%)',
                cursor: props.undraggable ? props.cardType === CardTypes.IN_DISCARD ? 'not-allowed' : 'help' : 'pointer',
            }}
            onClick={handleClick}
        >
            <img src={cardImg} alt="Game Card" draggable={false} />
        </div>
    );
}