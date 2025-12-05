'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const result = await signIn('credentials', {
                username,
                password,
                redirect: false,
            });

            if (result?.error) {
                setError('Invalid username or password');
                setLoading(false);
            } else {
                router.push('/');
                router.refresh();
            }
        } catch (err) {
            setError('An error occurred. Please try again.');
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen flex items-center justify-center p-8 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-900 via-[#0a0a0a] to-black">
            <div className="w-full max-w-md">
                <div className="glass rounded-xl p-8 shadow-2xl">
                    <h1 className="text-4xl font-bold text-center mb-2">
                        Keyword <span className="text-gradient">Finder</span>
                    </h1>
                    <p className="text-gray-400 text-center mb-8">Sign in to continue</p>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="p-4 text-red-400 bg-red-900/20 border border-red-900/50 rounded-lg">
                                {error}
                            </div>
                        )}

                        <div>
                            <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-2">
                                Username
                            </label>
                            <input
                                id="username"
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                                className="w-full p-3 bg-black border border-gray-800 rounded-lg text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                                placeholder="Enter username"
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                                Password
                            </label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="w-full p-3 bg-black border border-gray-800 rounded-lg text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                                placeholder="Enter password"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg px-6 py-3 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Signing in...' : 'Sign In'}
                        </button>
                    </form>
                </div>
            </div>
        </main>
    );
}

