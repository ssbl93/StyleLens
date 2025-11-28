import React, { useState } from 'react';
import Header from './components/Header';
import ImageUpload from './components/ImageUpload';
import AnalysisDisplay from './components/AnalysisDisplay';
import LoadingState from './components/LoadingState';
import { analyzeImage } from './services/geminiService';
import { AnalysisResult, AppStatus } from './types';

const App: React.FC = () => {
  const [status, setStatus] = useState<AppStatus>('idle');
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleImageSelect = (file: File, url: string) => {
    setSelectedFile(file);
    setPreviewUrl(url);
    setResult(null);
    setError(null);
    setStatus('idle');
  };

  const handleAnalyze = async () => {
    if (!selectedFile) return;

    setStatus('analyzing');
    setError(null);

    try {
      const analysisData = await analyzeImage(selectedFile);
      setResult(analysisData);
      setStatus('complete');
    } catch (err: any) {
      setStatus('error');
      setError(err.message || "Something went wrong with the style analysis. Please try again.");
    }
  };

  const resetApp = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setResult(null);
    setStatus('idle');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col font-sans text-fashion-charcoal bg-fashion-cream">
      <Header />

      <main className="flex-grow container mx-auto px-4 py-8 md:py-12">
        {/* Hero Section - Only show when not viewing results */}
        {status !== 'complete' && (
          <div className="text-center mb-12 max-w-2xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-fashion-black mb-4 leading-tight">
              Define Your Aesthetic. <br/>
              <span className="italic text-fashion-accent font-serif">Elevate Your Style.</span>
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Upload your daily look. Get instant, actionable advice from our AI stylist.
            </p>
          </div>
        )}

        {/* Upload Section - Hide when complete */}
        {status !== 'complete' && (
          <section className="mb-12 transition-all duration-500 ease-in-out max-w-6xl mx-auto">
             <div className="grid md:grid-cols-2 gap-8 items-center">
               
               {/* Example Section (Left) - Hidden on mobile */}
               <div className="hidden md:flex justify-center items-center p-6">
                  <div className="relative w-full max-w-xs group">
                     {/* Back card */}
                     <div className="absolute inset-0 bg-fashion-beige rounded-[2rem] transform rotate-6 scale-95 transition-transform group-hover:rotate-3"></div>
                     
                     {/* Main card */}
                     <div className="relative bg-white p-4 rounded-2xl shadow-xl transform -rotate-2 transition-transform duration-500 group-hover:rotate-0 border border-gray-100">
                        <div className="aspect-[3/4] w-full overflow-hidden rounded-xl mb-4 relative bg-gray-100">
                           <img 
                             src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=800&auto=format&fit=crop" 
                             alt="Style Example" 
                             className="w-full h-full object-cover"
                           />
                           <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-fashion-black">
                              #DenimChic
                           </div>
                        </div>
                        
                        <div className="space-y-3 px-1">
                           <div className="flex gap-2">
                              <div className="h-2 w-16 bg-gray-200 rounded-full"></div>
                              <div className="h-2 w-8 bg-gray-200 rounded-full"></div>
                           </div>
                           <div className="h-2 w-3/4 bg-gray-100 rounded-full"></div>
                           <div className="pt-2 flex justify-between items-center border-t border-gray-50 mt-2">
                              <span className="text-xs text-fashion-accent font-serif italic">Analysis complete</span>
                              <div className="flex gap-0.5">
                                 {[1,2,3,4,5].map(i => <span key={i} className="text-[8px] text-fashion-accent">★</span>)}
                              </div>
                           </div>
                        </div>
                     </div>

                     <div className="absolute -top-4 -right-4 bg-fashion-black text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg transform rotate-12">
                        Example
                     </div>
                  </div>
               </div>

               {/* Upload Component (Right) */}
               <div className="flex flex-col items-center w-full">
                  <ImageUpload 
                    onImageSelected={handleImageSelect} 
                    disabled={status === 'analyzing'}
                  />

                  {/* Analyze Button */}
                  <div className="text-center -mt-2">
                    <button
                      onClick={handleAnalyze}
                      disabled={!selectedFile || status === 'analyzing'}
                      className={`
                        px-10 py-4 rounded-full font-medium text-lg tracking-wide transition-all duration-300 shadow-lg transform
                        ${!selectedFile || status === 'analyzing' 
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                          : 'bg-fashion-black text-white hover:bg-fashion-charcoal hover:scale-105 hover:shadow-xl'
                        }
                      `}
                    >
                      {status === 'analyzing' ? 'Styling...' : 'Analyze My Look'}
                    </button>
                  </div>
               </div>

             </div>
          </section>
        )}

        {/* Error Message */}
        {status === 'error' && (
          <div className="max-w-md mx-auto mb-8 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-center">
            {error}
          </div>
        )}

        {/* Loading State */}
        {status === 'analyzing' && <LoadingState />}

        {/* Results Section */}
        {status === 'complete' && result && previewUrl && (
          <section className="animate-fadeIn pb-16">
            <AnalysisDisplay 
              result={result} 
              imageUrl={previewUrl} 
              imageFile={selectedFile}
              onReset={resetApp} 
            />
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white py-8 border-t border-gray-100">
        <div className="container mx-auto px-4 text-center text-sm text-gray-400">
          <p>&copy; {new Date().getFullYear()} StyleLens AI. Fashion is personal; these are just suggestions.</p>
          <p className="mt-2 text-xs">Powered by Google Gemini 2.5 Flash</p>
        </div>
      </footer>
    </div>
  );
};

export default App;