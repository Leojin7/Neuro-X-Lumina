import React from 'react';
import Editor from '@monaco-editor/react';
import type { Language } from '../types';
import { Loader2 } from 'lucide-react';
interface CodeEditorProps {
    language: Language;
    code: string;
    onChange: (value: string | undefined) => void;
    readOnly?: boolean;
}
const CodeEditor: React.FC<CodeEditorProps> = ({ language, code, onChange, readOnly = false }) => {
    return (
        <Editor
            height="100%"
            language={language}
            value={code}
            onChange={onChange}
            theme={'vs-dark'}
            options={{
                fontSize: 14,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                wordWrap: 'on',
                readOnly,
                contextmenu: true,
                scrollbar: {
                    verticalScrollbarSize: 10,
                    horizontalScrollbarSize: 10,
                },
                automaticLayout: true,
                fontFamily: "Menlo, Monaco, 'Courier New', monospace",
                lineHeight: 24,
                padding: { top: 16, bottom: 16 }
            }}
            loading={<div className="flex h-full w-full items-center justify-center bg-background"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}
        />
    );
};
export default CodeEditor;