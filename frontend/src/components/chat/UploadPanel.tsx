import { useState, useEffect, useRef } from "react";
import { documentAPI } from "../../services/api";
import { Document } from "../../types";
import { FileUp, FileText, Trash2, CheckCircle2, CloudLightning, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function UploadPanel() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [vectorCount, setVectorCount] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchDocs = async () => {
    try {
      const [docs, vectorStatus] = await Promise.all([
        documentAPI.getDocuments(),
        documentAPI.getVectorstoreStatus()
      ]);
      setDocuments(docs);
      setVectorCount(vectorStatus.vector_count || 0);
    } catch (err) {
      console.error("Failed to load documents catalog:", err);
    }
  };

  useEffect(() => {
    fetchDocs();

    const handleRemoteUpload = () => {
      fetchDocs();
    };

    window.addEventListener("rag-document-uploaded", handleRemoteUpload);
    return () => {
      window.removeEventListener("rag-document-uploaded", handleRemoteUpload);
    };
  }, []);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const processUpload = async (file: File) => {
    // Validate file type
    const validExtensions = [".pdf", ".docx", ".txt"];
    const ext = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
    if (!validExtensions.includes(ext)) {
      setError("Unsupported file format. Please upload .pdf, .docx, or .txt files.");
      return;
    }

    setIsUploading(true);
    setProgress(0);
    setError(null);

    try {
      await documentAPI.upload(file, (percent) => {
        setProgress(percent);
      });
      // Ingested successfully, refresh catalog
      await fetchDocs();
    } catch (err: any) {
      console.error(err);
      const detail = err.response?.data?.detail || err.message;
      setError(detail || "Inference/Splitting ingestion failed. Ensure local servers are online.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await processUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      await processUpload(e.target.files[0]);
    }
  };

  const handleDelete = async (docId: string) => {
    try {
      await documentAPI.deleteDocument(docId);
      setDocuments((prev) => prev.filter((d) => d.id !== docId));
      await fetchDocs();
    } catch (err) {
      console.error("Failed to delete document:", err);
      setError("Failed to delete document from ChromaDB vectorstore.");
    }
  };

  return (
    <div className="w-80 h-full glass-panel border-l border-white/5 flex flex-col pt-6 pb-6 px-4">
      {/* Header */}
      <div className="flex items-center gap-2 px-1 mb-4">
        <CloudLightning className="w-5 h-5 text-cyan-400" />
        <h2 className="text-base font-semibold text-white tracking-wide">Knowledge Retrieval (RAG)</h2>
      </div>

      <p className="text-xs text-slate-400 px-1 mb-6 leading-relaxed">
        Upload documents to inject them directly into your local vector database. The AI will contextually reference them.
      </p>

      {/* Drag & Drop Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative cursor-pointer py-8 px-4 border-2 border-dashed rounded-2xl flex flex-col items-center text-center justify-center transition-all duration-300 ${
          isDragging
            ? "border-cyan-400 bg-cyan-500/5 shadow-[0_0_15px_rgba(6,182,212,0.15)]"
            : isUploading
            ? "border-blue-500/30 bg-blue-500/0 pointer-events-none"
            : "border-white/10 hover:border-cyan-500/30 hover:bg-white/5"
        }`}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          accept=".pdf,.docx,.txt"
          className="hidden"
        />

        {isUploading ? (
          <div className="flex flex-col items-center space-y-3">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            <div className="w-full max-w-[120px] bg-white/10 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-blue-500 to-cyan-400 h-full rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-xs text-slate-300 font-semibold">{progress}% splitting...</span>
          </div>
        ) : (
          <>
            <FileUp className="w-8 h-8 text-slate-400 group-hover:text-cyan-400 mb-2 transition-transform duration-200 hover:scale-105" />
            <span className="text-xs font-semibold text-slate-200">Drag & Drop Files here</span>
            <span className="text-[10px] text-slate-500 mt-1 uppercase font-bold tracking-wider">PDF, DOCX, TXT</span>
          </>
        )}
      </div>

      {/* Ingestion Error Alert */}
      {error && (
        <div className="mt-3 px-3 py-2 bg-red-950/40 border border-red-500/20 text-[10px] text-red-300 rounded-xl leading-snug">
          {error}
        </div>
      )}

      {/* Documents Catalog Header */}
      <div className="flex items-center justify-between px-1 mt-8 mb-3">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Active Database Ingestion</span>
        <span className="text-[10px] text-slate-500 bg-white/5 px-2 py-0.5 rounded-full border border-white/5 font-semibold">
          {documents.length} Items · {vectorCount} Vectors
        </span>
      </div>

      {/* Catalog List */}
      <div className="flex-1 overflow-y-auto pr-1 space-y-2">
        {documents.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-center text-slate-500">
            <FileText className="w-8 h-8 mb-2 opacity-25" />
            <span className="text-xs font-medium">Vector index is empty</span>
            <span className="text-[10px] opacity-75 mt-0.5">Upload a document to split into vectors</span>
          </div>
        ) : (
          <ul className="space-y-2">
            <AnimatePresence initial={false}>
              {documents.map((doc) => (
                <motion.li
                  key={doc.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="group relative flex items-center justify-between p-3.5 glass rounded-xl border border-white/5 hover:border-white/10 hover:bg-white/5 transition-all duration-300"
                >
                  <div className="flex items-center gap-2.5 min-w-0 pr-6">
                    <FileText className="w-4.5 h-4.5 text-cyan-400 shrink-0" />
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-semibold text-white truncate">
                        {doc.filename}
                      </span>
                      <span className="text-[9px] text-cyan-500 font-bold flex items-center gap-1 mt-0.5">
                        <CheckCircle2 className="w-2.5 h-2.5" />
                        {doc.chunk_count} Chunks Ingested
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDelete(doc.id)}
                    title="Remove Vector Index"
                    className="p-1.5 rounded-lg bg-red-500/0 hover:bg-red-500/15 text-slate-400 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all duration-200"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        )}
      </div>
    </div>
  );
}
