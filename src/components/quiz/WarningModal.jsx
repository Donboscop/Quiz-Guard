import React from 'react';
import { useQuiz } from '../../context/QuizContext';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { AlertTriangle, ShieldCheck } from 'lucide-react';

export const WarningModal = () => {
  const { warningModal, closeWarningModal, focusWarnings } = useQuiz();

  return (
    <Modal
      isOpen={warningModal.isOpen}
      onClose={closeWarningModal}
      title={warningModal.title || "Focus Monitoring Alert"}
      type="warning"
    >
      <div className="space-y-4">
        <p className="text-sm text-slate-300 leading-relaxed">
          {warningModal.message}
        </p>

        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between">
          <span className="text-xs font-semibold text-amber-300">
            Warnings Issued:
          </span>
          <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono font-bold text-xs">
            {focusWarnings} / 2 Max
          </span>
        </div>

        <p className="text-xs text-slate-400">
          Note: A 2nd warning will immediately terminate your quiz attempt and record the violation in your history.
        </p>

        <div className="pt-2 flex justify-end">
          <Button
            variant="primary"
            size="md"
            onClick={closeWarningModal}
            icon={ShieldCheck}
          >
            I Understand — Continue Test
          </Button>
        </div>
      </div>
    </Modal>
  );
};
