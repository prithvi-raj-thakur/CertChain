// src/components/Footer.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const LinkedinIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
    <rect x="2" y="9" width="4" height="12"></rect>
    <circle cx="4" cy="4" r="2"></circle>
  </svg>
);

const GithubIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"></path>
    <path d="M9 18c-4.51 2-5-2-7-2"></path>
  </svg>
);

const InstagramIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <h1 className="footer-logo">CERTCHAIN</h1>
        <p className="footer-tagline">
          The decentralized standard for issuing and verifying digital academic and professional credentials.
        </p>

        <div className="footer-links">
          <Link to="/">Home</Link>
          <Link to="/verify">Verify Certificate</Link>
          <Link to="/admin/login">Admin Dashboard</Link>
          <a href="#" target="_blank" rel="noreferrer">Documentation</a>
          <a href="https://github.com/prithvi-raj-thakur" target="_blank" rel="noreferrer">GitHub</a>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} CertChain. All rights reserved.</p>
        <div className="footer-socials">
          <a href="https://www.linkedin.com/in/prithvi-raj-thakur-606500312/" className="footer-social" aria-label="LinkedIn">
            <LinkedinIcon />
          </a>

          <a href="https://github.com/prithvi-raj-thakur" className="footer-social" aria-label="GitHub">
            <GithubIcon />
          </a>

          <a href="https://www.instagram.com/_prithvi.fr_?igsh=OGJ5eTNwczM3eTdh" className="footer-social" aria-label="Instagram">
            <InstagramIcon />
          </a>
        </div>
      </div>
    </footer>
  );
}
