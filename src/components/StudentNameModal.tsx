import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { User, Users } from 'lucide-react';

interface StudentNameModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (name: string) => void;
  sessionName?: string;
}

const StudentNameModal = ({ isOpen, onClose, onSubmit, sessionName }: StudentNameModalProps) => {
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);

  console.log('StudentNameModal render:', { isOpen, sessionName });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError('Por favor ingresa tu nombre');
      return;
    }

    if (trimmedName.length < 2) {
      setError('El nombre debe tener al menos 2 caracteres');
      return;
    }

    if (trimmedName.length > 50) {
      setError('El nombre no puede tener más de 50 caracteres');
      return;
    }

    onSubmit(trimmedName);
    setName('');
    setError(null);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
    if (error) setError(null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full">
              <Users className="h-8 w-8 text-white" />
            </div>
          </div>
          <DialogTitle className="text-xl font-bold">
            ¡Bienvenido a la sesión!
          </DialogTitle>
          <DialogDescription className="text-base">
            {sessionName ? (
              <>Estás a punto de unirte a "<strong>{sessionName}</strong>"</>
            ) : (
              'Estás a punto de unirte a la sesión interactiva'
            )}
            <br />
            Ingresa tu nombre para continuar
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="studentName" className="text-sm font-medium">
              Tu nombre
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="studentName"
                type="text"
                placeholder="Ej: María González"
                value={name}
                onChange={handleNameChange}
                className="pl-10"
                maxLength={50}
                autoFocus
              />
            </div>
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Este nombre se mostrará a otros participantes durante la sesión
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
              disabled={!name.trim()}
            >
              Unirse a la Sesión
            </Button>
          </div>
        </form>

        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-xs text-blue-700 text-center">
            💡 <strong>Tip:</strong> No necesitas crear una cuenta. Tu participación será temporal 
            y tus datos no se guardarán permanentemente.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StudentNameModal;
