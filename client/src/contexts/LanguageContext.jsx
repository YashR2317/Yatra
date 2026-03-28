import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import en from '../locales/en';
import hi from '../locales/hi';

const translations = { en, hi };

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
    const [language, setLanguage] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('brajyatra-lang') || 'en';
        }
        return 'en';
    });

    useEffect(() => {
        localStorage.setItem('brajyatra-lang', language);
        document.documentElement.lang = language === 'hi' ? 'hi' : 'en';
    }, [language]);

    const toggleLanguage = () => {
        setLanguage((prev) => (prev === 'en' ? 'hi' : 'en'));
    };

    const t = useCallback((key) => {
        return translations[language]?.[key] || translations.en?.[key] || key;
    }, [language]);

    return (
        <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (!context) throw new Error('useLanguage must be used within LanguageProvider');
    return context;
}
