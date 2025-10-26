import React, { createContext, useContext, useState, useCallback } from 'react';
import { Toast, ToastContainer } from 'react-bootstrap';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const showToast = useCallback((message, options = {}) => {
        const id = Date.now() + Math.random();
        const toast = {
            id,
            message,
            variant: options.variant || 'success',
            delay: options.delay || 3000,
        };
        setToasts((t) => [...t, toast]);
        return id;
    }, []);

    const removeToast = useCallback((id) => {
        setToasts((t) => t.filter(x => x.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}

            <ToastContainer position="top-end" className="p-3">
                {toasts.map((t) => (
                    <Toast key={t.id} onClose={() => removeToast(t.id)} bg={t.variant} delay={t.delay} autohide>
                        <Toast.Body className={t.variant !== 'light' ? 'text-white' : ''}>{t.message}</Toast.Body>
                    </Toast>
                ))}
            </ToastContainer>
        </ToastContext.Provider>
    );
};

export const useToast = () => {
    const ctx = useContext(ToastContext);
    if (!ctx) throw new Error('useToast must be used within ToastProvider');
    return ctx;
};

export default ToastContext;
