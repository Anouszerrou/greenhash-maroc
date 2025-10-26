import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="max-w-2xl text-center">
        <h1 className="text-4xl font-bold mb-4">404 — Page non trouvée</h1>
        <p className="text-gray-300 mb-6">La page que vous recherchez n'existe pas ou a été déplacée.</p>
        <Link to="/" className="btn-primary px-6 py-3">Retour à l'accueil</Link>
      </div>
    </div>
  );
};

export default NotFound;
