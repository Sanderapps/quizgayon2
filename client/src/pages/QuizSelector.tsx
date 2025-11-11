import { Link } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { allQuizzes } from "@/data/quizzes";
import { TopMenu } from "@/components/TopMenu";
import { ChatWidget } from "@/components/ChatWidget";
import { RadioPlayer } from "@/components/RadioPlayer";
import { motion } from "framer-motion";

/**
 * Página inicial com seletor de quizzes
 * Design mobile-first, moderno e compacto
 */
export default function QuizSelector() {
  return (
    <div 
      className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-red-500"
      style={{
        backgroundImage: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}
    >
      <TopMenu />
      <ChatWidget />
      <RadioPlayer />
      
      <div className="container mx-auto px-4 py-8 md:py-16 max-w-4xl">
        {/* Header - Mais compacto */}
        <motion.div 
          className="text-center mb-8 md:mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-3 drop-shadow-lg">
            Escolha seu Quiz
          </h1>
          <p className="text-base md:text-lg text-white/80 max-w-xl mx-auto">
            Descubra mais sobre você com nossos quizzes divertidos
          </p>
        </motion.div>

        {/* Quiz Cards - Design compacto e moderno */}
        <div className="space-y-4 md:space-y-6">
          {allQuizzes.map((quiz, index) => (
            <motion.div
              key={quiz.id}
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card 
                className="relative overflow-hidden bg-white/95 backdrop-blur-md border-0 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
              >
                <Link href={`/quiz/${quiz.slug}`}>
                  <div className="flex items-center gap-4 p-4 md:p-6 cursor-pointer">
                    {/* Ícone/Emoji - Menor e mais discreto */}
                    <div 
                      className="flex-shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center text-3xl md:text-4xl shadow-lg"
                      style={{
                        background: quiz.theme.gradient,
                      }}
                    >
                      {quiz.emoji}
                    </div>

                    {/* Conteúdo */}
                    <div className="flex-1 min-w-0">
                      {/* Título */}
                      <h2 
                        className="text-xl md:text-2xl font-bold mb-1 truncate"
                        style={{
                          background: quiz.theme.gradient,
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                          backgroundClip: 'text'
                        }}
                      >
                        {quiz.title}
                      </h2>

                      {/* Descrição - Mais curta */}
                      <p className="text-gray-600 text-sm md:text-base line-clamp-2 mb-2">
                        {quiz.description}
                      </p>

                      {/* Tags compactas */}
                      <div className="flex flex-wrap gap-2">
                        <span className="inline-flex items-center px-2 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-medium">
                          50 perguntas
                        </span>
                        <span className="inline-flex items-center px-2 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-medium">
                          ~5 min
                        </span>
                      </div>
                    </div>

                    {/* Seta - Indicador visual */}
                    <div className="flex-shrink-0">
                      <div 
                        className="w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center text-white shadow-md"
                        style={{
                          background: quiz.theme.gradient,
                        }}
                      >
                        <svg 
                          className="w-5 h-5 md:w-6 md:h-6" 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth={2} 
                            d="M9 5l7 7-7 7" 
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                </Link>
              </Card>
            </motion.div>
          ))}
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
