import { useDrop } from 'react-dnd';
import CardTypes from '../constants/CardTypes';

export default function RightPile(props) {
    const [{}, drop] = useDrop(() => ({
        accept: CardTypes.IN_HAND,        
        drop: () => ({ slotIdx: `discard_pile_slot_idx` }),

    }));
    
    return (
        <div className='card-slot right-pile'
            ref={drop}
        >
            {props.children}
        </div>
    )
}