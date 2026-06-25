import React, { useRef, useState } from 'react';
import { HistoryItem } from '../types';
import { X, Trash2, Clock, ChevronRight, Download, Upload, Cloud, HardDrive } from 'lucide-react';
import { Button } from './Button';
import { exportHistory, importHistory, getStorageType } from '../services/historyService';

interface HistorySidebarProps {
  isOpen: boolean;
  onClose: () => void;
  history: HistoryItem[];
  onSelect: (item: HistoryItem) => void;
  onClear: () => void;
  onImport: () => void;
}

export const HistorySidebar: React.FC<HistorySidebarProps> = ({
  isOpen,
  onClose,
  history,
  onSelect,
  onClear,
  onImport
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isClearing, setIsClearing] = useState(false);
  const storageType = getStorageType();

  if (!isOpen) return null;

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target?.result as string;
      if (content) {
        const success = await importHistory(content);
        if (success) {
          onImport();
          alert('Database imported successfully.');
        } else {
          alert('Failed to import database. Invalid file format.');
        }
      }
    };
    reader.readAsText(file);
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity"
        onClick={onClose}
      />
      
      {/* Sidebar Panel */}
      <div className="fixed inset-y-0 right-0 w-full sm:w-96 bg-slate-900 border-l border-slate-800 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-900/50">
          <div className="flex flex-col">
            <div className="flex items-center space-x-2 text-indigo-400">
              <Clock className="w-5 h-5" />
              <h2 className="font-semibold text-white">History</h2>
            </div>
            <div className="flex items-center mt-1 ml-7 space-x-1.5">
              {storageType === 'SUPABASE' ? (
                <>
                  <Cloud className="w-3 h-3 text-emerald-400" />
                  <span className="text-[10px] text-emerald-400 font-medium tracking-wide">CLOUD SYNCED</span>
                </>
              ) : (
                <>
                  <HardDrive className="w-3 h-3 text-amber-400" />
                  <span className="text-[10px] text-amber-400 font-medium tracking-wide">LOCAL STORAGE</span>
                </>
              )}
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
          {history.length === 0 ? (
            <div className="text-center py-10">
              <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-3">
                <Clock className="w-6 h-6 text-slate-600" />
              </div>
              <p className="text-slate-500 text-sm">No history yet.</p>
              <p className="text-slate-600 text-xs mt-1">Generate a prompt to start saving.</p>
            </div>
          ) : (
            history.map((item) => (
              <div 
                key={item.id}
                onClick={() => onSelect(item)}
                className="group bg-slate-800/40 hover:bg-slate-800 border border-slate-800 hover:border-indigo-500/30 rounded-lg p-3 cursor-pointer transition-all duration-200"
              >
                <div className="flex justify-between items-start mb-2">
                  <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded uppercase tracking-wider ${
                    item.tone === 'Professional' ? 'bg-blue-500/10 text-blue-400' :
                    item.tone === 'Casual' ? 'bg-green-500/10 text-green-400' :
                    item.tone === 'Polite' ? 'bg-purple-500/10 text-purple-400' :
                    'bg-yellow-500/10 text-yellow-400'
                  }`}>
                    {item.tone}
                  </span>
                  <span className="text-xs text-slate-500">
                    {new Date(item.timestamp).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm text-slate-300 line-clamp-2 mb-2 group-hover:text-white transition-colors">
                  {item.original}
                </p>
                <div className="flex items-center justify-end text-indigo-400/0 group-hover:text-indigo-400 transition-all transform translate-x-2 group-hover:translate-x-0">
                  <span className="text-xs mr-1">Load</span>
                  <ChevronRight className="w-3 h-3" />
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/50 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Button 
              variant="secondary" 
              onClick={exportHistory}
              className="text-xs h-9 bg-slate-800 hover:bg-slate-700"
              icon={<Download className="w-3.5 h-3.5" />}
              disabled={history.length === 0}
            >
              Backup
            </Button>
            <Button 
              variant="secondary" 
              onClick={handleImportClick}
              className="text-xs h-9 bg-slate-800 hover:bg-slate-700"
              icon={<Upload className="w-3.5 h-3.5" />}
            >
              Restore
            </Button>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept=".json" 
              onChange={handleFileChange}
            />
          </div>
          
          {history.length > 0 && (
            <Button 
              variant="ghost" 
              isLoading={isClearing}
              onClick={async () => {
                if (window.confirm('Are you sure you want to delete all history permanently?')) {
                  setIsClearing(true);
                  try {
                    await onClear();
                  } finally {
                    setIsClearing(false);
                  }
                }
              }}
              className="w-full text-red-400 hover:text-red-300 hover:bg-red-500/10 h-9 text-xs"
              icon={<Trash2 className="w-3.5 h-3.5" />}
            >
              Clear Database
            </Button>
          )}
        </div>
      </div>
    </>
  );
};