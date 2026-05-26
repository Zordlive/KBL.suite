import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import logoKLB from '../img/logoKLB.png';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [form, setForm] = useState({
    name: '',
    agent_number: '',
    gender: 'male',
    position: '',
    email: '',
    password: '',
    password_confirmation: '',
    role: 'agent',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const response = await register(form);

      if (response?.user?.status === 'active') {
        navigate('/dashboard');
        return;
      }

      if (response?.message) {
        setMessage(response.message);
      }
    } catch (error) {
      setMessage(error.response?.data?.message || 'Inscription échouée.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center bg-linear-to-br from-indigo-50 via-white to-blue-50 px-4 py-8 sm:px-6 lg:px-8 relative"
      style={{
        backgroundImage: `url(${logoKLB})`,
        backgroundPosition: 'bottom right',
        backgroundRepeat: 'no-repeat',
        backgroundSize: '300px 300px',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Background Decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse animation-delay-2000"></div>
      </div>

      <div className="w-full max-w-xl relative z-10">
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-8 sm:p-10">
          {/* Header */}
          <div className="text-center mb-8">
            <img src={logoKLB} alt="KLB Logo" className="h-20 w-auto mx-auto mb-4 shadow-lg rounded-lg" />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Créer un compte</h1>
            <p className="text-gray-600 text-sm">Inscrivez-vous en tant qu'Agent ou Super Agent</p>
          </div>

          {/* Info Message */}
          {message && (
            <div className="rounded-lg bg-blue-50 border border-blue-200 p-4 mb-6 flex items-start gap-3">
              <svg className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6z" />
              </svg>
              <p className="text-blue-700 text-sm font-medium">{message}</p>
            </div>
          )}

          {/* Register Form */}
          <form className="space-y-5" onSubmit={handleSubmit}>
            {/* Row 1: Nom et Numéro Agent */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nom complet</label>
                <Input 
                  name="name" 
                  value={form.name} 
                  onChange={handleChange} 
                  placeholder="Jean Dupont" 
                  required 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Numéro agent</label>
                <Input 
                  name="agent_number" 
                  value={form.agent_number} 
                  onChange={handleChange} 
                  placeholder="AG-001" 
                  required 
                />
              </div>
            </div>

            {/* Row 2: Genre et Poste */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Genre</label>
                <select
                  name="gender"
                  value={form.gender}
                  onChange={handleChange}
                  className="flex h-11 w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                >
                  <option value="male">Homme</option>
                  <option value="female">Femme</option>
                  <option value="other">Autre</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Poste occupé</label>
                <Input 
                  name="position" 
                  value={form.position} 
                  onChange={handleChange} 
                  placeholder="Agent de caisse" 
                  required 
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Adresse email</label>
              <Input 
                name="email" 
                type="email" 
                value={form.email} 
                onChange={handleChange} 
                placeholder="jean@example.com" 
                required 
              />
            </div>

            {/* Row 3: Mot de passe */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mot de passe</label>
                <Input 
                  name="password" 
                  type="password" 
                  value={form.password} 
                  onChange={handleChange} 
                  placeholder="••••••••" 
                  required 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Confirmer le mot de passe</label>
                <Input
                  name="password_confirmation"
                  type="password"
                  value={form.password_confirmation}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Sélectionnez votre rôle</label>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className={`flex items-center rounded-lg border-2 p-4 cursor-pointer transition-all ${
                  form.role === 'agent' 
                    ? 'border-indigo-500 bg-indigo-50' 
                    : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                }`}>
                  <input
                    type="radio"
                    name="role"
                    value="agent"
                    checked={form.role === 'agent'}
                    onChange={handleChange}
                    className="mr-3 h-5 w-5 text-indigo-600 cursor-pointer"
                  />
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Agent</p>
                    <p className="text-xs text-gray-600">Rôle standard</p>
                  </div>
                </label>
                <label className={`flex items-center rounded-lg border-2 p-4 cursor-pointer transition-all ${
                  form.role === 'super_agent' 
                    ? 'border-indigo-500 bg-indigo-50' 
                    : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                }`}>
                  <input
                    type="radio"
                    name="role"
                    value="super_agent"
                    checked={form.role === 'super_agent'}
                    onChange={handleChange}
                    className="mr-3 h-5 w-5 text-indigo-600 cursor-pointer"
                  />
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Super Agent</p>
                    <p className="text-xs text-gray-600">Rôle avancé</p>
                  </div>
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <Button 
              type="submit" 
              disabled={loading} 
              className="w-full h-12 text-base"
              variant="primary"
            >
              {loading ? (
                <>
                  <svg className="w-5 h-5 animate-spin mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Création en cours...
                </>
              ) : (
                'S\'inscrire'
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="my-6 relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Ou</span>
            </div>
          </div>

          {/* Login Link */}
          <p className="text-center text-sm text-gray-600">
            Déjà inscrit ?{' '}
            <Link to="/login" className="font-semibold text-indigo-600 hover:text-indigo-700 hover:underline transition-colors">
              Se connecter
            </Link>
          </p>
        </div>

        {/* Footer Info */}
        <p className="text-center text-xs text-gray-500 mt-6">
          KLB.suite - Système de gestion intégré • Tous droits réservés © 2026
        </p>
      </div>
    </div>
  );
};

export default Register;
