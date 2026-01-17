"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import Placeholder from "@tiptap/extension-placeholder";
import Image from "@tiptap/extension-image";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import { useEffect, useCallback } from "react";
import {
    FiBold,
    FiItalic,
    FiUnderline,
    FiLink,
    FiImage,
    FiPlus,
    FiRotateCcw,
    FiRotateCw,
    FiMoreVertical,
} from "react-icons/fi";
import {
    RiText,
    RiFontColor,
    RiLinkUnlink,
    RiImageAddLine,
    RiListUnordered,
} from "react-icons/ri";

interface RichTextEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

interface ToolbarButtonProps {
    onClick: () => void;
    isActive?: boolean;
    children: React.ReactNode;
    title: string;
}

function ToolbarButton({ onClick, isActive, children, title }: ToolbarButtonProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            title={title}
            className={`p-2 rounded hover:bg-gray-100 transition-colors ${isActive ? "bg-gray-100 text-teal-600" : "text-gray-500"
                }`}
        >
            {children}
        </button>
    );
}

function ToolbarDivider() {
    return <div className="w-px h-5 bg-gray-200 mx-1" />;
}

export default function RichTextEditor({
    value,
    onChange,
    placeholder = "Your content goes here!",
}: RichTextEditorProps) {
    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: {
                    levels: [1, 2, 3],
                },
            }),
            Underline,
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: "text-teal-600 underline cursor-pointer",
                },
            }),
            TextAlign.configure({
                types: ["heading", "paragraph"],
            }),
            Placeholder.configure({
                placeholder,
            }),
            Image.configure({
                HTMLAttributes: {
                    class: "max-w-full h-auto rounded-lg",
                },
            }),
            TextStyle,
            Color,
        ],
        content: value,
        editorProps: {
            attributes: {
                class:
                    "prose prose-sm max-w-none focus:outline-none min-h-[180px] px-4 py-3 text-gray-700",
            },
        },
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
        immediatelyRender: false,
    });

    // Sync external value changes
    useEffect(() => {
        if (editor && value !== editor.getHTML()) {
            editor.commands.setContent(value);
        }
    }, [value, editor]);

    const setLink = useCallback(() => {
        if (!editor) return;

        const previousUrl = editor.getAttributes("link").href;
        const url = window.prompt("Enter URL:", previousUrl);

        if (url === null) return;

        if (url === "") {
            editor.chain().focus().extendMarkRange("link").unsetLink().run();
            return;
        }

        editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
    }, [editor]);

    const addImage = useCallback(() => {
        if (!editor) return;

        const url = window.prompt("Enter image URL:");

        if (url) {
            editor.chain().focus().setImage({ src: url }).run();
        }
    }, [editor]);

    if (!editor) {
        return (
            <div className="h-64 bg-gray-50 rounded-lg animate-pulse border border-gray-200" />
        );
    }

    return (
        <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
            {/* Toolbar */}
            <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200 bg-white">
                <div className="flex items-center gap-0.5">
                    {/* Text Style */}
                    <ToolbarButton
                        onClick={() => editor.chain().focus().setParagraph().run()}
                        isActive={!editor.isActive("heading")}
                        title="Text Style"
                    >
                        <RiText size={18} />
                    </ToolbarButton>

                    {/* Font Color */}
                    <ToolbarButton
                        onClick={() => { }}
                        isActive={false}
                        title="Font Color"
                    >
                        <RiFontColor size={18} />
                    </ToolbarButton>

                    {/* Link */}
                    <ToolbarButton
                        onClick={setLink}
                        isActive={editor.isActive("link")}
                        title="Add Link"
                    >
                        <FiLink size={18} />
                    </ToolbarButton>

                    {/* Unlink */}
                    <ToolbarButton
                        onClick={() => editor.chain().focus().unsetLink().run()}
                        isActive={false}
                        title="Remove Link"
                    >
                        <RiLinkUnlink size={18} />
                    </ToolbarButton>

                    {/* Image */}
                    <ToolbarButton
                        onClick={addImage}
                        isActive={false}
                        title="Add Image"
                    >
                        <RiImageAddLine size={18} />
                    </ToolbarButton>

                    {/* List */}
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleBulletList().run()}
                        isActive={editor.isActive("bulletList")}
                        title="Bullet List"
                    >
                        <RiListUnordered size={18} />
                    </ToolbarButton>

                    <ToolbarDivider />

                    {/* Bold */}
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleBold().run()}
                        isActive={editor.isActive("bold")}
                        title="Bold"
                    >
                        <FiBold size={18} />
                    </ToolbarButton>

                    {/* Underline */}
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleUnderline().run()}
                        isActive={editor.isActive("underline")}
                        title="Underline"
                    >
                        <FiUnderline size={18} />
                    </ToolbarButton>

                    {/* Italic */}
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleItalic().run()}
                        isActive={editor.isActive("italic")}
                        title="Italic"
                    >
                        <FiItalic size={18} />
                    </ToolbarButton>

                    {/* Add More */}
                    <ToolbarButton
                        onClick={() => { }}
                        isActive={false}
                        title="Add More"
                    >
                        <FiPlus size={18} />
                    </ToolbarButton>
                </div>

                <div className="flex items-center gap-0.5">
                    {/* Undo */}
                    <ToolbarButton
                        onClick={() => editor.chain().focus().undo().run()}
                        isActive={false}
                        title="Undo"
                    >
                        <FiRotateCcw size={16} />
                    </ToolbarButton>

                    {/* Redo */}
                    <ToolbarButton
                        onClick={() => editor.chain().focus().redo().run()}
                        isActive={false}
                        title="Redo"
                    >
                        <FiRotateCw size={16} />
                    </ToolbarButton>

                    {/* More Options */}
                    <ToolbarButton
                        onClick={() => { }}
                        isActive={false}
                        title="More Options"
                    >
                        <FiMoreVertical size={16} />
                    </ToolbarButton>
                </div>
            </div>

            {/* Editor Content */}
            <EditorContent editor={editor} className="min-h-45" />

            {/* Styles for placeholder and editor */}
            <style jsx global>{`
        .ProseMirror p.is-editor-empty:first-child::before {
          color: #9ca3af;
          content: attr(data-placeholder);
          float: left;
          height: 0;
          pointer-events: none;
        }
        
        .ProseMirror {
          min-height: 180px;
          padding: 12px 16px;
        }
        
        .ProseMirror:focus {
          outline: none;
        }
        
        .ProseMirror h1 {
          font-size: 1.5rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
        }
        
        .ProseMirror h2 {
          font-size: 1.25rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
        }
        
        .ProseMirror h3 {
          font-size: 1.125rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
        }
        
        .ProseMirror ul {
          list-style-type: disc;
          padding-left: 1.5rem;
        }
        
        .ProseMirror ol {
          list-style-type: decimal;
          padding-left: 1.5rem;
        }
        
        .ProseMirror a {
          color: #14b8a6;
          text-decoration: underline;
        }
        
        .ProseMirror p {
          margin: 0;
          line-height: 1.6;
        }
      `}</style>
        </div>
    );
}
