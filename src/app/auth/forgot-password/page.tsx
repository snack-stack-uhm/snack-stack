'use client';

import { useState, useEffect } from 'react';
import styles from '@/styles/forgot-password.module.css';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;

    if (resendCountdown > 0) {
      timer = setInterval(() => {
        setResendCountdown((prev) => prev - 1);
      }, 1000);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [resendCountdown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setLoading(true);
    setResendCountdown(60); // start countdown immediately

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      setMessage(data.message || 'If that email exists, a reset link has been sent.');
    } catch (err) {
      console.error(err);
      setMessage('Something went wrong. Please try again.');
      setResendCountdown(0); // reset countdown if failed
    } finally {
      setLoading(false);
    }
  };

  let buttonLabel;
  if (loading) {
    buttonLabel = <span className={styles.spinner} />;
  } else if (resendCountdown > 0) {
    buttonLabel = `Resend Link (${resendCountdown})`;
  } else {
    buttonLabel = 'Send Reset Link';
  }

  return (
    <div className={styles.container}>
      <div className={styles.formWrapper}>
        <h1 className={styles.title}>Forgot Password</h1>
        <p className={styles.descriptionCentered}>
          Enter your email and we&apos;ll send you a link to reset your password.
        </p>
        <form onSubmit={handleSubmit}>
          <div className={styles.inputGroup}>
            <label className={styles.label}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={styles.input}
              // placeholder="you@example.com"
            />
          </div>
          <button
            type="submit"
            disabled={loading || resendCountdown > 0}
            className={styles.button}
          >
            {buttonLabel}
          </button>
        </form>
        {message && (
        <p className={message.toLowerCase().includes('sent') ? styles.success : styles.error}>
          {message}
        </p>
        )}
      </div>
    </div>
  );
}
