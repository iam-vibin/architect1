import { motion } from 'framer-motion';

export default function PortfolioGallery({ images }: { images: string[] }) {
  if (!images || images.length === 0) {
    return (
      <div className="py-16 px-4 text-center text-gray-500 bg-gray-50/50 rounded-3xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center">
        <p className="font-bold text-gray-700">No portfolio images uploaded yet.</p>
        <p className="text-sm mt-1 font-medium">Upload your best work to stand out.</p>
      </div>
    );
  }
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
      {images.map((img, i) => (
        <motion.div 
          key={i} 
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: i * 0.05 }}
          className="aspect-square rounded-2xl overflow-hidden bg-gray-100 group shadow-sm border border-gray-200 relative cursor-pointer"
        >
          <img 
            src={img} 
            alt={`Portfolio ${i}`} 
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </motion.div>
      ))}
    </div>
  );
}
