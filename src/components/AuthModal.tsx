import React, { useState } from 'react';
import { X, Mail, Lock, User, AlertCircle, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'signup';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login',
}) => {
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { login, signup, switchDemoRole } = useAuth();

  if (!isOpen) return null;

  const handleClose = () => {
    setError(null);
    setSuccessMessage(null);
    setLoading(false);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      if (mode === 'login') {
        const res = await login(email, password);
        setLoading(false);
        if (!res.success) {
          setError(res.error || 'Invalid email or password.');
        } else {
          setSuccessMessage('Logged in successfully! Welcome back.');
          setTimeout(() => {
            handleClose();
          }, 900);
        }
      } else {
        // Signup with secret hidden role
        const res = await signup(name, email, password);
        setLoading(false);
        if (!res.success) {
          setError(res.error || 'Failed to create account.');
        } else {
          setSuccessMessage('Account registered successfully! Welcome to Aurashka.');
          setTimeout(() => {
            handleClose();
          }, 900);
        }
      }
    } catch (err: any) {
      setLoading(false);
      setError(err?.message || 'Connection note: Please try again.');
    }
  };

  const handleQuickFill = (targetEmail: string, targetPass: string, isSpecial = false) => {
    setError(null);
    if (isSpecial) {
      switchDemoRole('admin');
      setSuccessMessage('Logged in as Pharmacist Admin!');
      setTimeout(() => {
        handleClose();
      }, 700);
    } else {
      switchDemoRole('user');
      setSuccessMessage('Logged in successfully!');
      setTimeout(() => {
        handleClose();
      }, 700);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/65 backdrop-blur-xs"
      onClick={handleClose}
    >
      <div
        className="relative w-full max-w-sm bg-[#FBF9F5] border border-[#DDD5C5] rounded-xl shadow-2xl text-[#1E2922] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#14291D] text-white">
          <h3 className="font-serif text-lg font-bold">
            {mode === 'login' ? 'Sign In to Aurashka' : 'Create Account'}
          </h3>
          <button
            onClick={handleClose}
            aria-label="Close"
            className="p-1 text-white/70 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Minimalist Tabs */}
        {!successMessage && (
          <div className="flex border-b border-[#E7DFD1] bg-[#FAF8F5]">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setError(null);
              }}
              className={`flex-1 py-2.5 text-xs font-semibold text-center transition-colors border-b-2 ${
                mode === 'login'
                  ? 'border-[#14291D] text-[#14291D] bg-white'
                  : 'border-transparent text-[#726857] hover:text-[#14291D]'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('signup');
                setError(null);
              }}
              className={`flex-1 py-2.5 text-xs font-semibold text-center transition-colors border-b-2 ${
                mode === 'signup'
                  ? 'border-[#14291D] text-[#14291D] bg-white'
                  : 'border-transparent text-[#726857] hover:text-[#14291D]'
              }`}
            >
              Create Account
            </button>
          </div>
        )}

        {/* Form Body */}
        <div className="p-6 space-y-4">
          {/* Prominent Success Alert with Auto-Dismiss & Manual Continue Button */}
          {successMessage ? (
            <div className="p-5 bg-emerald-50 border border-emerald-300 rounded-xl text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div>
                <h4 className="font-serif font-bold text-base text-emerald-950">
                  {successMessage}
                </h4>
                <p className="text-xs text-emerald-700 mt-1">
                  Redirecting to store...
                </p>
              </div>
              <button
                type="button"
                onClick={handleClose}
                className="w-full py-2 px-4 rounded-lg bg-[#14291D] text-white text-xs font-semibold hover:bg-[#203E2D] transition-colors flex items-center justify-center gap-1.5 shadow-sm"
              >
                <span>Continue to Store</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <>
              {error && (
                <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg text-xs text-red-800 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-3 text-xs">
                {mode === 'signup' && (
                  <div>
                    <label className="block font-medium text-[#2F2920] mb-1">Full Name</label>
                    <div className="relative">
                      <User className="w-4 h-4 absolute left-3 top-2.5 text-[#8A8070]" />
                      <input
                        type="text"
                        required
                        placeholder="Your Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-white border border-[#DCD5C5] rounded-lg focus:outline-hidden focus:border-[#2C5E43] text-xs text-[#1E2922]"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block font-medium text-[#2F2920] mb-1">Email Address</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3 top-2.5 text-[#8A8070]" />
                    <input
                      type="email"
                      required
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-white border border-[#DCD5C5] rounded-lg focus:outline-hidden focus:border-[#2C5E43] text-xs text-[#1E2922]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-medium text-[#2F2920] mb-1">Password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3 top-2.5 text-[#8A8070]" />
                    <input
                      type="password"
                      required
                      placeholder="Password (minimum 6 characters)"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-white border border-[#DCD5C5] rounded-lg focus:outline-hidden focus:border-[#2C5E43] text-xs text-[#1E2922]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-[#14291D] hover:bg-[#203E2D] rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-xs disabled:opacity-50"
                >
                  <span>{loading ? 'Processing...' : mode === 'login' ? 'Sign In' : 'Register Account'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>

              {/* Discreet Fast Login for Testing */}
              <div className="pt-3 border-t border-[#EAE3D4] flex items-center justify-between text-[11px] text-[#786F5F]">
                <span>Fast Sign In:</span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleQuickFill('admin@aurashka.com', 'admin123', true)}
                    className="text-[#2C5E43] hover:underline font-medium"
                  >
                    Pharmacist Desk
                  </button>
                  <span>·</span>
                  <button
                    type="button"
                    onClick={() => handleQuickFill('guest@aurashka.com', 'user123', false)}
                    className="text-[#554C3E] hover:underline font-medium"
                  >
                    Customer
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
