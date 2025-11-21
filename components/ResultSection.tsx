import React, { useState } from 'react';
import { EnhancementResponse } from '../types';
import { Copy, Check, Sparkles, Zap, BarChart3, ArrowRight } from 'lucide-react';
import { Button } from './Button';

interface ResultSectionProps {
  data: EnhancementResponse;
  onReset: () => void;
}

export const ResultSection: React.FC<ResultSectionProps> = ({ data, onReset }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(data.enhancedPrompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  // Simple parser to render **bold** text
  const renderFormattedText = (text: string) => {
    // Split text by bold markers
    const parts = text.split(/(\*\*.*?\*\*)/g);
    
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        // Remove asterisks and render bold with specific styling
        return (
          <span key={index} className="text-indigo-400 font-bold">
            {part.slice(2, -2)}
          </span>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 animate-fade-in-up">
      
      {/* Main Enhanced Output Card */}
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
        <div className="relative bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-xl p-6 shadow-2xl">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center space-x-2 text-indigo-400">
              <Sparkles className="w-5 h-5" />
              <h2 className="text-lg font-semibold text-white">Enhanced Prompt</h2>
            </div>
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                onClick={handleCopy}
                className="text-xs h-8 px-3"
                icon={copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
              >
                {copied ? "Copied" : "Copy"}
              </Button>
            </div>
          </div>
          
          <div className="bg-slate-900/80 rounded-lg p-4 border border-slate-800">
            <div className="whitespace-pre-wrap font-mono text-sm text-slate-300 leading-relaxed">
              {renderFormattedText(data.enhancedPrompt)}
            </div>
          </div>

          <div className="mt-4 flex justify-end">
            <span className="text-xs text-slate-500 font-mono">
              ~{data.estimatedTokenCount} tokens
            </span>
          </div>
        </div>
      </div>

      {/* Analysis and Improvements Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Analysis Card */}
        <div className="bg-slate-800/30 border border-slate-700 rounded-xl p-6">
          <div className="flex items-center space-x-2 mb-4 text-blue-400">
            <BarChart3 className="w-5 h-5" />
            <h3 className="text-white font-medium">AI Analysis</h3>
          </div>
          <p className="text-slate-400 text-sm leading-relaxed">
            {data.analysis}
          </p>
        </div>

        {/* Improvements Card */}
        <div className="bg-slate-800/30 border border-slate-700 rounded-xl p-6">
          <div className="flex items-center space-x-2 mb-4 text-emerald-400">
            <Zap className="w-5 h-5" />
            <h3 className="text-white font-medium">Key Improvements</h3>
          </div>
          <ul className="space-y-2">
            {data.keyImprovements.map((item, index) => (
              <li key={index} className="flex items-start space-x-2 text-sm text-slate-400">
                <ArrowRight className="w-4 h-4 text-emerald-500/50 mt-0.5 shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="flex justify-center pt-8">
        <Button onClick={onReset} variant="secondary">
          Enhance Another Prompt
        </Button>
      </div>
    </div>
  );
};