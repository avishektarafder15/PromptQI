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

  const parseInline = (text: string) => {
    // Split by bold markers and code ticks
    const parts = text.split(/(\*\*.*?\*\*|`[^`]+`)/g);
    
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={index} className="text-indigo-300 font-semibold">
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code key={index} className="bg-slate-800 border border-slate-700 px-1.5 py-0.5 rounded text-xs font-mono text-amber-300">
            {part.slice(1, -1)}
          </code>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  // Advanced parser for the prompt structure to ensure perfect alignment
  const renderFormattedText = (text: string) => {
    const lines = text.split('\n');
    
    return lines.map((line, index) => {
      const trimmed = line.trim();
      if (!trimmed) return <div key={index} className="h-3" />; // Spacing between blocks

      // Check for Section Headers
      // 1. Bold headers: **Role:** Content or **Role** Content
      // 2. Markdown headers: ### Role or ### Role:
      const boldHeaderMatch = trimmed.match(/^(\*\*.*?\*\*):?\s*(.*)$/);
      const hashHeaderMatch = trimmed.match(/^(#{1,6})\s+(.*?)(:)?\s*$/);

      if (boldHeaderMatch) {
        const header = boldHeaderMatch[1].replace(/\*\*/g, ''); // Remove **
        const content = boldHeaderMatch[2];
        return renderSection(index, header, content);
      }
      
      if (hashHeaderMatch) {
        const header = hashHeaderMatch[2];
        return renderSection(index, header, '');
      }

      // Check for bullet points
      if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        return (
          <div key={index} className="flex items-start pl-0 sm:pl-[9rem] mb-1">
            <span className="text-indigo-500/50 mr-3 mt-2 text-[6px] shrink-0">●</span>
            <span className="text-slate-300 text-sm leading-relaxed">
              {parseInline(trimmed.replace(/^[\-\*]\s+/, ''))}
            </span>
          </div>
        );
      }
      
      // Regular paragraph text (continuation) - indented to align with content column
      return (
        <div key={index} className="pl-0 sm:pl-[9rem] mb-2 text-slate-300 text-sm leading-relaxed">
          {parseInline(trimmed)}
        </div>
      );
    });
  };

  const renderSection = (index: number, header: string, content: string) => (
    <div key={index} className="mb-2 group">
      <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4">
        <span className="text-indigo-400 font-bold uppercase text-xs tracking-wider mt-1 sm:w-32 sm:shrink-0 sm:text-right select-none">
          {header}
        </span>
        <div className="flex-1 text-slate-200 leading-relaxed">
          {content ? parseInline(content) : null}
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 animate-fade-in-up">
      
      {/* Main Enhanced Output Card */}
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
        <div className="relative bg-slate-900/90 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6 sm:p-8 shadow-2xl">
          
          <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-800">
            <div className="flex items-center space-x-3 text-indigo-400">
              <div className="p-2 bg-indigo-500/10 rounded-lg">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">Enhanced Prompt</h2>
                <p className="text-xs text-slate-500 font-mono mt-0.5">Ready for use with LLMs</p>
              </div>
            </div>
            <Button 
              variant="outline" 
              onClick={handleCopy}
              className="text-xs h-9 px-4 border-slate-700 hover:bg-slate-800"
              icon={copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            >
              {copied ? "Copied to Clipboard" : "Copy Prompt"}
            </Button>
          </div>
          
          <div className="bg-slate-950 rounded-xl p-6 border border-slate-800/50 overflow-hidden">
            <div className="font-mono text-sm">
              {renderFormattedText(data.enhancedPrompt)}
            </div>
          </div>

          <div className="mt-4 flex justify-between items-center">
            <div className="text-xs text-slate-600 flex items-center">
              <div className="w-2 h-2 rounded-full bg-indigo-500 mr-2 animate-pulse"></div>
              Optimized for Clarity & Structure
            </div>
            <span className="text-xs text-slate-500 font-mono bg-slate-800/50 px-2 py-1 rounded">
              ~{data.estimatedTokenCount} tokens
            </span>
          </div>
        </div>
      </div>

      {/* Analysis and Improvements Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Analysis Card */}
        <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-6 hover:border-slate-600 transition-colors">
          <div className="flex items-center space-x-2 mb-4 text-blue-400">
            <BarChart3 className="w-5 h-5" />
            <h3 className="text-white font-medium">Strategic Analysis</h3>
          </div>
          <p className="text-slate-400 text-sm leading-relaxed">
            {data.analysis}
          </p>
        </div>

        {/* Improvements Card */}
        <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-6 hover:border-slate-600 transition-colors">
          <div className="flex items-center space-x-2 mb-4 text-emerald-400">
            <Zap className="w-5 h-5" />
            <h3 className="text-white font-medium">Applied Improvements</h3>
          </div>
          <ul className="space-y-3">
            {data.keyImprovements.map((item, index) => (
              <li key={index} className="flex items-start space-x-3 text-sm text-slate-400 group">
                <ArrowRight className="w-4 h-4 text-emerald-500/50 mt-0.5 shrink-0 group-hover:text-emerald-400 transition-colors" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="flex justify-center pt-8 pb-12">
        <Button onClick={onReset} variant="secondary" className="w-full sm:w-auto min-w-[200px]">
          Enhance Another Prompt
        </Button>
      </div>
    </div>
  );
};