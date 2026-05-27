import { useState } from "react";
import { Message } from "../../types";
import { Bot, User, Copy, Check, ChevronDown, ChevronUp, FileText, Sparkles } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

interface MessageBubbleProps {
  message: Message;
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const isAssistant = message.role === "assistant";
  const [copied, setCopied] = useState(false);
  const [sourcesOpen, setSourcesOpen] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`flex items-start gap-4 ${isAssistant ? "justify-start" : "justify-end"}`}>
      
      {/* Bot Avatar column */}
      {isAssistant && (
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-500 to-cyan-400 p-[1px] shadow-md shadow-blue-500/5 shrink-0 flex items-center justify-center">
          <div className="w-full h-full bg-[#080B14] rounded-[11px] flex items-center justify-center">
            <Bot className="w-4 h-4 text-cyan-400 animate-pulse" />
          </div>
        </div>
      )}

      {/* Bubble Content container */}
      <div className="flex flex-col max-w-[92%] space-y-1.5 min-w-0">
        
        {isAssistant ? (
          /* Assistant Response: Glassmorphic bubble with markdown rendering */
          <div className="glass rounded-2xl rounded-tl-none px-5 py-4 text-sm leading-relaxed break-words">
            <div className="prose prose-invert max-w-none text-slate-100 break-words">
              <ReactMarkdown
                components={{
                  code({ node, className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || "");
                    return match ? (
                      <div className="my-3 rounded-xl overflow-x-auto max-w-full border border-white/5 bg-black/40">
                        <div className="flex items-center justify-between px-4 py-2 bg-black/60 border-b border-white/5 text-[10px] text-slate-400 font-mono">
                          <span>{match[1].toUpperCase()}</span>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(String(children).replace(/\n$/, ""));
                            }}
                            className="flex items-center gap-1 hover:text-white transition-colors"
                          >
                            <Copy className="w-3 h-3" />
                            Copy
                          </button>
                        </div>
                        <SyntaxHighlighter
                          style={vscDarkPlus as any}
                          language={match[1]}
                          PreTag="div"
                          customStyle={{ margin: 0, padding: "16px", background: "transparent", overflowX: "auto" }}
                        >
                          {String(children).replace(/\n$/, "")}
                        </SyntaxHighlighter>
                      </div>
                    ) : (
                      <code className="bg-white/10 px-1.5 py-0.5 rounded text-cyan-400 font-mono break-words" {...props}>
                        {children}
                      </code>
                    );
                  }
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>

            {/* Copy button below the assistant message */}
            {message.content && (
              <div className="flex items-center gap-2 mt-3 pt-2 border-t border-white/5">
                <button
                  type="button"
                  onClick={handleCopy}
                  title="Copy response"
                  className="text-slate-500 hover:text-cyan-400 transition-all duration-200 focus:outline-none"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
                <span className="text-[10px] text-slate-600 font-medium">
                  {copied ? "Copied!" : "Copy"}
                </span>
              </div>
            )}
          </div>
        ) : (
          /* User Message: Glassmorphic rounded bubble on the right */
          <div className="rounded-2xl rounded-tr-none px-5 py-3 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/15 text-slate-100 text-sm leading-relaxed break-words shadow-sm">
            <p className="whitespace-pre-wrap break-words">{message.content}</p>
          </div>
        )}

        {/* Collapsible RAG Sources Badge */}
        {isAssistant && message.used_rag && message.sources && message.sources.length > 0 && (
          <div className="flex flex-col mt-2">
            <button
              onClick={() => setSourcesOpen(!sourcesOpen)}
              className="self-start flex items-center gap-1.5 px-3 py-1 bg-cyan-950/20 border border-cyan-500/10 hover:bg-cyan-950/40 text-[10px] font-bold text-cyan-400 rounded-full transition-all duration-200 focus:outline-none"
            >
              <Sparkles className="w-3 h-3" />
              RAG Knowledge Context ({message.sources.length} sources referenced)
              {sourcesOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>

            {/* Injected Context Sources list */}
            {sourcesOpen && (
              <div className="mt-2 p-3 bg-cyan-950/10 border border-cyan-500/5 rounded-xl space-y-2.5 max-w-xl">
                {message.sources.map((src, idx) => (
                  <div key={idx} className="flex flex-col text-xs text-slate-350 leading-relaxed border-b border-cyan-950/30 pb-2 last:border-b-0 last:pb-0">
                    <div className="flex items-center justify-between font-semibold text-cyan-400 mb-1">
                      <div className="flex items-center gap-1">
                        <FileText className="w-3.5 h-3.5" />
                        <span>{src.filename}</span>
                      </div>
                      <span className="text-[10px] bg-cyan-500/10 px-2 py-0.5 rounded-full">
                        Similarity Score: {(src.score * 100).toFixed(0)}%
                      </span>
                    </div>
                    <p className="bg-black/20 p-2 rounded-lg italic text-[11px] border border-cyan-950/10">
                      "{src.content.slice(0, 300)}..."
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* User Avatar */}
      {!isAssistant && (
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-500 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-blue-500/10 shrink-0">
          <User className="w-4.5 h-4.5" />
        </div>
      )}
    </div>
  );
}
