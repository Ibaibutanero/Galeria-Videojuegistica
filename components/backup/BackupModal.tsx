'use client';

import React, { useState, useRef } from 'react';
import { useLibrary } from '@/lib/context/library-context';
import { BackupValidationResult, ImportMode, ImportResult } from '@/types/library';
import {
  Download,
  Upload,
  X,
  FileJson,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Loader2,
  Database,
  RefreshCw,
  PlusCircle,
  Calendar,
  Gamepad2,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import { formatDate } from '@/lib/utils/formatters';

interface BackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'export' | 'import';
}

export const BackupModal: React.FC<BackupModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'export',
}) => {
  const { games, exportBackup, validateBackup, importBackup } = useLibrary();

  const [activeTab, setActiveTab] = useState<'export' | 'import'>(initialTab);
  const [exporting, setExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  // Import state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [validation, setValidation] = useState<BackupValidationResult | null>(null);
  const [importMode, setImportMode] = useState<ImportMode>('merge');
  const [confirmReplace, setConfirmReplace] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [readingFile, setReadingFile] = useState(false);

  // Reset states when closing
  const handleClose = () => {
    setSelectedFileName(null);
    setValidation(null);
    setConfirmReplace(false);
    setImportResult(null);
    setExportSuccess(false);
    onClose();
  };

  if (!isOpen) return null;

  // 1. Manejador de Exportación
  const handleExport = async () => {
    try {
      setExporting(true);
      const backupData = await exportBackup();

      const jsonString = JSON.stringify(backupData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      const now = new Date();
      const dateStr = now.toISOString().slice(0, 10);
      const timeStr = `${String(now.getHours()).padStart(2, '0')}-${String(now.getMinutes()).padStart(2, '0')}`;
      const fileName = `gameshelf_backup_${dateStr}_${timeStr}.json`;

      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 3500);
    } catch (err) {
      console.error('Error al exportar la copia de seguridad:', err);
    } finally {
      setExporting(false);
    }
  };

  // 2. Manejador de selección de archivo para Importar
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFileName(file.name);
    setValidation(null);
    setImportResult(null);
    setConfirmReplace(false);
    setReadingFile(true);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const result = validateBackup(text);
        setValidation(result);
      } catch (error) {
        setValidation({
          valid: false,
          error: 'No se pudo leer el archivo. Asegúrate de que sea un archivo de texto JSON válido.',
        });
      } finally {
        setReadingFile(false);
      }
    };

    reader.onerror = () => {
      setValidation({
        valid: false,
        error: 'Ocurrió un error al leer el archivo desde tu dispositivo.',
      });
      setReadingFile(false);
    };

    reader.readAsText(file);
  };

  // 3. Manejador de ejecución de importación
  const handleExecuteImport = async () => {
    if (!validation?.valid || !validation.backup) return;

    if (importMode === 'replace' && !confirmReplace) {
      return;
    }

    try {
      setIsImporting(true);
      const result = await importBackup(validation.backup, importMode);
      setImportResult(result);
    } catch (err: any) {
      setImportResult({
        success: false,
        importedCount: 0,
        mode: importMode,
        message: err.message || 'Error inesperado durante la importación.',
      });
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl rounded-2xl bg-shelf-900 border border-shelf-700/80 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Cabecera del Modal */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-shelf-800 bg-shelf-950/70">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-brand-purple/15 border border-brand-purple/30 flex items-center justify-center text-brand-purple shadow-glow">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>Copia de Seguridad</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-shelf-800 text-shelf-300 border border-shelf-700">
                  JSON v1
                </span>
              </h3>
              <p className="text-xs text-shelf-400">Exporta o restaura tu biblioteca de videojuegos</p>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg text-shelf-400 hover:text-white hover:bg-shelf-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Selector de Pestañas (Exportar / Importar) */}
        <div className="flex border-b border-shelf-800 bg-shelf-950/40 px-5 pt-2 gap-4">
          <button
            type="button"
            onClick={() => setActiveTab('export')}
            className={`pb-3 text-xs sm:text-sm font-semibold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'export'
                ? 'border-brand-purple text-white'
                : 'border-transparent text-shelf-400 hover:text-shelf-200'
            }`}
          >
            <Download className="w-4 h-4" />
            <span>Exportar biblioteca</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('import')}
            className={`pb-3 text-xs sm:text-sm font-semibold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'import'
                ? 'border-brand-purple text-white'
                : 'border-transparent text-shelf-400 hover:text-shelf-200'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>Importar biblioteca</span>
          </button>
        </div>

        {/* Contenido de la pestaña */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-5">
          {/* ================= PESTAÑA: EXPORTAR ================= */}
          {activeTab === 'export' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-shelf-850/80 border border-shelf-750 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-shelf-400 flex items-center gap-2">
                    <Gamepad2 className="w-4 h-4 text-brand-purple" />
                    <span>Juegos en tu colección actual:</span>
                  </span>
                  <span className="font-mono font-bold text-white text-sm">{games.length}</span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-shelf-400 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-emerald-400" />
                    <span>Horas jugadas registradas:</span>
                  </span>
                  <span className="font-mono font-bold text-emerald-400 text-sm">
                    {games.reduce((sum, g) => sum + (g.hoursPlayed || 0), 0)} h
                  </span>
                </div>
              </div>

              <div className="text-xs text-shelf-300 space-y-2 leading-relaxed">
                <p>
                  Descarga un archivo <strong className="text-white">.json</strong> con todos los
                  datos de tu biblioteca:
                </p>
                <ul className="list-disc list-inside space-y-1 text-shelf-400 ml-1">
                  <li>Identificadores y carátulas de videojuegos.</li>
                  <li>Estados de progreso (Pendiente, Jugando, Completado, etc.).</li>
                  <li>Plataformas seleccionadas y horas dedicadas.</li>
                  <li>Notas y valoraciones personales.</li>
                  <li>Fechas de incorporación y última actualización.</li>
                </ul>
                <p className="text-[11px] text-shelf-400 pt-1">
                  Este archivo no altera tu colección actual y podrás guardarlo como respaldo o
                  utilizarlo en otro navegador.
                </p>
              </div>

              {exportSuccess && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>
                    Copia de seguridad descargada correctamente. Guárdala en un lugar seguro.
                  </span>
                </div>
              )}

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={handleExport}
                  disabled={exporting}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-brand-purple hover:bg-brand-purple-hover text-white font-medium text-xs sm:text-sm shadow-subtle transition-all disabled:opacity-50"
                >
                  {exporting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Generando archivo...</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      <span>Descargar copia de seguridad (.json)</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* ================= PESTAÑA: IMPORTAR ================= */}
          {activeTab === 'import' && (
            <div className="space-y-4">
              {/* Resultado de importación exitosa */}
              {importResult && (
                <div
                  className={`p-4 rounded-xl border text-xs space-y-2 animate-in fade-in ${
                    importResult.success
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                      : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                  }`}
                >
                  <div className="flex items-center gap-2 font-semibold">
                    {importResult.success ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-rose-400" />
                    )}
                    <span>{importResult.message}</span>
                  </div>
                  {importResult.success && (
                    <div className="pt-2 flex justify-end">
                      <button
                        type="button"
                        onClick={handleClose}
                        className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold"
                      >
                        Aceptar y ver mi biblioteca
                      </button>
                    </div>
                  )}
                </div>
              )}

              {!importResult?.success && (
                <>
                  {/* Selector de Archivo / Dropzone */}
                  <div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".json,application/json"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="p-6 rounded-2xl border-2 border-dashed border-shelf-750 hover:border-brand-purple/70 bg-shelf-850/50 hover:bg-shelf-850/80 text-center cursor-pointer transition-all space-y-2"
                    >
                      <div className="w-12 h-12 rounded-xl bg-shelf-800 border border-shelf-700 flex items-center justify-center text-brand-purple mx-auto">
                        <FileJson className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm font-semibold text-white">
                          {selectedFileName ? (
                            <span className="text-brand-purple font-mono">{selectedFileName}</span>
                          ) : (
                            'Haz clic para seleccionar tu archivo de copia (.json)'
                          )}
                        </p>
                        <p className="text-[11px] text-shelf-400 mt-0.5">
                          Formato compatible con copias de seguridad de GameShelf (v1)
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Cargando lectura */}
                  {readingFile && (
                    <div className="p-3 text-center text-xs text-shelf-400 flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-brand-purple" />
                      <span>Validando estructura del archivo...</span>
                    </div>
                  )}

                  {/* Error de Validación */}
                  {validation && !validation.valid && (
                    <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5">
                      <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                      <div>
                        <h5 className="font-semibold text-rose-200">Archivo no válido</h5>
                        <p className="mt-0.5 text-shelf-300">{validation.error}</p>
                      </div>
                    </div>
                  )}

                  {/* Validación Exitosa -> Resumen y Confirmación */}
                  {validation?.valid && validation.backup && validation.stats && (
                    <div className="space-y-4 animate-in fade-in">
                      {/* Resumen del contenido */}
                      <div className="p-4 rounded-xl bg-shelf-850/90 border border-shelf-750 space-y-2.5">
                        <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                          <ShieldCheck className="w-4 h-4 text-emerald-400" />
                          <span>Resumen de la copia de seguridad</span>
                        </h4>

                        <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                          <div className="p-2 rounded-lg bg-shelf-900 border border-shelf-800">
                            <span className="text-shelf-400 text-[11px]">Juegos en el archivo:</span>
                            <p className="font-mono font-bold text-white text-sm">
                              {validation.stats.totalGames}
                            </p>
                          </div>
                          <div className="p-2 rounded-lg bg-shelf-900 border border-shelf-800">
                            <span className="text-shelf-400 text-[11px]">Juegos nuevos a añadir:</span>
                            <p className="font-mono font-bold text-emerald-400 text-sm">
                              +{validation.stats.newGamesCount}
                            </p>
                          </div>
                        </div>

                        {validation.stats.existingGamesCount > 0 && (
                          <p className="text-[11px] text-amber-300/90 flex items-center gap-1.5 pt-1">
                            <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-amber-400" />
                            <span>
                              {validation.stats.existingGamesCount} juego(s) ya existen en tu biblioteca.
                            </span>
                          </p>
                        )}

                        {validation.backup.exportedAt && (
                          <div className="text-[11px] text-shelf-400 flex items-center gap-1.5 pt-1">
                            <Calendar className="w-3.5 h-3.5 text-shelf-500" />
                            <span>Exportada el {formatDate(validation.backup.exportedAt)}</span>
                          </div>
                        )}
                      </div>

                      {/* Selección de Estrategia de Importación */}
                      <div className="space-y-2.5">
                        <label className="block text-xs font-semibold text-shelf-300 uppercase tracking-wider">
                          Modo de importación
                        </label>

                        {/* Opción 1: Combinar */}
                        <div
                          onClick={() => setImportMode('merge')}
                          className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                            importMode === 'merge'
                              ? 'bg-shelf-850 border-brand-purple shadow-subtle'
                              : 'bg-shelf-850/60 border-shelf-750 hover:bg-shelf-850'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <input
                                type="radio"
                                name="importMode"
                                checked={importMode === 'merge'}
                                onChange={() => setImportMode('merge')}
                                className="accent-purple-500"
                              />
                              <span className="text-xs font-bold text-white">
                                Combinar sin duplicar (Recomendado)
                              </span>
                            </div>
                            <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/30">
                              Seguro
                            </span>
                          </div>
                          <p className="text-[11px] text-shelf-400 mt-1.5 ml-5 leading-normal">
                            Añade los juegos nuevos. Si un juego ya existe, se conservará la versión con
                            la modificación más reciente para mantener tus horas y notas.
                          </p>
                        </div>

                        {/* Opción 2: Reemplazar */}
                        <div
                          onClick={() => setImportMode('replace')}
                          className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                            importMode === 'replace'
                              ? 'bg-shelf-850 border-rose-500/80 shadow-subtle'
                              : 'bg-shelf-850/60 border-shelf-750 hover:bg-shelf-850'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <input
                                type="radio"
                                name="importMode"
                                checked={importMode === 'replace'}
                                onChange={() => setImportMode('replace')}
                                className="accent-rose-500"
                              />
                              <span className="text-xs font-bold text-white">
                                Reemplazar biblioteca completa
                              </span>
                            </div>
                            <span className="text-[10px] font-semibold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-md border border-rose-500/30">
                              Sobrescribe todo
                            </span>
                          </div>
                          <p className="text-[11px] text-shelf-400 mt-1.5 ml-5 leading-normal">
                            Borra los juegos actuales de este navegador y los sustituye exactamente por los
                            del archivo importado.
                          </p>
                        </div>

                        {/* Confirmación adicional obligatoria si se selecciona Reemplazar */}
                        {importMode === 'replace' && (
                          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs space-y-2 animate-in fade-in">
                            <label className="flex items-start gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={confirmReplace}
                                onChange={(e) => setConfirmReplace(e.target.checked)}
                                className="mt-0.5 accent-rose-500"
                              />
                              <span className="text-[11px] font-medium text-rose-200">
                                He leído la advertencia y confirmo que deseo sustituir mi biblioteca actual
                                por completo.
                              </span>
                            </label>
                          </div>
                        )}
                      </div>

                      {/* Botones de acción */}
                      <div className="pt-3 border-t border-shelf-800 flex items-center justify-end gap-2.5">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedFileName(null);
                            setValidation(null);
                            if (fileInputRef.current) fileInputRef.current.value = '';
                          }}
                          className="px-4 py-2 rounded-lg text-xs text-shelf-300 hover:text-white hover:bg-shelf-800 transition-colors"
                        >
                          Cambiar archivo
                        </button>

                        <button
                          type="button"
                          onClick={handleExecuteImport}
                          disabled={
                            isImporting ||
                            (importMode === 'replace' && !confirmReplace)
                          }
                          className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-xs sm:text-sm text-white shadow-subtle transition-all disabled:opacity-50 ${
                            importMode === 'replace'
                              ? 'bg-rose-600 hover:bg-rose-500'
                              : 'bg-brand-purple hover:bg-brand-purple-hover'
                          }`}
                        >
                          {isImporting ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              <span>Aplicando cambios...</span>
                            </>
                          ) : importMode === 'replace' ? (
                            <>
                              <RefreshCw className="w-4 h-4" />
                              <span>Confirmar y reemplazar todo</span>
                            </>
                          ) : (
                            <>
                              <PlusCircle className="w-4 h-4" />
                              <span>Confirmar y combinar juegos</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
