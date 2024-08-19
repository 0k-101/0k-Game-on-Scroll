import { NavLink } from 'react-router-dom';
export default function NotFound() {
    return (
        <div className='d-flex flex-column gap-4 w-25 m-auto' style={{height:'100vh'}}> 
            <h2 className='mt-5'>
                404 Not Found
            </h2>
            <NavLink className='btn btn-primary my-auto' 
                to={'/'}
                >Go back</NavLink>
        </div>
    );
}
    