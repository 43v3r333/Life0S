import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function MarkdownMessage({ content, inverted = false }: { content: string; inverted?: boolean }) {
  const muted = inverted ? "text-stone-300" : "text-stone-600";
  return <ReactMarkdown
    remarkPlugins={[remarkGfm]}
    components={{
      h1: ({ children }) => <h1 className="text-lg font-bold mt-4 mb-2 first:mt-0">{children}</h1>,
      h2: ({ children }) => <h2 className="text-base font-bold mt-4 mb-2 first:mt-0">{children}</h2>,
      h3: ({ children }) => <h3 className="text-sm font-semibold mt-3 mb-1.5 first:mt-0">{children}</h3>,
      p: ({ children }) => <p className="leading-6 my-2 first:mt-0 last:mb-0">{children}</p>,
      ul: ({ children }) => <ul className="list-disc pl-5 my-2 space-y-1">{children}</ul>,
      ol: ({ children }) => <ol className="list-decimal pl-5 my-2 space-y-1">{children}</ol>,
      li: ({ children }) => <li className="pl-0.5 leading-5">{children}</li>,
      strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
      blockquote: ({ children }) => <blockquote className={`border-l-4 pl-3 my-3 italic ${inverted ? "border-stone-500" : "border-emerald-400"} ${muted}`}>{children}</blockquote>,
      a: ({ href, children }) => <a href={href} target="_blank" rel="noreferrer" className={`underline underline-offset-2 ${inverted ? "text-emerald-300" : "text-emerald-700"}`}>{children}</a>,
      code: ({ className, children }) => className
        ? <code className="block overflow-x-auto rounded-lg bg-stone-950 text-stone-100 p-3 my-3 text-xs whitespace-pre font-mono">{children}</code>
        : <code className={`rounded px-1 py-0.5 text-[0.9em] font-mono ${inverted ? "bg-stone-700" : "bg-stone-200"}`}>{children}</code>,
      table: ({ children }) => <div className="overflow-x-auto my-3"><table className="w-full border-collapse text-xs">{children}</table></div>,
      th: ({ children }) => <th className={`border p-2 text-left font-semibold ${inverted ? "border-stone-600 bg-stone-800" : "border-stone-300 bg-stone-100"}`}>{children}</th>,
      td: ({ children }) => <td className={`border p-2 align-top ${inverted ? "border-stone-600" : "border-stone-300"}`}>{children}</td>,
      hr: () => <hr className={`my-4 ${inverted ? "border-stone-600" : "border-stone-300"}`} />,
    }}
  >{content}</ReactMarkdown>;
}
