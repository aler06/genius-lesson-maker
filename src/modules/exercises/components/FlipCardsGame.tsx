import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RotateCcw, CheckCircle, Eye, EyeOff } from 'lucide-react';

interface FlipCard {
  front: string;
  back: string;
}

interface FlipCardsGameProps {
  cards: FlipCard[];
  instructions?: string;
  onGameComplete?: (cardsViewed: number, totalCards: number) => void;
  studentMode?: boolean;
}

const FlipCardsGame: React.FC<FlipCardsGameProps> = ({ 
  cards, 
  instructions,
  onGameComplete, 
  studentMode = false 
}) => {
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [viewedCards, setViewedCards] = useState<Set<number>>(new Set());
  const [gameCompleted, setGameCompleted] = useState(false);

  const currentCard = cards[currentCardIndex];
  const isLastCard = currentCardIndex === cards.length - 1;

  const handleFlipCard = () => {
    setIsFlipped(!isFlipped);
    if (!isFlipped) {
      // Mark card as viewed when flipped to back
      setViewedCards(prev => new Set([...prev, currentCardIndex]));
    }
  };

  const handleNextCard = () => {
    if (isLastCard) {
      if (studentMode) {
        // In student mode, don't show completion screen
        onGameComplete?.(viewedCards.size, cards.length);
      } else {
        setGameCompleted(true);
        onGameComplete?.(viewedCards.size, cards.length);
      }
    } else {
      setCurrentCardIndex(prev => prev + 1);
      setIsFlipped(false);
    }
  };

  const handlePreviousCard = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(prev => prev - 1);
      setIsFlipped(false);
    }
  };

  const resetGame = () => {
    setCurrentCardIndex(0);
    setIsFlipped(false);
    setViewedCards(new Set());
    setGameCompleted(false);
  };

  if (gameCompleted && !studentMode) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2 text-2xl">
            <RotateCcw className="h-8 w-8 text-primary" />
            ¡Ejercicio Completado!
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="text-6xl font-bold text-primary">
            {viewedCards.size}/{cards.length}
          </div>
          <p className="text-lg text-muted-foreground">
            Tarjetas revisadas: {Math.round((viewedCards.size / cards.length) * 100)}%
          </p>
          <p className="text-sm text-muted-foreground">
            Avanzando al siguiente ejercicio...
          </p>
          {!studentMode && (
            <Button onClick={resetGame} className="mt-4">
              <RotateCcw className="h-4 w-4 mr-2" />
              Reiniciar Tarjetas
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }
  
  // In student mode, when game is completed, don't render anything
  if (gameCompleted && studentMode) {
    return null;
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <RotateCcw className="h-5 w-5" />
          Tarjeta {currentCardIndex + 1} de {cards.length}
        </CardTitle>
        {instructions && (
          <p className="text-sm text-muted-foreground mt-2">
            {instructions}
          </p>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Flip Card */}
        <div className="relative h-64 perspective-1000">
          <div 
            className={`flip-card-inner ${isFlipped ? 'flipped' : ''} relative w-full h-full cursor-pointer`}
            onClick={handleFlipCard}
          >
            {/* Front of card */}
            <div className="absolute inset-0 w-full h-full backface-hidden">
              <Card className="flip-card h-full border-2 border-primary/20 hover:border-primary/40 transition-all duration-300 shadow-lg hover:shadow-xl">
                <CardContent className="h-full flex items-center justify-center p-6">
                  <div className="text-center space-y-4">
                    <div className="p-3 bg-primary/10 rounded-full inline-block">
                      <Eye className="h-8 w-8 text-primary" />
                    </div>
                    <p className="text-lg font-medium text-foreground">
                      {currentCard.front}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      💡 Haz clic para revelar la respuesta
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Back of card */}
            <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180">
              <Card className="flip-card h-full border-2 border-green-500/30 bg-gradient-to-br from-green-50 to-emerald-50 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardContent className="h-full flex items-center justify-center p-6">
                  <div className="text-center space-y-4">
                    <div className="p-3 bg-green-100 rounded-full inline-block">
                      <CheckCircle className="h-8 w-8 text-green-600" />
                    </div>
                    <p className="text-lg font-medium text-green-800">
                      {currentCard.back}
                    </p>
                    <p className="text-sm text-green-600">
                      ✨ Haz clic para volver al frente
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={handlePreviousCard}
            disabled={currentCardIndex === 0}
          >
            ← Anterior
          </Button>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleFlipCard}
              className="text-xs bg-primary/5 hover:bg-primary/10 border border-primary/20 transition-all duration-200"
            >
              {isFlipped ? (
                <>
                  <EyeOff className="h-3 w-3 mr-1" />
                  Ocultar Respuesta
                </>
              ) : (
                <>
                  <Eye className="h-3 w-3 mr-1" />
                  Revelar Respuesta
                </>
              )}
            </Button>
          </div>

          <Button
            onClick={handleNextCard}
            disabled={!viewedCards.has(currentCardIndex)}
          >
            {isLastCard ? 'Finalizar' : 'Siguiente →'}
          </Button>
        </div>

        {/* Progress indicator */}
        <div className="flex justify-center space-x-1">
          {cards.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full ${
                index === currentCardIndex
                  ? 'bg-primary'
                  : viewedCards.has(index)
                  ? 'bg-green-500'
                  : 'bg-gray-300'
              }`}
            />
          ))}
        </div>

        {!viewedCards.has(currentCardIndex) && (
          <div className="text-center text-sm text-muted-foreground">
            Voltea la tarjeta para poder continuar
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FlipCardsGame;