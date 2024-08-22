import {Container,Row,Col} from 'react-bootstrap';

export default function Table () {



    return (
        <Container className='game-overview-container w-75'>
            <Row className='d-flex h-50 gap-2 pb-1'>
                <Col className='game-table'>
                    <div className='card-container table-ul'></div>
                </Col>
                <Col className='game-table'>
                    <div className='card-container table-ur'></div>
                </Col>
            </Row>
            <Row className='d-flex h-50 gap-2'>
                <Col className='game-table'>
                    <div className='card-container table-bl'></div>
                </Col>
                <Col className='game-table'>
                    <div className='card-container table-br'></div>
                </Col>
            </Row>
        </Container>
    )
}