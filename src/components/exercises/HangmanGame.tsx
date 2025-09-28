import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { AlertCircle, Lightbulb, Target, Trophy } from 'lucide-react';

interface HangmanGameProps {
  word: string;
  hint: string;
  onGuess?: (letter: string, isCorrect: boolean, timeSpent: number) => void;
  onComplete?: (success: boolean, totalTime: number) => void;
}

const HangmanGame: React.FC<HangmanGameProps> = ({ 
  word, 
  hint, 
  onGuess, 
  onComplete 
}) => {
  const [guessedLetters, setGuessedLetters] = useState<string[]>([]);
  const [wrongGuesses, setWrongGuesses] = useState<string[]>([]);
  const [currentGuess, setCurrentGuess] = useState('');
  const [startTime] = useState(Date.now());
  const [gameStatus, setGameStatus] = useState<'playing' | 'won' | 'lost'>('playing');

  const maxWrongGuesses = 6;
  const wordToGuess = word.toUpperCase();
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  // Calculate display word (with guessed letters revealed)
  const displayWord = wordToGuess
    .split('')
    .map(letter => {
      if (letter === ' ' || letter === '/' || letter === '-') return letter;
      return guessedLetters.includes(letter) ? letter : '_';
    })
    .join(' ');

  // Check if word is complete
  const isWordComplete = wordToGuess
    .split('')
    .every(letter => 
      letter === ' ' || 
      letter === '/' || 
      letter === '-' || 
      guessedLetters.includes(letter)
    );

  // Update game status
  useEffect(() => {
    if (isWordComplete && gameStatus === 'playing') {
      setGameStatus('won');
      const totalTime = Date.now() - startTime;
      onComplete?.(true, totalTime);
    } else if (wrongGuesses.length >= maxWrongGuesses && gameStatus === 'playing') {
      setGameStatus('lost');
      const totalTime = Date.now() - startTime;
      onComplete?.(false, totalTime);
    }
  }, [isWordComplete, wrongGuesses.length, gameStatus, startTime, onComplete]);

  const handleLetterGuess = (letter: string) => {
    if (guessedLetters.includes(letter) || wrongGuesses.includes(letter) || gameStatus !== 'playing') {
      return;
    }

    const guessTime = Date.now() - startTime;
    const isCorrect = wordToGuess.includes(letter);

    if (isCorrect) {
      setGuessedLetters([...guessedLetters, letter]);
    } else {
      setWrongGuesses([...wrongGuesses, letter]);
    }

    onGuess?.(letter, isCorrect, guessTime);
  };

  const handleWordGuess = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentGuess.trim() || gameStatus !== 'playing') return;

    const guess = currentGuess.toUpperCase().trim();
    const guessTime = Date.now() - startTime;
    
    if (guess === wordToGuess) {
      // Correct word guess
      setGuessedLetters(wordToGuess.split('').filter(l => l !== ' ' && l !== '/' && l !== '-'));
      onGuess?.(guess, true, guessTime);
    } else {
      // Wrong word guess - counts as wrong letter
      setWrongGuesses([...wrongGuesses, guess]);
      onGuess?.(guess, false, guessTime);
    }
    
    setCurrentGuess('');
  };

  const getHangmanDrawing = () => {
    const stages = [
      '', // 0 wrong
      '  |\n  |', // 1 wrong
      '  +---+\n  |   |\n  |', // 2 wrong
      '  +---+\n  |   |\n  |   O', // 3 wrong
      '  +---+\n  |   |\n  |   O\n  |   |', // 4 wrong
      '  +---+\n  |   |\n  |   O\n  |  /|', // 5 wrong
      '  +---+\n  |   |\n  |   O\n  |  /|\\\n  |  /', // 6 wrong (game over)
    ];
    return stages[Math.min(wrongGuesses.length, maxWrongGuesses)];
  };

  const progressPercentage = ((maxWrongGuesses - wrongGuesses.length) / maxWrongGuesses) * 100;

  return (
    <div className="space-y-6">
      {/* Game Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Juego del Ahorcado
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant={gameStatus === 'won' ? 'default' : gameStatus === 'lost' ? 'destructive' : 'secondary'}>
                {gameStatus === 'won' ? '¡Ganaste!' : gameStatus === 'lost' ? 'Perdiste' : 'Jugando'}
              </Badge>
              {gameStatus === 'won' && <Trophy className="h-5 w-5 text-yellow-500" />}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Intentos restantes: {maxWrongGuesses - wrongGuesses.length}</span>
                <span>{wrongGuesses.length}/{maxWrongGuesses} errores</span>
              </div>
              <Progress 
                value={progressPercentage} 
                className={`h-2 ${wrongGuesses.length >= 4 ? 'bg-red-100' : 'bg-green-100'}`}
              />
            </div>

            {/* Hint - Always visible */}
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Lightbulb className="h-4 w-4 text-blue-600" />
                <span className="font-medium text-blue-800">Pista:</span>
              </div>
              <p className="text-sm text-blue-700">{hint}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Game Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hangman Drawing */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Dibujo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center">
              <pre className="text-2xl font-mono text-center leading-tight">
                {getHangmanDrawing()}
              </pre>
            </div>
          </CardContent>
        </Card>

        {/* Word Display */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Palabra a Adivinar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-4xl font-mono font-bold tracking-widest mb-4 p-4 bg-gray-50 rounded-lg">
                {displayWord}
              </div>
              <p className="text-sm text-muted-foreground">
                {wordToGuess.replace(/[A-Z]/g, '_').length} letras
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Game Controls */}
      {gameStatus === 'playing' && (
        <div className="space-y-4">
          {/* Word Guess */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Adivinar Palabra Completa</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleWordGuess} className="flex gap-2">
                <Input
                  value={currentGuess}
                  onChange={(e) => setCurrentGuess(e.target.value)}
                  placeholder="Escribe la palabra completa..."
                  className="flex-1"
                />
                <Button type="submit" disabled={!currentGuess.trim()}>
                  Adivinar
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Letter Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Seleccionar Letras</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="max-w-3xl mx-auto">
                <div className="flex flex-wrap justify-center gap-1">
                  {alphabet.map(letter => {
                    const isGuessed = guessedLetters.includes(letter);
                    const isWrong = wrongGuesses.includes(letter);
                    const isUsed = isGuessed || isWrong;
                    
                    return (
                      <Button
                        key={letter}
                        variant={isGuessed ? "default" : isWrong ? "destructive" : "outline"}
                        size="sm"
                        onClick={() => handleLetterGuess(letter)}
                        disabled={isUsed}
                        className="h-10 w-10 p-0 text-sm font-semibold"
                      >
                        {letter}
                      </Button>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Game Over */}
      {gameStatus !== 'playing' && (
        <Card className={gameStatus === 'won' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center gap-2">
                {gameStatus === 'won' ? (
                  <Trophy className="h-8 w-8 text-green-600" />
                ) : (
                  <AlertCircle className="h-8 w-8 text-red-600" />
                )}
                <h3 className="text-2xl font-bold">
                  {gameStatus === 'won' ? '¡Felicitaciones!' : '¡Juego Terminado!'}
                </h3>
              </div>
              
              <div className="space-y-2">
                <p className="text-lg">
                  La palabra era: <span className="font-bold text-2xl">{wordToGuess}</span>
                </p>
                <p className="text-muted-foreground">{hint}</p>
              </div>

              {gameStatus === 'won' && (
                <div className="text-green-600">
                  <p>¡Excelente trabajo! Has adivinado la palabra correctamente.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Wrong Guesses Display */}
      {wrongGuesses.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-red-600">Letras Incorrectas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {wrongGuesses.map((letter, index) => (
                <Badge key={index} variant="destructive">
                  {letter}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default HangmanGame;
