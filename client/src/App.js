import './App.css';
import './Menu.css';
import Home from './routes/HomeRoute';
import Game from './routes/GameRoute';
import NotFound from './routes/NotFoundRoute';
import WaitingRoom from './routes/WaitingRoomRoute';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Route, Routes } from 'react-router-dom';

function App() {
	return (
		<Routes>
			<Route path="/" element={<Home />} />
			<Route path="/game/:id" element={<Game />} />
			<Route path="/waiting-room" element={<WaitingRoom />} />
			<Route path='*' element={<NotFound />} />
		</Routes>
	);
}

export default App;
