import React, { useState } from 'react';
import AuthService from '../../services/AuthService';
import { Link, useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Register = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [reEnterPassword, setReEnterPassword] = useState('');
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();

        try {
            // Check if passwords match before making the registration request
            if (password !== reEnterPassword) {
                toast.error('Passwords do not match');
                return;
            }

            const response = await AuthService.register(email, password, reEnterPassword);

            // Check if registration is successful
            if (response.status === 201) {
                console.log('Registered successfully', response.data);
                toast.success('Registered successfully');
                setTimeout(() => {
                    navigate('/login');
                }, 3000);
            } else {
                toast.error('An error occurred while registering');
            }
        } catch (error) {
            // Handle registration failure
            console.error('Registration failed', error);

            if (error.response && error.response.status === 400) {
                toast.error('User already exists');
            } else {
                toast.error('An error occurred while registering');
            }
        }
    };

    return (
        <div className='register'>
            <h2>Register</h2>
            <form onSubmit={handleRegister}>
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
                <div>
                    <label htmlFor="reEnterPassword">Re-enter Password:</label>
                    <input
                        type="password"
                        id="reEnterPassword"
                        placeholder="Re-enter your password"
                        value={reEnterPassword}
                        onChange={(e) => setReEnterPassword(e.target.value)}
                        required
                    />
                </div>
                <button type="submit">Register</button>
            </form>
            <Link to="/forgotPassword">Forgot Password?</Link>
            <span>Already have an account?<Link to="/login">Login</Link></span>
            <ToastContainer autoClose={3000} />
        </div>
    );
};

export default Register;
