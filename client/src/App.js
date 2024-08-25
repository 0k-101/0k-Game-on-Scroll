import './App.css';
import './Menu.css';
import './Game.css';
import Home from './routes/HomeRoute';
import Game from './routes/GameRoute';
import NotFound from './routes/NotFoundRoute';
import WaitingRoom from './routes/WaitingRoomRoute';
import OverviewPanel from './components/OverviewPanel';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Route, Routes } from 'react-router-dom';
import { createContext,useState } from 'react'
import Test from './routes/TestRoute';
import TutorialPage from './routes/TutorialRoute';

export const AccountContext = createContext();

function App() {
	const [account, setAccount] = useState(null);
    const [network, setNetwork] = useState(null);

	return (
		<AccountContext.Provider value={{account,setAccount,network,setNetwork}}> 
			<Routes>
				<Route path="/" element={<Home />} />
				<Route path="/game/:id" element={<Game />} />
				<Route path="/waiting-room" element={<WaitingRoom account={account} />} />
				<Route path='*' element={<NotFound />} />
				<Route path='/test' element={<Test />} />
				<Route path='/tutorial' element={<TutorialPage />} />
			</Routes>
		</AccountContext.Provider>
	);
}

export default App;
