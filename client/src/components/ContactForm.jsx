// src/components/ContactForm.jsx
import React, { useRef, useState } from 'react';
import emailjs from '@emailjs/browser';
import { motion } from 'framer-motion';
import './ContactForm.css';

export default function ContactForm() {
  const form = useRef();
  const [status, setStatus] = useState(''); // 'idle', 'sending', 'success', 'error'

  const sendEmail = (e) => {
    e.preventDefault();
    setStatus('sending');

    // EmailJS requires Service ID, Template ID, and Public Key
    // Please replace with your actual EmailJS credentials
    // Note: The template should have {{user_name}}, {{user_email}}, and {{message}}
    const SERVICE_ID = 'YOUR_SERVICE_ID';
    const TEMPLATE_ID = 'YOUR_TEMPLATE_ID';
    const PUBLIC_KEY = 'YOUR_PUBLIC_KEY';

    emailjs
      .sendForm(SERVICE_ID, TEMPLATE_ID, form.current, PUBLIC_KEY)
      .then(
        (result) => {
          setStatus('success');
          form.current.reset();
          setTimeout(() => setStatus('idle'), 5000);
        },
        (error) => {
          console.error(error.text);
          setStatus('error');
          setTimeout(() => setStatus('idle'), 5000);
        }
      );
  };

  return (
    <section className="contact-section" id="contact">
      <div className="contact-container">
        <motion.div 
          className="contact-header"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2>Get in Touch</h2>
          <p>Have questions about integrating CertChain into your institution? Drop us a message.</p>
        </motion.div>

        <motion.div 
          className="contact-form-card"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {status === 'success' && (
            <div className="status-message status-success">
              ✅ Thank you for your message! We'll get back to you shortly.
            </div>
          )}
          {status === 'error' && (
            <div className="status-message status-error">
              ❌ Failed to send message. Please configure EmailJS variables or try again later.
            </div>
          )}

          <form ref={form} onSubmit={sendEmail} className="contact-form">
            <div className="form-group">
              <label htmlFor="user_name">Name</label>
              <input
                type="text"
                id="user_name"
                name="user_name"
                className="input"
                placeholder="John Doe"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="user_email">Email</label>
              <input
                type="email"
                id="user_email"
                name="user_email"
                className="input"
                placeholder="john@example.com"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="message">Message</label>
              <textarea
                id="message"
                name="message"
                className="input"
                placeholder="How can we help you?"
                required
              ></textarea>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={status === 'sending'}
              style={{ marginTop: '10px' }}
            >
              {status === 'sending' ? (
                <>
                  <div className="spinner" style={{ width: '16px', height: '16px' }} />
                  Sending...
                </>
              ) : (
                '✈️ Send Message'
              )}
            </button>
          </form>
        </motion.div>
      </div>
    </section>
  );
}
