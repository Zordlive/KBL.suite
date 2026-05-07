import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

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
      setMessage(error.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-lg space-y-8 bg-white p-8 rounded-3xl shadow-lg">
        <div>
          <h2 className="text-center text-3xl font-bold tracking-tight text-gray-900">Créer un compte KLB.suite</h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Inscrivez-vous en tant qu'Agent ou Super Agent.
          </p>
        </div>

        {message && (
          <div className="rounded-xl bg-blue-50 border border-blue-200 p-4 text-blue-700">
            {message}
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input name="name" value={form.name} onChange={handleChange} placeholder="Nom complet" required />
            <Input name="agent_number" value={form.agent_number} onChange={handleChange} placeholder="Numéro agent" required />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <select
              name="gender"
              value={form.gender}
              onChange={handleChange}
              className="flex h-12 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="male">Homme</option>
              <option value="female">Femme</option>
              <option value="other">Autre</option>
            </select>
            <Input name="position" value={form.position} onChange={handleChange} placeholder="Poste occupé" required />
          </div>

          <Input name="email" type="email" value={form.email} onChange={handleChange} placeholder="Email" required />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input name="password" type="password" value={form.password} onChange={handleChange} placeholder="Mot de passe" required />
            <Input
              name="password_confirmation"
              type="password"
              value={form.password_confirmation}
              onChange={handleChange}
              placeholder="Confirmer le mot de passe"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Rôle</label>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="flex items-center rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 hover:border-blue-400">
                <input
                  type="radio"
                  name="role"
                  value="agent"
                  checked={form.role === 'agent'}
                  onChange={handleChange}
                  className="mr-3 h-4 w-4 text-blue-600"
                />
                <span className="text-sm font-medium text-gray-700">Agent</span>
              </label>
              <label className="flex items-center rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 hover:border-blue-400">
                <input
                  type="radio"
                  name="role"
                  value="super_agent"
                  checked={form.role === 'super_agent'}
                  onChange={handleChange}
                  className="mr-3 h-4 w-4 text-blue-600"
                />
                <span className="text-sm font-medium text-gray-700">Super Agent</span>
              </label>
            </div>
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Création en cours...' : 'S’inscrire'}
          </Button>
        </form>

        <p className="text-center text-sm text-gray-500">
          Déjà inscrit ?{' '}
          <Link to="/login" className="font-semibold text-blue-600 hover:text-blue-800">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
