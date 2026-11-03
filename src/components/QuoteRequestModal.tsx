import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, DollarSign, Ruler, FileText, CheckCircle2 } from 'lucide-react';

export default function QuoteRequestModal({ isOpen, onClose, professionalName, onSubmit }: { isOpen: boolean, onClose: () => void, professionalName: string, onSubmit: (data: any) => void }) {
  const [budget, setBudget] = useState('');
  const [area, setArea] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      
      // Pass data back after brief success screen
      setTimeout(() => {
        onSubmit({ budget, area, description });
        setIsSuccess(false);
        setBudget('');
        setArea('');
        setDescription('');
      }, 2000);
    }, 1500);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }}
          onClick={onClose} 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg relative z-10 overflow-hidden"
        >
          {isSuccess ? (
            <div className="p-12 text-center flex flex-col items-center">
              <motion.div 
                initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }}
                className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mb-6"
              >
                <CheckCircle2 className="w-10 h-10 text-emerald-500" />
              </motion.div>
              <h2 className="text-2xl font-black text-gray-900 mb-2">Quote Requested!</h2>
              <p className="text-gray-500 font-medium">Your request has been sent to {professionalName}. They will review it and get back to you shortly.</p>
            </div>
          ) : (
            <>
              <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                <div>
                  <h2 className="text-2xl font-black text-gray-900">Request a Quote</h2>
                  <p className="text-gray-500 text-sm font-medium mt-1">Provide project details for {professionalName}</p>
                </div>
                <button onClick={onClose} className="p-2 bg-white hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-800 transition-colors shadow-sm cursor-[url('/cursor/pointer.png'),_pointer]">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-8 space-y-6">
                
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-emerald-500" /> Estimated Budget (USD)
                  </label>
                  <select 
                    required
                    value={budget} 
                    onChange={e => setBudget(e.target.value)}
                    className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 font-medium text-gray-900"
                  >
                    <option value="" disabled>Select a budget range</option>
                    <option value="$5,000 - $10,000">$5,000 - $10,000</option>
                    <option value="$10,000 - $25,000">$10,000 - $25,000</option>
                    <option value="$25,000 - $50,000">$25,000 - $50,000</option>
                    <option value="$50,000+">$50,000+</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                    <Ruler className="w-4 h-4 text-blue-500" /> Project Area (sq ft)
                  </label>
                  <input 
                    type="number" 
                    required
                    min="100"
                    placeholder="e.g. 1500"
                    value={area}
                    onChange={e => setArea(e.target.value)}
                    className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 font-medium text-gray-900 placeholder:text-gray-400"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-amber-500" /> Project Description & Requirements
                  </label>
                  <textarea 
                    required
                    rows={4}
                    placeholder="Describe your vision, timeline, and any specific requirements..."
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 font-medium text-gray-900 resize-none placeholder:text-gray-400 custom-scrollbar"
                  />
                </div>

                <div className="pt-4">
                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full bg-primary text-white font-bold py-4 rounded-xl hover:bg-primary/90 transition-all flex items-center justify-center gap-2 shadow-[0_8px_30px_rgb(29,78,216,0.2)] hover:shadow-[0_8px_30px_rgb(29,78,216,0.3)] disabled:opacity-70 disabled:pointer-events-none"
                  >
                    {isSubmitting ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        Submit Request <Send className="w-4 h-4 ml-1 relative bottom-[1px]" />
                      </>
                    )}
                  </button>
                  <p className="text-center text-xs text-gray-400 font-medium mt-4">By submitting, you agree to our Terms of Service.</p>
                </div>
              </form>
            </>
          )}
        </motion.div>
      </div>
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #d1d5db;
          border-radius: 10px;
        }
      `}} />
    </AnimatePresence>
  );
}
