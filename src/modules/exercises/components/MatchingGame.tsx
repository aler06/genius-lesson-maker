import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PairModel } from '../model/pair.model';
import { CheckCircle2, RefreshCw, Link2, X, ArrowRight } from 'lucide-react';

interface MatchingGameProps {
  pairs: PairModel[];
  instructions?: string;
  onGameComplete?: (score: number, totalPairs: number, matchedPairs: { term: string; match: string; correct: boolean; correctMatch?: string }[]) => void;
  studentMode?: boolean;
}

interface MatchedPair {
  term: string;
  match: string;
  correct: boolean;
  correctMatch?: string;
}

const MatchingGame: React.FC<MatchingGameProps> = ({ 
  pairs, 
  instructions, 
  onGameComplete,
  studentMode = false 
}) => {
  const [draggedTerm, setDraggedTerm] = useState<string | null>(null);
  const [matchedPairs, setMatchedPairs] = useState<MatchedPair[]>([]);
  const [gameCompleted, setGameCompleted] = useState(false);

  // Shuffle arrays for randomization
  const [shuffledTerms] = useState(() => 
    pairs.map(pair => pair.term).sort(() => Math.random() - 0.5)
  );
  const [shuffledMatches] = useState(() => 
    pairs.map(pair => pair.match).sort(() => Math.random() - 0.5)
  );

  const handleDragStart = (e: React.DragEvent, term: string) => {
    setDraggedTerm(term);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetMatch: string) => {
    e.preventDefault();
    
    if (!draggedTerm) return;

    // Check if this term or match is already used
    const termAlreadyMatched = matchedPairs.some(pair => pair.term === draggedTerm);
    const matchAlreadyUsed = matchedPairs.some(pair => pair.match === targetMatch);
    
    if (termAlreadyMatched || matchAlreadyUsed) {
      setDraggedTerm(null);
      return;
    }

    // Find the correct match for this term
    const correctPair = pairs.find(pair => pair.term === draggedTerm);
    const isCorrect = correctPair?.match === targetMatch;

    const newMatch: MatchedPair = {
      term: draggedTerm,
      match: targetMatch,
      correct: isCorrect,
      correctMatch: correctPair?.match // Always include the correct match
    };

    const newMatchedPairs = [...matchedPairs, newMatch];
    setMatchedPairs(newMatchedPairs);
    setDraggedTerm(null);

    // Check if all pairs are matched (but don't complete yet)
    if (newMatchedPairs.length === pairs.length) {
      setGameCompleted(true);
    }
  };

  const resetGame = () => {
    setMatchedPairs([]);
    setGameCompleted(false);
    setDraggedTerm(null);
  };

  const getAvailableTerms = () => {
    return shuffledTerms.filter(term => 
      !matchedPairs.some(pair => pair.term === term)
    );
  };

  const getAvailableMatches = () => {
    return shuffledMatches.filter(match => 
      !matchedPairs.some(pair => pair.match === match)
    );
  };

  const isTermMatched = (term: string) => {
    return matchedPairs.some(pair => pair.term === term);
  };

  const isMatchUsed = (match: string) => {
    return matchedPairs.some(pair => pair.match === match);
  };

  const getMatchForTerm = (term: string) => {
    return matchedPairs.find(pair => pair.term === term);
  };

  const handleRemovePair = (index: number) => {
    const newMatchedPairs = matchedPairs.filter((_, i) => i !== index);
    setMatchedPairs(newMatchedPairs);
    if (gameCompleted) {
      setGameCompleted(false);
    }
  };

  const handleSubmit = () => {
    if (onGameComplete) {
      const score = matchedPairs.filter(pair => pair.correct).length;
      onGameComplete(score, pairs.length, matchedPairs);
    }
  };

  if (pairs.length === 0) {
    return (
      <Card className="border-l-4 border-l-red-500">
        <CardContent className="p-6 text-center">
          <p className="text-red-600">Error: No se han configurado pares para el juego de emparejamiento.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-6xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center flex items-center justify-center gap-2">
          <Link2 className="h-6 w-6" />
          Juego de Emparejamiento
        </CardTitle>
        {instructions && (
          <p className="text-muted-foreground mt-2 text-center">{instructions}</p>
        )}
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Game Progress */}
        <div className="text-center">
          <Badge variant="outline" className="text-lg px-4 py-2">
            {matchedPairs.length} / {pairs.length} emparejados
          </Badge>
        </div>

        {/* Game Area */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Terms Column */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-center mb-4 text-blue-700">
              📝 Términos
            </h3>
            {getAvailableTerms().map((term, index) => (
              <div
                key={term}
                draggable
                onDragStart={(e) => handleDragStart(e, term)}
                className={`
                  p-4 bg-blue-50 border-2 border-blue-200 rounded-lg cursor-move
                  hover:bg-blue-100 hover:border-blue-300 transition-all duration-200
                  transform hover:scale-105 active:scale-95
                  ${draggedTerm === term ? 'opacity-50 scale-95' : ''}
                `}
              >
                <p className="font-medium text-blue-900">{term}</p>
              </div>
            ))}
          </div>

          {/* Matches Column */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-center mb-4 text-green-700">
              🎯 Definiciones
            </h3>
            {getAvailableMatches().map((match, index) => (
              <div
                key={match}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, match)}
                className={`
                  p-4 bg-green-50 border-2 border-green-200 rounded-lg min-h-[60px]
                  transition-all duration-200
                  ${draggedTerm ? 'border-dashed border-green-400 bg-green-100' : ''}
                  hover:bg-green-100 hover:border-green-300
                `}
              >
                <p className="text-green-900">{match}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Matched Pairs Display - Only show count, not correctness */}
        {matchedPairs.length > 0 && (
          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-4 text-center">
              🔗 Emparejamientos Realizados
            </h3>
            <div className="grid gap-3">
              {matchedPairs.map((pair, index) => (
                <div
                  key={index}
                  className="p-4 rounded-lg border-2 bg-gray-50 border-gray-300 text-gray-900 flex items-center justify-between"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="font-medium">{pair.term}</div>
                    <div className="text-gray-500">↔</div>
                    <div>{pair.match}</div>
                  </div>
                  <div className="ml-4 flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleRemovePair(index)}
                      className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-600"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Submit button when all pairs are matched */}
        {gameCompleted && (
          <div className="flex justify-center mt-6">
            <Button
              onClick={handleSubmit}
              size="lg"
              className="bg-gradient-to-r from-primary to-blue-500 hover:from-primary-hover hover:to-blue-600 flex items-center gap-2"
            >
              {studentMode ? 'Siguiente Ejercicio' : 'Finalizar'}
              <ArrowRight className="h-5 w-5" />
            </Button>
          </div>
        )}

        {/* Controls */}
        {!studentMode && !gameCompleted && (
          <div className="flex justify-center">
            <Button
              onClick={resetGame}
              variant="outline"
              size="lg"
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-5 w-5" />
              Reiniciar Juego
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MatchingGame;
