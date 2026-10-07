"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Mail, Lock, User, ArrowRight, Github, Chrome, CheckCircle, ArrowLeft, Phone, UserRoundCog } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  // Mock authentication state. Change to 'true' to see the "already logged in" view
  const [isAlreadyLoggedIn, setIsAlreadyLoggedIn] = useState(false);
  const router = useRouter();

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault(); 
    
    if(password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    try {
       const register = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name,
          email,
          password,
          phoneNumber: phone
        })
      })

      const data = await register.json();

      if(data.success){
        alert("Registration successful! Please log in.");
        router.push("/auth/login/");
      }
      else {
        alert("Registration failed: " + data.message);
      }

    } catch (error) {
      console.error("Error during registration:", error);
      alert("An error occurred during registration. Please try again later.");
    }
  };

  useEffect(() => {
    // If logic to check token existed, it would happen here
  }, []);

  if (isAlreadyLoggedIn) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex relative items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-black overflow-hidden font-sans">
        
        {/* Decorative background elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full overflow-hidden z-0 pointer-events-none">
          <div className="absolute -top-[20%] -right-[10%] w-[50%] h-[50%] rounded-full bg-blue-400/20 dark:bg-blue-600/10 blur-3xl mix-blend-multiply dark:mix-blend-screen animate-blob"></div>
          <div className="absolute top-[20%] -left-[10%] w-[40%] h-[40%] rounded-full bg-emerald-400/20 dark:bg-emerald-600/10 blur-3xl mix-blend-multiply dark:mix-blend-screen animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-[20%] left-[20%] w-[60%] h-[60%] rounded-full bg-purple-400/20 dark:bg-purple-600/10 blur-3xl mix-blend-multiply dark:mix-blend-screen animate-blob animation-delay-4000"></div>
        </div>
  
        <div className="max-w-md w-full text-center bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl p-10 rounded-3xl shadow-2xl border border-white/20 dark:border-gray-800/50 relative z-10 transform transition-all animate-in fade-in slide-in-from-bottom-8 duration-700">
          
          {/* Icon */}
          <div className="mx-auto w-20 h-20 bg-emerald-50 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mb-6 shadow-inner relative">
            <div className="absolute inset-0 rounded-full border-4 border-emerald-100 dark:border-emerald-900/50 scale-110 animate-pulse"></div>
            <CheckCircle className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
          </div>
          
          {/* Text */}
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-3">
            Already Logged In
          </h2>
          <p className="text-base text-gray-500 dark:text-gray-400 mb-8 max-w-sm mx-auto">
            You are currently signed into your account. Do you want to return to the homepage or sign out?
          </p>
  
          {/* Buttons */}
          <div className="space-y-4">
            <Link 
              href="/" 
              className="group relative w-full flex justify-center items-center py-3.5 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 active:scale-[0.98]"
            >
              Continue to Dashboard
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            
            <Link 
              href="/auth/logout" 
              className="w-full flex justify-center items-center py-3.5 px-4 border border-gray-200 dark:border-gray-700 text-sm font-bold rounded-xl text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all shadow-sm active:scale-[0.98]"
            >
              <ArrowLeft className="mr-2 h-5 w-5 text-gray-400 dark:text-gray-500" />
              Sign Out Instead
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Registration Form UI
  return (
    <div className="min-h-[calc(100vh-4rem)] flex relative items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-black overflow-hidden font-sans">
      
      {/* Decorative background elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute -top-[20%] -right-[10%] w-[50%] h-[50%] rounded-full bg-blue-400/20 dark:bg-blue-600/10 blur-3xl mix-blend-multiply dark:mix-blend-screen animate-blob"></div>
        <div className="absolute top-[20%] -left-[10%] w-[40%] h-[40%] rounded-full bg-purple-400/20 dark:bg-purple-600/10 blur-3xl mix-blend-multiply dark:mix-blend-screen animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-[20%] left-[20%] w-[60%] h-[60%] rounded-full bg-emerald-400/20 dark:bg-emerald-600/10 blur-3xl mix-blend-multiply dark:mix-blend-screen animate-blob animation-delay-4000"></div>
      </div>

      <div className="max-w-md w-full space-y-8 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl p-8 sm:p-10 rounded-3xl shadow-2xl border border-white/20 dark:border-gray-800/50 relative z-10 transform transition-all mt-8 mb-8">
        
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center p-3 bg-blue-100 dark:bg-blue-900/30 rounded-2xl mb-4 shadow-inner">
            <User className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h2 className="text-center text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Create an account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Already have an account?{' '}
            <Link href="/auth/login" className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 transition-colors">
              Log in
            </Link>
          </p>
        </div>

        {/* Form */}
        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          
          <div>
            <label htmlFor="name" className="sr-only">Full Name</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
              </div>
              <input
                id="name" name="name" type="text" required
                className="appearance-none block w-full pl-10 pr-3 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50/50 dark:bg-gray-800/50 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm sm:text-sm"
                placeholder="Full Name"
                value={name} onChange={(e) => setName(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label htmlFor="email-address" className="sr-only">Email address</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
              </div>
              <input
                id="email-address" name="email" type="email" autoComplete="email" required
                className="appearance-none block w-full pl-10 pr-3 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50/50 dark:bg-gray-800/50 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm sm:text-sm"
                placeholder="Email address"
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="sr-only">Password</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
              </div>
              <input
                id="password" name="password" type="password" required
                className="appearance-none block w-full pl-10 pr-3 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50/50 dark:bg-gray-800/50 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm sm:text-sm"
                placeholder="Password"
                value={password} 
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label htmlFor="confirm-password" className="sr-only">Confirm Password</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
              </div>
              <input
                id="confirm-password" name="confirm-password" type="password" required
                className="appearance-none block w-full pl-10 pr-3 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50/50 dark:bg-gray-800/50 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm sm:text-sm"
                placeholder="Confirm password"
                value={confirmPassword} 
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>
          <div>
            <label htmlFor="phone-number" className="sr-only">Phone</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Phone className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
              </div>
              <input
                id="phone-number" name="phone-number" type="number" required
                className="appearance-none block w-full pl-10 pr-3 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50/50 dark:bg-gray-800/50 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm sm:text-sm"
                placeholder="Mobile Number"
                value={phone} 
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group cursor-pointer mt-4 relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 active:scale-[0.98]"
            >
              Sign up
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </form>

        {/* Social Login Divider */}
        <div className="mt-8">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200 dark:border-gray-700" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400 rounded-full text-xs font-medium uppercase tracking-wider backdrop-blur-xl">
                Or register with
              </span>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <button className="w-full inline-flex justify-center py-2.5 px-4 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm bg-white dark:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors">
              <span className="sr-only">Sign up with Google</span>
              <Chrome className="w-5 h-5 text-red-500" />
            </button>
            <button className="w-full inline-flex justify-center py-2.5 px-4 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm bg-white dark:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors">
              <span className="sr-only">Sign up with GitHub</span>
              <Github className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
