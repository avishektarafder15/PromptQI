import React, { useState, useCallback, useEffect } from 'react';
import { Wand2, AlertCircle, Terminal, Thermometer, MessageSquare, History as HistoryIcon, Cloud, HardDrive, Check } from 'lucide-react';
import { enhancePrompt } from './services/geminiService';
import { getHistory, saveHistoryItem, clearHistory, getStorageType } from './services/historyService';
import { AppState, EnhancementResponse, ToneType, HistoryItem } from './types';
import { Button } from './components/Button';
import { ResultSection } from './components/ResultSection';
import { HistorySidebar } from './components/HistorySidebar';

function App() {
  const [promptInput, setPromptInput] = useState('');
  const [temperature, setTemperature] = useState(0.7);
  const [tone, setTone] = useState<ToneType>('Professional');
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [result, setResult] = useState<EnhancementResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // History State
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [storageType, setStorageType] = useState<'SUPABASE' | 'LOCAL'>('LOCAL');

  // Load history on mount
  useEffect(() => {
    const loadData = async () => {
      const data = await getHistory();
      setHistory(data);
      setStorageType(getStorageType());
    };
    loadData();
  }, []);

  const tones: ToneType[] = ['Professional', 'Casual', 'Polite', 'Emojify'];

  const handleEnhance = useCallback(async () => {
    if (!promptInput.trim()) return;

    setAppState(AppState.PROCESSING);
    setError(null);

    try {
      const data = await enhancePrompt(promptInput, temperature, tone);
      setResult(data);
      setAppState(AppState.COMPLETE);

      // Save to History (Async)
      const newItem: HistoryItem = {
        id: crypto.randomUUID(),
        original: promptInput,
        result: data,
        timestamp: Date.now(),
        tone: tone
      };
      
      // Optimistic update or wait for save
      const updatedHistory = await saveHistoryItem(newItem);
      setHistory(updatedHistory);

    } catch (err) {
      setAppState(AppState.ERROR);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    }
  }, [promptInput, temperature, tone]);

  const handleReset = () => {
    setAppState(AppState.IDLE);
    setResult(null);
    setPromptInput('');
  };

  const handleHistorySelect = (item: HistoryItem) => {
    setPromptInput(item.original);
    setResult(item.result);
    setTone(item.tone);
    setAppState(AppState.COMPLETE);
    setShowHistory(false);
  };

  const handleClearHistory = async () => {
    try {
      await clearHistory();
      setHistory([]);
    } catch (e) {
      console.error("Failed to clear history:", e);
      alert("Failed to clear history from cloud storage. Please check your internet connection.");
    }
  };

  const handleImportHistory = async () => {
    const data = await getHistory();
    setHistory(data);
  };

  return (
    <div className="min-h-screen bg-slate-950 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-slate-950 to-slate-950 text-slate-200 selection:bg-indigo-500/30">
      
      {/* Navbar */}
      <nav className="border-b border-slate-800/60 bg-slate-950/50 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={handleReset}>
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <Wand2 className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight text-white">PromptQI</span>
          </div>
          <div className="flex items-center gap-4">
            
            {/* Connection Status Badge */}
            <div className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
              storageType === 'SUPABASE' 
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
            }`}>
              {storageType === 'SUPABASE' ? (
                <>
                  <Cloud className="w-3.5 h-3.5" />
                  <span>Cloud Synced</span>
                </>
              ) : (
                <>
                  <HardDrive className="w-3.5 h-3.5" />
                  <span>Local Only</span>
                </>
              )}
            </div>

            <div className="h-6 w-px bg-slate-800 hidden sm:block"></div>

            <button 
              onClick={() => setShowHistory(true)}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors relative group"
              title="View History"
            >
              <HistoryIcon className="w-5 h-5" />
              {history.length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-500 rounded-full ring-2 ring-slate-950"></span>
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* History Sidebar */}
      <HistorySidebar 
        isOpen={showHistory} 
        onClose={() => setShowHistory(false)} 
        history={history}
        onSelect={handleHistorySelect}
        onClear={handleClearHistory}
        onImport={handleImportHistory}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {appState === AppState.IDLE || appState === AppState.PROCESSING || appState === AppState.ERROR ? (
          <div className="max-w-3xl mx-auto space-y-10">
            
            {/* Hero Header */}
            <div className="text-center space-y-4">
              <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
                Transform Vague Ideas into <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Powerful Prompts</span>
              </h1>
              <p className="text-lg text-slate-400 max-w-2xl mx-auto">
                Stop struggling with LLM hallucinations. Get structured, optimized prompts tailored for specific outcomes instantly.
              </p>
            </div>

            {/* Input Section */}
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-500"></div>
              <div className="relative bg-slate-900 rounded-xl border border-slate-800 p-1 shadow-2xl">
                <div className="relative">
                   {/* Icon aligned with first line of text (approx 18px from top for optical centering) */}
                   <div className="absolute top-4 mt-0.5 left-3 text-slate-500">
                     <Terminal className="w-5 h-5" />
                   </div>
                  <textarea
                    value={promptInput}
                    onChange={(e) => setPromptInput(e.target.value)}
                    placeholder="e.g., Write a blog post about coffee..."
                    className="w-full h-48 bg-slate-950 rounded-lg p-4 pl-10 text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-0 resize-none font-mono text-sm leading-relaxed"
                    disabled={appState === AppState.PROCESSING}
                  />
                  <div className="absolute bottom-3 right-3 text-xs text-slate-600 font-mono">
                    {promptInput.length} chars
                  </div>
                </div>
              </div>
            </div>

            {/* Settings Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Temperature Control */}
              <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 flex flex-col justify-between h-full">
                <div className="flex items-start space-x-3 mb-3">
                  <div className="p-2 bg-slate-800 rounded-lg flex-shrink-0">
                    <Thermometer className="w-5 h-5 text-indigo-400" />
                  </div>
                  <div>
                    <label htmlFor="temp-slider" className="block text-sm font-medium text-slate-200">
                      Creativity Level
                    </label>
                    <p className="text-xs text-slate-500 mt-1">
                      Adjust variability.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <span className="text-xs font-mono text-slate-500 w-4">0.0</span>
                  <div className="flex-1 relative flex items-center">
                    <input
                      id="temp-slider"
                      type="range"
                      min="0"
                      max="2"
                      step="0.1"
                      value={temperature}
                      onChange={(e) => setTemperature(parseFloat(e.target.value))}
                      className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                    />
                  </div>
                  <span className="text-sm font-mono text-indigo-400 font-bold w-8 text-right">
                    {temperature.toFixed(1)}
                  </span>
                </div>
              </div>

              {/* Tone Control */}
              <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 flex flex-col justify-between h-full">
                <div className="flex items-start space-x-3 mb-4">
                  <div className="p-2 bg-slate-800 rounded-lg flex-shrink-0">
                    <MessageSquare className="w-5 h-5 text-indigo-400" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-200">
                      Output Tone
                    </label>
                    <p className="text-xs text-slate-500 mt-1">
                      Style of the generated response.
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  {tones.map((t) => (
                    <button
                      key={t}
                      onClick={() => setTone(t)}
                      className={`px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 border ${
                        tone === t
                          ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/20'
                          : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700 hover:text-white hover:border-slate-600'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

            </div>

            {/* Error Message */}
            {appState === AppState.ERROR && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex items-center text-red-400 animate-fade-in">
                <AlertCircle className="w-5 h-5 mr-2 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Action Button */}
            <div className="flex justify-center">
              <Button
                onClick={handleEnhance}
                disabled={!promptInput.trim()}
                isLoading={appState === AppState.PROCESSING}
                className="w-full sm:w-auto min-w-[200px] py-3 text-lg shadow-indigo-500/25"
                icon={<Wand2 className="w-5 h-5" />}
              >
                {appState === AppState.PROCESSING ? 'Optimizing...' : 'Enhance Prompt'}
              </Button>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12 border-t border-slate-800/50">
              {[
                { title: "Context Injection", desc: "Automatically adds necessary context and personas." },
                { title: "Structure Formatting", desc: "Organizes output requirements clearly." },
                { title: "Chain of Thought", desc: "Enables step-by-step reasoning for models." }
              ].map((f, i) => (
                <div key={i} className="text-center space-y-2">
                  <h3 className="text-white font-semibold">{f.title}</h3>
                  <p className="text-sm text-slate-500">{f.desc}</p>
                </div>
              ))}
            </div>

          </div>
        ) : (
          result && <ResultSection data={result} onReset={handleReset} />
        )}
      </main>
    </div>
  );
}

export default App;