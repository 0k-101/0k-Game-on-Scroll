import { Container,Row,Col } from 'react-bootstrap';
import TableSlot from './TableSlot'
import { useContext, useState,useEffect } from 'react'
import { HandContext } from '../routes/GameRoute'
import TableCard from './TableCard'


const bgImages = [];
bgImages.push(require('../assets/game/overview-turn-0.png'))
bgImages.push(require('../assets/game/overview-turn-1.png'))
bgImages.push(require('../assets/game/overview-turn-2.png'))
bgImages.push(require('../assets/game/overview-turn-3.png'))

export default function OverviewPanel () {
    
    const { hand,setHand,socket, tables,setTables } = useContext(HandContext);

    const [ bgImageIndex,setBgImageIndex ] = useState(0);

    useEffect(() => {
        setBgImageIndex((hand.whoseTurn +4+ hand.playerIdx) %4 );
    },[hand.whoseTurn])

    return (
        <Container className='game-overview-container w-75 position-absolute'
            style={{backgroundImage: `url(${bgImages[bgImageIndex]})`}}
        >
            <Row className='d-flex h-50 gap-2 pb-1'>
                <Col className='game-table-wrapper'>
                    <div className='game-table-container table-ul'>
                        {
                            Array.from({length: 50}, (_, i) => i+1).map((i) => (
                                <TableSlot key={i} tableSlotIdx={i} >
                                    {hand.playerIdx === -1 ? null : tables[(hand.playerIdx+3)%4][i] ? <TableCard cardId={tables[(hand.playerIdx+3)%4][i]} /> :
                                     null}
                                </TableSlot>
                            ))
                        }
                    </div>
                </Col>
                <Col className='game-table-wrapper'>
                    <div className='game-table-container table-ur'>
                        {
                            Array.from({length: 50}, (_, i) => i+1).map((i) => (
                                <TableSlot key={i} tableSlotIdx={i} >
                                    {hand.playerIdx === -1 ? null : tables[(hand.playerIdx+2)%4][i] ? <TableCard cardId={tables[(hand.playerIdx+2)%4][i]} /> :
                                     null}
                                </TableSlot>
                            ))
                        }
                    </div>
                </Col>
            </Row>
            <Row className='d-flex h-50 gap-2'>
                <Col className='game-table-wrapper'>
                    <div className='game-table-container table-bl'>
                        { 
                            Array.from({length: 50}, (_, i) => i+1).map((i) => (
                                <TableSlot key={i} tableSlotIdx={i} >
                                    {hand.playerIdx === -1 ? null : tables[hand.playerIdx][i] ? <TableCard cardId={tables[hand.playerIdx][i]} /> :
                                     null}
                                </TableSlot>
                            ))
                        }
                    </div>
                </Col>
                <Col className='game-table-wrapper'>
                    <div className='game-table-container table-br'>
                        {
                            Array.from({length: 50}, (_, i) => i+1).map((i) => (
                                <TableSlot key={i} tableSlotIdx={i}>
                                    {hand.playerIdx === -1 ? null : tables[(hand.playerIdx+1)%4][i] ? <TableCard cardId={tables[(hand.playerIdx+1)%4][i]} /> :
                                     null}
                                </TableSlot>
                            ))
                        }
                    </div>
                </Col>
            </Row>
        </Container>
    )
}