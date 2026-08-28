import  { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import cityPhoto from '../assets/city-photo.jpeg';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { handleRegister } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await handleRegister({ name, email, password });
      navigate('/dashboard');
    } catch (error) {
      alert(error.message || "Registration failed. Please try again.");
    }
  };

  return (
    <div className="relative h-screen w-screen flex items-center justify-center p-4">
      {/* Background */}
      <div className="absolute inset-0 z-[-1]">
        <img src={cityPhoto} alt="City" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/60"></div>
      </div>

      {/* Glassmorphism Card */}
      <div className="w-full max-w-md bg-black/40 backdrop-blur-xl border border-white/10 rounded-[2rem] p-8 shadow-2xl text-white">
        <h2 className="text-3xl font-bold mb-2">Create Account</h2>
        <p className="text-white/60 mb-8">Join the urban intelligence network</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input 
            type="text" placeholder="Full Name" required
            value={name} onChange={(e) => setName(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-emerald-500 transition-colors"
          />
          <input 
            type="email" placeholder="Email Address" required
            value={email} onChange={(e) => setEmail(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-emerald-500 transition-colors"
          />
          <input 
            type="password" placeholder="Password" required
            value={password} onChange={(e) => setPassword(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-emerald-500 transition-colors"
          />
          
          <button type="submit" className="bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-md text-white font-medium py-3 rounded-xl mt-4 transition-all shadow-lg active:scale-[0.98]">
            Register
          </button>
        </form>

        <p className="text-center text-sm text-white/60 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-emerald-400 font-medium hover:underline">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
}