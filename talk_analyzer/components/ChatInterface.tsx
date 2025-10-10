import React, { useState, useRef, useEffect } from 'react';
import type { Chat } from '@google/genai';
import type { ChatMessage } from '../types';
import Spinner from './Spinner';

// Helper function to render inline markdown (bold, italics) safely
const renderInlineMarkdown = (text: string) => {
  // Split by bold/italic markers, keeping the captured group
  const parts = text.split(/(\*\*.*?\*\*|\*.*?\*)/g);

  return parts.filter(part => part).map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('*') && part.endsWith('*')) {
      return <em key={index}>{part.slice(1, -1)}</em>;
    }
    // Using Fragment to avoid key issues with plain strings
    return <React.Fragment key={index}>{part}</React.Fragment>;
  });
};

// Component to render block-level markdown (headings, paragraphs, lists)
const MarkdownContent: React.FC<{ text: string }> = ({ text }) => {
  // Normalize line endings and split into blocks by double newlines, then filter out empty blocks
  const blocks = text.replace(/\r\n/g, '\n').split('\n\n').filter(block => block.trim());

  return (
    <div className="text-sm font-sans">
      {blocks.map((block, i) => {
        const trimmedBlock = block.trim();
        const lines = trimmedBlock.split('\n');

        // Heading check: A heading is typically a single line starting with '#'
        if (lines.length === 1 && trimmedBlock.startsWith('#')) {
          if (trimmedBlock.startsWith('### ')) {
            return <h3 key={i} className="text-base font-bold mt-3 mb-1">{renderInlineMarkdown(trimmedBlock.substring(4))}</h3>;
          }
          if (trimmedBlock.startsWith('## ')) {
            return <h2 key={i} className="text-lg font-bold mt-4 mb-2">{renderInlineMarkdown(trimmedBlock.substring(3))}</h2>;
          }
          if (trimmedBlock.startsWith('# ')) {
            return <h1 key={i} className="text-xl font-bold mt-5 mb-3">{renderInlineMarkdown(trimmedBlock.substring(2))}</h1>;
          }
        }

        // List check: All non-empty lines in the block are list items
        const isList = lines.filter(line => line.trim() !== '').every(line => line.trim().startsWith('* ') || line.trim().startsWith('- '));

        if (isList) {
          return (
            <ul key={i} className="list-disc list-inside my-2 space-y-1">
              {lines.map((line, j) => {
                if (!line.trim()) return null;
                const content = line.trim().replace(/^[\*\-]\s*/, '');
                return <li key={j}>{renderInlineMarkdown(content)}</li>;
              })}
            </ul>
          );
        }
        
        // Fallback to paragraph. The `whitespace-pre-wrap` class handles single newlines within a block.
        return <p key={i} className="my-1 whitespace-pre-wrap">{renderInlineMarkdown(block)}</p>;
      })}
    </div>
  );
};


interface ChatInterfaceProps {
  chat: Chat;
  initialHistory: ChatMessage[];
  suggestedQuestions: string[];
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ chat, initialHistory, suggestedQuestions }) => {
  const [history, setHistory] = useState<ChatMessage[]>(initialHistory);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history, isLoading]);

  const handleSendMessage = async (message: string) => {
    if (!message.trim() || isLoading) return;

    const userMessage: ChatMessage = { role: 'user', parts: [{ text: message }] };
    setHistory(prev => [...prev, userMessage]);
    setUserInput('');
    setIsLoading(true);

    try {
      const result = await chat.sendMessage({ message });
      const modelMessage: ChatMessage = { role: 'model', parts: [{ text: result.text }] };
      setHistory(prev => [...prev, modelMessage]);
    } catch (error) {
      console.error("Chat error:", error);
      const errorMessage: ChatMessage = { role: 'model', parts: [{ text: "Sorry, I encountered an error. Please try again." }] };
      setHistory(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(userInput);
  };
  
  const handleSuggestedQuestionClick = (question: string) => {
    if (isLoading) return;
    setUserInput(question); // Keep it in input for user to see before sending
    handleSendMessage(question);
  }

  return (
    <div className="w-full max-w-4xl mx-auto mt-8 bg-slate-800 rounded-lg shadow-lg flex flex-col h-[70vh]">
      <div className="p-4 border-b border-slate-700">
        <h2 className="text-xl font-bold text-slate-200">Follow-up Conversation</h2>
      </div>
      
      <div className="flex-1 p-6 overflow-y-auto space-y-4">
        {history.map((msg, index) => (
          <div key={index} className={`flex items-start gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xl px-4 py-2 rounded-2xl ${
              msg.role === 'user' 
                ? 'bg-sky-600 text-white rounded-br-none' 
                : 'bg-slate-700 text-slate-200 rounded-bl-none'
            }`}>
              <MarkdownContent text={msg.parts[0].text} />
            </div>
          </div>
        ))}
         {isLoading && (
            <div className="flex justify-start">
                 <div className="max-w-lg px-4 py-2 rounded-2xl bg-slate-700 text-slate-200 flex items-center rounded-bl-none">
                    <Spinner/>
                    <span className="ml-2 text-sm">Thinking...</span>
                 </div>
            </div>
        )}
        <div ref={chatEndRef} />
      </div>

      <div className="p-4 border-t border-slate-700">
         <div className="flex flex-wrap gap-2 mb-3">
            {suggestedQuestions.map((q, i) => (
                <button 
                  key={i} 
                  onClick={() => handleSuggestedQuestionClick(q)}
                  className="px-3 py-1 bg-slate-700 text-sky-300 text-xs rounded-full hover:bg-slate-600 transition-colors disabled:opacity-50"
                  disabled={isLoading}
                >
                    {q}
                </button>
            ))}
        </div>
        <form onSubmit={handleFormSubmit} className="flex gap-2">
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="Ask a follow-up question..."
            className="flex-1 bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-white placeholder-slate-500 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 disabled:opacity-50"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !userInput.trim()}
            className="bg-sky-600 hover:bg-sky-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-bold py-2 px-4 rounded-md transition-colors"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatInterface;