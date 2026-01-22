'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Shield, TrendingUp, Sparkles, Mail, Lock } from 'lucide-react';
import Logo from '@/components/Logo';

export default function LoginPage() {
    const { user, signInWithGoogle, signInWithEmail, signUpWithEmail, loading } = useAuth();
    const router = useRouter();
    const [isSigningIn, setIsSigningIn] = useState(false);
    const [isSignUp, setIsSignUp] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!loading && user) {
            router.push('/dashboard');
        }
    }, [user, loading, router]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    const handleEmailAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsSigningIn(true);

        try {
            if (isSignUp) {
                await signUpWithEmail(email, password);
                alert('Account created! Please sign in.');
                setIsSignUp(false);
            } else {
                await signInWithEmail(email, password);
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsSigningIn(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col lg:flex-row bg-white">
            {/* Left Side - Branding */}
            <div className="lg:w-1/2 bg-gradient-to-br from-slate-900 to-slate-800 text-white p-8 lg:p-16 flex flex-col justify-between relative overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>

                <div className="relative z-10">
                    <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl w-fit mb-8 border border-white/10">
                        <Logo className="w-12 h-12" textSize="text-3xl" showText={true} theme="light" />
                    </div>

                    <h1 className="text-4xl lg:text-5xl font-bold mb-6 leading-tight">
                        Rent management made <span className="text-green-400">easy</span>.
                    </h1>
                    <p className="text-lg text-slate-300 max-w-md">
                        The all-in-one solution for landlords to manage properties, tenants, and payments with ease.
                    </p>
                </div>

                <div className="relative z-10 grid gap-6 mt-12">
                    <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                            <Shield className="w-5 h-5 text-green-400" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-white">Bank-Grade Security</h3>
                            <p className="text-sm text-slate-400">Your data is encrypted and secure.</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                            <TrendingUp className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-white">Smart Analytics</h3>
                            <p className="text-sm text-slate-400">Track your income and growth.</p>
                        </div>
                    </div>
                </div>

                <div className="relative z-10 mt-12 text-sm text-slate-500">
                    © 2026 RentWell Inc.
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="lg:w-1/2 flex items-center justify-center p-8 lg:p-16 bg-slate-50">
                <div className="w-full max-w-md space-y-8">
                    <div className="text-center lg:text-left">
                        <h2 className="text-3xl font-bold text-slate-900">
                            {isSignUp ? 'Create Account' : 'Welcome Back'}
                        </h2>
                        <p className="mt-2 text-slate-600">
                            {isSignUp ? 'Enter your details to get started' : 'Sign in to access your dashboard'}
                        </p>
                    </div>

                    <form onSubmit={handleEmailAuth} className="mt-8 space-y-6">
                        {error && (
                            <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-red-700">
                                <span className="text-sm font-medium">{error}</span>
                            </div>
                        )}

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Email address</label>
                                <div className="relative">
                                    <input
                                        type="email"
                                        required
                                        className="input pl-10"
                                        placeholder="you@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        disabled={isSigningIn}
                                    />
                                    <Mail className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                                <div className="relative">
                                    <input
                                        type="password"
                                        required
                                        className="input pl-10"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        disabled={isSigningIn}
                                        minLength={6}
                                    />
                                    <Lock className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                </div>
                                {isSignUp && (
                                    <p className="mt-1 text-xs text-slate-500">Must be at least 6 characters</p>
                                )}
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isSigningIn}
                            className={`w-full btn btn-primary flex items-center justify-center ${isSigningIn ? 'opacity-75 cursor-not-allowed' : ''}`}
                        >
                            {isSigningIn ? (
                                <>
                                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                                    Processing...
                                </>
                            ) : (
                                isSignUp ? 'Create Account' : 'Sign In'
                            )}
                        </button>

                        <div className="mt-6 text-center">
                            <p className="text-sm text-slate-600">
                                {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsSignUp(!isSignUp);
                                        setError(null);
                                    }}
                                    className="font-medium text-primary-600 hover:text-primary-500 transition-colors"
                                >
                                    {isSignUp ? 'Sign In' : 'Sign Up'}
                                </button>
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
