import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { myContext } from '../Context/Context';

export default function HomePage() {
    const ctx = useContext(myContext);

    return (
        <div>
            <h1>HomePage</h1>
            { !ctx ? (
                <>
                    <Link to="/login">Login</Link>
                    <Link to="/register">Register</Link>
                </>
            ) : null }
        </div>
    )
}
