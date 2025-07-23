"use client";

import React, { ReactNode } from "react";

type ModalProps = {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
};

/**
 * PUBLIC_INTERFACE
 * Shows a centered overlay modal.
 */
export default function Modal({ open, onClose, children }: ModalProps) {
  if (!open) return null;
  return (
    <div
      className="fixed z-40 inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center px-3"
      aria-modal="true"
      tabIndex={-1}
      onClick={onClose}
    >
      <div
        className="relative max-w-[96vw] w-full sm:w-[380px] bg-white rounded-lg shadow-lg p-6 border border-[#e0e0e0]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          aria-label="Close dialog"
          className="absolute top-2 right-2 p-1 rounded hover:bg-[#d3d6da] text-lg text-[#3a3a3c]"
          onClick={onClose}
        >
          &#10005;
        </button>
        {children}
      </div>
    </div>
  );
}
