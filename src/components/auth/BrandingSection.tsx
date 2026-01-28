import { motion } from "framer-motion";
import { Heart, Sparkles } from "lucide-react";

export function BrandingSection() {
  return (
    <div className="relative w-full h-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex flex-col items-center justify-center text-white p-8 md:p-12 text-center overflow-hidden">
      {/* Background Shapes */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-20 pointer-events-none">
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
          }}
          transition={{ 
            duration: 20, 
            repeat: Infinity,
            ease: "linear" 
          }}
          className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-r from-blue-400 to-purple-400 rounded-full blur-3xl"
        />
        <motion.div 
          animate={{ 
            scale: [1, 1.5, 1],
            rotate: [0, -90, 0],
          }}
          transition={{ 
            duration: 25, 
            repeat: Infinity,
            ease: "linear" 
          }}
          className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-r from-pink-400 to-orange-400 rounded-full blur-3xl"
        />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-lg">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex justify-center mb-8"
        >
          <div className="w-20 h-20 bg-white/10 backdrop-blur-xl rounded-3xl flex items-center justify-center shadow-xl border border-white/20">
            <Heart className="w-10 h-10 text-white fill-white/20" />
          </div>
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-4xl md:text-5xl font-bold mb-6 font-display"
        >
          Welcome to <br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-white/80">
            SewaPacar
          </span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-lg md:text-xl text-white/90 leading-relaxed mb-8 font-light"
        >
          Platform sewa teman & pacar virtual #1 di Indonesia. 
          Temukan teman ngobrol, main game, atau jalan yang asik dan aman.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="flex items-center justify-center gap-4 text-sm font-medium bg-white/10 backdrop-blur-md py-3 px-6 rounded-full border border-white/10 w-fit mx-auto"
        >
          <Sparkles className="w-4 h-4 text-yellow-300" />
          <span>Aman • Terpercaya • Fun</span>
          <Sparkles className="w-4 h-4 text-yellow-300" />
        </motion.div>
      </div>
    </div>
  );
}
