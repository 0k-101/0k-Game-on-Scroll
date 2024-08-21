import { NavLink } from 'react-router-dom';
import { Row, Col, Container } from 'react-bootstrap';

export default function Home() {
    const cards = []
    cards.push(require('../assets/cards/gri1.png'))
    cards.push(require('../assets/cards/turuncu12.png'))
    cards.push(require('../assets/cards/mavi6.png'))
    cards.push(require('../assets/cards/pembe4.png'))
    const diskImg = require('../assets/menu/disk.png')
    return (
        <div className='main-menu-container'>
            <Container>
                <Row className='align-items-center vh-100'>
                    <Col xs={5} className='d-flex flex-column gap-4 justify-content-center'>
                        <NavLink
                            className='btn start-btn m-auto w-75'
                            to={'/waiting-room'}
                        >
                        </NavLink>
                        <NavLink
                            className='btn connect-wallet-btn m-auto w-75'
                            to={'/connect-wallet'}
                        >
                        </NavLink>
                        <NavLink
                            className='btn tutorial-btn m-auto w-75'
                            to={'/tutorial'}
                        >
                        </NavLink>
                    </Col>
                    <Col></Col>
                    <Col xs={5} className='d-flex justify-content-center' >
                        <div className='showcase-container'>
                            <img src={cards[0]} alt="Game Card" draggable={false} />
                            <img src={cards[1]} alt="Game Card" draggable={false} />
                            <img src={cards[2]} alt="Game Card" draggable={false} />
                            <img src={cards[3]} alt="Game Card" draggable={false} />
                            <img src={diskImg} alt="Disk" />
                        </div>
                    </Col>
                </Row>
            </Container>
        </div>

    );
}