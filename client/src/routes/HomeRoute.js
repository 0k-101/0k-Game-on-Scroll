import { NavLink } from 'react-router-dom';

export default function Home() {
    
    return (
        <div className='d-flex flex-column gap-4 w-25 m-auto' style={{height:'100vh'}}> 
            <NavLink 
                className='btn btn-success my-auto'
                to={'/waiting-room'} 
            >
                <h2>
                    Start Game!
                </h2>
            </NavLink>
        </div>

    );
}