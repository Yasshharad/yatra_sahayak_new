import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaBars } from 'react-icons/fa';
import { ImCross } from 'react-icons/im';
import AuthService from '../services/AuthService'; // Import your authentication service

function Navbar() {
    const [mobile, setMobile] = useState(false);
    const isLoggedIn = AuthService.isLoggedIn();
    const userEmail = AuthService.getUserEmail();
    const navigate = useNavigate();

    const handleLogout = () => {
        AuthService.logout();
        navigate('/');
    };

    return (
        <nav className='navbar'>
            <div className='nav-logo'>
                <img className='logo' src='./public/images/logo.png' />
                <a href="/" className='logo-head'>
                    <h3 className='logo-text'>YatraSahayak</h3>
                </a>
            </div>

            <ul className={mobile ? 'nav-links-mobile' : 'nav-links'} onClick={() => setMobile(false)}>
                <Link to='/plan'><li>Trip Planner</li></Link>
                <Link to='/blog'><li>Blog</li></Link>
                <Link to='/feedback'><li>Feedback</li></Link>
                {isLoggedIn ? (
                    <div className='user-info'>
                        <p>{userEmail}</p>
                        <button onClick={handleLogout}><li>Logout</li></button>
                    </div>
                ) : (
                    <>
                        <Link to='/login' ><li>Sign In</li></Link>
                        <Link to='/register' ><li>Sign Up</li></Link>
                    </>
                )}
            </ul>
            <button className='mobile-menu-icon' onClick={() => setMobile(!mobile)}>
                {mobile ? <ImCross /> : <FaBars />}
            </button>
        </nav>
    );
}

export default Navbar;
