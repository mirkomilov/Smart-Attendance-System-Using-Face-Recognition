import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn } from 'lucide-react';
import { motion } from 'framer-motion';
import AuthLayout from '../../layouts/AuthLayout';
import Card from '../../components/ui/Card';
import { login, getUserProfile } from '../../api/api';

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // 1. Auth via Supabase
    const { data: user, error: loginError } = await login(email, password);
    if (loginError || !user) {
      setError(loginError?.message || 'Invalid email or password.');
      setLoading(false);
      return;
    }

    // 2. Get User Profile to determine role
    const { data: profile, error: profileError } = await getUserProfile(user.id);
    if (profileError || !profile) {
      setError('Could not fetch user profile details.');
      setLoading(false);
      return;
    }

    setLoading(false);

    // 3. Route based on role
    if (profile.role === 'student') {
      navigate('/student/dashboard');
    } else if (profile.role === 'professor') {
      navigate('/professor/dashboard');
    } else {
      setError('Unknown role assigned to user.');
    }
  };

  return (
    <AuthLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 bg-blue-600 rounded-2xl mb-4 shadow-xl shadow-blue-200">
            <LogIn size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900">Sign In</h1>
          <p className="text-slate-500 mt-2">Welcome back! Please enter your details.</p>
        </div>

        <Card className="p-8">
          <form className="space-y-6" onSubmit={handleLogin}>
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg">
                {error}
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                placeholder="name@university.edu"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-xl font-semibold shadow-lg transition-all text-white
                ${loading ? 'bg-blue-400 cursor-not-allowed shadow-none' : 'bg-blue-600 shadow-blue-200 hover:bg-blue-700'}`}
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>
        </Card>
      </motion.div>
    </AuthLayout>
  );
}

export default LoginPage;
