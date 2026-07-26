"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import {
  Type,
  Square,
  Image as ImageIcon,
  Download,
  Link2,
  Trash2,
  ChevronUp,
  ChevronDown,
  X,
  Undo2,
  FileText,
  ExternalLink,
  Paperclip,
} from "lucide-react";
import styles from "./CacheBoard.module.css";
import ColorPicker from "./ColorPicker";

// constants
const BOARD_W = 1400;
const BOARD_H = 900;
const MOBILE_BREAKPOINT = 768;

// monochrome chrome + three pastel accents, each doing exactly one job —
// lavender marks selection, butter marks the primary action, pink marks resize
const INK = "#0d0d0c";
const BONE = "#f8f6f0";
const CONCRETE = "#8f8b81";
const GRAPHITE = "#1c1b19";
const BONE_TEXT = "#ece7db";
const LAVENDER = "#c9bce0";
const BUTTER = "#f5e6a8";
const PINK = "#f0bfd0";

const SWATCHES = [
  { name: "bone", hex: BONE },
  { name: "lavender", hex: LAVENDER },
  { name: "butter", hex: BUTTER },
  { name: "pink", hex: PINK },
];

const PATTERNS = [
  { id: "none", label: "none" },
  { id: "dots", label: "dots" },
  { id: "grid", label: "grid" },
  { id: "diagonal", label: "diagonal" },
  { id: "blob", label: "blob" },
  { id: "flower", label: "flower" },
];

// text font presets — cssVar drives the live contentEditable (via next/font,
// no flash of unstyled text), family is the real font name used for canvas
// drawing (PNG/PDF export) and document.fonts.load() readiness checks
const FONT_PRESETS = [
  {
    id: "mono",
    label: "mono",
    cssVar: "var(--font-mono)",
    family: "IBM Plex Mono",
  },
  {
    id: "display",
    label: "display",
    cssVar: "var(--font-display)",
    family: "Space Grotesk",
  },
  {
    id: "serif",
    label: "serif",
    cssVar: "var(--font-serif)",
    family: "Playfair Display",
  },
  { id: "sans", label: "sans", cssVar: "var(--font-sans)", family: "Inter" },
  {
    id: "hand",
    label: "handwritten",
    cssVar: "var(--font-hand)",
    family: "Caveat",
  },
  {
    id: "monoAlt",
    label: "mono alt",
    cssVar: "var(--font-mono-alt)",
    family: "JetBrains Mono",
  },
];

// CSS for the live board — used only when there's no background image set
function patternCSS(patternId) {
  switch (patternId) {
    case "dots":
      return {
        backgroundImage:
          "radial-gradient(rgba(13,13,12,0.16) 1.4px, transparent 1.4px)",
        backgroundSize: "18px 18px",
      };
    case "grid":
      return {
        backgroundImage:
          "linear-gradient(rgba(13,13,12,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(13,13,12,0.12) 1px, transparent 1px)",
        backgroundSize: "28px 28px, 28px 28px",
      };
    case "diagonal":
      return {
        backgroundImage:
          "repeating-linear-gradient(45deg, rgba(13,13,12,0.14) 0 1.5px, transparent 1.5px 14px)",
        backgroundSize: "auto",
      };
    case "blob": {
      const svg =
        "<svg xmlns='http://www.w3.org/2000/svg' width='44' height='44'>" +
        "<path d='M22,10 C28,10 33,14 33,21 C33,28 28,33 21,33 C14,33 9,28 9,21 C9,14 15,10 22,10 Z' fill='rgba(13,13,12,0.14)'/>" +
        "</svg>";
      return {
        backgroundImage: `url("data:image/svg+xml,${encodeURIComponent(svg)}")`,
        backgroundSize: "44px 44px",
      };
    }
    case "flower": {
      const svg =
        "<svg xmlns='http://www.w3.org/2000/svg' width='48' height='48'>" +
        "<circle cx='32' cy='24' r='5' fill='rgba(13,13,12,0.13)'/>" +
        "<circle cx='26.5' cy='31.6' r='5' fill='rgba(13,13,12,0.13)'/>" +
        "<circle cx='17.5' cy='28.7' r='5' fill='rgba(13,13,12,0.13)'/>" +
        "<circle cx='17.5' cy='19.3' r='5' fill='rgba(13,13,12,0.13)'/>" +
        "<circle cx='26.5' cy='16.4' r='5' fill='rgba(13,13,12,0.13)'/>" +
        "<circle cx='24' cy='24' r='4' fill='rgba(13,13,12,0.18)'/>" +
        "</svg>";
      return {
        backgroundImage: `url("data:image/svg+xml,${encodeURIComponent(svg)}")`,
        backgroundSize: "48px 48px",
      };
    }
    default:
      return {};
  }
}

// same patterns, rendered as a small tile for canvas export via createPattern —
// keeps the exported PNG matching what's on screen
function makePatternTile(patternId) {
  const size =
    patternId === "flower"
      ? 48
      : patternId === "blob"
        ? 44
        : patternId === "diagonal"
          ? 28
          : patternId === "grid"
            ? 28
            : 18;
  const tile = document.createElement("canvas");
  tile.width = size;
  tile.height = size;
  const tctx = tile.getContext("2d");

  if (patternId === "dots") {
    tctx.fillStyle = "rgba(13,13,12,0.16)";
    tctx.beginPath();
    tctx.arc(size / 2, size / 2, 1.4, 0, Math.PI * 2);
    tctx.fill();
  } else if (patternId === "grid") {
    tctx.strokeStyle = "rgba(13,13,12,0.12)";
    tctx.lineWidth = 1;
    tctx.beginPath();
    tctx.moveTo(0, 0.5);
    tctx.lineTo(size, 0.5);
    tctx.moveTo(0.5, 0);
    tctx.lineTo(0.5, size);
    tctx.stroke();
  } else if (patternId === "diagonal") {
    tctx.strokeStyle = "rgba(13,13,12,0.14)";
    tctx.lineWidth = 1.5;
    tctx.beginPath();
    tctx.moveTo(0, size);
    tctx.lineTo(size, 0);
    tctx.stroke();
  } else if (patternId === "blob") {
    tctx.fillStyle = "rgba(13,13,12,0.14)";
    tctx.beginPath();
    tctx.moveTo(22, 10);
    tctx.bezierCurveTo(28, 10, 33, 14, 33, 21);
    tctx.bezierCurveTo(33, 28, 28, 33, 21, 33);
    tctx.bezierCurveTo(14, 33, 9, 28, 9, 21);
    tctx.bezierCurveTo(9, 14, 15, 10, 22, 10);
    tctx.closePath();
    tctx.fill();
  } else if (patternId === "flower") {
    const petals = [
      [32, 24],
      [26.5, 31.6],
      [17.5, 28.7],
      [17.5, 19.3],
      [26.5, 16.4],
    ];
    tctx.fillStyle = "rgba(13,13,12,0.13)";
    petals.forEach(([cx, cy]) => {
      tctx.beginPath();
      tctx.arc(cx, cy, 5, 0, Math.PI * 2);
      tctx.fill();
    });
    tctx.fillStyle = "rgba(13,13,12,0.18)";
    tctx.beginPath();
    tctx.arc(24, 24, 4, 0, Math.PI * 2);
    tctx.fill();
  }
  return tile;
}

let idCounter = 1;
const newId = () => `el-${idCounter++}`;

const URL_PATTERN = /^https?:\/\/[^\s]+$/i;

function escapeHtml(str) {
  return String(str ?? "").replace(
    /[&<>]/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[c],
  );
}

function escapeAttr(str) {
  return String(str ?? "").replace(
    /[&"<>]/g,
    (c) => ({ "&": "&amp;", '"': "&quot;", "<": "&lt;", ">": "&gt;" })[c],
  );
}

function loadImage(src, allowCrossOrigin) {
  return new Promise((resolve) => {
    const img = new window.Image();
    if (allowCrossOrigin) img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

export default function CacheBoard() {
  const [elements, setElements] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [canvasBg, setCanvasBg] = useState(BONE);
  const [canvasPattern, setCanvasPattern] = useState("none");
  const [canvasImage, setCanvasImage] = useState(null);
  const [bgPanelOpen, setBgPanelOpen] = useState(false);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [bgRemovalId, setBgRemovalId] = useState(null);
  const [customFonts, setCustomFonts] = useState([]); // [{ id, label, family, dataUrl }]
  const fontUploadInputRef = useRef(null);
  const customFontStyleRef = useRef(null);
  const [bgRemovalError, setBgRemovalError] = useState(null);
  const [linkPanelOpen, setLinkPanelOpen] = useState(false);
  const [linkInputValue, setLinkInputValue] = useState("");
  const linkPanelRef = useRef(null);
  const linkButtonRef = useRef(null);
  const fileUploadInputRef = useRef(null);
  const [downloadPanelOpen, setDownloadPanelOpen] = useState(false);
  const downloadPanelRef = useRef(null);
  const downloadButtonRef = useRef(null);
  const [copyStatus, setCopyStatus] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const [scale, setScale] = useState(1);
  const boardRef = useRef(null);
  const boardWrapRef = useRef(null);
  const dragRef = useRef(null);
  const resizeRef = useRef(null);
  const fileInputRef = useRef(null);
  const bgImageInputRef = useRef(null);
  const bgPanelRef = useRef(null);
  const bgButtonRef = useRef(null);
  const zCounter = useRef(1);
  const placeCounter = useRef(0);
  const historyRef = useRef([]);

  // each new piece lands a bit further along a diagonal cascade instead of
  // dead-center every time, so repeated pastes don't stack exactly on top of
  // each other
  const nextOffset = () => {
    placeCounter.current += 1;
    const step = placeCounter.current % 10;
    return { dx: step * 26, dy: step * 20 };
  };

  const pushHistory = (snapshot) => {
    historyRef.current.push(snapshot);
    if (historyRef.current.length > 50) historyRef.current.shift();
  };

  const undo = () => {
    const prev = historyRef.current.pop();
    if (prev) {
      setElements(prev);
      setSelectedId(null);
    }
  };

  const [editingId, setEditingId] = useState(null);
  const selected = elements.find((e) => e.id === selectedId) || null;

  // responsive: track viewport and compute a fit-to-width scale for the board
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

  // load state from URL hash on mount (the "share link" mechanism)
  useEffect(() => {
    try {
      const hash = window.location.hash;
      if (hash && hash.startsWith("#patch=")) {
        const decoded = JSON.parse(decodeURIComponent(atob(hash.slice(7))));
        if (decoded?.elements) {
          setElements(decoded.elements);
          setCanvasBg(decoded.canvasBg || BONE);
          setCanvasPattern(decoded.canvasPattern || "none");
          setCanvasImage(decoded.canvasImage || null);
          const maxZ = Math.max(
            1,
            ...decoded.elements.map((e) => e.zIndex || 1),
          );
          zCounter.current = maxZ + 1;
          idCounter = decoded.elements.length + 1;
          return;
        }
      }
      // no share link — recover the last auto-saved session for this browser,
      // if there is one
      const saved = localStorage.getItem("cache:lastPatch");
      if (saved) {
        const decoded = JSON.parse(saved);
        if (decoded?.elements?.length) {
          setElements(decoded.elements);
          setCanvasBg(decoded.canvasBg || BONE);
          setCanvasPattern(decoded.canvasPattern || "none");
          setCanvasImage(decoded.canvasImage || null);
          const maxZ = Math.max(
            1,
            ...decoded.elements.map((e) => e.zIndex || 1),
          );
          zCounter.current = maxZ + 1;
          idCounter = decoded.elements.length + 1;
        }
      }
    } catch (e) {
      // ignore malformed hash or corrupted local save
    }
  }, []);

  // auto-save to localStorage so a refresh doesn't lose the patch — this is
  // per-browser only (not shared, not synced across devices); the share link
  // is still the only way to hand a patch to someone else
  const autosaveTimer = useRef(null);
  useEffect(() => {
    if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
    autosaveTimer.current = setTimeout(() => {
      try {
        localStorage.setItem(
          "cache:lastPatch",
          JSON.stringify({ elements, canvasBg, canvasPattern, canvasImage }),
        );
      } catch (e) {
        // storage full or unavailable — silently skip, the app still works
        // for the current session, it just won't survive a refresh
      }
    }, 500);
    return () => clearTimeout(autosaveTimer.current);
  }, [elements, canvasBg, canvasPattern, canvasImage]);

  const addElement = useCallback((el) => {
    zCounter.current += 1;
    const full = {
      rotation: 0,
      opacity: 1,
      radius: 0,
      zIndex: zCounter.current,
      ...el,
    };
    setElements((prev) => {
      pushHistory(prev);
      return [...prev, full];
    });
    setSelectedId(full.id);
  }, []);

  const addText = () => {
    const { dx, dy } = nextOffset();
    addElement({
      id: newId(),
      type: "text",
      x: BOARD_W / 2 - 110 + dx,
      y: BOARD_H / 2 - 50 + dy,
      w: 220,
      h: 100,
      text: "double-tap to edit",
      fontSize: 18,
      fontFamily: "mono",
      textColor: INK,
      bg: "transparent",
    });
  };

  const addColorBlock = (hex) => {
    const { dx, dy } = nextOffset();
    addElement({
      id: newId(),
      type: "color",
      x: BOARD_W / 2 - 100 + dx,
      y: BOARD_H / 2 - 80 + dy,
      w: 200,
      h: 160,
      bg: hex || CONCRETE,
    });
  };

  // links: create immediately with a placeholder, then enrich once the
  // server-side unfurl route returns a title/description/image
  const addLink = (rawUrl) => {
    const url = rawUrl.trim();
    if (!URL_PATTERN.test(url)) return;
    const { dx, dy } = nextOffset();
    const id = newId();
    let domain = url;
    try {
      domain = new URL(url).hostname.replace(/^www\./, "");
    } catch {
      // keep raw url as fallback
    }
    addElement({
      id,
      type: "link",
      url,
      title: domain,
      description: "",
      image: null,
      domain,
      x: BOARD_W / 2 - 130 + dx,
      y: BOARD_H / 2 - 80 + dy,
      w: 260,
      h: 160,
      radius: 0,
    });

    fetch(`/api/unfurl?url=${encodeURIComponent(url)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data && !data.error) {
          updateElement(id, {
            title: data.title,
            description: data.description,
            image: data.image,
            domain: data.domain,
          });
        } else if (data) {
          updateElement(id, { domain: data.domain || domain });
        }
      })
      .catch(() => {
        // keep the placeholder card — still a working link even without a preview
      });
  };

  // files: PDFs and other documents, stored inline as a data URL (same
  // no-backend approach as images)
  const handleFileUpload = (file) => {
    if (!file) return;
    const { dx, dy } = nextOffset();
    const reader = new FileReader();
    reader.onload = () => {
      addElement({
        id: newId(),
        type: "file",
        name: file.name,
        fileType: file.type || "application/octet-stream",
        size: file.size,
        dataUrl: reader.result,
        x: BOARD_W / 2 - 110 + dx,
        y: BOARD_H / 2 - 70 + dy,
        w: 220,
        h: 140,
        radius: 0,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleFiles = (files, dropPos) => {
    const { dx, dy } = nextOffset();
    Array.from(files).forEach((file, i) => {
      if (!file.type.startsWith("image/")) return;
      const reader = new FileReader();
      reader.onload = () => {
        const src = reader.result;
        const img = new window.Image();
        img.onload = () => {
          const targetW = 260;
          const targetH = (img.height / img.width) * targetW;
          const baseX = dropPos ? dropPos.x - targetW / 2 : BOARD_W / 2 - 130;
          const baseY = dropPos
            ? dropPos.y - targetH / 2
            : BOARD_H / 2 - targetH / 2;
          addElement({
            id: newId(),
            type: "image",
            src,
            x: baseX + dx + i * 24,
            y: baseY + dy + i * 24,
            w: targetW,
            h: targetH,
            radius: 0,
          });
        };
        img.src = src;
      };
      reader.readAsDataURL(file);
    });
  };

  // resolves a text element's fontFamily (a preset id, or "custom:<id>")
  // into { cssVar, family } — cssVar for live rendering, family for canvas
  // export and document.fonts.load()
  const resolveFont = (fontFamily) => {
    if (fontFamily?.startsWith("custom:")) {
      const id = fontFamily.slice(7);
      const custom = customFonts.find((f) => f.id === id);
      if (custom)
        return { cssVar: `"${custom.family}"`, family: custom.family };
    }
    const preset =
      FONT_PRESETS.find((f) => f.id === fontFamily) || FONT_PRESETS[0];
    return { cssVar: preset.cssVar, family: preset.family };
  };

  const addCustomFont = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result;
      const id = `f${Date.now()}`;
      const family = `CustomFont${id}`;
      const label = file.name.replace(/\.(woff2?|ttf|otf)$/i, "").slice(0, 20);

      if (!customFontStyleRef.current) {
        const styleEl = document.createElement("style");
        styleEl.id = "cache-custom-fonts";
        document.head.appendChild(styleEl);
        customFontStyleRef.current = styleEl;
      }
      customFontStyleRef.current.appendChild(
        document.createTextNode(
          `@font-face { font-family: "${family}"; src: url(${dataUrl}); }`,
        ),
      );

      setCustomFonts((prev) => [...prev, { id, label, family, dataUrl }]);
      if (selected?.id)
        updateElement(selected.id, { fontFamily: `custom:${id}` });
    };
    reader.readAsDataURL(file);
  };

  const handleBgImage = (file) => {
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => setCanvasImage(reader.result);
    reader.readAsDataURL(file);
  };

  // remove background from an image piece on the board (client-side ML, no backend)
  const removeImageBackground = async (id) => {
    const el = elements.find((e) => e.id === id);
    if (!el || el.type !== "image") return;

    setBgRemovalError(null);
    setBgRemovalId(id);
    pushHistory(elements);

    try {
      const { removeBackground } = await import("@imgly/background-removal");
      const blob = await removeBackground(el.src);
      const reader = new FileReader();
      reader.onload = () => {
        updateElement(id, {
          src: reader.result,
          originalSrc: el.originalSrc || el.src,
        });
        setBgRemovalId(null);
      };
      reader.readAsDataURL(blob);
    } catch (err) {
      setBgRemovalError(
        "couldn't remove background — check your connection and try again",
      );
      setBgRemovalId(null);
    }
  };

  const restoreImageBackground = (id) => {
    const el = elements.find((e) => e.id === id);
    if (!el || !el.originalSrc) return;
    pushHistory(elements);
    updateElement(id, { src: el.originalSrc });
  };

  // paste support: images and plain text land straight on the board
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
          const trimmed = text.trim();
          if (URL_PATTERN.test(trimmed)) {
            addLink(trimmed);
          } else {
            const { dx, dy } = nextOffset();
            addElement({
              id: newId(),
              type: "text",
              x: BOARD_W / 2 - 110 + dx,
              y: BOARD_H / 2 - 50 + dy,
              w: 240,
              h: 110,
              text: trimmed.slice(0, 400),
              fontSize: 16,
              fontFamily: "mono",
              textColor: INK,
              bg: "#ffffff",
            });
          }
        }
      }
    };
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateElement = (id, patch) =>
    setElements((prev) =>
      prev.map((e) => (e.id === id ? { ...e, ...patch } : e)),
    );

  const deleteElement = (id) => {
    setElements((prev) => {
      pushHistory(prev);
      return prev.filter((e) => e.id !== id);
    });
    setSelectedId(null);
  };

  const bringToFront = (id) => {
    zCounter.current += 1;
    updateElement(id, { zIndex: zCounter.current });
  };
  const sendToBack = (id) => updateElement(id, { zIndex: 0 });

  // drag (pointer events cover touch + mouse; divide by scale so screen px map to board px)
  const onPointerDownElement = (e, el) => {
    e.stopPropagation();
    pushHistory(elements);
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

  // resize
  const onPointerDownResize = (e, el) => {
    e.stopPropagation();
    pushHistory(elements);
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

  // export to PNG (always renders at full BOARD_W/BOARD_H regardless of on-screen scale)
  // draws the whole board (background + every element) onto a fresh canvas.
  // Shared by the PNG export and the PDF export, so the drawing logic only
  // lives in one place.
  const renderBoardCanvas = async () => {
    const canvas = document.createElement("canvas");
    canvas.width = BOARD_W;
    canvas.height = BOARD_H;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = canvasBg;
    ctx.fillRect(0, 0, BOARD_W, BOARD_H);

    if (canvasImage) {
      const bg = await loadImage(canvasImage);
      if (bg) {
        // cover-fit crop, same behavior as CSS background-size: cover
        const scaleCover = Math.max(BOARD_W / bg.width, BOARD_H / bg.height);
        const drawW = bg.width * scaleCover;
        const drawH = bg.height * scaleCover;
        const offX = (BOARD_W - drawW) / 2;
        const offY = (BOARD_H - drawH) / 2;
        ctx.drawImage(bg, offX, offY, drawW, drawH);
      }
    } else if (canvasPattern !== "none") {
      const tile = makePatternTile(canvasPattern);
      const pattern = ctx.createPattern(tile, "repeat");
      ctx.fillStyle = pattern;
      ctx.fillRect(0, 0, BOARD_W, BOARD_H);
    }

    const sorted = [...elements].sort(
      (a, b) => (a.zIndex || 0) - (b.zIndex || 0),
    );
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
        ctx.fillStyle = el.textColor || INK;
        const fontSize = el.fontSize || 16;
        const { family } = resolveFont(el.fontFamily);
        try {
          await document.fonts.load(`${fontSize}px "${family}"`);
        } catch {
          // font failed to load in time — canvas falls back to its default,
          // better than throwing and aborting the whole export
        }
        ctx.font = `${fontSize}px "${family}", ui-monospace, monospace`;
        ctx.textBaseline = "top";
        wrapText(ctx, el.text || "", 14, 14, el.w - 28, fontSize * 1.35);
      } else if (el.type === "link") {
        ctx.fillStyle = "#ffffff";
        roundRectPath(ctx, 0, 0, el.w, el.h, el.radius || 0);
        ctx.fill();
        ctx.strokeStyle = "rgba(13,13,12,0.2)";
        ctx.lineWidth = 1;
        roundRectPath(ctx, 0.5, 0.5, el.w - 1, el.h - 1, el.radius || 0);
        ctx.stroke();

        const bodyH = 52;
        const imgH = Math.max(0, el.h - bodyH);
        let drewImage = false;
        if (el.image) {
          const img = await loadImage(el.image, true);
          if (img) {
            try {
              ctx.save();
              roundRectPath(ctx, 0, 0, el.w, imgH, 0);
              ctx.clip();
              const s = Math.max(el.w / img.width, imgH / img.height);
              const dw = img.width * s;
              const dh = img.height * s;
              ctx.drawImage(img, (el.w - dw) / 2, (imgH - dh) / 2, dw, dh);
              ctx.restore();
              drewImage = true;
            } catch {
              // remote image didn't allow CORS — fall back to a plain fill
              // rather than tainting (and breaking) the whole export
              ctx.restore();
            }
          }
        }
        if (!drewImage) {
          ctx.fillStyle = "rgba(13,13,12,0.06)";
          ctx.fillRect(0, 0, el.w, imgH);
        }
        ctx.fillStyle = INK;
        ctx.font = "600 13px ui-monospace, monospace";
        ctx.textBaseline = "top";
        ctx.fillText(
          (el.title || el.url || "").slice(0, 40),
          12,
          imgH + 10,
          el.w - 24,
        );
        ctx.fillStyle = "rgba(13,13,12,0.5)";
        ctx.font = "11px ui-monospace, monospace";
        ctx.fillText(el.domain || "", 12, imgH + 28, el.w - 24);
      } else if (el.type === "file") {
        ctx.fillStyle = "#ffffff";
        roundRectPath(ctx, 0, 0, el.w, el.h, el.radius || 0);
        ctx.fill();
        ctx.strokeStyle = "rgba(13,13,12,0.2)";
        ctx.lineWidth = 1;
        roundRectPath(ctx, 0.5, 0.5, el.w - 1, el.h - 1, el.radius || 0);
        ctx.stroke();

        ctx.fillStyle = INK;
        ctx.font = "600 13px ui-monospace, monospace";
        ctx.textAlign = "center";
        ctx.textBaseline = "alphabetic";
        ctx.fillText(
          (el.name || "file").slice(0, 30),
          el.w / 2,
          el.h / 2 + 4,
          el.w - 24,
        );
        ctx.fillStyle = "rgba(13,13,12,0.5)";
        ctx.font = "10px ui-monospace, monospace";
        ctx.fillText(
          `${(el.fileType || "file").split("/").pop()} · ${Math.round((el.size || 0) / 1024)}kb`,
          el.w / 2,
          el.h / 2 + 22,
          el.w - 24,
        );
        ctx.textAlign = "left";
      }
      ctx.restore();
    }

    return canvas;
  };

  const handleExport = async () => {
    const canvas = await renderBoardCanvas();
    canvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "patch.png";
      a.click();
      URL.revokeObjectURL(url);
    });
  };

  // export as a real PDF — the board is drawn as a raster image (same
  // rendering as the PNG), then real clickable link annotations are laid on
  // top for every link-type card, using jsPDF (MIT licensed). File cards stay
  // visual-only here — embedding an openable attachment inside a PDF is a
  // much heavier feature (PDF file-attachment annotations) than a link
  // overlay, so that's a noted limitation, not a silent gap.
  const handleExportPDF = async () => {
    const canvas = await renderBoardCanvas();
    const imgData = canvas.toDataURL("image/png");

    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF({
      orientation: "landscape",
      unit: "px",
      format: [BOARD_W, BOARD_H],
      hotfixes: ["px_scaling"],
    });

    doc.addImage(imgData, "PNG", 0, 0, BOARD_W, BOARD_H);

    elements
      .filter((el) => el.type === "link" && el.url)
      .forEach((el) => {
        // link() ignores rotation — fine for the common case (most link
        // cards aren't rotated), noted as a limitation for rotated ones
        doc.link(el.x, el.y, el.w, el.h, { url: el.url });
      });

    doc.save("patch.pdf");
  };

  // export as a standalone HTML file — the "functional" export.
  // Unlike the PNG, link cards stay real <a> tags and file cards stay
  // real openable/downloadable links; no backend involved, it's just a
  // single self-contained file.
  const handleExportHTML = () => {
    const bg = canvasImage
      ? `background-image:url('${escapeAttr(canvasImage)}');background-size:cover;background-position:center;background-color:${canvasBg};`
      : canvasPattern !== "none"
        ? (() => {
            const p = patternCSS(canvasPattern);
            return `background-color:${canvasBg};background-image:${p.backgroundImage};background-size:${p.backgroundSize};`;
          })()
        : `background-color:${canvasBg};`;

    const sorted = [...elements].sort(
      (a, b) => (a.zIndex || 0) - (b.zIndex || 0),
    );

    // figure out which fonts are actually used, so the export only loads
    // what it needs — presets go through the Google Fonts CDN (no next/font
    // available in a standalone file), custom uploads get their real bytes
    // embedded directly so the file stays self-contained
    const usedPresetIds = new Set();
    const usedCustomIds = new Set();
    sorted.forEach((el) => {
      if (el.type !== "text") return;
      const ff = el.fontFamily || "mono";
      if (ff.startsWith("custom:")) usedCustomIds.add(ff.slice(7));
      else usedPresetIds.add(ff);
    });

    const GOOGLE_FONT_PARAMS = {
      mono: "IBM+Plex+Mono:wght@400;500;600",
      display: "Space+Grotesk:wght@500;600;700",
      serif: "Playfair+Display:wght@400;600",
      sans: "Inter:wght@400;600",
      hand: "Caveat:wght@500;700",
      monoAlt: "JetBrains+Mono:wght@400;600",
    };
    const googleFontsLink =
      usedPresetIds.size > 0
        ? `<link rel="stylesheet" href="https://fonts.googleapis.com/css2?${[
            ...usedPresetIds,
          ]
            .map(
              (id) =>
                `family=${GOOGLE_FONT_PARAMS[id] || GOOGLE_FONT_PARAMS.mono}`,
            )
            .join("&")}&display=swap" />`
        : "";

    const customFontFaces = [...usedCustomIds]
      .map((id) => customFonts.find((f) => f.id === id))
      .filter(Boolean)
      .map(
        (f) =>
          `@font-face { font-family: "${f.family}"; src: url(${f.dataUrl}); }`,
      )
      .join("\n");

    const pieces = sorted
      .map((el) => {
        const common = `position:absolute;left:${el.x}px;top:${el.y}px;width:${el.w}px;height:${el.h}px;transform:rotate(${
          el.rotation || 0
        }deg);opacity:${el.opacity ?? 1};border-radius:${el.radius || 0}px;overflow:hidden;box-sizing:border-box;`;

        if (el.type === "color") {
          return `<div style="${common}background:${el.bg};"></div>`;
        }
        if (el.type === "image" && el.src) {
          return `<div style="${common}"><img src="${escapeAttr(el.src)}" style="width:100%;height:100%;object-fit:cover;display:block;" alt="" /></div>`;
        }
        if (el.type === "text") {
          const textBg =
            el.bg && el.bg !== "transparent" ? el.bg : "transparent";
          const { family } = resolveFont(el.fontFamily);
          return `<div style="${common}background:${textBg};padding:14px;font-family:'${family}',ui-monospace,monospace;font-size:${
            el.fontSize || 16
          }px;color:${el.textColor || INK};white-space:pre-wrap;word-break:break-word;">${escapeHtml(el.text)}</div>`;
        }
        if (el.type === "link") {
          const imgHtml = el.image
            ? `<div style="flex:1;background-image:url('${escapeAttr(el.image)}');background-size:cover;background-position:center;"></div>`
            : `<div style="flex:1;background:rgba(13,13,12,0.06);"></div>`;
          return `<a href="${escapeAttr(el.url)}" target="_blank" rel="noopener noreferrer" style="${common}display:flex;flex-direction:column;background:#fff;border:1px solid rgba(13,13,12,0.2);text-decoration:none;color:inherit;">${imgHtml}<div style="padding:10px 12px;flex-shrink:0;"><div style="font-family:ui-monospace,monospace;font-weight:600;font-size:13px;color:#0d0d0c;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${escapeHtml(
            el.title,
          )}</div><div style="font-family:ui-monospace,monospace;font-size:11px;color:rgba(13,13,12,0.5);margin-top:2px;">${escapeHtml(
            el.domain,
          )}</div></div></a>`;
        }
        if (el.type === "file") {
          const meta = `${(el.fileType || "file").split("/").pop()} · ${Math.round((el.size || 0) / 1024)}kb — click to open`;
          return `<a href="${escapeAttr(el.dataUrl)}" download="${escapeAttr(el.name)}" target="_blank" style="${common}display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;background:#fff;border:1px solid rgba(13,13,12,0.2);text-decoration:none;color:inherit;padding:12px;text-align:center;"><div style="font-family:ui-monospace,monospace;font-weight:600;font-size:12px;color:#0d0d0c;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%;">${escapeHtml(
            el.name,
          )}</div><div style="font-family:ui-monospace,monospace;font-size:10px;color:rgba(13,13,12,0.5);text-transform:uppercase;">${escapeHtml(
            meta,
          )}</div></a>`;
        }
        return "";
      })
      .join("\n    ");

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<title>cache — patch export</title>
${googleFontsLink}
<style>
* { box-sizing: border-box; } body { margin: 0; padding: 24px; background: #1c1b19; display: flex; justify-content: center; }
${customFontFaces}
</style>
</head>
<body>
  <div style="position:relative;width:${BOARD_W}px;height:${BOARD_H}px;${bg}box-shadow:0 12px 40px rgba(0,0,0,0.35);">
    ${pieces}
  </div>
</body>
</html>`;

    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "patch.html";
    a.click();
    URL.revokeObjectURL(url);
  };

  // share link (state packed into the URL hash — no backend needed for this starter)
  const handleShare = async () => {
    const payload = JSON.stringify({
      elements,
      canvasBg,
      canvasPattern,
      canvasImage,
    });
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

  // close the background popover when clicking outside it
  useEffect(() => {
    if (!bgPanelOpen) return;
    const onClickOutside = (e) => {
      if (
        bgPanelRef.current?.contains(e.target) ||
        bgButtonRef.current?.contains(e.target)
      )
        return;
      setBgPanelOpen(false);
    };
    window.addEventListener("pointerdown", onClickOutside);
    return () => window.removeEventListener("pointerdown", onClickOutside);
  }, [bgPanelOpen]);

  // close the link-add popover when clicking outside it
  useEffect(() => {
    if (!linkPanelOpen) return;
    const onClickOutside = (e) => {
      if (
        linkPanelRef.current?.contains(e.target) ||
        linkButtonRef.current?.contains(e.target)
      )
        return;
      setLinkPanelOpen(false);
    };
    window.addEventListener("pointerdown", onClickOutside);
    return () => window.removeEventListener("pointerdown", onClickOutside);
  }, [linkPanelOpen]);

  // close the download-options popover when clicking outside it
  useEffect(() => {
    if (!downloadPanelOpen) return;
    const onClickOutside = (e) => {
      if (
        downloadPanelRef.current?.contains(e.target) ||
        downloadButtonRef.current?.contains(e.target)
      )
        return;
      setDownloadPanelOpen(false);
    };
    window.addEventListener("pointerdown", onClickOutside);
    return () => window.removeEventListener("pointerdown", onClickOutside);
  }, [downloadPanelOpen]);

  // keyboard shortcuts: delete/backspace removes the selected piece, cmd/ctrl+z undoes
  useEffect(() => {
    const onKeyDown = (e) => {
      const active = document.activeElement;
      const isTypingSomewhere =
        active &&
        (active.tagName === "INPUT" ||
          active.tagName === "TEXTAREA" ||
          active.isContentEditable);

      if (
        (e.key === "Delete" || e.key === "Backspace") &&
        selectedId &&
        !isTypingSomewhere
      ) {
        e.preventDefault();
        deleteElement(selectedId);
        return;
      }

      if (
        (e.metaKey || e.ctrlKey) &&
        e.key.toLowerCase() === "z" &&
        !isTypingSomewhere
      ) {
        e.preventDefault();
        undo();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selectedId]);

  // viewfinder-bracket selection indicator and style panel now live outside
  // this component (see below) so their identity is stable across renders —
  // sliders and inputs no longer remount on every drag tick.

  return (
    <div
      style={{
        backgroundColor: GRAPHITE,
        backgroundImage:
          "linear-gradient(rgba(236,231,219,0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(236,231,219,0.045) 1px, transparent 1px)",
        backgroundSize: "32px 32px, 32px 32px",
      }}
      className={styles.page}
    >
      {/* toolbar */}
      <div className={styles.toolbar}>
        <span className={`fg-brand ${styles.brand}`}>CACHE</span>

        <button onClick={addText} className={styles.btn}>
          <Type size={13} /> <span className={styles.hideOnMobile}>text</span>
        </button>

        <div className={styles.swatchGroup}>
          <Square size={13} className={styles.swatchIcon} />
          {SWATCHES.map((s) => (
            <button
              key={s.hex}
              title={s.name}
              onClick={() => addColorBlock(s.hex)}
              style={{ background: s.hex }}
              className={styles.swatchDot}
            />
          ))}
        </div>

        <button
          onClick={() => fileInputRef.current?.click()}
          className={styles.btn}
        >
          <ImageIcon size={13} />{" "}
          <span className={styles.hideOnMobile}>image</span>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
        />

        <div style={{ position: "relative" }}>
          <button
            ref={linkButtonRef}
            onClick={() => setLinkPanelOpen((v) => !v)}
            className={styles.btn}
          >
            <Link2 size={13} />{" "}
            <span className={styles.hideOnMobile}>link</span>
          </button>
          {linkPanelOpen && (
            <div ref={linkPanelRef} className={styles.bgPanel}>
              <div className={styles.bgPanelLabel}>paste a url</div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (linkInputValue.trim()) {
                    addLink(linkInputValue.trim());
                    setLinkInputValue("");
                    setLinkPanelOpen(false);
                  }
                }}
                style={{ display: "flex", gap: 6 }}
              >
                <input
                  type="text"
                  value={linkInputValue}
                  onChange={(e) => setLinkInputValue(e.target.value)}
                  placeholder="https://…"
                  autoFocus
                  className={styles.linkTextInput}
                />
                <button
                  type="submit"
                  className={styles.smallBtn}
                  style={{ marginTop: 0 }}
                >
                  add
                </button>
              </form>
            </div>
          )}
        </div>

        <button
          onClick={() => fileUploadInputRef.current?.click()}
          className={styles.btn}
        >
          <Paperclip size={13} />{" "}
          <span className={styles.hideOnMobile}>file</span>
        </button>
        <input
          ref={fileUploadInputRef}
          type="file"
          hidden
          onChange={(e) => {
            if (e.target.files?.[0]) handleFileUpload(e.target.files[0]);
            e.target.value = "";
          }}
        />
        <input
          ref={fontUploadInputRef}
          type="file"
          accept=".woff,.woff2,.ttf,.otf"
          hidden
          onChange={(e) => {
            if (e.target.files?.[0]) addCustomFont(e.target.files[0]);
            e.target.value = "";
          }}
        />

        <div style={{ position: "relative" }}>
          <button
            ref={bgButtonRef}
            onClick={() => setBgPanelOpen((v) => !v)}
            className={styles.btn}
          >
            <span className={styles.hideOnMobile}>patch</span>
            <span
              aria-hidden="true"
              style={{
                width: 14,
                height: 14,
                border: "1px solid rgba(236,231,219,0.5)",
                backgroundColor: canvasBg,
                ...(canvasImage
                  ? {
                      backgroundImage: `url(${canvasImage})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }
                  : {
                      ...patternCSS(canvasPattern),
                      backgroundSize: "14px 14px",
                    }),
              }}
            />
          </button>

          {bgPanelOpen && (
            <div ref={bgPanelRef} className={styles.bgPanel}>
              <div className={styles.bgPanelLabel}>fill</div>
              <ColorPicker
                value={canvasBg}
                onChange={setCanvasBg}
                label="patch fill"
              />

              <div className={styles.bgPanelLabel}>pattern</div>
              <div className={styles.bgPatternRow}>
                {PATTERNS.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setCanvasPattern(p.id)}
                    className={`${styles.bgPatternBtn} ${canvasPattern === p.id ? styles.bgPatternBtnActive : ""}`}
                    title={p.label}
                  >
                    {p.id !== "none" && (
                      <span
                        aria-hidden="true"
                        style={{
                          display: "inline-block",
                          width: 12,
                          height: 12,
                          marginRight: 5,
                          verticalAlign: "-2px",
                          backgroundColor: "#fff",
                          border: "1px solid rgba(13,13,12,0.3)",
                          ...patternCSS(p.id),
                          backgroundSize: "12px 12px",
                        }}
                      />
                    )}
                    {p.label}
                  </button>
                ))}
              </div>

              <div className={styles.bgPanelLabel}>background image</div>
              {canvasImage ? (
                <div className={styles.bgImagePreviewRow}>
                  <div
                    className={styles.bgImagePreview}
                    style={{ backgroundImage: `url(${canvasImage})` }}
                  />
                  <button
                    onClick={() => setCanvasImage(null)}
                    className={styles.smallBtn}
                  >
                    remove
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => bgImageInputRef.current?.click()}
                  className={styles.smallBtn}
                >
                  upload image
                </button>
              )}
              <input
                ref={bgImageInputRef}
                type="file"
                accept="image/*"
                hidden
                onChange={(e) =>
                  e.target.files?.[0] && handleBgImage(e.target.files[0])
                }
              />
            </div>
          )}
        </div>

        <div className={styles.toolbarEnd}>
          {copyStatus && (
            <span className={`${styles.copyStatus} ${styles.hideOnMobile}`}>
              {copyStatus}
            </span>
          )}
          <button
            onClick={undo}
            className={styles.btn}
            title="undo (cmd/ctrl+z)"
          >
            <Undo2 size={13} /> <span className={styles.hideBelowMd}>undo</span>
          </button>
          <button onClick={handleShare} className={styles.btn}>
            <Link2 size={13} />{" "}
            <span className={styles.hideBelowMd}>share</span>
          </button>
          <div style={{ position: "relative" }}>
            <button
              ref={downloadButtonRef}
              onClick={() => setDownloadPanelOpen((v) => !v)}
              style={{
                borderColor: BUTTER,
                background: BUTTER,
                border: "1px solid " + BUTTER,
              }}
              className={`${styles.btn} ${styles.btnPrimary}`}
            >
              <Download size={13} />{" "}
              <span className={styles.hideBelowMd}>download</span>
            </button>
            {downloadPanelOpen && (
              <div
                ref={downloadPanelRef}
                className={styles.bgPanel}
                style={{ right: 0, left: "auto" }}
              >
                <div className={styles.bgPanelLabel}>export as</div>
                <button
                  onClick={() => {
                    handleExport();
                    setDownloadPanelOpen(false);
                  }}
                  className={styles.smallBtn}
                  style={{ marginTop: 0, width: "100%" }}
                >
                  PNG — flat image
                </button>
                <button
                  onClick={() => {
                    handleExportHTML();
                    setDownloadPanelOpen(false);
                  }}
                  className={styles.smallBtn}
                  style={{ width: "100%" }}
                >
                  HTML — links & files stay clickable
                </button>
                <button
                  onClick={() => {
                    handleExportPDF();
                    setDownloadPanelOpen(false);
                  }}
                  className={styles.smallBtn}
                  style={{ width: "100%" }}
                >
                  PDF — clickable links
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className={styles.body}>
        {/* board */}
        <div ref={boardWrapRef} className={styles.boardWrap}>
          <div
            style={{
              width: BOARD_W * scale,
              height: BOARD_H * scale,
              flexShrink: 0,
            }}
          >
            <div
              ref={boardRef}
              onPointerDown={() => setSelectedId(null)}
              onDragOver={(e) => {
                e.preventDefault();
                if (!isDraggingOver) setIsDraggingOver(true);
              }}
              onDragLeave={(e) => {
                if (
                  e.currentTarget === e.target ||
                  !e.currentTarget.contains(e.relatedTarget)
                ) {
                  setIsDraggingOver(false);
                }
              }}
              onDrop={(e) => {
                e.preventDefault();
                setIsDraggingOver(false);
                const files = e.dataTransfer?.files;
                if (!files || !files.length) return;
                const rect = boardRef.current.getBoundingClientRect();
                const dropPos = {
                  x: (e.clientX - rect.left) / scale,
                  y: (e.clientY - rect.top) / scale,
                };
                handleFiles(files, dropPos);
              }}
              style={{
                width: BOARD_W,
                height: BOARD_H,
                backgroundColor: canvasBg,
                ...(canvasImage
                  ? {
                      backgroundImage: `url(${canvasImage})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }
                  : patternCSS(canvasPattern)),
                position: "relative",
                boxShadow: isDraggingOver
                  ? `0 0 0 2px ${LAVENDER}, 0 12px 40px rgba(0,0,0,0.35)`
                  : "0 0 0 1px rgba(236,231,219,0.08), 0 12px 40px rgba(0,0,0,0.35)",
                transform: `scale(${scale})`,
                transformOrigin: "top left",
                touchAction: "none",
                overflow: "hidden",
              }}
            >
              {isDraggingOver && (
                <div className={styles.dropOverlay}>drop to add</div>
              )}
              {elements.length === 0 && (
                <div className={styles.emptyState}>
                  paste anything to start this patch
                </div>
              )}

              {/* a patch, literally — white fabric, black stitching, a tiny embroidered ⌘v as the one wink at what this thing actually does */}
              <svg
                width="64"
                height="44"
                viewBox="0 0 64 44"
                style={{
                  position: "absolute",
                  bottom: 16,
                  right: 16,
                  pointerEvents: "none",
                  userSelect: "none",
                }}
              >
                {/* fabric, edge kept dark for shape definition against the pale board */}
                <rect
                  x="1"
                  y="1"
                  width="62"
                  height="42"
                  rx="3"
                  fill="#ffffff"
                  stroke={INK}
                  strokeWidth="1"
                />
                {/* running stitch attaching it to the board */}
                <rect
                  x="7"
                  y="7"
                  width="50"
                  height="30"
                  rx="2"
                  fill="none"
                  stroke={INK}
                  strokeWidth="1.4"
                  strokeDasharray="2 3"
                  strokeLinecap="round"
                />
                {/* corner tack stitches */}
                {[
                  [4, 4],
                  [60, 4],
                  [4, 40],
                  [60, 40],
                ].map(([cx, cy], i) => (
                  <path
                    key={i}
                    d={`M${cx - 3},${cy} L${cx + 3},${cy} M${cx},${cy - 3} L${cx},${cy + 3}`}
                    stroke={INK}
                    strokeWidth="1.3"
                  />
                ))}
                {/* the embroidered detail */}
                <text
                  x="32"
                  y="26"
                  textAnchor="middle"
                  fontFamily="var(--font-mono)"
                  fontSize="10"
                  fill={INK}
                  letterSpacing="0.02em"
                >
                  ⌘v
                </text>
              </svg>

              {/* HUD readout, opposite corner */}
              <div
                style={{
                  position: "absolute",
                  bottom: 16,
                  left: 16,
                  fontSize: 10,
                  color: INK,
                  opacity: 0.35,
                  letterSpacing: "0.08em",
                  pointerEvents: "none",
                  userSelect: "none",
                  fontFamily: "var(--font-mono)",
                }}
              >
                {BOARD_W}×{BOARD_H} / {String(elements.length).padStart(3, "0")}{" "}
                ITEMS
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
                      background:
                        el.type === "color"
                          ? el.bg
                          : el.type === "text"
                            ? el.bg
                            : "transparent",
                    }}
                  >
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        borderRadius: "inherit",
                        overflow: "hidden",
                      }}
                    >
                      {el.type === "image" && (
                        <img
                          src={el.src}
                          alt=""
                          draggable={false}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            pointerEvents: "none",
                          }}
                        />
                      )}
                      {el.type === "text" && (
                        <div
                          contentEditable={editingId === el.id}
                          suppressContentEditableWarning
                          ref={(node) => {
                            if (
                              node &&
                              editingId === el.id &&
                              document.activeElement !== node
                            )
                              node.focus();
                          }}
                          onDoubleClick={(e) => {
                            e.stopPropagation();
                            setEditingId(el.id);
                          }}
                          onPointerDown={(e) => {
                            if (editingId === el.id) e.stopPropagation();
                          }}
                          onBlur={(e) => {
                            updateElement(el.id, {
                              text: e.currentTarget.textContent,
                            });
                            setEditingId(null);
                          }}
                          style={{
                            width: "100%",
                            height: "100%",
                            padding: 14,
                            fontSize: el.fontSize || 16,
                            color: el.textColor || INK,
                            outline: "none",
                            cursor: editingId === el.id ? "text" : "grab",
                            whiteSpace: "pre-wrap",
                            wordBreak: "break-word",
                            fontFamily: resolveFont(el.fontFamily).cssVar,
                          }}
                        >
                          {el.text}
                        </div>
                      )}
                      {el.type === "link" && (
                        <div className={styles.linkCard}>
                          {el.image ? (
                            <div
                              className={styles.linkCardImage}
                              style={{ backgroundImage: `url(${el.image})` }}
                            />
                          ) : (
                            <div
                              className={styles.linkCardImage}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              <Link2 size={24} style={{ opacity: 0.3 }} />
                            </div>
                          )}
                          <div className={styles.linkCardBody}>
                            <div className={styles.linkCardTitle}>
                              {el.title}
                            </div>
                            <div className={styles.linkCardDomain}>
                              {el.domain}
                            </div>
                          </div>
                        </div>
                      )}
                      {el.type === "file" && (
                        <div className={styles.fileCard}>
                          <FileText
                            size={28}
                            style={{ color: INK, opacity: 0.6 }}
                          />
                          <div className={styles.fileCardName}>{el.name}</div>
                          <div className={styles.fileCardMeta}>
                            {(el.fileType || "file").split("/").pop()} ·{" "}
                            {Math.round((el.size || 0) / 1024)}kb
                          </div>
                        </div>
                      )}
                    </div>

                    {(el.type === "link" || el.type === "file") && (
                      <button
                        className={styles.openBtn}
                        onPointerDown={(e) => e.stopPropagation()}
                        onClick={(e) => {
                          e.stopPropagation();
                          const target =
                            el.type === "link" ? el.url : el.dataUrl;
                          window.open(target, "_blank", "noopener,noreferrer");
                        }}
                        title={el.type === "link" ? "open link" : "open file"}
                      >
                        <ExternalLink size={13} />
                      </button>
                    )}
                    {selectedId === el.id && <CornerBrackets el={el} />}
                    {selectedId === el.id && (
                      <div
                        onPointerDown={(e) => onPointerDownResize(e, el)}
                        style={{
                          position: "absolute",
                          right: -8,
                          bottom: -8,
                          width: 14,
                          height: 14,
                          background: PINK,
                          border: `1px solid ${INK}`,
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

        {/* style panel: floats in on desktop when something's selected, bottom sheet on mobile */}
        {!isMobile && selected && (
          <div className={styles.panel}>
            <StylePanelContent
              selected={selected}
              isMobile={isMobile}
              updateElement={updateElement}
              deleteElement={deleteElement}
              setSelectedId={setSelectedId}
              bringToFront={bringToFront}
              sendToBack={sendToBack}
              onAdjustStart={() => pushHistory(elements)}
              removeImageBackground={removeImageBackground}
              restoreImageBackground={restoreImageBackground}
              bgRemovalId={bgRemovalId}
              bgRemovalError={bgRemovalError}
              customFonts={customFonts}
              fontUploadInputRef={fontUploadInputRef}
            />
          </div>
        )}

        {!isMobile && !selected && (
          <div className={styles.helpCorner}>
            paste anywhere on the patch, drag the corner dot to resize,
            double-click text to edit.{" "}
            <a href="/case-study">how this was built ↗</a>
          </div>
        )}

        {isMobile && selected && (
          <div
            className={styles.mobileSheet}
            style={{
              maxHeight: "55vh",
              boxShadow: "0 -4px 20px rgba(0,0,0,0.4)",
            }}
          >
            <StylePanelContent
              selected={selected}
              isMobile={isMobile}
              updateElement={updateElement}
              deleteElement={deleteElement}
              setSelectedId={setSelectedId}
              bringToFront={bringToFront}
              sendToBack={sendToBack}
              onAdjustStart={() => pushHistory(elements)}
              removeImageBackground={removeImageBackground}
              restoreImageBackground={restoreImageBackground}
              bgRemovalId={bgRemovalId}
              bgRemovalError={bgRemovalError}
              customFonts={customFonts}
              fontUploadInputRef={fontUploadInputRef}
            />
          </div>
        )}
      </div>
    </div>
  );
}

// viewfinder-bracket selection indicator — sharp corner marks, not a soft outline.
// Defined outside CacheBoard so its identity is stable across renders.
function CornerBrackets({ el }) {
  const m = 9;
  const len = 15;
  const w = el.w;
  const h = el.h;
  return (
    <svg
      width={w + m * 2}
      height={h + m * 2}
      style={{
        position: "absolute",
        left: -m,
        top: -m,
        pointerEvents: "none",
        overflow: "visible",
      }}
    >
      <path
        d={`M ${0} ${len} L ${0} ${0} L ${len} ${0}`}
        fill="none"
        stroke={LAVENDER}
        strokeWidth={2}
        strokeLinecap="square"
      />
      <path
        d={`M ${w + m * 2 - len} ${0} L ${w + m * 2} ${0} L ${w + m * 2} ${len}`}
        fill="none"
        stroke={LAVENDER}
        strokeWidth={2}
        strokeLinecap="square"
      />
      <path
        d={`M ${0} ${h + m * 2 - len} L ${0} ${h + m * 2} L ${len} ${h + m * 2}`}
        fill="none"
        stroke={LAVENDER}
        strokeWidth={2}
        strokeLinecap="square"
      />
      <path
        d={`M ${w + m * 2 - len} ${h + m * 2} L ${w + m * 2} ${h + m * 2} L ${w + m * 2} ${h + m * 2 - len}`}
        fill="none"
        stroke={LAVENDER}
        strokeWidth={2}
        strokeLinecap="square"
      />
    </svg>
  );
}

// Style panel, also defined outside CacheBoard for the same reason — kept as a
// stable component so range/color inputs don't lose native drag state on every
// keystroke or slider tick.
function StylePanelContent({
  selected,
  isMobile,
  updateElement,
  deleteElement,
  setSelectedId,
  bringToFront,
  sendToBack,
  onAdjustStart,
  removeImageBackground,
  restoreImageBackground,
  bgRemovalId,
  bgRemovalError,
  customFonts,
  fontUploadInputRef,
}) {
  return (
    <>
      <div className={styles.panelHeader}>
        <span className={styles.typeLabel}>{selected.type}</span>
        <div className={styles.iconRow}>
          <button
            onClick={() => deleteElement(selected.id)}
            className={styles.iconBtn}
          >
            <Trash2 size={16} />
          </button>
          {isMobile && (
            <button
              onClick={() => setSelectedId(null)}
              className={styles.iconBtnPlain}
            >
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      {selected.type === "image" && (
        <div className={styles.field}>
          background removal
          {bgRemovalId === selected.id ? (
            <span className={styles.processingLabel}>removing background…</span>
          ) : (
            <div className={styles.frontBackRow} style={{ marginTop: 4 }}>
              <button
                onClick={() => removeImageBackground(selected.id)}
                className={styles.smallBtn}
                style={{ marginTop: 0 }}
              >
                remove background
              </button>
              {selected.originalSrc && (
                <button
                  onClick={() => restoreImageBackground(selected.id)}
                  className={styles.smallBtn}
                  style={{ marginTop: 0 }}
                >
                  restore original
                </button>
              )}
            </div>
          )}
          {bgRemovalError && bgRemovalId === null && (
            <span className={styles.errorLabel}>{bgRemovalError}</span>
          )}
        </div>
      )}

      {(selected.type === "color" || selected.type === "text") && (
        <div className={styles.field}>
          {selected.type === "color" ? "fill" : "background"}
          <ColorPicker
            value={selected.bg === "transparent" ? "#ffffff" : selected.bg}
            onChange={(hex) => updateElement(selected.id, { bg: hex })}
            onAdjustStart={onAdjustStart}
            label="fill"
          />
        </div>
      )}

      {selected.type === "text" && (
        <>
          <div className={styles.field}>
            text color
            <ColorPicker
              value={selected.textColor || INK}
              onChange={(hex) => updateElement(selected.id, { textColor: hex })}
              onAdjustStart={onAdjustStart}
              label="text color"
            />
          </div>
          <label className={styles.field}>
            font size — {selected.fontSize || 16}px
            <input
              onPointerDown={onAdjustStart}
              type="range"
              min="10"
              max="48"
              value={selected.fontSize || 16}
              onChange={(e) =>
                updateElement(selected.id, { fontSize: Number(e.target.value) })
              }
            />
          </label>
          <div className={styles.field}>
            font
            <div className={styles.bgPatternRow}>
              {FONT_PRESETS.map((f) => (
                <button
                  key={f.id}
                  onClick={() =>
                    updateElement(selected.id, { fontFamily: f.id })
                  }
                  style={{ fontFamily: f.cssVar }}
                  className={`${styles.bgPatternBtn} ${
                    (selected.fontFamily || "mono") === f.id
                      ? styles.bgPatternBtnActive
                      : ""
                  }`}
                >
                  {f.label}
                </button>
              ))}
              {customFonts.map((f) => (
                <button
                  key={f.id}
                  onClick={() =>
                    updateElement(selected.id, { fontFamily: `custom:${f.id}` })
                  }
                  style={{ fontFamily: `"${f.family}"` }}
                  className={`${styles.bgPatternBtn} ${
                    selected.fontFamily === `custom:${f.id}`
                      ? styles.bgPatternBtnActive
                      : ""
                  }`}
                >
                  {f.label}
                </button>
              ))}
              <button
                onClick={() => fontUploadInputRef.current?.click()}
                className={styles.bgPatternBtn}
              >
                + upload
              </button>
            </div>
          </div>
          <button
            onClick={() =>
              updateElement(selected.id, {
                bg: selected.bg === "transparent" ? "#ffffff" : "transparent",
              })
            }
            className={styles.smallBtn}
          >
            {selected.bg === "transparent"
              ? "add background"
              : "make transparent"}
          </button>
        </>
      )}

      <label className={styles.field}>
        corner radius — {selected.radius ?? 0}px
        <input
          onPointerDown={onAdjustStart}
          type="range"
          min="0"
          max="80"
          value={selected.radius ?? 0}
          onChange={(e) =>
            updateElement(selected.id, { radius: Number(e.target.value) })
          }
        />
      </label>

      <label className={styles.field}>
        rotation — {selected.rotation ?? 0}°
        <input
          onPointerDown={onAdjustStart}
          type="range"
          min="-45"
          max="45"
          value={selected.rotation ?? 0}
          onChange={(e) =>
            updateElement(selected.id, { rotation: Number(e.target.value) })
          }
        />
      </label>

      <label className={styles.field}>
        opacity — {Math.round((selected.opacity ?? 1) * 100)}%
        <input
          onPointerDown={onAdjustStart}
          type="range"
          min="10"
          max="100"
          value={Math.round((selected.opacity ?? 1) * 100)}
          onChange={(e) =>
            updateElement(selected.id, {
              opacity: Number(e.target.value) / 100,
            })
          }
        />
      </label>

      <div className={styles.frontBackRow}>
        <button
          onClick={() => bringToFront(selected.id)}
          className={styles.frontBackBtn}
        >
          <ChevronUp size={13} /> front
        </button>
        <button
          onClick={() => sendToBack(selected.id)}
          className={styles.frontBackBtn}
        >
          <ChevronDown size={13} /> back
        </button>
      </div>
    </>
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
