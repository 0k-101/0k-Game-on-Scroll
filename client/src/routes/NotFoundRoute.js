import { NavLink } from 'react-router-dom';
export default function NotFound() {
    const catImg = require('../assets/menu/angry-cat.png')
    return (
        <div className='not-found-container d-flex flex-column gap-4 w-25 m-auto' style={{height:'100vh'}}> 
            <img src={catImg} alt="Angry Cat" className='m-auto' />
            <h2 className='cat-speek'>  <strong style={{fontSize:'4rem'}}>404 NOT FOUND!</strong> <br/> 
            GO BACK WHERE YOU CAME FROM!!</h2>
            <NavLink className='btn btn-secondary go-back-btn my-auto' 
                to={'/'}
                >Go back</NavLink>
        </div>
    );
}
    