import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PhraseModel } from '../model/phrase.model';
import { Play, RefreshCw, RotateCcw } from 'lucide-react';

interface RouletteGameProps {
  phrases: PhraseModel[]; 
  instructions?: string;
  onGameComplete?: (selectedPhrase: string, phraseIndex: number) => void;
  studentMode?: boolean;
}

const RouletteGame: React.FC<RouletteGameProps> = ({ 
  phrases, 
  instructions, 
  onGameComplete,
  studentMode = false 
}) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [selectedPhrase, setSelectedPhrase] = useState<string | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [rotation, setRotation] = useState(0);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [showWinAnimation, setShowWinAnimation] = useState(false);
  const rouletteRef = useRef<HTMLDivElement>(null);

  const colors = [
    '#2196F3', // Azul
    '#4CAF50', // Verde
    '#9C27B0', // Morado
    '#FFEB3B', // Amarillo
    '#E91E63', // Rosa
    '#00BCD4', // Cian
    '#8BC34A', // Verde lima
    '#673AB7', // Violeta
    '#FF9800', // Naranja
    '#009688'  // Teal
  ];

  const spinRoulette = () => {
    if (isSpinning || phrases.length === 0) return;

    setIsSpinning(true);
    setSelectedPhrase(null);
    setSelectedIndex(null);
    setGameCompleted(false);
    setShowWinAnimation(false);

    const randomIndex = Math.floor(Math.random() * phrases.length);
    const degreesPerSection = 360 / phrases.length;
    const sectionCenter = randomIndex * degreesPerSection + degreesPerSection / 2;
    const spins = 5;
    const finalRotation = rotation + (spins * 360) + (360 - sectionCenter);
    
    setRotation(finalRotation);

    setTimeout(() => {
      setIsSpinning(false);
      setSelectedPhrase(phrases[randomIndex].text);
      setSelectedIndex(randomIndex);
      setGameCompleted(true);
      
      // Activar animación después de un pequeño delay
      setTimeout(() => {
        setShowWinAnimation(true);
      }, 300);
      
      if (onGameComplete) {
        onGameComplete(phrases[randomIndex].text, randomIndex);
      }
    }, 4000);
  };

  const resetGame = () => {
    setIsSpinning(false);
    setSelectedPhrase(null);
    setSelectedIndex(null);
    setGameCompleted(false);
    setShowWinAnimation(false);
    setRotation(0);
  };

  if (phrases.length === 0) {
    return (
      <Card className="border-l-4 border-l-red-500">
        <CardContent className="p-6 text-center">
          <p className="text-red-600">Error: No se han configurado frases para la ruleta.</p>
        </CardContent>
      </Card>
    );
  }

  const degreesPerSection = 360 / phrases.length;

  // Crear el conic-gradient dinámicamente
  let gradientSegments = '';
  phrases.forEach((_, index) => {
    const color = colors[index % colors.length];
    const startAngle = index * degreesPerSection;
    const endAngle = startAngle + degreesPerSection;
    gradientSegments += `${color} ${startAngle}deg ${endAngle}deg, `;
  });
  gradientSegments = gradientSegments.slice(0, -2);

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center flex items-center justify-center gap-2">
          🎯 Ruleta
        </CardTitle>
        {instructions && (
          <p className="text-muted-foreground mt-2">{instructions}</p>
        )}
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Ruleta Visual */}
        <div className="flex justify-center p-4">
          <div className="relative">
            {/* Flecha indicadora */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 z-20">
              <div className="w-0 h-0 border-l-8 border-r-8 border-b-16 border-l-transparent border-r-transparent border-b-red-600 drop-shadow-lg"></div>
            </div>
            
            {/* Overlay de animación ganadora */}
            {showWinAnimation && selectedIndex !== null && (
              <div 
                className="absolute inset-0 rounded-full pointer-events-none z-10 animate-pulse"
                style={{
                  boxShadow: `inset 0 0 0 8px ${colors[selectedIndex % colors.length]}80, 0 0 30px ${colors[selectedIndex % colors.length]}60`,
                }}
              />
            )}
            
            {/* Ruleta */}
            <div 
              ref={rouletteRef}
              className="w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 relative border-4 border-gray-800 shadow-xl overflow-hidden rounded-full"
              style={{
                transform: `rotate(${rotation}deg)`,
                transition: isSpinning ? 'transform 4s cubic-bezier(0.17, 0.67, 0.12, 0.99)' : 'none',
                background: `conic-gradient(${gradientSegments})`,
              }}
            >
              {phrases.map((_, index) => {
                const startAngle = index * degreesPerSection;
                const numberAngle = startAngle + degreesPerSection / 2;
                const numberRadius = 35;
                const numberX = 50 + (numberRadius * Math.cos((numberAngle - 90) * Math.PI / 180));
                const numberY = 50 + (numberRadius * Math.sin((numberAngle - 90) * Math.PI / 180));
                
                return (
                  <div 
                    key={index}
                    className={`absolute text-white font-bold text-lg sm:text-xl md:text-2xl pointer-events-none transition-all duration-300 ${
                      showWinAnimation && selectedIndex === index ? 'animate-bounce scale-125' : ''
                    }`}
                    style={{
                      left: `${numberX}%`,
                      top: `${numberY}%`,
                      transform: 'translate(-50%, -50%)',
                      textShadow: showWinAnimation && selectedIndex === index 
                        ? '0 0 10px rgba(255, 255, 255, 0.8), 0 0 20px rgba(255, 255, 255, 0.6)' 
                        : '2px 2px 4px rgba(0,0,0,0.5)',
                    }}
                  >
                    {index + 1}
                  </div>
                );
              })}
              
              {/* Centro */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 bg-white rounded-full shadow-lg z-10 border-2 border-gray-800"></div>
            </div>
          </div>
        </div>

        {/* Controles */}
        <div className="flex justify-center gap-4">
          <button
            onClick={spinRoulette}
            disabled={isSpinning}
            className={`
              px-8 py-4 rounded-2xl font-semibold text-white text-lg
              bg-gradient-to-r from-blue-500 to-blue-600 
              hover:from-blue-600 hover:to-blue-700
              disabled:from-gray-400 disabled:to-gray-500
              shadow-lg hover:shadow-xl
              transform transition-all duration-200
              hover:scale-105 active:scale-95
              disabled:cursor-not-allowed disabled:transform-none
              flex items-center gap-3
              ${isSpinning ? 'animate-pulse' : ''}
            `}
          >
            {isSpinning ? (
              <>
                <RefreshCw className="h-6 w-6 animate-spin" />
                Girando Ruleta...
              </>
            ) : (
              <>
                <Play className="h-6 w-6" />
                Girar Ruleta
              </>
            )}
          </button>

          {!studentMode && gameCompleted && (
            <Button
              onClick={resetGame}
              variant="outline"
              size="lg"
              className="flex items-center gap-2"
            >
              <RotateCcw className="h-5 w-5" />
              Reiniciar
            </Button>
          )}
        </div>

        {/* Frase Seleccionada */}
        {selectedPhrase && selectedIndex !== null && (
          <div 
            className={`mx-auto max-w-2xl p-6 rounded-2xl shadow-lg border-2 transition-all duration-500 ease-out transform ${
              showWinAnimation ? 'animate-pulse scale-105' : 'scale-100'
            }`}
            style={{
              backgroundColor: `${colors[selectedIndex % colors.length]}40`,
              borderColor: `${colors[selectedIndex % colors.length]}80`,
              boxShadow: showWinAnimation 
                ? `0 10px 30px ${colors[selectedIndex % colors.length]}40, 0 0 20px ${colors[selectedIndex % colors.length]}60`
                : undefined,
            }}
          >
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div 
                  className={`w-8 h-8 rounded-full shadow-lg flex items-center justify-center font-bold text-white transition-all duration-300 ${
                    showWinAnimation ? 'animate-bounce scale-110' : ''
                  }`}
                  style={{
                    backgroundColor: colors[selectedIndex % colors.length],
                    boxShadow: showWinAnimation 
                      ? `0 0 15px ${colors[selectedIndex % colors.length]}80`
                      : undefined,
                  }}
                >
                  {selectedIndex + 1}
                </div>
                <h3 className="text-xl font-bold text-gray-800">
                  Frase Seleccionada
                </h3>
              </div>
              
              <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-white/50 shadow-inner">
                <p className="text-lg font-medium text-gray-800 leading-relaxed">
                  "{selectedPhrase}"
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RouletteGame;