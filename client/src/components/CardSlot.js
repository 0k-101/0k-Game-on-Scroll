import { useDrop } from 'react-dnd';
import CardTypes from '../constants/CardTypes';

export default function CardSlot(props) {
    const [{}, drop] = useDrop(() => ({
        accept: [CardTypes.IN_HAND, CardTypes.IN_LEFT_PILE, CardTypes.IN_MID_PILE],
        drop: () => ({ slotIdx: props.slotIdx })
    }), [props.slotIdx]);         
    
    return (
        <div className='card-slot'
            ref={drop}    
        >
            {props.children}
        </div>
    );
}
