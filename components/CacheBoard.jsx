"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { Type, Square, Image as ImageIcon, Download, Link2, Trash2, ChevronUp, ChevronDown, X } from "lucide-react";

// ---- constants ----
const BOARD_W = 1400;
const BOARD_H = 900;
const MOBILE_BREAKPOINT = 768;
const SWATCHES = [
  { name: "blush", hex: "#f3d6d9" },
  { name: "matcha", hex: "#c9d6ab" },
  { name: "wisteria", hex: "#cdc0e0" },
  { name: "butter", hex: "#f6e6a8" },
];

let idCounter = 1;
const newId = () => `el-${idCounter++}`;

function loadImage(src) {
  return new Promise((resolve) => {
    const img = new window.Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

export default function CacheBoard() {
  const [elements, setElements] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [canvasBg, setCanvasBg] = useState("#faf6ee");
  const [copyStatus, setCopyStatus] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const [scale, setScale] = useState(1);
  const boardRef = useRef(null);
  const boardWrapRef = useRef(null);
  const dragRef = useRef(null);
  const resizeRef = useRef(null);
  const fileInputRef = useRef(null);
  const zCounter = useRef(1);

  const selected = elements.find((e) => e.id === selectedId) || null;

  // ---- responsive: track viewport and compute a fit-to-width scale for the board ----
  useEffect(() => {
    const compute = () => {
      const vw = window.innerWidth;
      setIsMobile(vw < MOBILE_BREAKPOINT);
      const wrapEl = boardWrapRef.current;
      const available = wrapEl ? wrapEl.clientWidth : vw;
      const padding = vw < MOBILE_BREAKPOINT ? 16 : 64;
      const next = Math.min(1, (available - padding) / BOARD_W);
      setScale(next > 0 ? next : 1);
    };
    compute();
    window.addEventListener("resize", compute);
    return () => window.removeEventListener("resize", compute);
  }, []);

  // ---- load state from URL hash on mount (the "share link" mechanism) ----
  useEffect(() => {
    try {
      const hash = window.location.hash;
      if (hash && hash.startsWith("#patch=")) {
        const decoded = JSON.parse(decodeURIComponent(atob(hash.slice(7))));
        if (decoded?.elements) {
          setElements(decoded.elements);
          setCanvasBg(decoded.canvasBg || "#faf6ee");
          const maxZ = Math.max(1, ...decoded.elements.map((e) => e.zIndex || 1));
          zCounter.current = maxZ + 1;
          idCounter = decoded.elements.length + 1;
        }
      }
    } catch (e) {
      // ignore malformed hash
    }
  }, []);

  const addElement = useCallback((el) => {
    zCounter.current += 1;
    const full = { rotation: 0, opacity: 1, radius: 12, zIndex: zCounter.current, ...el };
    setElements((prev) => [...prev, full]);
    setSelectedId(full.id);
  }, []);

  const addText = () =>
    addElement({
      id: newId(),
      type: "text",
      x: BOARD_W / 2 - 110,
      y: BOARD_H / 2 - 50,
      w: 220,
      h: 100,
      text: "double-tap to edit",
      fontSize: 18,
      textColor: "#2b2620",
      bg: "transparent",
    });

  const addColorBlock = (hex) =>
    addElement({
      id: newId(),
      type: "color",
      x: BOARD_W / 2 - 100 + Math.random() * 40,
      y: BOARD_H / 2 - 80 + Math.random() * 40,
      w: 200,
      h: 160,
      bg: hex || "#c9d6ab",
    });

  const handleFiles = (files) => {
    Array.from(files).forEach((file, i) => {
      if (!file.type.startsWith("image/")) return;
      const reader = new FileReader();
      reader.onload = () => {
        const src = reader.result;
        const img = new window.Image();
        img.onload = () => {
          const targetW = 260;
          const targetH = (img.height / img.width) * targetW;
          addElement({
            id: newId(),
            type: "image",
            src,
            x: BOARD_W / 2 - 130 + i * 20,
            y: BOARD_H / 2 - targetH / 2 + i * 20,
            w: targetW,
            h: targetH,
            radius: 12,
          });
        };
        img.src = src;
      };
      reader.readAsDataURL(file);
    });
  };

  // ---- paste support: images and plain text land straight on the board ----
  useEffect(() => {
    const onPaste = (e) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      let handledImage = false;
      for (const item of items) {
        if (item.type.startsWith("image/")) {
          const file = item.getAsFile();
          if (file) {
            handleFiles([file]);
            handledImage = true;
          }
        }
      }
      if (!handledImage) {
        const text = e.clipboardData.getData("text/plain");
        if (text && text.trim()) {
          addElement({
            id: newId(),
            type: "text",
            x: BOARD_W / 2 - 110 + Math.random() * 40,
            y: BOARD_H / 2 - 50 + Math.random() * 40,
            w: 240,
            h: 110,
            text: text.trim().slice(0, 400),
            fontSize: 16,
            textColor: "#2b2620",
            bg: "#ffffff",
          });
        }
      }
    };
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateElement = (id, patch) =>
    setElements((prev) => prev.map((e) => (e.id === id ? { ...e, ...patch } : e)));

  const deleteElement = (id) => {
    setElements((prev) => prev.filter((e) => e.id !== id));
    setSelectedId(null);
  };

  const bringToFront = (id) => {
    zCounter.current += 1;
    updateElement(id, { zIndex: zCounter.current });
  };
  const sendToBack = (id) => updateElement(id, { zIndex: 0 });

  // ---- drag (pointer events cover touch + mouse; divide by scale so screen px map to board px) ----
  const onPointerDownElement = (e, el) => {
    e.stopPropagation();
    setSelectedId(el.id);
    dragRef.current = {
      id: el.id,
      startX: e.clientX,
      startY: e.clientY,
      origX: el.x,
      origY: el.y,
    };
    window.addEventListener("pointermove", onPointerMoveDrag);
    window.addEventListener("pointerup", onPointerUpDrag);
  };
  const onPointerMoveDrag = (e) => {
    const d = dragRef.current;
    if (!d) return;
    const dx = (e.clientX - d.startX) / scale;
    const dy = (e.clientY - d.startY) / scale;
    updateElement(d.id, { x: d.origX + dx, y: d.origY + dy });
  };
  const onPointerUpDrag = () => {
    dragRef.current = null;
    window.removeEventListener("pointermove", onPointerMoveDrag);
    window.removeEventListener("pointerup", onPointerUpDrag);
  };

  // ---- resize ----
  const onPointerDownResize = (e, el) => {
    e.stopPropagation();
    resizeRef.current = {
      id: el.id,
      startX: e.clientX,
      startY: e.clientY,
      origW: el.w,
      origH: el.h,
    };
    window.addEventListener("pointermove", onPointerMoveResize);
    window.addEventListener("pointerup", onPointerUpResize);
  };
  const onPointerMoveResize = (e) => {
    const r = resizeRef.current;
    if (!r) return;
    const dx = (e.clientX - r.startX) / scale;
    const dy = (e.clientY - r.startY) / scale;
    updateElement(r.id, {
      w: Math.max(40, r.origW + dx),
      h: Math.max(40, r.origH + dy),
    });
  };
  const onPointerUpResize = () => {
    resizeRef.current = null;
    window.removeEventListener("pointermove", onPointerMoveResize);
    window.removeEventListener("pointerup", onPointerUpResize);
  };

  // ---- export to PNG (always renders at full BOARD_W/BOARD_H regardless of on-screen scale) ----
  const handleExport = async () => {
    const canvas = document.createElement("canvas");
    canvas.width = BOARD_W;
    canvas.height = BOARD_H;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = canvasBg;
    ctx.fillRect(0, 0, BOARD_W, BOARD_H);

    const sorted = [...elements].sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));
    for (const el of sorted) {
      ctx.save();
      const cx = el.x + el.w / 2;
      const cy = el.y + el.h / 2;
      ctx.translate(cx, cy);
      ctx.rotate(((el.rotation || 0) * Math.PI) / 180);
      ctx.translate(-el.w / 2, -el.h / 2);
      ctx.globalAlpha = el.opacity ?? 1;

      if (el.type === "color") {
        ctx.fillStyle = el.bg;
        roundRectPath(ctx, 0, 0, el.w, el.h, el.radius || 0);
        ctx.fill();
      } else if (el.type === "image" && el.src) {
        const img = await loadImage(el.src);
        if (img) {
          ctx.save();
          roundRectPath(ctx, 0, 0, el.w, el.h, el.radius || 0);
          ctx.clip();
          ctx.drawImage(img, 0, 0, el.w, el.h);
          ctx.restore();
        }
      } else if (el.type === "text") {
        if (el.bg && el.bg !== "transparent") {
          ctx.fillStyle = el.bg;
          roundRectPath(ctx, 0, 0, el.w, el.h, el.radius || 0);
          ctx.fill();
        }
        ctx.fillStyle = el.textColor || "#2b2620";
        ctx.font = `${el.fontSize || 16}px ui-monospace, monospace`;
        ctx.textBaseline = "top";
        wrapText(ctx, el.text || "", 14, 14, el.w - 28, (el.fontSize || 16) * 1.35);
      }
      ctx.restore();
    }

    canvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "patch.png";
      a.click();
      URL.revokeObjectURL(url);
    });
  };

  // ---- share link (state packed into the URL hash — no backend needed for this starter) ----
  const handleShare = async () => {
    const payload = JSON.stringify({ elements, canvasBg });
    const encoded = btoa(encodeURIComponent(payload));
    const url = `${window.location.origin}${window.location.pathname}#patch=${encoded}`;
    window.location.hash = `patch=${encoded}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopyStatus("cached — link copied");
    } catch {
      setCopyStatus("couldn't cache — copy the address bar");
    }
    setTimeout(() => setCopyStatus(""), 2000);
  };

  const StitchSelection = ({ el }) => {
    const r = Math.min(el.radius || 0, el.w / 2, el.h / 2);
    return (
      <svg
        width={el.w + 12}
        height={el.h + 12}
        style={{ position: "absolute", left: -6, top: -6, pointerEvents: "none", overflow: "visible" }}
      >
        <rect
          x={1}
          y={1}
          width={el.w + 10}
          height={el.h + 10}
          rx={r + 6}
          fill="none"
          stroke="#2b2620"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeDasharray="1 9"
        />
      </svg>
    );
  };

  const StylePanelContent = () => (
    <>
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-wide text-[#2b2620]/60">{selected.type}</span>
        <div className="flex items-center gap-3">
          <button onClick={() => deleteElement(selected.id)} className="text-[#2b2620]/50 hover:text-red-600">
            <Trash2 size={16} />
          </button>
          {isMobile && (
            <button onClick={() => setSelectedId(null)} className="text-[#2b2620]/50">
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      {(selected.type === "color" || selected.type === "text") && (
        <label className="flex flex-col gap-1 text-xs text-[#2b2620]/70 mt-3">
          {selected.type === "color" ? "fill" : "background"}
          <input
            type="color"
            value={selected.bg === "transparent" ? "#ffffff" : selected.bg}
            onChange={(e) => updateElement(selected.id, { bg: e.target.value })}
            className="w-full h-8 rounded border border-[#2b2620]/30 cursor-pointer"
          />
        </label>
      )}

      {selected.type === "text" && (
        <>
          <label className="flex flex-col gap-1 text-xs text-[#2b2620]/70 mt-3">
            text color
            <input
              type="color"
              value={selected.textColor || "#2b2620"}
              onChange={(e) => updateElement(selected.id, { textColor: e.target.value })}
              className="w-full h-8 rounded border border-[#2b2620]/30 cursor-pointer"
            />
          </label>
          <label className="flex flex-col gap-1 text-xs text-[#2b2620]/70 mt-3">
            font size {selected.fontSize || 16}px
            <input
              type="range"
              min="10"
              max="48"
              value={selected.fontSize || 16}
              onChange={(e) => updateElement(selected.id, { fontSize: Number(e.target.value) })}
            />
          </label>
          <button
            onClick={() => updateElement(selected.id, { bg: selected.bg === "transparent" ? "#ffffff" : "transparent" })}
            className="text-xs px-2 py-1 rounded border border-[#2b2620]/30 hover:bg-[#f3d6d9] mt-2"
          >
            {selected.bg === "transparent" ? "add background" : "make transparent"}
          </button>
        </>
      )}

      <label className="flex flex-col gap-1 text-xs text-[#2b2620]/70 mt-3">
        corner radius {selected.radius ?? 0}px
        <input
          type="range"
          min="0"
          max="80"
          value={selected.radius ?? 0}
          onChange={(e) => updateElement(selected.id, { radius: Number(e.target.value) })}
        />
      </label>

      <label className="flex flex-col gap-1 text-xs text-[#2b2620]/70 mt-3">
        rotation {selected.rotation ?? 0}°
        <input
          type="range"
          min="-45"
          max="45"
          value={selected.rotation ?? 0}
          onChange={(e) => updateElement(selected.id, { rotation: Number(e.target.value) })}
        />
      </label>

      <label className="flex flex-col gap-1 text-xs text-[#2b2620]/70 mt-3">
        opacity {Math.round((selected.opacity ?? 1) * 100)}%
        <input
          type="range"
          min="10"
          max="100"
          value={Math.round((selected.opacity ?? 1) * 100)}
          onChange={(e) => updateElement(selected.id, { opacity: Number(e.target.value) / 100 })}
        />
      </label>

      <div className="flex gap-2 mt-3">
        <button onClick={() => bringToFront(selected.id)} className="flex-1 flex items-center justify-center gap-1 text-xs px-2 py-2 rounded border border-[#2b2620]/30 hover:bg-[#c9d6ab]">
          <ChevronUp size={14} /> front
        </button>
        <button onClick={() => sendToBack(selected.id)} className="flex-1 flex items-center justify-center gap-1 text-xs px-2 py-2 rounded border border-[#2b2620]/30 hover:bg-[#cdc0e0]">
          <ChevronDown size={14} /> back
        </button>
      </div>
    </>
  );

  return (
    <div
      style={{
        backgroundColor: "#efe9dd",
        backgroundImage:
          "radial-gradient(rgba(43,38,32,0.05) 1px, transparent 1px), radial-gradient(rgba(43,38,32,0.035) 1px, transparent 1px)",
        backgroundSize: "3px 3px, 7px 7px",
        backgroundPosition: "0 0, 3.5px 3.5px",
      }}
      className="w-full h-full min-h-screen flex flex-col"
    >
      {/* toolbar */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-dashed border-[#2b2620]/30 bg-[#faf6ee] flex-wrap sticky top-0 z-20">
        <span className="fg-brand text-base tracking-wide text-[#2b2620] font-bold mr-1">cache</span>

        <button onClick={addText} className="flex items-center gap-1 text-xs px-2.5 py-2 rounded-full border border-[#2b2620]/40 hover:bg-[#f3d6d9] transition-colors">
          <Type size={14} /> <span className="hidden sm:inline">text</span>
        </button>

        <div className="flex items-center gap-1 px-2 py-1 rounded-full border border-[#2b2620]/40">
          <Square size={14} />
          {SWATCHES.map((s) => (
            <button
              key={s.hex}
              title={s.name}
              onClick={() => addColorBlock(s.hex)}
              style={{ background: s.hex }}
              className="w-5 h-5 rounded-full border border-[#2b2620]/30 active:scale-95 transition-transform"
            />
          ))}
        </div>

        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-1 text-xs px-2.5 py-2 rounded-full border border-[#2b2620]/40 hover:bg-[#c9d6ab] transition-colors"
        >
          <ImageIcon size={14} /> <span className="hidden sm:inline">image</span>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
        />

        <div className="flex items-center gap-1">
          <span className="text-[10px] uppercase text-[#2b2620]/60 hidden sm:inline">patch</span>
          <input
            type="color"
            value={canvasBg}
            onChange={(e) => setCanvasBg(e.target.value)}
            className="w-6 h-6 rounded-full border border-[#2b2620]/40 cursor-pointer"
          />
        </div>

        <div className="ml-auto flex items-center gap-1.5">
          {copyStatus && <span className="text-[10px] text-[#2b2620]/60 hidden sm:inline">{copyStatus}</span>}
          <button onClick={handleShare} className="flex items-center gap-1 text-xs px-2.5 py-2 rounded-full border border-[#2b2620]/40 hover:bg-[#cdc0e0] transition-colors">
            <Link2 size={14} /> <span className="hidden md:inline">share</span>
          </button>
          <button onClick={handleExport} className="flex items-center gap-1 text-xs px-2.5 py-2 rounded-full bg-[#2b2620] text-[#faf6ee] hover:opacity-80 transition-opacity">
            <Download size={14} /> <span className="hidden md:inline">download</span>
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden relative">
        {/* board */}
        <div ref={boardWrapRef} className="flex-1 overflow-auto p-2 sm:p-8 flex items-start justify-center">
          <div style={{ width: BOARD_W * scale, height: BOARD_H * scale, flexShrink: 0 }}>
            <div
              ref={boardRef}
              onPointerDown={() => setSelectedId(null)}
              style={{
                width: BOARD_W,
                height: BOARD_H,
                background: canvasBg,
                position: "relative",
                borderRadius: 6,
                boxShadow: "0 2px 24px rgba(43,38,32,0.18)",
                border: "1px dashed rgba(43,38,32,0.35)",
                transform: `scale(${scale})`,
                transformOrigin: "top left",
                touchAction: "none",
                overflow: "hidden",
              }}
            >
              {elements.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center text-[#2b2620]/40 text-sm text-center px-8">
                  paste anything to start this patch, or use the toolbar above
                </div>
              )}
              <div
                className="fg-brand"
                style={{
                  position: "absolute",
                  bottom: 14,
                  right: 18,
                  fontSize: 13,
                  color: "rgba(43,38,32,0.25)",
                  letterSpacing: "0.03em",
                  pointerEvents: "none",
                  userSelect: "none",
                }}
              >
                cache
              </div>
              {elements
                .slice()
                .sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0))
                .map((el) => (
                  <div
                    key={el.id}
                    onPointerDown={(e) => onPointerDownElement(e, el)}
                    style={{
                      position: "absolute",
                      left: el.x,
                      top: el.y,
                      width: el.w,
                      height: el.h,
                      transform: `rotate(${el.rotation || 0}deg)`,
                      opacity: el.opacity ?? 1,
                      zIndex: el.zIndex,
                      cursor: "grab",
                      touchAction: "none",
                      borderRadius: el.radius || 0,
                      background: el.type === "color" ? el.bg : el.type === "text" ? el.bg : "transparent",
                    }}
                  >
                    <div style={{ position: "absolute", inset: 0, borderRadius: "inherit", overflow: "hidden" }}>
                      {el.type === "image" && (
                        <img src={el.src} alt="" draggable={false} style={{ width: "100%", height: "100%", objectFit: "cover", pointerEvents: "none" }} />
                      )}
                      {el.type === "text" && (
                        <div
                          contentEditable
                          suppressContentEditableWarning
                          onPointerDown={(e) => e.stopPropagation()}
                          onBlur={(e) => updateElement(el.id, { text: e.currentTarget.textContent })}
                          style={{
                            width: "100%",
                            height: "100%",
                            padding: 14,
                            fontSize: el.fontSize || 16,
                            color: el.textColor || "#2b2620",
                            outline: "none",
                            cursor: "text",
                            whiteSpace: "pre-wrap",
                            wordBreak: "break-word",
                          }}
                        >
                          {el.text}
                        </div>
                      )}
                    </div>
                    {selectedId === el.id && <StitchSelection el={el} />}
                    {selectedId === el.id && (
                      <div
                        onPointerDown={(e) => onPointerDownResize(e, el)}
                        style={{
                          position: "absolute",
                          right: -6,
                          bottom: -6,
                          width: 22,
                          height: 22,
                          borderRadius: "50%",
                          background: "#2b2620",
                          cursor: "nwse-resize",
                          touchAction: "none",
                        }}
                      />
                    )}
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* style panel: sidebar on desktop, bottom sheet on mobile */}
        {!isMobile && (
          <div className="w-64 border-l border-dashed border-[#2b2620]/30 bg-[#faf6ee] p-4 overflow-y-auto flex-shrink-0">
            {!selected ? (
              <p className="text-xs text-[#2b2620]/50">select a piece in this patch to style it</p>
            ) : (
              <StylePanelContent />
            )}
            <div className="mt-8 pt-4 border-t border-dashed border-[#2b2620]/30">
              <p className="text-[10px] text-[#2b2620]/50 leading-relaxed">
                paste images/text anywhere in the patch, drag the corner dot to resize, double-click text to edit.
                "share link" packs the patch into the URL itself so this works with no backend; swap in a short
                patch id cached to a database for real persistence across devices, with the same no-account-required flow.
              </p>
            </div>
          </div>
        )}

        {isMobile && selected && (
          <div
            className="absolute bottom-0 left-0 right-0 bg-[#faf6ee] border-t border-dashed border-[#2b2620]/30 p-4 rounded-t-2xl overflow-y-auto z-30"
            style={{ maxHeight: "55vh", boxShadow: "0 -4px 20px rgba(43,38,32,0.2)" }}
          >
            <StylePanelContent />
          </div>
        )}
      </div>
    </div>
  );
}

function roundRectPath(ctx, x, y, w, h, r) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const paragraphs = text.split("\n");
  let cursorY = y;
  paragraphs.forEach((paragraph) => {
    const words = paragraph.split(" ");
    let line = "";
    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + " ";
      if (ctx.measureText(testLine).width > maxWidth && n > 0) {
        ctx.fillText(line, x, cursorY);
        line = words[n] + " ";
        cursorY += lineHeight;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, x, cursorY);
    cursorY += lineHeight;
  });
}
