import React from 'react';
import Link from 'next/link';
import { Twitter, Instagram, Facebook, Github, Heart } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = [
    { name: 'Home', href: '/' },
    { name: 'Lost Items', href: '/lost-items' },
    { name: 'Found Items', href: '/found-items' },
    { name: 'Contact', href: '/contact' },
    { name: 'About', href: '/about' },
  ];

  const socialLinks = [
    { name: 'Twitter', icon: Twitter, href: '#' },
    { name: 'Instagram', icon: Instagram, href: '#' },
    { name: 'Facebook', icon: Facebook, href: '#' },
    { name: 'GitHub', icon: Github, href: '#' },
  ];

  return (
    <footer className="bg-white dark:bg-black border-t border-gray-100 dark:border-gray-900 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between gap-12 lg:gap-8 mb-12">
          {/* Brand & Description */}
          <div className="max-w-sm">
            <Link href="/" className="inline-block text-2xl font-extrabold text-blue-600 dark:text-blue-500 tracking-tight mb-4 flex-shrink-0">
              Lost <span className="text-gray-900 dark:text-white">&</span> Found
            </Link>
            <p className="text-gray-500 dark:text-gray-400 text-base leading-relaxed mb-6 break-words">
              A community-driven platform dedicated to reuniting people with their lost belongings. Because honesty builds better communities.
            </p>
            <div className="flex items-center space-x-4 flex-wrap">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.name}
                    href={social.href}
                    className="text-gray-400 hover:text-blue-600 dark:text-gray-500 dark:hover:text-blue-400 transition-colors bg-gray-50 hover:bg-blue-50 dark:bg-gray-900 dark:hover:bg-gray-800 p-2.5 rounded-full mb-2"
                    aria-label={social.name}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Icon className="w-5 h-5" />
                  </a>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 lg:gap-16">
            {/* Quick Links */}
            <div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-5">
                Quick Links
              </h3>
              <ul className="space-y-4">
                {footerLinks.map((link) => (
                  <li key={link.name}>
                    <Link 
                      href={link.href}
                      className="text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors text-base flex w-fit line-clamp-2 break-words"
                      title={link.name}
                    >
                      {link.name || "Missing Link"}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support */}
            <div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-5">
                Support
              </h3>
              <ul className="space-y-4">
                <li>
                  <Link href="/faq" className="text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors text-base flex w-fit break-words">
                    Help Center & FAQ
                  </Link>
                </li>
                <li>
                  <Link href="/safety" className="text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors text-base flex w-fit break-words">
                    Trust & Safety
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors text-base flex w-fit break-words">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors text-base flex w-fit break-words">
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-gray-100 dark:border-gray-800/60 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          <p className="text-gray-500 dark:text-gray-500 text-sm">
            &copy; {currentYear} Lost & Found. All rights reserved.
          </p>
          <p className="text-gray-500 dark:text-gray-500 text-sm flex items-center justify-center">
            Made with <Heart className="w-4 h-4 mx-1 text-red-500 fill-current flex-shrink-0" /> by the Community
          </p>
        </div>
      </div>
    </footer>
  );
}