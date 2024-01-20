import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AuthService from '../../services/AuthService';
import { toast } from 'react-toastify';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ResetPassword = () => {
    const { userId } = useParams();
    const [newPassword, setNewPassword] = useState('');
    const [reEnterPassword, setReEnterPassword] = useState('');
    const [resetStatus, setResetStatus] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        // Use userId in your component logic if needed
        console.log('User ID:', userId);
    }, [userId]);

    const handleResetPassword = async () => {
        try {
            // Check if passwords match before making the reset password request
            if (newPassword !== reEnterPassword) {
                toast.error('Passwords do not match');
                return;
            }

            const response = await AuthService.resetPassword(userId, newPassword, reEnterPassword);

            if (response.status === 200) {
                setTimeout(() => {
                    navigate('/login');
                }, 3000);
                toast.success('Password reset successfully');
            } else {
                // Handle other messages or errors
                toast.error('Failed to reset password');
            }
        } catch (error) {
            // Handle error, show a message, etc.
            toast.error('Failed to reset password');
            console.error('Error resetting password:', error);
        }
    };


    return (
        <div className='resetPass'>
            <h2>Password Reset</h2>
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    handleResetPassword();
                }}
            >
                <div>
                    <label htmlFor="newPassword">New Password:</label>
                    <input
                        type="password"
                        id="newPassword"
                        placeholder="Enter your new password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label htmlFor="reEnterPassword">Re-enter Password:</label>
                    <input
                        type="password"
                        id="reEnterPassword"
                        placeholder="Re-enter your new password"
                        value={reEnterPassword}
                        onChange={(e) => setReEnterPassword(e.target.value)}
                        required
                    />
                </div>
                <button type="submit">Reset Password</button>
            </form>
            <ToastContainer autoClose={3000} />
        </div>
    );
};

export default ResetPassword;
