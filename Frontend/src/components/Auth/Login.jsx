import React, { useState } from 'react';
import AuthService from '../../services/AuthService';
import { Link, useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();

        try {
            const response = await AuthService.login(email, password);
            console.log('Logged in successfully', response.data);
            toast.success('Logged in successfully'); // Display success notification
            setTimeout(() => {
                navigate('/');
            }, 3000);
        } catch (error) {
            console.error('Login failed', error);

            if (error.response && error.response.status === 401) {
                toast.error('Invalid email or password'); // Display error notification
            } else {
                toast.error('An error occurred while logging in. Please try again.'); // Display generic error notification
            }
        }
    };

    return (
        <div className='login'>
            <h2>Login</h2>
            <form onSubmit={handleLogin}>
                <div>
                    <label htmlFor="email">Email:</label>
                    <input
                        type="email"
                        id="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label htmlFor="password">Password:</label>
                    <input
                        type="password"
                        id="password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <button type="submit">Login</button>
            </form>
            <Link to="/forgotPassword">Forgot Password?</Link>
            <span>New to Yatra Sahayak?<Link to="/register">Register here</Link></span>

            <ToastContainer autoClose={3000} />
        </div>
    );
};

export default Login;
