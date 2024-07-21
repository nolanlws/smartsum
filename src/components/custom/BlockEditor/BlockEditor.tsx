"use client";

import { EditorContent, PureEditorContent, useEditor } from "@tiptap/react";
import React, { useEffect, useRef } from "react";

import { LinkMenu } from "@/components/custom/menus";

// import "@/styles/index.css";

import ImageBlockMenu from "@/extensions/ImageBlock/components/ImageBlockMenu";
import { ColumnsMenu } from "@/extensions/MultiColumn/menus";
import { TableColumnMenu, TableRowMenu } from "@/extensions/Table/menus";
import { TextMenu } from "../menus/TextMenu";
import { ContentItemMenu } from "../menus/ContentItemMenu";
import ExtensionKit from "@/extensions/extension-kit";
import { Summary } from "@/app/(main)/(pages)/summaries/_components/summary";

type BlockEditorProps = {
  summary?: Summary;
};

export const BlockEditor = ({ summary }: BlockEditorProps) => {
  const menuContainerRef = useRef(null);
  const editorRef = useRef<PureEditorContent | null>(null);
  const editor = useEditor({
    autofocus: true,
    extensions: [...ExtensionKit({})],
    editorProps: {
      attributes: {
        autocomplete: "off",
        autocorrect: "off",
        autocapitalize: "off",
        class: "min-h-full",
      },
    },
  });

  useEffect(() => {
    if (editor && summary?.summary !== "") {
      editor.commands.setContent(summary.summary);
    }
  }, [summary]);

  if (!editor) {
    return null;
  }

  return (
    // <EditorContext.Provider value={providerValue}>
    <div className="flex h-full" ref={menuContainerRef}>
      <div className="relative flex h-full flex-1 flex-col ">
        <EditorContent
          editor={editor}
          ref={editorRef}
          className="h-full overflow-auto"
        />
        <LinkMenu editor={editor} appendTo={menuContainerRef} />
        <TextMenu editor={editor} />
        <ColumnsMenu editor={editor} appendTo={menuContainerRef} />
        <TableRowMenu editor={editor} appendTo={menuContainerRef} />
        <TableColumnMenu editor={editor} appendTo={menuContainerRef} />
        <ImageBlockMenu editor={editor} appendTo={menuContainerRef} />
      </div>
    </div>
    // </EditorContext.Provider>
  );
};

export default BlockEditor;
