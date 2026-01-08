'use client';

import { useState, useEffect } from 'react';

export default function BulkPage() {
    const [keywordsInput, setKeywordsInput] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [progress, setProgress] = useState({ current: 0, total: 0 });
    const [results, setResults] = useState([]);
    const [error, setError] = useState('');
    const [processingStatus, setProcessingStatus] = useState('');
    const [processingErrors, setProcessingErrors] = useState([]);

    // Load results from localStorage on mount
    useEffect(() => {
        const savedResults = localStorage.getItem('bulkKeywordResults');
        if (savedResults) {
            try {
                const parsed = JSON.parse(savedResults);
                setResults(parsed);
            } catch (e) {
                console.error('Failed to load saved results:', e);
            }
        }
    }, []);

    // Save results to localStorage whenever they change
    useEffect(() => {
        if (results.length > 0) {
            localStorage.setItem('bulkKeywordResults', JSON.stringify(results));
        }
    }, [results]);

    const parseKeywords = (input) => {
        // Split by commas or newlines, trim, and filter empty strings
        return input
            .split(/[,\n]/)
            .map(k => k.trim())
            .filter(k => k.length > 0);
    };

    const handleBulkSearch = async (e) => {
        e.preventDefault();
        
        const keywords = parseKeywords(keywordsInput);
        
        if (keywords.length === 0) {
            setError('Please enter at least one keyword');
            return;
        }

        setIsProcessing(true);
        setError('');
        setProcessingErrors([]);
        setProgress({ current: 0, total: keywords.length });
        setProcessingStatus(`Starting bulk search for ${keywords.length} keywords...`);
        
        // Clear previous results or keep them (user's choice - we'll keep them)
        // setResults([]);

        const allResults = [...results];
        const errors = [];
        let completed = 0;

        // Process keywords sequentially to avoid overwhelming the API
        for (let i = 0; i < keywords.length; i++) {
            const seedKeyword = keywords[i];
            setProcessingStatus(`Processing "${seedKeyword}" (${i + 1}/${keywords.length})...`);
            setProgress({ current: i + 1, total: keywords.length });

            try {
                const res = await fetch('/api/search', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ seed_keyword: seedKeyword }),
                });

                const data = await res.json();

                if (res.ok && data.keywords) {
                    // Add seed keyword to each result
                    const keywordsWithSeed = data.keywords.map(kw => ({
                        ...kw,
                        seed_keyword: seedKeyword
                    }));

                    // Merge with existing results, avoiding duplicates
                    keywordsWithSeed.forEach(newKw => {
                        const exists = allResults.find(
                            r => r.keyword === newKw.keyword && r.seed_keyword === newKw.seed_keyword
                        );
                        if (!exists) {
                            allResults.push(newKw);
                        }
                    });

                    // Sort all results by volume (descending), then by KD (ascending)
                    allResults.sort((a, b) => {
                        if (b.search_volume !== a.search_volume) {
                            return b.search_volume - a.search_volume;
                        }
                        return a.keyword_difficulty - b.keyword_difficulty;
                    });

                    setResults([...allResults]);
                } else {
                    const errorMsg = data.error || 'Unknown error';
                    const errorEntry = { keyword: seedKeyword, error: errorMsg };
                    errors.push(errorEntry);
                    setProcessingErrors([...errors]);
                    console.error(`Error processing "${seedKeyword}":`, errorMsg);
                    
                    // If it's a payment/credit error, stop processing and show error
                    if (errorMsg.toLowerCase().includes('payment') || errorMsg.toLowerCase().includes('credit')) {
                        setError(`Payment Required: ${errorMsg}. Processing stopped.`);
                        setIsProcessing(false);
                        return;
                    }
                }
            } catch (err) {
                const errorMsg = err.message || 'Network error';
                const errorEntry = { keyword: seedKeyword, error: errorMsg };
                errors.push(errorEntry);
                setProcessingErrors([...errors]);
                console.error(`Error processing "${seedKeyword}":`, errorMsg);
            }

            completed++;
            
            // Small delay to avoid rate limiting
            if (i < keywords.length - 1) {
                await new Promise(resolve => setTimeout(resolve, 500));
            }
        }

        if (errors.length > 0 && errors.length < keywords.length) {
            setProcessingStatus(`Completed with ${errors.length} error(s). Found ${allResults.length} total keywords.`);
        } else if (errors.length === 0) {
            setProcessingStatus(`Completed! Found ${allResults.length} total keywords.`);
        } else {
            setProcessingStatus(`Completed with errors. Found ${allResults.length} total keywords.`);
        }
        setIsProcessing(false);
    };

    const clearResults = () => {
        if (confirm('Are you sure you want to clear all results?')) {
            setResults([]);
            localStorage.removeItem('bulkKeywordResults');
        }
    };

    const exportResults = () => {
        const csv = [
            ['Seed Keyword', 'Keyword', 'Search Volume', 'Keyword Difficulty'].join(','),
            ...results.map(r => [
                r.seed_keyword,
                `"${r.keyword}"`,
                r.search_volume,
                r.keyword_difficulty
            ].join(','))
        ].join('\n');

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `bulk-keywords-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
    };

    return (
        <main className="min-h-screen flex flex-col items-center justify-start p-8 sm:p-20 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-900 via-[#0a0a0a] to-black">
            {/* Header */}
            <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm flex flex-col gap-8 animate-fade-in">
                <div className="flex items-center justify-between w-full">
                    <a href="/" className="text-indigo-400 hover:text-indigo-300 transition-colors underline">
                        ← Back to Single Search
                    </a>
                </div>
                
                <h1 className="text-5xl sm:text-7xl font-bold tracking-tight text-center">
                    Bulk Keyword <span className="text-gradient">Finder</span>
                </h1>
                <p className="text-gray-400 text-lg text-center max-w-2xl">
                    Enter multiple seed keywords (comma or line-separated) to find high-volume, low-competition keywords in bulk.
                </p>

                {/* Input Form */}
                <form onSubmit={handleBulkSearch} className="w-full max-w-4xl mt-8 relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
                    <div className="relative">
                        <textarea
                            value={keywordsInput}
                            onChange={(e) => setKeywordsInput(e.target.value)}
                            placeholder="Enter keywords separated by commas or new lines&#10;Example:&#10;running shoes&#10;fitness equipment&#10;yoga mats"
                            disabled={isProcessing}
                            className="block w-full p-4 text-lg text-white bg-black border border-gray-800 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none placeholder-gray-600 shadow-xl resize-y min-h-[200px] disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                        <div className="flex justify-between items-center mt-4">
                            <button
                                type="submit"
                                disabled={isProcessing || !keywordsInput.trim()}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-md px-6 py-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isProcessing ? 'Processing...' : 'Start Bulk Search'}
                            </button>
                            {results.length > 0 && (
                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={exportResults}
                                        className="bg-green-600 hover:bg-green-700 text-white font-medium rounded-md px-4 py-2 transition-all text-sm"
                                    >
                                        Export CSV
                                    </button>
                                    <button
                                        type="button"
                                        onClick={clearResults}
                                        className="bg-red-600 hover:bg-red-700 text-white font-medium rounded-md px-4 py-2 transition-all text-sm"
                                    >
                                        Clear Results
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </form>
            </div>

            {/* Progress Bar */}
            {isProcessing && (
                <div className="w-full max-w-4xl mt-8 animate-fade-in">
                    <div className="glass rounded-xl p-6">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-gray-300 font-medium">{processingStatus}</span>
                            <span className="text-gray-400 text-sm">
                                {progress.current} / {progress.total}
                            </span>
                        </div>
                        <div className="w-full bg-gray-800 rounded-full h-3 overflow-hidden">
                            <div
                                className="bg-gradient-to-r from-indigo-500 to-purple-600 h-full transition-all duration-300"
                                style={{ width: `${(progress.current / progress.total) * 100}%` }}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Error Message */}
            {error && (
                <div className="mt-8 p-4 text-red-400 bg-red-900/20 border border-red-900/50 rounded-lg animate-fade-in max-w-4xl w-full">
                    <strong>Error:</strong> {error}
                </div>
            )}

            {/* Processing Errors */}
            {processingErrors.length > 0 && !isProcessing && (
                <div className="mt-8 max-w-4xl w-full animate-fade-in">
                    <div className="glass rounded-xl p-6">
                        <h3 className="text-lg font-semibold text-yellow-400 mb-4">
                            Processing Errors ({processingErrors.length})
                        </h3>
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                            {processingErrors.map((err, idx) => (
                                <div key={idx} className="text-sm text-gray-300 p-2 bg-gray-800/50 rounded">
                                    <span className="font-medium text-yellow-400">"{err.keyword}":</span> {err.error}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Results Section */}
            {results.length > 0 && (
                <div className="w-full max-w-5xl mt-16 animate-fade-in delay-200">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-semibold text-gray-200">
                            Results <span className="text-gray-500 text-base font-normal ml-2">({results.length} keywords found)</span>
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        {/* Header */}
                        <div className="hidden sm:grid grid-cols-12 gap-4 px-6 py-3 text-sm font-medium text-gray-500 uppercase tracking-wider">
                            <div className="col-span-2">Seed Keyword</div>
                            <div className="col-span-4">Keyword</div>
                            <div className="col-span-2 text-right">Volume</div>
                            <div className="col-span-2 text-right">Difficulty</div>
                            <div className="col-span-2"></div>
                        </div>

                        {/* List */}
                        {results.map((item, index) => (
                            <div
                                key={`${item.seed_keyword}-${item.keyword}-${index}`}
                                className="group relative grid grid-cols-1 sm:grid-cols-12 gap-4 px-6 py-4 glass rounded-xl items-center hover:bg-white/5 transition-colors duration-200"
                                style={{ animationDelay: `${index * 0.02}s` }}
                            >
                                <div className="col-span-2 text-sm text-gray-400 font-medium">
                                    <span className="text-indigo-400">{item.seed_keyword}</span>
                                </div>
                                <div className="col-span-4 font-medium text-lg text-gray-200 flex items-center gap-3">
                                    {item.keyword}
                                    <button
                                        onClick={() => copyToClipboard(item.keyword)}
                                        className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-500 hover:text-white"
                                        title="Copy"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                                    </button>
                                </div>
                                <div className="col-span-2 text-right text-gray-400 font-mono">
                                    {item.search_volume.toLocaleString()}
                                </div>
                                <div className="col-span-2 text-right">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                      ${item.keyword_difficulty < 15 ? 'bg-green-900/30 text-green-400' :
                                                item.keyword_difficulty < 30 ? 'bg-yellow-900/30 text-yellow-400' :
                                                    'bg-orange-900/30 text-orange-400'}`}>
                                        {item.keyword_difficulty}
                                    </span>
                                </div>
                                <div className="col-span-2"></div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Empty State */}
            {!isProcessing && results.length === 0 && keywordsInput && (
                <div className="mt-8 text-center text-gray-500 py-12 glass rounded-xl max-w-4xl w-full">
                    No results yet. Start a bulk search to find keywords!
                </div>
            )}
        </main>
    );
}

