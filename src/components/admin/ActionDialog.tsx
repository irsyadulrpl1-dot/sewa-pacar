import { ReactNode } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface ActionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  actionLabel: string;
  actionVariant?: 'default' | 'destructive';
  onConfirm: () => void;
  disabled?: boolean;
  children?: ReactNode;
  notes?: string;
  onNotesChange?: (notes: string) => void;
  notesRequired?: boolean;
  notesPlaceholder?: string;
}

/**
 * Reusable action dialog for admin operations
 */
export function ActionDialog({
  open,
  onOpenChange,
  title,
  description,
  actionLabel,
  actionVariant = 'default',
  onConfirm,
  disabled,
  children,
  notes,
  onNotesChange,
  notesRequired,
  notesPlaceholder = 'Add notes...',
}: ActionDialogProps) {
  const handleConfirm = () => {
    onConfirm();
    onOpenChange(false);
  };

  const isDisabled = disabled || (notesRequired && !notes?.trim());

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {children}
          {onNotesChange && (
            <Textarea
              placeholder={notesPlaceholder}
              value={notes}
              onChange={(e) => onNotesChange(e.target.value)}
              rows={4}
            />
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant={actionVariant}
            onClick={handleConfirm}
            disabled={isDisabled}
          >
            {actionLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
