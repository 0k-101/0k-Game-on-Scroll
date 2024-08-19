import { useContext } from "react";
import { HandContext } from "../routes/GameRoute";

import CardTypes from "../constants/CardTypes";

import Card from "./Card";
import CardSlot from "./CardSlot";
import LeftPile from './LeftPile';
import MidPile from './MidPile';
import RightPile from './RightPile';
import OppRightPile from './OppRightPile'
import OppLeftPile from './OppLeftPile';


export default function Board() {

    const { hand } = useContext(HandContext);
    return (
        <div className='board-container'>
            <div className="flex-container">
                {
                    hand.cardSlots.map((cardId, idx) => {
                        return (
                            <CardSlot key={idx} slotIdx={idx}>
                                {cardId ? <Card cardId={cardId} cardType={CardTypes.IN_HAND } undraggable={false}/> : null}
                            </CardSlot>
                        );
                    })
                }
                <LeftPile>
                    {
                        hand.leftPile.map((cardId,idx) => {
                            let isUndraggable = true;
                            if (idx === hand.leftPile.length - 1 && hand.isTurn && !hand.didDrawCard) {
                                isUndraggable = false;
                            }

                            return <Card key={idx} cardId={cardId} cardType={CardTypes.IN_LEFT_PILE} undraggable={isUndraggable} style={{zIndex:idx}}/>
                        })
                    }
                </LeftPile> 
                <OppLeftPile>
                {
                    hand.oppLeftPile.map((cardId,idx)=>{
                        return <Card key={idx} cardId={cardId} cardType={CardTypes.IN_DISCARD} undraggable={true}
                        style={{zIndex:idx}} />
                    })
                }
                </OppLeftPile>
                <MidPile>
                        <Card cardId={107} cardType={CardTypes.IN_MID_PILE} undraggable={true}
                        style={{zIndex:0}} />
                        <Card cardId={107} cardType={CardTypes.IN_MID_PILE} undraggable={hand.didDrawCard}
                        style={{zIndex:1}} />
                </MidPile>
                <RightPile>
                    {
                        hand.rightPile.map((cardId,idx) => {
                            return <Card key={idx} cardId={cardId} cardType={CardTypes.IN_DISCARD} undraggable={true}
                            style={{zIndex:idx}} />
                        })
                    }
                </RightPile>
                <OppRightPile>
                {
                    hand.oppRightPile.map((cardId,idx)=>{
                        return <Card key={idx} cardId={cardId} cardType={CardTypes.IN_DISCARD} undraggable={true}
                        style={{zIndex:idx}} />
                    })
                }
                </OppRightPile>
            </div>
        </div>
    );
}