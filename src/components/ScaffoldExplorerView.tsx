import React, { useState } from "react";
import { FolderOpen, FileCode, Copy, Check, Terminal } from "lucide-react";

export interface ScaffoldFileLocal {
  name: string;
  path: string;
  type: "file" | "folder";
  children?: ScaffoldFileLocal[];
  description?: string;
}

interface ScaffoldExplorerProps {
  scaffoldTree: ScaffoldFileLocal[];
  selectedFile: ScaffoldFileLocal | null;
  onSelectFile: (f: ScaffoldFileLocal) => void;
  fileContent: string;
  loadingFile: boolean;
  copied: boolean;
  onCopyCode: () => void;
}

export default function ScaffoldExplorerView({
  scaffoldTree,
  selectedFile,
  onSelectFile,
  fileContent,
  loadingFile,
  copied,
  onCopyCode
}: ScaffoldExplorerProps) {
  
  const renderFileNode = (node: ScaffoldFileLocal, depth = 0) => {
    const isFolder = node.type === "folder";
    const isSelected = selectedFile?.path === node.path;

    return (
      <div key={node.path} style={{ paddingLeft: `${depth * 10}px` }} className="py-0.5">
        {isFolder ? (
          <div className="flex items-center space-x-1.5 py-1 text-stone-400 text-[11px] font-mono select-none">
            <span className="text-stone-500 font-bold">📂</span>
            <span className="font-semibold text-stone-700">{node.name}</span>
          </div>
        ) : (
          <button
            onClick={() => onSelectFile(node)}
            className={`w-full text-left flex items-center justify-between p-1.5 rounded-lg transition duration-150 text-[11px] font-mono group ${
              isSelected
                ? "bg-stone-900 text-[#fafaf9]"
                : "text-stone-600 hover:bg-stone-100 hover:text-stone-900"
            }`}
          >
            <div className="flex items-center space-x-2">
              <span className={isSelected ? "text-emerald-400 font-bold" : "text-stone-400"}>📄</span>
              <span className="truncate max-w-[130px]">{node.name}</span>
            </div>
            {node.description && (
              <span className="text-[9px] text-stone-400 opacity-0 group-hover:opacity-100 transition truncate max-w-[110px] pl-1 font-sans">
                {node.description}
              </span>
            )}
          </button>
        )}
        {node.children && node.children.map((child) => renderFileNode(child, depth + 1))}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden grid grid-cols-1 md:grid-cols-4 min-h-[580px] max-w-7xl mx-auto">
      
      {/* File Tree Left Section */}
      <div className="p-4 border-r border-stone-200 bg-stone-50 md:col-span-1 flex flex-col justify-between overflow-y-auto max-h-[580px]">
        <div>
          <h3 className="text-[9px] font-bold text-stone-400 tracking-widest font-mono uppercase mb-4 flex items-center space-x-1.5">
            <FolderOpen className="h-4 w-4" />
            <span>SCAFFOLD FILESYSTEM</span>
          </h3>
          <div className="space-y-1">
            {scaffoldTree.map((node) => renderFileNode(node))}
          </div>
        </div>
        
        <div className="mt-6 pt-4 border-t border-stone-200 text-[10px] text-stone-400 font-mono">
          💡 <span className="italic">Explore the pure, domain-driven aggregate files of Project Jannah inside the virtual workspace.</span>
        </div>
      </div>

      {/* File Viewer Content Right Section */}
      <div className="md:col-span-3 flex flex-col justify-between bg-stone-950 text-stone-100 relative max-h-[580px]">
        
        {/* Header Details of selected file */}
        <div className="border-b border-stone-850 bg-stone-900/60 px-5 py-3.5 flex items-center justify-between shrink-0">
          <div>
            <h3 className="text-xs font-mono font-semibold text-stone-100 flex items-center space-x-2">
              <span className="text-emerald-400 font-bold">📄</span>
              <span>scaffold/{selectedFile?.path || "No file selected"}</span>
            </h3>
            <p className="text-[10px] text-stone-400 mt-0.5 italic font-sans">
              {selectedFile?.description || "Source file inside Project Jannah foundation blueprint"}
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={onCopyCode}
              disabled={loadingFile || !fileContent}
              className="flex items-center space-x-1 px-2.5 py-1.5 rounded bg-stone-850 hover:bg-stone-800 transition text-[10px] font-medium disabled:opacity-50 text-stone-300 font-mono"
            >
              {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
              <span>{copied ? "COPIED" : "COPY"}</span>
            </button>
          </div>
        </div>

        {/* Code Panel Container */}
        <div className="flex-1 p-5 font-mono text-xs overflow-y-auto select-text">
          {loadingFile ? (
            <div className="flex flex-col items-center justify-center h-full space-y-3 py-24">
              <div className="w-5 h-5 border-2 border-stone-400 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-stone-400 text-[10px]">Syncing workspace file content...</span>
            </div>
          ) : (
            <pre className="whitespace-pre-wrap leading-relaxed text-stone-300 break-all select-text font-mono">
              {fileContent || "// No files have been loaded or loaded contents are empty."}
            </pre>
          )}
        </div>

        {/* Bottom design banner */}
        <div className="bg-stone-900 px-5 py-2.5 text-[9px] font-mono text-stone-500 border-t border-stone-850 flex items-center justify-between shrink-0">
          <span>ENCODING: UTF-8</span>
          <span className="flex items-center space-x-1 text-[8px] uppercase tracking-wider font-bold">
            <Terminal className="h-3 w-3 text-emerald-400" />
            <span>CLEAN ARCHITECTURE CORE</span>
          </span>
        </div>

      </div>

    </div>
  );
}
