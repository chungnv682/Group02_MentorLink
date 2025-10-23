import React, { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

const TestAuthContext = () => {
    const { logout, isLoggedIn, user } = useAuth();

    useEffect(() => {
        console.log('TestAuthContext useEffect running - this should only run once');
        // Test logout function stability
        console.log('Logout function:', logout);
    }, [logout]);

    return (
        <div style={{ padding: '20px' }}>
            <h3>Test AuthContext Stability</h3>
            <p>Check console - useEffect should only run once when component mounts</p>
            <p>Is Logged In: {isLoggedIn ? 'Yes' : 'No'}</p>
            <p>User: {user ? JSON.stringify(user) : 'None'}</p>
            <button onClick={logout}>
                Test Logout
            </button>
        </div>
    );
};

export default TestAuthContext;