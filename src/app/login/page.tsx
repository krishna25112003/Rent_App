'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Building2, TrendingUp, Shield, Sparkles, Mail, Lock, User } from 'lucide-react';

export default function LoginPage() {
    const { user, signInWithEmail, signUpWithEmail, loading } = useAuth();
    const router = useRouter();
    const [isSigningIn, setIsSigningIn] = useState(false);
    const [isSignUp, setIsSignUp] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (user && !loading) {
            router.push('/dashboard');
        }
    }, [user, loading, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!email || !password) {
            setError('Please fill in all fields');
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        try {
            setIsSigningIn(true);
            if (isSignUp) {
                await signUpWithEmail(email, password);
                alert('Account created! Please check your email to verify your account.');
            } else {
                await signInWithEmail(email, password);
            }
        } catch (error: any) {
            console.error('Auth error:', error);
            setError(error.message || 'Authentication failed. Please try again.');
            setIsSigningIn(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col lg:flex-row">
            {/* Left Side - Branding */}
            <div className="lg:w-1/2 bg-gradient-to-br from-primary-600 via-primary-500 to-primary-700 p-8 lg:p-12 flex flex-col justify-center text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>

                <div className="relative z-10 max-w-md mx-auto lg:mx-0">
                    <div className="flex items-center space-x-3 mb-8">
                        <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                            <Building2 className="w-8 h-8" />
                        </div>
                        <h1 className="text-3xl font-bold">RentApp</h1>
                    </div>

                    <h2 className="text-4xl lg:text-5xl font-bold mb-6 leading-tight">
                        Manage Your Properties with Confidence
                    </h2>

                    <p className="text-lg text-blue-100 mb-12">
                        Professional rent management system designed for modern landlords. Track properties, tenants, and payments all in one place.
                    </p>

                    <div className="space-y-6">
                        <div className="flex items-start space-x-4">
                            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0">
                                <Shield className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="font-semibold mb-1">Secure & Private</h3>
                                <p className="text-blue-100 text-sm">Your data is protected with enterprise-grade security and complete isolation.</p>
                            </div>
                        </div>

                        <div className="flex items-start space-x-4">
                            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0">
                                <TrendingUp className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="font-semibold mb-1">Smart Analytics</h3>
                                <p className="text-blue-100 text-sm">Get insights into your rental income with detailed reports and dashboards.</p>
                            </div>
                        </div>

                        <div className="flex items-start space-x-4">
                            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0">
                                <Sparkles className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="font-semibold mb-1">Automated Workflows</h3>
                                <p className="text-blue-100 text-sm">Monthly rent records are generated automatically for all your properties.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="lg:w-1/2 p-8 lg:p-12 flex items-center justify-center">
                <div className="w-full max-w-md">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-slate-900 mb-3">
                            {isSignUp ? 'Create Account' : 'Welcome Back'}
                        </h2>
                        <p className="text-slate-600">
                            {isSignUp ? 'Sign up to get started' : 'Sign in to access your dashboard'}
                        </p>
                    </div>

                    <div className="card">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {error && (
                                <div className="p-4 bg-danger-50 border border-danger-200 rounded-xl">
                                    <p className="text-sm text-danger-700">{error}</p>
                                </div>
                            )}

                            <div>
                                <label className="label">
                                    <Mail className="w-4 h-4 inline mr-2" />
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    required
                                    className="input"
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    disabled={isSigningIn}
                                />
                            </div>

                            <div>
                                <label className="label">
                                    <Lock className="w-4 h-4 inline mr-2" />
                                    Password
                                </label>
                                <input
                                    type="password"
                                    required
                                    className="input"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    disabled={isSigningIn}
                                    minLength={6}
                                />
                                <p className="text-xs text-slate-500 mt-1">
                                    {isSignUp ? 'Must be at least 6 characters' : ''}
                                </p>
                            </div>

                            <button
                                type="submit"
                                disabled={isSigningIn}
                                className="w-full btn btn-primary"
                            >
                                {isSigningIn ? (
                                    <div className="flex items-center justify-center space-x-2">
                                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                                        <span>{isSignUp ? 'Creating Account...' : 'Signing In...'}</span>
                                    </div>
                                ) : (
                                    <span>{isSignUp ? 'Create Account' : 'Sign In'}</span>
                                )}
                            </button>
                        </form>

                        <div className="mt-6 text-center">
                            <button
                                onClick={() => {
                                    setIsSignUp(!isSignUp);
                                    setError('');
                                }}
                                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                                disabled={isSigningIn}
                            >
                                {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
                            </button>
                        </div>
                    </div>

                    <div className="mt-8 p-4 bg-blue-50 rounded-xl border border-blue-100">
                        <p className="text-sm text-blue-800">
                            <strong>Note:</strong> Your data is completely secure and private. Each user has isolated access to their own properties and tenants.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
