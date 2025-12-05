'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import LogoutButton from '@/components/LogoutButton';

export default function Home() {
    const { data: session } = useSession();
    const [keyword, setKeyword] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [searched, setSearched] = useState(false);

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!keyword.trim()) return;

        setLoading(true);
        setError('');
        setResults([]);
        setSearched(false);

        try {
            const res = await fetch('/api/search', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ seed_keyword: keyword }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Something went wrong');
            }

            setResults(data.keywords || []);
            setSearched(true);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        // Optional: Show a toast
    };

    return (
        <main className="min-h-screen flex flex-col items-center justify-start p-8 sm:p-20 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-900 via-[#0a0a0a] to-black">

            {/* Hero Section */}
            <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm flex flex-col gap-8 animate-fade-in">
                <div className="w-full flex justify-end mb-4">
                    <LogoutButton />
                </div>
                <h1 className="text-5xl sm:text-7xl font-bold tracking-tight text-center">
                    Keyword <span className="text-gradient">Finder</span>
                </h1>
                <p className="text-gray-400 text-lg text-center max-w-2xl">
                    Discover high-volume, low-competition keywords. (Use Bulk Finder <a href="/bulk" className="text-indigo-400 hover:text-indigo-300 underline transition-colors">here</a>.)
                </p>

                {/* Search Bar */}
                <form onSubmit={handleSearch} className="w-full max-w-xl mt-8 relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
                    <div className="relative flex items-center">
                        <input
                            type="text"
                            value={keyword}
                            onChange={(e) => setKeyword(e.target.value)}
                            placeholder="Enter a seed keyword (e.g., 'running shoes')"
                            className="block w-full p-4 pl-6 text-lg text-white bg-black border border-gray-800 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none placeholder-gray-600 shadow-xl"
                        />
                        <button
                            type="submit"
                            disabled={loading}
                            className="absolute right-2.5 bottom-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-md text-sm px-6 py-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Searching...' : 'Search'}
                        </button>
                    </div>
                </form>
            </div>

            {/* Error Message */}
            {error && (
                <div className="mt-8 p-4 text-red-400 bg-red-900/20 border border-red-900/50 rounded-lg animate-fade-in">
                    Error: {error}
                </div>
            )}

            {/* Results Section */}
            {searched && (
                <div className="w-full max-w-5xl mt-16 animate-fade-in delay-200">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-semibold text-gray-200">
                            Results <span className="text-gray-500 text-base font-normal ml-2">({results.length} found)</span>
                        </h2>
                    </div>

                    {results.length === 0 ? (
                        <div className="text-center text-gray-500 py-12 glass rounded-xl">
                            No keywords found with KD &lt; 40. Try a different seed keyword.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-4">
                            {/* Header */}
                            <div className="hidden sm:grid grid-cols-12 gap-4 px-6 py-3 text-sm font-medium text-gray-500 uppercase tracking-wider">
                                <div className="col-span-6">Keyword</div>
                                <div className="col-span-3 text-right">Volume</div>
                                <div className="col-span-3 text-right">Difficulty</div>
                            </div>

                            {/* List */}
                            {results.map((item, index) => (
                                <div
                                    key={index}
                                    className="group relative grid grid-cols-1 sm:grid-cols-12 gap-4 px-6 py-4 glass rounded-xl items-center hover:bg-white/5 transition-colors duration-200"
                                    style={{ animationDelay: `${index * 0.05}s` }}
                                >
                                    <div className="col-span-6 font-medium text-lg text-gray-200 flex items-center gap-3">
                                        {item.keyword}
                                        <button
                                            onClick={() => copyToClipboard(item.keyword)}
                                            className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-500 hover:text-white"
                                            title="Copy"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                                        </button>
                                    </div>
                                    <div className="col-span-3 text-right text-gray-400 font-mono">
                                        {item.search_volume.toLocaleString()}
                                    </div>
                                    <div className="col-span-3 text-right">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                      ${item.keyword_difficulty < 15 ? 'bg-green-900/30 text-green-400' :
                                                item.keyword_difficulty < 30 ? 'bg-yellow-900/30 text-yellow-400' :
                                                    'bg-orange-900/30 text-orange-400'}`}>
                                            {item.keyword_difficulty}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </main>
    );
}
