import { Link } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { allQuizzes } from "@/data/quizzes";
import { TopMenu } from "@/components/TopMenu";
import { ChatWidget } from "@/components/ChatWidget";
import { RadioPlayer } from "@/components/RadioPlayer";
import { motion } from "framer-motion";
import { Rainbow, Vote, MapPin, ArrowRight } from "lucide-react";

// Mapeamento de ícones para cada quiz
const quizIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  "gay": Rainbow,
  "politico": Vote,
  "regional": MapPin,
};

/**
 * Página inicial com seletor de quizzes
 * Design em grid de 3 colunas, mobile-first e moderno
 */
export default function QuizSelector() {
  return (
    <div 
      className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-red-500 pb-32"
      style={{
        backgroundImage: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}
    >
      <TopMenu />
      <ChatWidget />
      <RadioPlayer />
      
      <div className="container mx-auto px-4 py-8 md:py-16 max-w-6xl">
        {/* Header - Mais compacto */}
        <motion.div 
          className="text-center mb-8 md:mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-3 drop-shadow-lg">
            QuiZoeira
          </h1>
          <p className="text-base md:text-lg text-white/80 max-w-xl mx-auto">
            Descubra mais sobre você com nossos quizzes divertidos
          </p>
        </motion.div>

        {/* Quiz Cards - Grid de 3 colunas */}
        <div className="grid grid-cols-3 gap-2 md:gap-6">
          {allQuizzes.map((quiz, index) => {
            const IconComponent = quizIcons[quiz.id] || Rainbow;
            
            return (
              <motion.div
                key={quiz.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Link href={`/quiz/${quiz.slug}`}>
                  <Card 
                    className="relative overflow-hidden bg-white/95 backdrop-blur-md border-0 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer aspect-square"
                  >
                    <div className="flex flex-col items-center justify-center p-3 md:p-4 text-center h-full">
                      {/* Ícone - Compacto */}
                      <div 
                        className="w-16 h-16 md:w-20 md:h-20 rounded-xl md:rounded-2xl flex items-center justify-center shadow-md mb-2 md:mb-3"
                        style={{
                          background: quiz.theme.gradient,
                        }}
                      >
                        <IconComponent className="w-8 h-8 md:w-10 md:h-10 text-white" />
                      </div>

                      {/* Título - Menor e compacto */}
                      <h2 
                        className="text-sm md:text-base font-bold leading-tight"
                        style={{
                          background: quiz.theme.gradient,
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                          backgroundClip: 'text'
                        }}
                      >
                        {quiz.title.replace(/[^\w\s]/gi, '').trim()}
                      </h2>
                    </div>
                  </Card>
                </Link>
              </motion.div>
            );
          })}
        </div>

        {/* Footer - Mais discreto */}
        <motion.div 
          className="text-center mt-8 md:mt-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <p className="text-white/60 text-xs md:text-sm">
            Todos os quizzes são 100% anônimos e divertidos
          </p>
        </motion.div>
      </div>
    </div>
  );
}
