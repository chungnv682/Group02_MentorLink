import React from 'react';
import { useLocation } from 'react-router-dom';
import { Header, Footer } from '../common';
import { useAuth } from '../../contexts';
import '../../styles/components/Layout.css';

const Layout = ({ children }) => {
    const location = useLocation();
    const { user } = useAuth();

    // Ẩn header cho khu vực mentor dashboard
    const hideHeader = user?.role === 'MENTOR' && location.pathname.startsWith('/mentor');

    return (
        <div className="layout-container">
            {!hideHeader && <Header />}
            <main className="main-content">
                {children}
            </main>
            <Footer />
        </div>
    );
};

export default Layout;