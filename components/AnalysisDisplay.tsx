import React, { useState } from 'react';
import { AnalysisResult } from '../types';
import { generateImageModification } from '../services/geminiService';

interface AnalysisDisplayProps {
  result: AnalysisResult;
  imageUrl: string;
  imageFile: File | null;
  onReset: () => void;
}

const AnalysisDisplay: React.FC<AnalysisDisplayProps> = ({ result, imageUrl, imageFile, onReset }) => {
  const [isVisualizing, setIsVisualizing] = useState(false);
  const [visualizedImage, setVisualizedImage] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  // Split the text into sections based on markdown headers
  const rawSections = result.text.split(/##\s+/).filter(Boolean);
  
  // Helper to identify section type
  const getSectionType = (text: string) => {
    if (text.toLowerCase().includes('vibe')) return 'vibe';
    if (text.toLowerCase().includes('fix') || text.toLowerCase().includes('update') || text.toLowerCase().includes('quick')) return 'updates';
    if (text.toLowerCase().includes('shop')) return 'shop';
    if (text.toLowerCase().includes('next') || text.toLowerCase().includes('looks')) return 'next';
    return 'other';
  };

  const sections = rawSections.reduce((acc, section) => {
    const type = getSectionType(section.split('\n')[0]);
    acc[type] = section;
    return acc;
  }, {} as Record<string, string>);

  const handleVisualize = async () => {
    if (!imageFile || !sections['updates'] || isVisualizing) return;
    
    setIsVisualizing(true);
    try {
      // Clean up text to just get the bullet points for the prompt
      const updateText = sections['updates']
        .split('\n')
        .filter(l => l.trim().startsWith('*'))
        .map(l => l.replace(/^\*\s*/, ''))
        .join('. ');

      const newImage = await generateImageModification(imageFile, updateText);
      setVisualizedImage(newImage);
      setShowModal(true);
    } catch (error) {
      console.error("Failed to visualize:", error);
      alert("Could not generate visualization. Please try again.");
    } finally {
      setIsVisualizing(false);
    }
  };

  // Parser for bold text and links
  const renderRichText = (text: string) => {
    // Regex to match Markdown links [Text](Url) or just raw http links
    const parts = text.split(/(\[.*?\]\(.*?\)|https?:\/\/[^\s]+|\*\*.*?\*\*)/g);
    
    return parts.map((part, i) => {
      // Handle Markdown Link: [Title](url)
      const mdLinkMatch = part.match(/^\[(.*?)\]\((.*?)\)$/);
      if (mdLinkMatch) {
        return (
          <a 
            key={i} 
            href={mdLinkMatch[2]} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-fashion-accent hover:underline font-medium"
          >
            {mdLinkMatch[1]} ↗
          </a>
        );
      }

      // Handle Raw URL
      if (part.match(/^https?:\/\//)) {
        return (
           <a 
            key={i} 
            href={part} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-fashion-accent hover:underline font-medium break-all"
          >
            Link ↗
          </a>
        );
      }

      // Handle Bold
      if (part.startsWith('**') && part.endsWith('**')) {
        return <span key={i} className="font-bold">{part.slice(2, -2)}</span>;
      }
      
      return part;
    });
  };

  const renderList = (content: string) => {
    const lines = content.split('\n').slice(1).filter(l => l.trim().startsWith('*'));
    return (
      <ul className="space-y-3">
        {lines.map((line, idx) => (
          <li key={idx} className="text-fashion-charcoal text-sm md:text-base leading-relaxed flex items-start gap-2">
            <span className="mt-1.5 w-1.5 h-1.5 bg-fashion-accent rounded-full flex-shrink-0"></span>
            <span>{renderRichText(line.replace(/^\*\s*/, ''))}</span>
          </li>
        ))}
      </ul>
    );
  };

  const renderVibeContent = (content: string) => {
    if (!content) return null;

    const lines = content.split('\n').filter(l => l.trim() !== '');
    
    // Extract key sections manually
    const detectedLine = lines.find(l => l.toLowerCase().includes('detected pieces:'));
    const aestheticLine = lines.find(l => l.toLowerCase().includes('aesthetic:'));
    const adviceLine = lines.find(l => l.toLowerCase().includes('advice:'));

    // Helpers to strip keys
    const detected = detectedLine ? detectedLine.replace(/\*\*.*?\*\*|Detected Pieces:/gi, '').trim() : null;
    const aesthetic = aestheticLine ? aestheticLine.replace(/\*\*.*?\*\*|Aesthetic:/gi, '').trim() : null;
    const advice = adviceLine ? adviceLine.replace(/\*\*.*?\*\*|Advice:/gi, '').trim() : null;

    // Fallback logic
    if (!detected && !aesthetic && !advice) {
         return (
            <div className="flex flex-col justify-center h-full p-8">
                <h3 className="font-serif text-3xl font-bold text-fashion-black mb-4">The Vibe</h3>
                 {lines.slice(1).map((line, idx) => (
                    <p key={idx} className="text-lg text-fashion-charcoal mb-2">{renderRichText(line)}</p>
                 ))}
            </div>
         );
    }

    return (
      <div className="flex flex-col justify-center h-full p-8 md:p-12 relative">
        <h3 className="font-serif text-3xl font-bold text-fashion-black mb-8">The Vibe</h3>
        
        {/* Aesthetic Badge */}
        {aesthetic && (
          <div className="mb-6">
            <span className="inline-block px-5 py-2 bg-fashion-black text-white text-sm font-medium rounded-full tracking-wide uppercase shadow-md">
              {aesthetic}
            </span>
          </div>
        )}

        {/* Detected Pieces */}
        {detected && (
          <div className="mb-6 pb-6 border-b border-gray-100">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Detected Pieces</p>
            <p className="text-fashion-charcoal text-sm leading-relaxed italic">
              {detected}
            </p>
          </div>
        )}

        {/* Advice / Analysis */}
        {advice && (
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Advice</p>
            <p className="text-lg md:text-xl font-serif text-fashion-charcoal leading-relaxed">
              "{advice}"
            </p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto">
      
      {/* Top Section: Side-by-Side Image & Vibe */}
      <div className="grid md:grid-cols-2 gap-8 md:gap-0 mb-12 items-stretch bg-white rounded-2xl overflow-hidden shadow-sm border border-fashion-charcoal/5">
        {/* Image Column */}
        <div className="relative min-h-[400px] bg-gray-100">
           <img 
             src={imageUrl} 
             alt="Your Look" 
             className="absolute inset-0 w-full h-full object-cover"
           />
        </div>

        {/* Vibe Column */}
        <div className="bg-white relative">
            {/* Reset Button Positioned Here */}
            <button 
              onClick={onReset}
              className="absolute top-4 right-4 z-10 bg-white border border-gray-200 hover:bg-gray-50 text-fashion-charcoal text-xs px-4 py-2 rounded-full font-medium transition-colors shadow-sm"
            >
              Analyze another outfit
            </button>

           {sections['vibe'] ? renderVibeContent(sections['vibe']) : (
             <div className="flex items-center justify-center h-full p-8 text-gray-500 italic">Analyzing vibe...</div>
           )}
        </div>
      </div>

      {/* Bottom Section: Grid for recommendations */}
      <div className="grid md:grid-cols-3 gap-6">
        
        {/* Quick Updates */}
        {sections['updates'] && (
          <div className="bg-fashion-cream p-6 rounded-xl border border-fashion-charcoal/5 relative flex flex-col">
            <div className="flex-grow">
                <h4 className="font-serif text-xl font-bold text-fashion-black mb-4 flex items-center gap-2">
                🚀 Quick Updates
                </h4>
                {renderList(sections['updates'])}
            </div>
            
            {/* Visual Example Action */}
            <div className="mt-6 pt-4 border-t border-gray-200/50">
               <button 
                 onClick={handleVisualize}
                 disabled={isVisualizing}
                 className="text-blue-600 hover:text-blue-700 text-sm font-medium hover:underline flex items-center gap-2 transition-colors"
               >
                 {isVisualizing ? (
                    <>
                        <span className="animate-spin h-3 w-3 border-2 border-current border-t-transparent rounded-full"></span>
                        Generating preview...
                    </>
                 ) : (
                    <>Show a visual example</>
                 )}
               </button>
            </div>
          </div>
        )}

        {/* Next Outfits */}
        {sections['next'] && (
          <div className="bg-white p-6 rounded-xl border border-fashion-charcoal/5 shadow-sm">
            <h4 className="font-serif text-xl font-bold text-fashion-black mb-4 flex items-center gap-2">
              🔮 Future Looks
            </h4>
            {renderList(sections['next'])}
          </div>
        )}

        {/* Shop The Look */}
        {sections['shop'] && (
          <div className="bg-fashion-black text-fashion-cream p-6 rounded-xl shadow-lg">
            <h4 className="font-serif text-xl font-bold text-white mb-4 flex items-center gap-2">
              🛍️ Shop The Look
            </h4>
            {/* Custom renderer for shop to handle links nicely */}
            <div className="space-y-4">
                {sections['shop'].split('\n').slice(1).filter(l => l.trim().startsWith('*')).map((line, idx) => (
                    <div key={idx} className="bg-white/10 p-3 rounded-lg hover:bg-white/20 transition-colors">
                         <p className="text-sm leading-relaxed text-gray-200">
                            {renderRichText(line.replace(/^\*\s*/, ''))}
                         </p>
                    </div>
                ))}
            </div>
          </div>
        )}
      </div>

      {/* Modal for Visualized Image */}
      {showModal && visualizedImage && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-fashion-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl overflow-hidden shadow-2xl max-w-2xl w-full flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                <h3 className="font-serif text-xl font-bold">Visualized Update</h3>
                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-black">
                    ✕
                </button>
            </div>
            <div className="p-0 overflow-auto bg-gray-50 flex-grow relative">
                <img src={visualizedImage} alt="Visualized Update" className="w-full h-auto block" />
            </div>
            <div className="p-4 border-t border-gray-100 text-sm text-gray-500 text-center">
                This is an AI-generated preview of the suggested updates.
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AnalysisDisplay;