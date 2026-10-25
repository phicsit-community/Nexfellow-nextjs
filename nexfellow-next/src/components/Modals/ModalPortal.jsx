"use client";

import { createPortal } from "react-dom";

/**
 * Renders modal markup directly under document.body.
 *
 * Modals rendered inline inside the feed end up inside the sticky
 * `.feedColumn`, which creates its own stacking context. A fixed overlay
 * with z-index 1000 is then confined to that context, so the fixed sidebar
 * (z-index 30) and the sticky suggestions column paint over it and only the
 * feed column appears dimmed. Portalling to body lets the overlay cover the
 * whole viewport and centre the dialog in it.
 */
const ModalPortal = ({ children }) => {
  if (typeof document === "undefined") return null;
  return createPortal(children, document.body);
};

export default ModalPortal;
