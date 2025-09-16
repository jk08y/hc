// src/components/layout/Footer.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  const footerLinks = [
    { text: 'About', href: '/about' },
    { text: 'Help Center', href: '/help' },
    { text: 'Terms of Service', href: '/terms' },
    { text: 'Privacy Policy', href: '/privacy' },
    { text: 'Cookie Policy', href: '/cookies' },
    { text: 'Accessibility', href: '/accessibility' },
    { text: 'Ads Info', href: '/ads-info' },
    { text: 'Blog', href: '/blog' },
    { text: 'Status', href: '/status' },
    { text: 'Careers', href: '/careers' },
    { text: 'Brand Resources', href: '/brand' },
    { text: 'Advertising', href: '/advertising' },
    { text: 'Marketing', href: '/marketing' },
    { text: 'Developers', href: '/developers' }
  ];
  
  return (
    <footer className="py-4 px-4 sm:px-6 border-t border-gray-200 dark:border-dark-border mt-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-wrap gap-x-4 gap-y-2">
          {footerLinks.map((link, index) => (
            <Link
              key={index}
              to={link.href}
              className="text-xs text-gray-500 dark:text-gray-400 hover:underline"
            >
              {link.text}
            </Link>
          ))}
        </div>
        
        <p className="mt-4 text-xs text-gray-500 dark:text-gray-400">
          © {currentYear} HeyChat, Inc.
        </p>
      </div>
    </footer>
  );
};

export default Footer;