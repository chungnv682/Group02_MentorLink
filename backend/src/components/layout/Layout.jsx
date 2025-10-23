import React from 'react';
import { Header, Footer } from '../common';
import '../../styles/components/Layout.css';

const Layout = ({ children }) => {
    return (
        <div className="layout-container">
            <Header />
            <main className="main-content">
                {children}
            </main>
            <Footer />
        </div>
    );
};

export default Layout;