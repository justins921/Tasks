"use client";

import { ReactNode, useEffect } from "react";
import { XIcon } from "./Icons";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export default function Modal({ open, onClose, title, children }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 bg-black/45 backdrop-blur-[4px] z-[100] flex items-center justify-center p-4 animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-xl shadow-2xl p-7 w-full max-w-md max-h-[85vh] overflow-y-auto animate-slide-up">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-[17px] font-semibold">{title}</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-md bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-gray-100 transition"
          >
            <XIcon />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
