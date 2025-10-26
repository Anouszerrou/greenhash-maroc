import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, MessageCircle, Mail, MapPin, Phone, Send, Twitter, Github } from 'lucide-react';
import { FaDiscord, FaTelegram } from "react-icons/fa";
import emailjs from 'emailjs-com';
import { toast } from 'react-toastify';

// EmailJS configuration
const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

// Vérification des identifiants EmailJS
console.log('EmailJS Config:', { serviceId, templateId, publicKey });


const Community = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!serviceId || !templateId || !publicKey) {
      console.error('EmailJS configuration missing');
      toast.error('Erreur de configuration EmailJS');
      return;
    }

    const templateParams = {
      from_name: formData.name,
      from_email: formData.email,
      message: formData.message,
      subject: formData.subject
    };

    try {
      const response = await emailjs.send(
        serviceId,
        templateId,
        templateParams,
        publicKey
      );

      console.log('EmailJS Response:', response);
      toast.success('✅ Message envoyé avec succès !');
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      console.error('EmailJS error:', error);
      let errorMessage = 'Erreur lors de l\'envoi du message';
      
      if (error.message?.includes('service')) {
        errorMessage = 'Service ID invalide';
      } else if (error.message?.includes('template')) {
        errorMessage = 'Template ID invalide';
      } else if (error.status === 400) {
        errorMessage = 'Erreur de requête - Vérifiez les champs';
      }
      
      toast.error(`❌ ${errorMessage}`);
    }
  };

  const socialLinks = [
    { icon: <FaDiscord className="w-6 h-6" />, name: 'Discord', members: '15,000+', href: '#', color: 'bg-indigo-500' },
    { icon: <FaTelegram className="w-6 h-6" />, name: 'Telegram', members: '8,500+', href: '#', color: 'bg-blue-500' },
    { icon: <Twitter className="w-6 h-6" />, name: 'Twitter', members: '25,000+', href: '#', color: 'bg-sky-500' },
    { icon: <Github className="w-6 h-6" />, name: 'GitHub', members: '1,200+', href: '#', color: 'bg-gray-700' }
  ];

  const teamMembers = [
    {
      name: 'Ahmed Benali',
      role: 'CEO & Fondateur',
      image: '/api/placeholder/150/150',
      bio: 'Expert en blockchain et passionné par les énergies renouvelables'
    },
    {
      name: 'Fatima Zahra',
      role: 'CTO',
      image: '/api/placeholder/150/150',
      bio: 'Ingénieure en développement blockchain et smart contracts'
    },
    {
      name: 'Youssef El Amrani',
      role: 'Responsable Écologie',
      image: '/api/placeholder/150/150',
      bio: 'Spécialiste en développement durable et énergies vertes'
    },
    {
      name: 'Sarah Mouline',
      role: 'Community Manager',
      image: '/api/placeholder/150/150',
      bio: 'Experte en gestion de communauté et marketing digital'
    }
  ];

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.h1 
            className="text-4xl md:text-5xl font-bold mb-4"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="gradient-text">Communauté</span>
          </motion.h1>
          <motion.p 
            className="text-xl text-gray-300 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Rejoignez notre communauté mondiale d'investisseurs éco-responsables 
            et participez à la construction d'un avenir durable.
          </motion.p>
        </div>

        {/* Social Links */}
        <motion.div 
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          {socialLinks.map((social, index) => (
            <a
              key={index}
              href={social.href}
              className="card hover:bg-white hover:bg-opacity-10 transition-all duration-300 group"
            >
              <div className="text-center">
                <div className={`w-12 h-12 ${social.color} rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300`}>
                  {social.icon}
                </div>
                <h3 className="font-semibold text-white mb-1">{social.name}</h3>
                <p className="text-sm text-gray-400">{social.members} membres</p>
              </div>
            </a>
          ))}
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <motion.div 
            className="card"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h3 className="text-2xl font-bold mb-6 gradient-text flex items-center space-x-2">
              <MessageCircle className="w-6 h-6" />
              <span>Contactez-nous</span>
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Nom complet</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 bg-dark-100 border border-primary-500/30 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-white"
                  placeholder="Votre nom"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 bg-dark-100 border border-primary-500/30 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-white"
                  placeholder="votre@email.com"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Sujet</label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 bg-dark-100 border border-primary-500/30 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-white"
                  placeholder="Objet de votre message"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Message</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                  rows={5}
                  className="w-full px-4 py-3 bg-dark-100 border border-primary-500/30 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-white resize-none"
                  placeholder="Votre message..."
                />
              </div>
              
              <button
                type="submit"
                className="w-full btn-primary flex items-center justify-center space-x-2"
              >
                <Send className="w-5 h-5" />
                <span>Envoyer le message</span>
              </button>
            </form>
          </motion.div>

          {/* Contact Information */}
          <motion.div 
            className="space-y-6"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="card">
              <h3 className="text-2xl font-bold mb-6 gradient-text">Informations de Contact</h3>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <MapPin className="w-5 h-5 text-primary-400" />
                  <div>
                    <p className="text-white font-semibold">Adresse</p>
                    <p className="text-gray-300">Oujda, Maroc</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-primary-400" />
                  <div>
                    <p className="text-white font-semibold">Email</p>
                    <p className="text-gray-300">Anaszerrou@gmail.com</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-primary-400" />
                  <div>
                    <p className="text-white font-semibold">Téléphone</p>
                    <p className="text-gray-300">+212 6 13 45 26 41</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="card">
              <h3 className="text-xl font-bold mb-4 gradient-text">Heures de Support</h3>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Lundi - Vendredi:</span>
                  <span className="text-white">9h00 - 18h00 (GMT+1)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Samedi:</span>
                  <span className="text-white">10h00 - 16h00 (GMT+1)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Dimanche:</span>
                  <span className="text-gray-400">Fermé</span>
                </div>
              </div>
            </div>

            <div className="card">
              <h3 className="text-xl font-bold mb-4 gradient-text">FAQ Rapide</h3>
              
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-white font-semibold mb-1">Comment commencer ?</p>
                  <p className="text-gray-400">Connectez votre wallet et choisissez un pack d'investissement.</p>
                </div>
                <div>
                  <p className="text-white font-semibold mb-1">Quels sont les risques ?</p>
                  <p className="text-gray-400">Comme tout investissement, il y a des risques de perte partielle ou totale.</p>
                </div>
                <div>
                  <p className="text-white font-semibold mb-1">Puis-je retirer mes fonds ?</p>
                  <p className="text-gray-400">Oui, selon les conditions de votre pack d'investissement.</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Team Section */}
        <motion.div 
          className="mt-16"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold gradient-text mb-4">Notre Équipe</h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Une équipe passionnée d'experts en blockchain, écologie et développement durable
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member, index) => (
              <motion.div 
                key={index} 
                className="card text-center"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                whileHover={{ y: -10 }}
              >
                <div className="w-24 h-24 bg-gradient-to-r from-primary-500 to-neon-green rounded-full mx-auto mb-4 flex items-center justify-center">
                  <Users className="w-12 h-12 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{member.name}</h3>
                <p className="text-primary-400 font-semibold mb-3">{member.role}</p>
                <p className="text-sm text-gray-300">{member.bio}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Community;