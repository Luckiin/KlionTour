"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, FileText, Download, RefreshCw, X, Info } from "lucide-react";
import { toast } from "sonner";
import DropZone from "./DropZone";
import { cn } from "@/lib/utils";

export default function AnexoFinanceiro({ lancamentoId }) {
  const [documentos, setDocumentos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  async function loadDocs() {
    if (!lancamentoId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/financeiro/lancamentos/${lancamentoId}/documentos`);
      if (res.ok) setDocumentos(await res.json());
    } catch (err) {
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadDocs(); }, [lancamentoId]);

  async function onFilesDropped(files) {
    if (!files || files.length === 0 || !lancamentoId) return;
    
    setUploading(true);
    // Nota: A lógica de upload real (S3/Supabase Storage) seria implementada aqui se solicitado.
    // Por enquanto, seguimos o contrato visual do prevgestao.
    toast.info("Upload de arquivos em breve...");
    setUploading(false);
  }

  async function excluirDoc(id) {
    if (!confirm("Excluir este anexo?")) return;
    try {
      const res = await fetch(`/api/admin/financeiro/documentos/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Anexo excluído.");
        loadDocs();
      }
    } catch (err) {
      toast.error("Erro ao excluir.");
    }
  }

  if (!lancamentoId) {
    return (
      <div className="p-12 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 rounded-3xl bg-brand-500/5 flex items-center justify-center text-brand-500/30 mb-4 border border-brand-500/10 border-dashed">
          <Info size={32} />
        </div>
        <h4 className="font-serif text-lg text-brand-900 dark:text-white mb-2">Aguardando Lançamento</h4>
        <p className="text-xs text-steel-500 max-w-[200px] leading-relaxed">Salve os dados principais primeiro para poder gerenciar anexos.</p>
      </div>
    );
  }

  return (
    <DropZone onFilesDropped={onFilesDropped} disabled={uploading}>
      <div className="space-y-6 min-h-[300px] flex flex-col pt-2">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-[10px] font-black text-brand-900 dark:text-white uppercase tracking-[0.2em]">Documentos e Notas</h3>
            <p className="text-[10px] text-steel-500 uppercase tracking-widest font-bold mt-1">Total: {documentos.length} arquivos</p>
          </div>
          <label className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-500 text-white text-[10px] font-black uppercase tracking-widest cursor-pointer hover:bg-brand-600 shadow-lg shadow-brand-500/20 transition-all">
            {uploading ? <RefreshCw size={14} className="animate-spin" /> : <Plus size={14} />}
            {uploading ? "Enviando..." : "Anexar Novo"}
            <input type="file" className="hidden" multiple onChange={(e) => onFilesDropped(Array.from(e.target.files))} disabled={uploading} />
          </label>
        </div>

        <div className="grid grid-cols-1 gap-3 flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center py-12">
              <RefreshCw size={24} className="animate-spin text-brand-500" />
            </div>
          ) : documentos.length === 0 ? (
            <div className="border-2 border-dashed border-surface-border dark:border-surface-dark-border rounded-[2rem] py-16 flex flex-col items-center justify-center text-steel-400 group hover:border-brand-500/30 transition-all">
              <div className="w-16 h-16 rounded-2xl bg-surface-subtle dark:bg-surface-dark-subtle flex items-center justify-center mb-4 text-steel-300">
                <FileText size={32} />
              </div>
              <p className="text-[10px] font-bold uppercase tracking-widest">Arraste comprovantes ou clique em anexar</p>
            </div>
          ) : (
            documentos.map(doc => (
              <div key={doc.id} className="flex items-center gap-4 p-4 rounded-3xl bg-surface-subtle/50 dark:bg-surface-dark-subtle/20 border border-surface-border dark:border-surface-dark-border group hover:bg-white dark:hover:bg-surface-dark transition-all">
                <div className="w-10 h-10 rounded-2xl bg-brand-500/10 flex items-center justify-center text-brand-500">
                  <FileText size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-brand-900 dark:text-white truncate">{doc.nome}</p>
                  <p className="text-[10px] text-steel-500 uppercase font-bold tracking-widest">{(doc.tamanho / 1024).toFixed(0)} KB • {new Date(doc.criado_em).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-2 rounded-lg text-steel-400 hover:text-brand-500 hover:bg-brand-500/10 transition-all">
                    <Download size={16} />
                  </button>
                  <button onClick={() => excluirDoc(doc.id)} className="p-2 rounded-lg text-steel-400 hover:text-red-500 hover:bg-red-500/10 transition-all">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </DropZone>
  );
}
