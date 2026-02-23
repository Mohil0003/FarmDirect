import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, Sprout, ArrowRight } from 'lucide-react';
import { login as apiLogin } from '../services/authService';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Call the real API login service
      const response = await apiLogin({ email, password });

      // Update AuthContext with real user data
      login({
        userId: response.user.userId,
        name: response.user.fullName,
        email: response.user.email,
        role: response.role,
        token: response.token || '',
      });

      // Redirect based on role
      if (response.role === 'Farmer') {
        navigate('/farmer');
      } else if (response.role === 'Admin') {
        navigate('/admin');
      } else {
        navigate('/shop');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen flex font-sans bg-white">

      {/* LEFT SIDE: Visual & Brand (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-primary-dark overflow-hidden">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-60 mix-blend-overlay"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1495107334309-fcf20504a5ab?q=80&w=2070&auto=format&fit=crop')" }} // Nice wheat field image
        />
        <div className="absolute inset-0 bg-gradient-to-t from-primary-dark/90 to-transparent" />

        {/* Brand Text Content */}
        <div className="relative z-10 w-full p-16 flex flex-col justify-between">
          <div className="flex items-center gap-3 text-white/90 bg-opacity-10">
            <div className="bg-white/10 p-2 rounded-lg backdrop-blur-sm">
              <Sprout size={24} className="text-secondary" />
            </div>
            <span className="text-xl font-bold tracking-wide">FarmDirect</span>
          </div>

          <div className="space-y-6">
            <h1 className="text-5xl font-bold text-white leading-tight">
              Fresh from the soil, <br />
              <span className="text-secondary">straight to you.</span>
            </h1>
            <p className="text-lg text-gray-300 max-w-md">
              Join thousands of farmers and buyers connecting directly. Fair prices for farmers, fresh produce for families.
            </p>
          </div>

          <div className="flex gap-4 text-sm text-gray-400">
            <span>© 2025 FarmDirect Inc.</span>
            <span>Privacy Policy</span>
            <span>Terms</span>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE: Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-16 bg-white">
        <div className="w-full max-w-md space-y-8">

          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-bold text-gray-900">Welcome back</h2>
            <p className="mt-2 text-gray-500">Please enter your details to sign in.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">

            <div className="space-y-4">
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail size={18} className="text-gray-400 group-focus-within:text-primary transition-colors" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none bg-gray-50 focus:bg-white"
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock size={18} className="text-gray-400 group-focus-within:text-primary transition-colors" />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none bg-gray-50 focus:bg-white"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Remember Me / Forgot Password */}
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="rounded border-gray-300 text-primary focus:ring-primary" />
                <span className="text-gray-600">Remember for 30 days</span>
              </label>
              <a href="#" className="font-semibold text-primary hover:text-primary-dark">Forgot password?</a>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Main Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-primary/30 hover:shadow-primary/50 flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
              {!isLoading && <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />}
            </button>


          </form>

          <p className="text-center text-sm text-gray-500">
            Don't have an account? <Link to="/register" className="font-bold text-primary hover:underline">Create account</Link>
          </p>

          {/* Dev Mode Helper */}
          <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-dashed border-gray-300">
            <p className="text-xs text-center text-gray-400 mb-2 uppercase font-bold tracking-wider">Dev Mode: Quick Login</p>
            <div className="flex justify-center gap-3">
              {/* Farmer Button */}
              <button onClick={() => { setEmail('ramesh@farmer.com'), setPassword('hashed_secret') }} className="text-xs bg-white border border-gray-200 px-3 py-1.5 rounded shadow-sm hover:text-primary transition-colors">
                Farmer
              </button>

              {/* Consumer Button */}
              <button onClick={() => { setEmail('priya@consumer.com'), setPassword('hashed_secret') }} className="text-xs bg-white border border-gray-200 px-3 py-1.5 rounded shadow-sm hover:text-primary transition-colors">
                Consumer
              </button>

              {/* --- ADD THIS NEW BUTTON --- */}
              <button onClick={() => { setEmail('admin@farmdirect.com'), setPassword('hashed_secret') }} className="text-xs bg-red-50 border border-red-100 text-red-600 px-3 py-1.5 rounded shadow-sm hover:bg-red-100 transition-colors">
                Admin
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default LoginPage;