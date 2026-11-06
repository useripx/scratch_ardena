import React from 'react';
import { Modal } from '../common/Modal';
import { useI18n } from '../../contexts/I18nContext';

export interface ImportSb3ConfirmModalProps {
  isOpen: boolean;
  fileName: string;
  fileSize: number;
  currentProjectTitle: string;
  onSaveAndOpen: () => void;
  onOpenWithoutSave: () => void;
  onClose: () => void;
}

export const ImportSb3ConfirmModal: React.FC<ImportSb3ConfirmModalProps> = ({
  isOpen,
  fileName,
  fileSize,
  currentProjectTitle,
  onSaveAndOpen,
  onOpenWithoutSave,
  onClose,
}) => {
  const { t } = useI18n();

  if (!isOpen) return null;

  const formattedSize = fileSize > 1024 * 1024
    ? `${(fileSize / (1024 * 1024)).toFixed(2)} MB`
    : `${(fileSize / 1024).toFixed(1)} KB`;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('importer.confirmModalTitle')}
      maxWidth="max-w-md"
    >
      <div className="space-y-4">
        {/* Info Box */}
        <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
          <span className="text-xl">⚠️</span>
          <div className="text-xs text-amber-900 leading-relaxed">
            <p className="font-bold mb-1">
              Proyek Aktif: &quot;{currentProjectTitle}&quot;
            </p>
            <p>
              {t('importer.confirmModalDesc')}
            </p>
          </div>
        </div>

        {/* Incoming File Details Card */}
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">📦</span>
            <div>
              <p className="text-xs font-bold text-slate-800 truncate max-w-[220px]">
                {fileName}
              </p>
              <p className="text-[11px] text-slate-500 font-medium">
                Scratch 3.0 Archive ({formattedSize})
              </p>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-blue-100 text-[#006194] text-[10px] font-bold">
            .sb3
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2 pt-2">
          <button
            type="button"
            onClick={onSaveAndOpen}
            className="w-full py-2.5 px-4 rounded-xl bg-[#006194] hover:bg-[#007bb9] text-white text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2"
          >
            <span>{t('importer.btnSaveAndOpen')}</span>
          </button>

          <button
            type="button"
            onClick={onOpenWithoutSave}
            className="w-full py-2.5 px-4 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-all"
          >
            <span>{t('importer.btnOpenWithoutSave')}</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="w-full py-2 px-4 rounded-xl text-slate-500 hover:text-slate-700 text-xs font-semibold transition-all"
          >
            {t('common.cancel')}
          </button>
        </div>
      </div>
    </Modal>
  );
};
