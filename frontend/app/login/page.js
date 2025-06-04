'use client';
import styles from './login.module.css';
import { useState, useEffect } from 'react';
import Image from 'next/image';

function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(false);

    useEffect(() => {
        // Check system preference on initial load
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleSystemThemeChange = (e) => setIsDarkMode(e.matches);

        setIsDarkMode(mediaQuery.matches);
        mediaQuery.addEventListener('change', handleSystemThemeChange);

        return () => {
            mediaQuery.removeEventListener('change', handleSystemThemeChange);
        };
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Login:', { email, password, rememberMe });
        // TODO: Call backend API
    };

    return (
        <div className={`${styles.container} ${isDarkMode ? styles.dark : ''}`}>
            <div className={styles.loginBox}>
                <div className={styles.logoContainer}>
                    <Image
                        src={isDarkMode ? "/greek-lanka-logo-white.png" : "/greek-lanka-logo-min.png"}
                        alt="Greek Lanka Logo"
                        width={175}
                        height={100}
                        className={styles.logo}
                    />
                    {/* <h1 className={styles.companyTagline}>We Serve the Ocean</h1> */}
                </div>

                <h2 className={styles.title}>Port Call Management</h2>
                <p className={styles.subtitle}>Login to your account</p>

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.inputGroup}>
                        <label htmlFor="email" className={styles.label}>Email address</label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            required
                            onChange={(e) => setEmail(e.target.value)}
                            className={styles.input}
                            placeholder='example@greeklanka.com'
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label htmlFor="password" className={styles.label}>Password</label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            required
                            onChange={(e) => setPassword(e.target.value)}
                            className={styles.input}
                            placeholder='your password'
                        />
                    </div>

                    <div className={styles.options}>
                        <label className={styles.rememberMe}>
                            <input
                                type="checkbox"
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                            />
                            <span>Remember me</span>
                        </label>
                        <a href="#" className={styles.forgotPassword}>Forgot your password?</a>
                    </div>

                    <button type="submit" className={styles.submitBtn}>
                        Sign in
                    </button>
                </form>

                <div className={styles.clientPortal}>
                    <a href='#link' className={styles.clientPortalLink}>Client Portal Login</a>
                </div>
            </div>
        </div>
    );
}

export default LoginPage;