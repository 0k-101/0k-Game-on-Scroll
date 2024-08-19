import { useDrop } from 'react-dnd';
import CardTypes from '../constants/CardTypes';

export default function LeftPile(props) {
    const [{}, drop] = useDrop(() => ({
        accept: CardTypes.IN_LEFT_PILE,
    }));
    
    return (
        <div className='card-slot left-pile'
            ref={drop}
        >
            {props.children}
        </div>
    )
}