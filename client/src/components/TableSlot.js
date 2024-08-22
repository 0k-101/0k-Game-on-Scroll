import { useDrop } from 'react-dnd';
import CardTypes from '../constants/CardTypes';

export default function TableSlot(props) {
    // const [{}, drop] = useDrop(() => ({
    //     accept: CardTypes.IN_HAND,        
    //     drop: () => ({ slotIdx: props.tableSlotIdx }),
    // }));
    
    return (
        <div className='table-slot'
            // ref={drop}
        >
            {props.children}
        </div>
    )
}