import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Gamepad2, RotateCcw, Trophy, Skull, CheckCircle } from 'lucide-react';

interface HangmanGameProps {
  word: string;
  hint?: string;
  onGameComplete?: (won: boolean, attempts: number) => void;
  studentMode?: boolean; // Hide restart button and correct answer for students
}

const HangmanGame: React.FC<HangmanGameProps> = ({ word, hint, onGameComplete, studentMode = false }) => {
  const [guessedLetters, setGuessedLetters] = useState<Set<string>>(new Set());
  const [wrongGuesses, setWrongGuesses] = useState(0);
  const [gameState, setGameState] = useState<'playing' | 'won' | 'lost'>('playing');
  const maxWrongGuesses = 6;

  const normalizedWord = word.toUpperCase().replace(/[^A-ZÑ]/g, '');
  const displayWord = word.toUpperCase();

  // Create alphabet array including Spanish letters
  const alphabet = 'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ'.split('');

  const getDisplayedWord = () => {
    return displayWord.split('').map(char => {
      if (char === ' ') return ' ';
      if (!/[A-ZÑ]/.test(char)) return char; // Keep punctuation
      return guessedLetters.has(char) ? char : '_';
    }).join(' ');
  };

  const handleLetterGuess = (letter: string) => {
    if (guessedLetters.has(letter) || gameState !== 'playing') return;

    const newGuessedLetters = new Set(guessedLetters);
    newGuessedLetters.add(letter);
    setGuessedLetters(newGuessedLetters);

    if (!normalizedWord.includes(letter)) {
      setWrongGuesses(prev => prev + 1);
    }
  };

  const resetGame = () => {
    setGuessedLetters(new Set());
    setWrongGuesses(0);
    setGameState('playing');
  };

  // Check win/lose conditions
  useEffect(() => {
    const wordLetters = new Set(normalizedWord.split(''));
    const guessedWordLetters = new Set([...guessedLetters].filter(letter => wordLetters.has(letter)));
    
    if (wordLetters.size === guessedWordLetters.size && wordLetters.size > 0) {
      setGameState('won');
      onGameComplete?.(true, wrongGuesses);
    } else if (wrongGuesses >= maxWrongGuesses) {
      setGameState('lost');
      onGameComplete?.(false, wrongGuesses);
    }
  }, [guessedLetters, wrongGuesses, normalizedWord, onGameComplete]);

  // SVG Hangman Drawing
  const HangmanDrawing = () => {
    const parts = [
      // Gallows base
      <line key="base" x1="10" y1="190" x2="70" y2="190" stroke="#8B4513" strokeWidth="4" />,
      // Gallows pole
      <line key="pole" x1="30" y1="190" x2="30" y2="20" stroke="#8B4513" strokeWidth="4" />,
      // Gallows top
      <line key="top" x1="30" y1="20" x2="120" y2="20" stroke="#8B4513" strokeWidth="4" />,
      // Noose
      <line key="noose" x1="120" y1="20" x2="120" y2="40" stroke="#8B4513" strokeWidth="3" />,
      // Head
      <circle key="head" cx="120" cy="55" r="15" stroke="#2C3E50" strokeWidth="3" fill="none" />,
      // Body
      <line key="body" x1="120" y1="70" x2="120" y2="140" stroke="#2C3E50" strokeWidth="3" />,
      // Left arm
      <line key="leftarm" x1="120" y1="90" x2="100" y2="110" stroke="#2C3E50" strokeWidth="3" />,
      // Right arm
      <line key="rightarm" x1="120" y1="90" x2="140" y2="110" stroke="#2C3E50" strokeWidth="3" />,
      // Left leg
      <line key="leftleg" x1="120" y1="140" x2="100" y2="170" stroke="#2C3E50" strokeWidth="3" />,
      // Right leg
      <line key="rightleg" x1="120" y1="140" x2="140" y2="170" stroke="#2C3E50" strokeWidth="3" />
    ];

    return (
      <svg width="200" height="200" className="mx-auto">
        {/* Always show gallows */}
        {parts.slice(0, 4)}
        {/* Show body parts based on wrong guesses */}
        {Array.from({ length: wrongGuesses }, (_, i) => parts[4 + i])}
      </svg>
    );
  };

  const getGameStatusColor = () => {
    switch (gameState) {
      case 'won': return 'text-white';
      case 'lost': return 'text-white';
      default: return 'text-white';
    }
  };

  const getGameStatusBadgeClass = () => {
    switch (gameState) {
      case 'won': return 'bg-blue-500 hover:bg-blue-600 text-white border-blue-500 animate-pulse';
      case 'lost': return 'bg-red-500 hover:bg-red-600 text-white border-red-500';
      default: return 'bg-blue-500 hover:bg-blue-600 text-white border-blue-500';
    }
  };

  const getGameStatusMessage = () => {
    switch (gameState) {
      case 'won': return '¡Felicitaciones! Has ganado 🎉';
      case 'lost': return '¡Game Over! La palabra era: ' + displayWord;
      default: return `Intentos restantes: ${maxWrongGuesses - wrongGuesses}`;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Game Header */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500 rounded-lg">
                <Gamepad2 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-green-800">Juego del Ahorcado</h2>
                <p className="text-sm text-green-600">Adivina la palabra letra por letra</p>
              </div>
            </div>
            {!studentMode && (
              <Button
                onClick={resetGame}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                Reiniciar
              </Button>
            )}
          </CardTitle>
        </CardHeader>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Hangman Drawing */}
        <Card className="bg-gradient-to-b from-sky-50 to-sky-100">
          <CardHeader>
            <CardTitle className="text-center text-lg text-sky-800">
              La Horca
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-white rounded-lg p-6 shadow-inner">
              <HangmanDrawing />
            </div>
            <div className="mt-4 text-center">
              <div 
                className={`inline-flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors cursor-default ${getGameStatusBadgeClass()}`}
              >
                {gameState === 'won' && <Trophy className="h-4 w-4 mr-1" />}
                {gameState === 'lost' && <Skull className="h-4 w-4 mr-1" />}
                <span className={getGameStatusColor()}>{getGameStatusMessage()}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Game Area */}
        <Card>
          <CardHeader>
            <CardTitle className="text-center text-lg">
              Palabra a Adivinar
            </CardTitle>
            {hint && (
              <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <strong>💡 Pista:</strong> {hint}
                </p>
              </div>
            )}
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Word Display */}
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-mono font-bold tracking-wider p-6 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 min-h-[80px] flex items-center justify-center">
                {getDisplayedWord()}
              </div>
            </div>

            {/* Alphabet Keyboard */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3 text-center">
                Selecciona una letra:
              </h3>
              <div className="grid grid-cols-6 md:grid-cols-9 gap-2">
                {alphabet.map(letter => {
                  const isGuessed = guessedLetters.has(letter);
                  const isCorrect = isGuessed && normalizedWord.includes(letter);
                  const isWrong = isGuessed && !normalizedWord.includes(letter);
                  
                  return (
                    <Button
                      key={letter}
                      onClick={() => handleLetterGuess(letter)}
                      disabled={isGuessed || gameState !== 'playing'}
                      variant={isCorrect ? 'default' : isWrong ? 'destructive' : 'outline'}
                      size="sm"
                      className={`aspect-square text-sm font-bold transition-all duration-200 ${
                        isCorrect 
                          ? 'bg-green-500 hover:bg-green-600 text-white' 
                          : isWrong 
                          ? 'bg-red-500 hover:bg-red-600 text-white'
                          : 'hover:bg-blue-50 hover:border-blue-300'
                      }`}
                    >
                      {letter}
                    </Button>
                  );
                })}
              </div>
            </div>

            {/* Guessed Letters Summary */}
            {guessedLetters.size > 0 && (
              <div className="space-y-2">
                <div className="flex flex-wrap gap-2">
                  <div className="text-sm">
                    <span className="font-medium text-green-700">Correctas: </span>
                    {[...guessedLetters].filter(letter => normalizedWord.includes(letter)).join(', ') || 'Ninguna'}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <div className="text-sm">
                    <span className="font-medium text-red-700">Incorrectas: </span>
                    {[...guessedLetters].filter(letter => !normalizedWord.includes(letter)).join(', ') || 'Ninguna'}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Answer Section - Only visible for teachers/preview mode */}
      {!studentMode && (
        <Card className="bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200">
          <CardHeader>
            <CardTitle className="text-center text-lg text-amber-800 flex items-center justify-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Respuesta Correcta
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-amber-900 bg-white p-4 rounded-lg border-2 border-amber-200 shadow-sm">
                {displayWord}
              </div>
              {hint && (
                <div className="mt-3 text-sm text-amber-700">
                  <strong>Pista:</strong> {hint}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Game Over Actions */}
      {gameState !== 'playing' && (
        <Card className={`border-2 ${gameState === 'won' ? 'border-green-300 bg-green-50' : 'border-red-300 bg-red-50'}`}>
          <CardContent className="text-center py-6">
            <div className="space-y-4">
              {gameState === 'won' ? (
                <div>
                  <Trophy className="h-12 w-12 text-green-600 mx-auto mb-2" />
                  <h3 className="text-xl font-bold text-green-800">¡Excelente trabajo!</h3>
                  <p className="text-green-700">Has adivinado la palabra con {wrongGuesses} errores.</p>
                </div>
              ) : (
                <div>
                  <Skull className="h-12 w-12 text-red-600 mx-auto mb-2" />
                  <h3 className="text-xl font-bold text-red-800">¡Mejor suerte la próxima vez!</h3>
                  <p className="text-red-700">¡Inténtalo de nuevo!</p>
                </div>
              )}
              {!studentMode && (
                <Button
                  onClick={resetGame}
                  variant="outline"
                  className="gap-2 hover:bg-primary/10 hover:border-primary/20 transition-colors"
                >
                  <RotateCcw className="h-4 w-4" />
                  Jugar de Nuevo
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default HangmanGame;
