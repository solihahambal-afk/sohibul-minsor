import React, { useState } from 'react';
import { 
  Bold, Italic, Underline, List, ListOrdered, Link as LinkIcon, 
  Image as ImageIcon, AlignLeft, AlignCenter, AlignRight, 
  Heading1, Heading2, Quote, Undo, Redo, Table
} from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  // In a real app, we would use a library like react-quill or TipTap
  // For this demo, we'll create a UI that looks like a rich text editor
  // but uses a standard textarea for simplicity and stability

  const handleAction = (action: string) => {
    // Simulate action
    console.log(`Rich text action triggered: ${action}`);
  };

  const ToolbarButton = ({ icon: Icon, action, title }: any) => (
    <button
      type="button"
      onClick={() => handleAction(action)}
      title={title}
      className="p-2 text-gray-500 hover:text-primary-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-700 rounded transition-colors"
    >
      <Icon size={16} />
    </button>
  );

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden bg-white dark:bg-gray-800">
      <div className="flex flex-wrap items-center gap-1 p-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
        <div className="flex items-center space-x-1 pr-2 border-r border-gray-200 dark:border-gray-700">
          <ToolbarButton icon={Undo} action="undo" title="Undo" />
          <ToolbarButton icon={Redo} action="redo" title="Redo" />
        </div>
        
        <div className="flex items-center space-x-1 px-2 border-r border-gray-200 dark:border-gray-700">
          <ToolbarButton icon={Heading1} action="h1" title="Heading 1" />
          <ToolbarButton icon={Heading2} action="h2" title="Heading 2" />
        </div>

        <div className="flex items-center space-x-1 px-2 border-r border-gray-200 dark:border-gray-700">
          <ToolbarButton icon={Bold} action="bold" title="Bold" />
          <ToolbarButton icon={Italic} action="italic" title="Italic" />
          <ToolbarButton icon={Underline} action="underline" title="Underline" />
        </div>

        <div className="flex items-center space-x-1 px-2 border-r border-gray-200 dark:border-gray-700">
          <ToolbarButton icon={AlignLeft} action="align-left" title="Align Left" />
          <ToolbarButton icon={AlignCenter} action="align-center" title="Align Center" />
          <ToolbarButton icon={AlignRight} action="align-right" title="Align Right" />
        </div>

        <div className="flex items-center space-x-1 px-2 border-r border-gray-200 dark:border-gray-700">
          <ToolbarButton icon={List} action="list-ul" title="Bullet List" />
          <ToolbarButton icon={ListOrdered} action="list-ol" title="Numbered List" />
          <ToolbarButton icon={Quote} action="quote" title="Blockquote" />
        </div>

        <div className="flex items-center space-x-1 px-2">
          <ToolbarButton icon={LinkIcon} action="link" title="Insert Link" />
          <ToolbarButton icon={ImageIcon} action="image" title="Insert Image" />
          <ToolbarButton icon={Table} action="table" title="Insert Table" />
        </div>
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || 'Write your article content here...'}
        className="w-full min-h-[300px] p-4 bg-transparent border-none focus:ring-0 resize-y text-primary-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
      />
      <div className="p-2 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 text-xs text-gray-500 dark:text-gray-400 flex justify-between">
        <span>Rich Text Editor </span>
        <span>{value.length} characters</span>
      </div>
    </div>
  );
}
