"use client";

import React, { useState, useRef, useEffect } from "react";
import styles from "./ColorPicker.module.css";

function hexToHsv(hex) {
  let h = hex.replace("#", "");
  if (h.length === 3)
    h = h
      .split("")
      .map((c) => c + c)
      .join("");
  const r = parseInt(h.substr(0, 2), 16) / 255;
  const g = parseInt(h.substr(2, 2), 16) / 255;
  const b = parseInt(h.substr(4, 2), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  let hue = 0;
  if (d !== 0) {
    if (max === r) hue = ((g - b) / d) % 6;
    else if (max === g) hue = (b - r) / d + 2;
    else hue = (r - g) / d + 4;
    hue *= 60;
    if (hue < 0) hue += 360;
  }
  const s = max === 0 ? 0 : d / max;
  const v = max;
  return { h: hue, s, v };
}

function hsvToHex(h, s, v) {
  const c = v * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = v - c;
  let r = 0,
    g = 0,
    b = 0;
  if (h < 60) [r, g, b] = [c, x, 0];
  else if (h < 120) [r, g, b] = [x, c, 0];
  else if (h < 180) [r, g, b] = [0, c, x];
  else if (h < 240) [r, g, b] = [0, x, c];
  else if (h < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];
  const toHex = (n) =>
    Math.round((n + m) * 255)
      .toString(16)
      .padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

export default function ColorPicker({ value, onChange, onAdjustStart, label }) {
  const [open, setOpen] = useState(false);
  const [hexInput, setHexInput] = useState(value || "#000000");
  const wrapRef = useRef(null);
  const svRef = useRef(null);
  const hueRef = useRef(null);

  useEffect(() => {
    setHexInput(value || "#000000");
  }, [value]);

  useEffect(() => {
    if (!open) return;
    const onClickOutside = (e) => {
      if (wrapRef.current?.contains(e.target)) return;
      setOpen(false);
    };
    window.addEventListener("pointerdown", onClickOutside);
    return () => window.removeEventListener("pointerdown", onClickOutside);
  }, [open]);

  const { h, s, v } = hexToHsv(value || "#000000");

  const commit = (nh, ns, nv) => onChange(hsvToHex(nh, ns, nv));

  const dragSv = (e) => {
    const rect = svRef.current.getBoundingClientRect();
    const update = (ev) => {
      const x = Math.min(Math.max(ev.clientX - rect.left, 0), rect.width);
      const y = Math.min(Math.max(ev.clientY - rect.top, 0), rect.height);
      commit(h, x / rect.width, 1 - y / rect.height);
    };
    update(e);
    const onMove = (ev) => update(ev);
    const onUp = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  };

  const dragHue = (e) => {
    const rect = hueRef.current.getBoundingClientRect();
    const update = (ev) => {
      const x = Math.min(Math.max(ev.clientX - rect.left, 0), rect.width);
      commit((x / rect.width) * 360, s, v);
    };
    update(e);
    const onMove = (ev) => update(ev);
    const onUp = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  };

  return (
    <div ref={wrapRef} style={{ position: "relative" }}>
      <button
        type="button"
        onClick={() => {
          if (!open) onAdjustStart?.();
          setOpen((o) => !o);
        }}
        className={styles.swatchTrigger}
        style={{ background: value }}
        aria-label={label || "pick color"}
      />

      {open && (
        <div className={styles.popover}>
          <div
            ref={svRef}
            className={styles.svSquare}
            style={{
              backgroundImage: `linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, hsl(${h}, 100%, 50%))`,
            }}
            onPointerDown={dragSv}
          >
            <div
              className={styles.svThumb}
              style={{ left: `${s * 100}%`, top: `${(1 - v) * 100}%` }}
            />
          </div>

          <div ref={hueRef} className={styles.hueStrip} onPointerDown={dragHue}>
            <div
              className={styles.hueThumb}
              style={{ left: `${(h / 360) * 100}%` }}
            />
          </div>

          <input
            type="text"
            value={hexInput}
            onChange={(e) => {
              const val = e.target.value;
              setHexInput(val);
              if (/^#[0-9a-fA-F]{6}$/.test(val)) onChange(val);
            }}
            onBlur={() => setHexInput(value)}
            className={styles.hexInput}
            spellCheck={false}
          />
        </div>
      )}
    </div>
  );
}
