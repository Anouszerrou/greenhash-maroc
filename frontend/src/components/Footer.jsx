import React from 'react';
import { Link } from 'react-router-dom';
import { Leaf } from "lucide-react";
import { FaGithub, FaTwitter, FaDiscord, FaTelegram } from "react-icons/fa";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    { icon: <FaGithub className="w-5 h-5" />, href: '#', label: 'GitHub' },
    { icon: <FaTwitter className="w-5 h-5" />, href: '#', label: 'Twitter' },
    { icon: <FaDiscord className="w-5 h-5" />, href: '#', label: 'Discord' },
    { icon: <FaTelegram className="w-5 h-5" />, href: '#', label: 'Telegram' },
  ];

  const footerLinks = [
    { title: 'Produit', links: [
      { label: 'Mining Pool', href: '/mining-pool' },
      { label: 'Exchange', href: '/exchange' },
      { label: 'Simulateur', href: '/simulator' },
      { label: 'Investir', href: '/invest' }
    ]},
    { title: 'Ressources', links: [
      { label: 'Documentation', href: '#' },
      { label: 'API', href: '#' },
      { label: 'Blog', href: '#' },
      { label: 'FAQ', href: '#' }
    ]},
    { title: 'Communauté', links: [
      { label: 'Discord', href: '#' },
      { label: 'Telegram', href: '#' },
      { label: 'Twitter', href: '#' },
      { label: 'Forum', href: '#' }
    ]},
    { title: 'Légal', links: [
      { label: 'Conditions d\'utilisation', href: '#' },
      { label: 'Politique de confidentialité', href: '#' },
      { label: 'Mentions légales', href: '#' },
      { label: 'Risques', href: '#' }
    ]}
  ];

  return (
    <footer className="bg-dark-200 border-t border-primary-500/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
          {/* Logo and description */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center space-x-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-neon-green rounded-full flex items-center justify-center">
                <Leaf className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold gradient-text">Green Hash Maroc</h3>
                <p className="text-xs text-gray-400">Minage Écologique</p>
              </div>
            </Link>
            
            <p className="text-gray-300 text-sm mb-6 max-w-sm">
              La première plateforme Web3 de minage écologique au Maroc. 
              Combinez investissement crypto et protection de l'environnement.
            </p>
            
            <div className="flex space-x-4">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  className="text-gray-400 hover:text-primary-400 transition-colors duration-200"
                  aria-label={social.label}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {footerLinks.map((section, index) => (
            <div key={index}>
              <h4 className="text-white font-semibold mb-4">{section.title}</h4>
              <ul className="space-y-2">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <Link
                      to={link.href}
                      className="text-gray-400 hover:text-primary-400 text-sm transition-colors duration-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-primary-500/20 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-400 text-sm">
              © {currentYear} Green Hash Maroc. Tous droits réservés.
            </div>
            
            <div className="flex items-center space-x-6 mt-4 md:mt-0">
              <div className="flex items-center space-x-2 text-sm text-gray-400">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Réseau BSC Testnet</span>
              </div>
              
              <div className="text-sm text-gray-400">
                Propulsé par <span className="text-primary-400">Énergie Verte</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;