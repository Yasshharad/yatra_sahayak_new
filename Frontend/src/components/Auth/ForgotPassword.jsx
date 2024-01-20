import React, { useState } from 'react';
import AuthService from '../../services/AuthService';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);

    const handleForgotPassword = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await AuthService.forgotPassword(email);
            console.log('Forgot password email sent', response.data);
            toast.success('Password reset email sent successfully. Please check your email.');
            setLoading(false);
        } catch (error) {
            console.error('Forgot password failed', error);
            if (error.response && error.response.data.message) {
                toast.error(error.response.data.message);
            } else {
                toast.error('An error occurred while processing your request');
            }
            setLoading(false);
        }
    };

    return (
        <div className='forgot'>
            <h2>Forgot Password</h2>
            <ToastContainer />
            <form onSubmit={handleForgotPassword}>
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
                <button type="submit" disabled={loading}>
                    {loading ? 'Sending...' : 'Send Reset Email'}
                </button>
            </form>
        </div>
    );
};

export default ForgotPassword;
