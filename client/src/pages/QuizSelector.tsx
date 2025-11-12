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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
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
                    className="relative overflow-hidden bg-white/95 backdrop-blur-md border-0 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 cursor-pointer h-full"
                  >
                    <div className="flex flex-col items-center p-6 text-center space-y-4">
                      {/* Ícone - Grande e centralizado */}
                      <div 
                        className="w-20 h-20 md:w-24 md:h-24 rounded-2xl flex items-center justify-center shadow-lg"
                        style={{
                          background: quiz.theme.gradient,
                        }}
                      >
                        <IconComponent className="w-10 h-10 md:w-12 md:h-12 text-white" />
                      </div>

                      {/* Conteúdo */}
                      <div className="flex-1 space-y-2">
                        {/* Título */}
                        <h2 
                          className="text-xl md:text-2xl font-bold"
                          style={{
                            background: quiz.theme.gradient,
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text'
                          }}
                        >
                          {quiz.title.replace(/[^\w\s]/gi, '').trim()}
                        </h2>

                        {/* Descrição */}
                        <p className="text-gray-600 text-sm line-clamp-3">
                          {quiz.description}
                        </p>

                        {/* Tags compactas */}
                        <div className="flex flex-wrap justify-center gap-2 pt-2">
                          <span className="inline-flex items-center px-2 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-medium">
                            15 perguntas
                          </span>
                          <span className="inline-flex items-center px-2 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-medium">
                            ~1 min
                          </span>
                        </div>
                      </div>

                      {/* Botão de ação */}
                      <div 
                        className="w-full py-3 rounded-xl flex items-center justify-center gap-2 text-white font-bold shadow-md transition-all hover:scale-105"
                        style={{
                          background: quiz.theme.gradient,
                        }}
                      >
                        <span>Começar</span>
                        <ArrowRight className="w-5 h-5" />
                      </div>
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
