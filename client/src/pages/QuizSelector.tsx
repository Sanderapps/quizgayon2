import { Link } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { allQuizzes } from "@/data/quizzes";
import { TopMenu } from "@/components/TopMenu";
import { ChatWidget } from "@/components/ChatWidget";
import { RadioPlayer } from "@/components/RadioPlayer";

/**
 * Página inicial com seletor de quizzes
 * Exibe cards para os 3 quizzes disponíveis
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
      
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold text-white mb-4 drop-shadow-lg">
            🎮 Escolha seu Quiz! 🎮
          </h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            Selecione um dos nossos quizzes divertidos e descubra mais sobre você!
          </p>
        </div>

        {/* Quiz Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {allQuizzes.map((quiz) => (
            <Card 
              key={quiz.id}
              className="relative overflow-hidden bg-white/10 backdrop-blur-md border-white/20 hover:scale-105 transition-transform duration-300"
              style={{
                background: `linear-gradient(135deg, ${quiz.theme.primaryColor}20, ${quiz.theme.secondaryColor}20)`
              }}
            >
              <div className="p-8 text-center space-y-6">
                {/* Emoji */}
                <div 
                  className="text-8xl mb-4 animate-bounce"
                  style={{
                    filter: 'drop-shadow(0 0 20px rgba(255,255,255,0.5))'
                  }}
                >
                  {quiz.emoji}
                </div>

                {/* Título */}
                <h2 
                  className="text-3xl font-bold mb-2"
                  style={{
                    background: quiz.theme.gradient,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                  }}
                >
                  {quiz.title}
                </h2>

                {/* Descrição */}
                <p className="text-white/80 text-lg mb-6">
                  {quiz.description}
                </p>

                {/* Info */}
                <div className="flex justify-center gap-4 text-sm text-white/70 mb-6">
                  <span>📝 50 perguntas</span>
                  <span>⏱️ ~5 min</span>
                </div>

                {/* Botão */}
                <Link href={`/quiz/${quiz.slug}`}>
                  <Button
                    size="lg"
                    className="w-full text-xl py-6 font-bold"
                    style={{
                      background: quiz.theme.gradient,
                      border: 'none'
                    }}
                  >
                    Começar Quiz! 🎉
                  </Button>
                </Link>

                {/* Categorias */}
                <div className="flex justify-between text-sm text-white/60 pt-4 border-t border-white/10">
                  <span>{quiz.categories.low.emoji} {quiz.categories.low.name}</span>
                  <span>VS</span>
                  <span>{quiz.categories.high.emoji} {quiz.categories.high.name}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Footer */}
        <div className="text-center mt-16">
          <p className="text-white/70 text-sm">
            🎮 Todos os quizzes são 100% anônimos e divertidos! 🎮
          </p>
        </div>
      </div>
    </div>
  );
}
