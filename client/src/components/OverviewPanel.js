import {Container,Row,Col} from 'react-bootstrap';
import TableSlot from './TableSlot'

export default function OverviewPanel () {



    return (
        <Container className='game-overview-container w-75'>
            <Row className='d-flex h-50 gap-2 pb-1'>
                <Col className='game-table-wrapper'>
                    <div className='game-table-container table-ul'>
                        {
                            Array.from({length: 50}, (_, i) => i+1).map((i) => (
                                <TableSlot key={i} tableSlotIdx={i} />
                            ))
                        }
                    </div>
                </Col>
                <Col className='game-table-wrapper'>
                    <div className='game-table-container table-ur'>
                        {
                            Array.from({length: 50}, (_, i) => i+1).map((i) => (
                                <TableSlot key={i} tableSlotIdx={i} />
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
                                <TableSlot key={i} tableSlotIdx={i} />
                            ))
                        }
                    </div>
                </Col>
                <Col className='game-table-wrapper'>
                    <div className='game-table-container table-br'>
                        {
                            Array.from({length: 50}, (_, i) => i+1).map((i) => (
                                <TableSlot key={i} tableSlotIdx={i} />
                            ))
                        }
                    </div>
                </Col>
            </Row>
        </Container>
    )
}