"use client";

import { motion, useScroll, useSpring } from "framer-motion";
import styles from "./case-study.module.css";
import Head from "next/head";
import Image from "next/image";

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

const reveal = {
  initial: "hidden",
  whileInView: "show",
  viewport: { once: true, margin: "-100px" },
  variants: fadeUp,
};

const heroStagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.05 } },
};

const heroItem = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

export default function CaseStudyClient() {
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, {
    stiffness: 200,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <div className={styles.page}>
      <Head>
        <title>Cache Case Study</title>
        <meta
          name="description"
          content="A deep dive into the design and development of Cache, a moodboard tool for the low-stakes moments."
        />
        <meta property="og:title" content="Cache Case Study" />
        <meta
          property="og:description"
          content="A deep dive into the design and development of Cache, a moodboard tool for the low-stakes moments."
        />
        <meta property="og:url" content="https://cacheboard.vercel.app/" />
        <meta property="og:image" content="/app/icon.svg" />
        <meta property="og:image:alt" content="Cache blank tag icon" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
      </Head>
      <motion.div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          background: "#c9bce0",
          transformOrigin: "0%",
          zIndex: 100,
          scaleX: progress,
        }}
      />

      <section className={styles.hero}>
        <motion.div
          className={styles.heroInner}
          initial="hidden"
          animate="show"
          variants={heroStagger}
        >
          <motion.div variants={heroItem} className={styles.heroEyebrow}>
            case study
          </motion.div>
          <motion.h1 variants={heroItem} className={styles.heroTitle}>
            cache
          </motion.h1>
          <motion.p variants={heroItem} className={styles.heroThesis}>
            a moodboard tool for the low-stakes moments — when arranging a few
            references doesn't need a whole design file behind it. paste
            anything — an image, a link, a pdf — and it's already on the board.
            no account, no "create new project" dialog, no auto layout to fight
            with.
          </motion.p>
          <motion.div variants={heroItem} className={styles.heroMeta}>
            <div className={styles.heroMetaItem}>
              role
              <b>design + build</b>
            </div>
            <div className={styles.heroMetaItem}>
              stack
              <b>next.js, css modules</b>
            </div>
            <div className={styles.heroMetaItem}>
              status
              <b>working prototype</b>
            </div>
          </motion.div>

          <motion.div
            variants={heroItem}
            className={styles.ctaRow}
            style={{ marginTop: 20 }}
          >
            <motion.a
              href="/"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              className={`${styles.ctaLink} ${styles.ctaLinkPrimary}`}
            >
              try it live ↗
            </motion.a>
            <motion.a
              href="https://github.com/yafira/cache"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              className={styles.ctaLink}
            >
              view source ↗
            </motion.a>
          </motion.div>

          <motion.svg
            variants={heroItem}
            width="76"
            height="52"
            viewBox="0 0 76 52"
            className={styles.tag}
            animate={{ y: [0, -5, 0], rotate: [0, 1.5, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          >
            <rect
              x="1"
              y="1"
              width="74"
              height="50"
              rx="3"
              fill="#ffffff"
              stroke="#0d0d0c"
              strokeWidth="1"
            />
            <rect
              x="8"
              y="8"
              width="60"
              height="36"
              rx="2"
              fill="none"
              stroke="#0d0d0c"
              strokeWidth="1.4"
              strokeDasharray="2 3"
              strokeLinecap="round"
            />
            {[
              [4, 4],
              [72, 4],
              [4, 48],
              [72, 48],
            ].map(([cx, cy], i) => (
              <path
                key={i}
                d={`M${cx - 3},${cy} L${cx + 3},${cy} M${cx},${cy - 3} L${cx},${cy + 3}`}
                stroke="#0d0d0c"
                strokeWidth="1.3"
              />
            ))}
            <text
              x="38"
              y="30"
              textAnchor="middle"
              fontFamily="var(--font-mono)"
              fontSize="11"
              fill="#0d0d0c"
              letterSpacing="0.02em"
            >
              ⌘v
            </text>
          </motion.svg>
        </motion.div>
      </section>

      <div className={styles.body}>
        {/* 01 — the idea */}
        <motion.section
          className={styles.section}
          style={{ borderTopColor: "#c9bce0" }}
          {...reveal}
        >
          <div
            className={styles.sectionNumber}
            style={{ background: "#c9bce0" }}
          >
            01 — the idea, and the why
          </div>
          <h2 className={styles.sectionTitle}>
            moodboards aren't the killer feature
          </h2>
          <p className={styles.prose}>
            don't get me wrong — figma is my main design tool, i genuinely love
            it. but there's a specific moment where it's the wrong tool for the
            job: i just want to drag a few references together, low stakes,
            nothing structural, and opening a full design file for that is like
            using a table saw to cut a piece of tape. the actual want underneath
            that is simple:{" "}
            <b>collect things fast, arrange them loosely, move on.</b>
          </p>
          <p className={styles.prose}>
            the reframe that made the product make sense: it's not a moodboard
            tool, it's a room. a moodboard implies a finished artifact you're
            building toward. a room is a space you keep walking back into. so
            the entry point isn't "create a new board" — it's opening the app to
            nothing, hitting <code>cmd+v</code>, and it's just there.
          </p>
          <div className={styles.callout}>
            <div className={styles.calloutLabel}>why it should exist</div>
            <p className={styles.prose}>
              most tools in this space pick a side: dead simple with almost no
              styling control, or fully styleable but heavier to open than a
              quick reference-drop deserves. cache is trying to hold
              paste-anything simplicity and real, figma-grade styling control at
              the same time — that combination is the actual gap, and it's the
              reason this kept going past the point of "just for me."
            </p>
          </div>
          <div className={styles.shotFrame}>
            <div className={styles.shotLabel}>
              <Image
                src="/screenshots/01-paste.png"
                alt="screenshot: the full patch UI — toolbar, canvas, and a real patch in progress, at real size"
                width={500}
                height={500}
              />
            </div>
          </div>
        </motion.section>

        {/* 02 — how it actually works */}
        <motion.section
          className={styles.section}
          style={{ borderTopColor: "#f5e6a8" }}
          {...reveal}
        >
          <div
            className={styles.sectionNumber}
            style={{ background: "#f5e6a8" }}
          >
            02 — how it actually works
          </div>
          <h2 className={styles.sectionTitle}>the happy path</h2>
          <p className={styles.prose}>
            not a click-through wireframe deck — this is the actual working app.
            every step below is something you can do right now on the live link.
          </p>

          <div className={styles.flowSteps}>
            <div className={styles.flowStep}>
              <div className={styles.flowStepNum}>01</div>
              <div>
                <div className={styles.flowStepTitle}>
                  open to nothing, paste something
                </div>
                <p className={styles.prose}>
                  no landing page, no "new project" button. copy any image or a
                  url and hit <code>cmd+v</code> directly on the patch — it
                  appears immediately as a card.
                </p>
              </div>
            </div>

            <div className={styles.flowStep}>
              <div className={styles.flowStepNum}>02</div>
              <div>
                <div className={styles.flowStepTitle}>arrange and style it</div>
                <p className={styles.prose}>
                  drag to move, drag the corner dot to resize, double-click text
                  to edit. select a piece and a style panel floats in — it isn't
                  a permanent sidebar, so the patch keeps the full page to
                  itself until something's actually selected. fill color uses a
                  custom in-app picker instead of the browser's native color
                  dialog; text pieces get a font picker (six presets plus your
                  own uploaded font file); every piece gets corner radius,
                  rotation, opacity, and layer order.
                </p>
              </div>
            </div>

            <div className={styles.flowStep}>
              <div className={styles.flowStepNum}>03</div>
              <div>
                <div className={styles.flowStepTitle}>
                  paste a link or drop a file
                </div>
                <p className={styles.prose}>
                  paste a raw url and it unfurls into a real card (title,
                  preview image, domain) via a small server route. drop a pdf
                  and it becomes an openable file card — both get an explicit
                  "open" button so opening them never fights with dragging them.
                </p>
                <div className={styles.shotFrame}>
                  <div className={styles.shotLabel}>
                    <Image
                      src="/screenshots/02-link-file-cards.gif"
                      alt="screenshot: a link card and a pdf file card on the patch"
                      width={500}
                      height={500}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.flowStep}>
              <div className={styles.flowStepNum}>04</div>
              <div>
                <div className={styles.flowStepTitle}>undo, delete, done</div>
                <p className={styles.prose}>
                  cmd/ctrl+z steps back through a real history (one undo per
                  gesture, not per pixel). delete/backspace removes the selected
                  piece. export as png, a self-contained html file (links and
                  files stay genuinely clickable), or pdf (with real clickable
                  link annotations, not just a flat picture).
                </p>
              </div>
            </div>
          </div>
        </motion.section>

        {/* 03 — the landscape */}
        <motion.section
          className={styles.section}
          style={{ borderTopColor: "#f0bfd0" }}
          {...reveal}
        >
          <div
            className={styles.sectionNumber}
            style={{ background: "#f0bfd0" }}
          >
            03 — the landscape
          </div>
          <h2 className={styles.sectionTitle}>where it sits</h2>
          <p className={styles.prose}>
            this space is more crowded than it looks from the outside. are.na,
            cosmos, milanote, mymind, pureref, and figma's own figjam are all
            circling the same territory — "visual, freeform, collect-anything."
            most of the obvious wedges are already taken.
          </p>
          <p className={styles.prose}>
            the gap that was actually open:{" "}
            <b>paste-anything simplicity + real, figma-grade styling control</b>
            , held at the same time. plenty of tools nail one side of that or
            the other — dead simple to start but little to no control over how
            things look, or fully styleable but heavier to open than the task
            deserves. this is trying to hold both at once.
          </p>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>tool</th>
                  <th>is for</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>pinterest</td>
                  <td>discovery</td>
                </tr>
                <tr>
                  <td>are.na</td>
                  <td>archives</td>
                </tr>
                <tr>
                  <td>cosmos</td>
                  <td>collecting</td>
                </tr>
                <tr>
                  <td>milanote</td>
                  <td>planning</td>
                </tr>
                <tr>
                  <td>figma / figjam</td>
                  <td>collaboration</td>
                </tr>
                <tr className={styles.tableSelf}>
                  <td>cache</td>
                  <td>personal visual thinking — paste in, style it, done</td>
                </tr>
              </tbody>
            </table>
          </div>
        </motion.section>

        {/* 04 — naming */}
        <motion.section
          className={styles.section}
          style={{ borderTopColor: "#c9bce0" }}
          {...reveal}
        >
          <div
            className={styles.sectionNumber}
            style={{ background: "#c9bce0" }}
          >
            04 — naming as a decision, not an afterthought
          </div>
          <h2 className={styles.sectionTitle}>patches, stashes, cached</h2>
          <p className={styles.prose}>
            every tool in this category names its unit of work differently —
            figma has files, are.na has channels, notion has pages, cosmos has
            clusters. picking a vocabulary on purpose, instead of defaulting to
            "board" and "save," was worth the extra round of naming work.
          </p>
          <div className={styles.vocabGrid}>
            <motion.div whileHover={{ y: -3 }} className={styles.vocabCell}>
              <div className={styles.vocabGeneric}>board / canvas</div>
              <div className={styles.vocabOwn}>patch</div>
            </motion.div>
            <motion.div whileHover={{ y: -3 }} className={styles.vocabCell}>
              <div className={styles.vocabGeneric}>folder</div>
              <div className={styles.vocabOwn}>stash</div>
            </motion.div>
            <motion.div whileHover={{ y: -3 }} className={styles.vocabCell}>
              <div className={styles.vocabGeneric}>saved</div>
              <div className={styles.vocabOwn}>cached</div>
            </motion.div>
          </div>
          <p className={styles.prose} style={{ marginTop: 20 }}>
            the product name went through a real shortlist first — found gems,
            swatch, patch, trinket — before landing on <b>cache</b>: short, and
            it does double duty as both "a stash of something valuable" and
            literally what a computer does to store things for fast retrieval.
            that it also folded neatly into "cached" as the save-state verb was
            a bonus, not the plan.
          </p>
          <p className={styles.prose} style={{ marginTop: 16 }}>
            the computer-science meaning isn't just a pun sitting on top of the
            name, either. a real cache is a small, fast store that sits between
            you and the thing you actually want, so the next time you reach for
            it, it's already close at hand instead of being re-fetched from
            wherever it originally lived. a patch works the same way — the
            references you just pulled together stay right where you left them,
            arranged, instead of needing to be found again each time you want to
            look at them together.
          </p>
          <p className={styles.prose} style={{ marginTop: 16 }}>
            there's a well-known line in computer science: there are only two
            hard problems — <i>cache invalidation</i> and <i>naming things</i>.
            this project ran straight into the second one, directly above. it
            mostly dodges the first — nothing in a patch needs to expire or get
            evicted the way a real cache does. the detail worth keeping, though:
            "cache" comes from the french <i>cacher</i>, to hide. the actual
            visual identity here does the opposite on purpose — a blank tag
            instead of a hidden logo. the name kept its function and inverted
            its origin.
          </p>
        </motion.section>

        {/* 05 — visual direction */}
        <motion.section
          className={styles.section}
          style={{ borderTopColor: "#f5e6a8" }}
          {...reveal}
        >
          <div
            className={styles.sectionNumber}
            style={{ background: "#f5e6a8" }}
          >
            05 — visual direction
          </div>
          <h2 className={styles.sectionTitle}>three passes to get here</h2>
          <p className={styles.prose}>
            the first pass leaned into my usual pastel poetronics palette —
            blush, matcha, wisteria, running-stitch borders. it looked fine and
            it looked like every other craft-adjacent tool in the space, cache
            included. the second pass just turned the saturation up. also fine,
            also still generic.
          </p>
          <p className={styles.prose}>
            the direction that actually stuck came from naming references
            outside the usual moodboard aesthetic entirely: <b>dieter rams</b>,
            for the belief that color and ornament should only show up where
            they're doing real work, not decorating it — and <b>margiela</b>,
            for treating the absence of a logo as the identity itself.
            translating that kind of restraint into actual interface decisions,
            instead of quoting either one literally, is what got this away from
            looking like every other tool in the category.
          </p>
          <div className={styles.evolution}>
            <motion.div
              whileHover={{ y: -6 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className={`${styles.evolutionStep} ${styles.rejected}`}
            >
              <div className={styles.evolutionSwatches}>
                <div
                  className={styles.evolutionSwatch}
                  style={{ background: "#f3d6d9" }}
                />
                <div
                  className={styles.evolutionSwatch}
                  style={{ background: "#c9d6ab" }}
                />
                <div
                  className={styles.evolutionSwatch}
                  style={{ background: "#cdc0e0" }}
                />
              </div>
              <div className={styles.evolutionLabel}>pass 01</div>
              <div className={styles.evolutionNote}>
                pastel, running-stitch borders. reads as craft-tool default.
              </div>
            </motion.div>
            <motion.div
              whileHover={{ y: -6 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className={`${styles.evolutionStep} ${styles.rejected}`}
            >
              <div className={styles.evolutionSwatches}>
                <div
                  className={styles.evolutionSwatch}
                  style={{ background: "#f2879e" }}
                />
                <div
                  className={styles.evolutionSwatch}
                  style={{ background: "#8fbb4a" }}
                />
                <div
                  className={styles.evolutionSwatch}
                  style={{ background: "#a678d1" }}
                />
              </div>
              <div className={styles.evolutionLabel}>pass 02</div>
              <div className={styles.evolutionNote}>
                same palette, more saturated. same problem, louder.
              </div>
            </motion.div>
            <motion.div
              whileHover={{ y: -6 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className={`${styles.evolutionStep} ${styles.evolutionFinal}`}
            >
              <div className={styles.evolutionSwatches}>
                <div
                  className={styles.evolutionSwatch}
                  style={{ background: "#1c1b19" }}
                />
                <div
                  className={styles.evolutionSwatch}
                  style={{ background: "#f8f6f0" }}
                />
                <div
                  className={styles.evolutionSwatch}
                  style={{ background: "#c9bce0" }}
                />
                <div
                  className={styles.evolutionSwatch}
                  style={{ background: "#f5e6a8" }}
                />
              </div>
              <div className={styles.evolutionLabel}>final direction</div>
              <div className={styles.evolutionNote}>
                dark chrome, bone paper canvas, sharp corners, one pastel accent
                per function.
              </div>
            </motion.div>
          </div>
          <p className={styles.prose} style={{ marginTop: 24 }}>
            two details carry most of the identity now. selection is a
            viewfinder-bracket mark instead of a soft dashed outline — sharp,
            technical, doubles as a pattern-cutting crop-mark reference. and
            every patch carries a small blank tag in the corner, standing in for
            a logo the way margiela's four-stitch blank tag stands in for one —
            deliberately arbitrary, so it never reads as a version number or a
            real system.
          </p>

          <h2
            className={styles.sectionTitle}
            style={{ marginTop: 40, fontSize: "clamp(24px, 4vw, 30px)" }}
          >
            the screen, at full fidelity
          </h2>
          <div className={styles.shotFrame} style={{ minHeight: 320 }}>
            <div className={styles.shotLabel}>
              <Image
                src="/screenshots/01-paste.png"
                alt="screenshot: the full patch UI — toolbar, canvas, and a real
              patch in progress, at real size"
                width={500}
                height={500}
              />
            </div>
          </div>

          <div className={styles.miniToolbar} style={{ marginTop: 32 }}>
            <span className={styles.miniBrand}>CACHE</span>
            <span className={styles.miniBtn}>text</span>
            <div className={styles.miniSwatchRow}>
              <div
                className={styles.miniSwatch}
                style={{ background: "#f8f6f0" }}
              />
              <div
                className={styles.miniSwatch}
                style={{ background: "#c9bce0" }}
              />
              <div
                className={styles.miniSwatch}
                style={{ background: "#f5e6a8" }}
              />
              <div
                className={styles.miniSwatch}
                style={{ background: "#f0bfd0" }}
              />
            </div>
            <span className={styles.miniBtn}>image</span>
            <span className={styles.miniBtn}>link</span>
            <span className={styles.miniBtn}>file</span>
          </div>

          <p className={styles.prose} style={{ marginTop: 24 }}>
            <b>
              the moodboard behind this direction was built inside cache itself
            </b>{" "}
            — pasting in product shots, the margiela tag, and instrument-panel
            references directly onto a patch, rather than moodboarding this in
            figma. partly to stay consistent with what the tool is actually for,
            partly because there's no better way to show a paste-first tool's
            taste than to use it that way.
          </p>
          <div>
            <div className={styles.shotFrame} style={{ minHeight: 320 }}>
              <div
                className={styles.shotLabel}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "24px",
                  width: "100%",
                  alignItems: "center",
                  padding: "10px",
                }}
              >
                <Image
                  src="/screenshots/04-braun.png"
                  alt="screenshot: the actual moodboard patch, exported from cache"
                  width={800}
                  height={500}
                  style={{ width: "100%", height: "auto", display: "block" }}
                />
                <Image
                  src="/screenshots/04-tag.png"
                  alt="screenshot: the actual moodboard patch, exported from cache"
                  width={800}
                  height={500}
                  style={{ width: "100%", height: "auto", display: "block" }}
                />
                <Image
                  src="/screenshots/04-instrument.gif"
                  alt="screenshot: the actual moodboard patch, exported from cache"
                  width={800}
                  height={500}
                  style={{ width: "100%", height: "auto", display: "block" }}
                />
              </div>
            </div>
          </div>
          <p
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 12,
              color: "rgba(13,13,12,0.5)",
              marginTop: 10,
              fontStyle: "italic",
            }}
          >
            (yes — this moodboard was made entirely inside cache. paste,
            arrange, export! :))
          </p>
          <div className={styles.refGrid}>
            <motion.div whileHover={{ y: -4 }} className={styles.refCard}>
              <div className={styles.refCardTitle}>
                dieter rams — braun products
              </div>
              <div className={styles.refCardNote}>
                color and ornament only where they do real work — the one pastel
                accent per function (lavender = selection, butter = the primary
                action, pink = resize) comes from this.
              </div>
            </motion.div>
            <motion.div whileHover={{ y: -4 }} className={styles.refCard}>
              <div className={styles.refCardTitle}>
                margiela — the blank tag
              </div>
              <div className={styles.refCardNote}>
                absence as identity. the patch mark carries no logo — just white
                fabric, black stitching, and a small embroidered ⌘v as the one
                wink at what the tool does.
              </div>
            </motion.div>
            <motion.div whileHover={{ y: -4 }} className={styles.refCard}>
              <div className={styles.refCardTitle}>
                instrument panels / hud readouts
              </div>
              <div className={styles.refCardNote}>
                the corner readout, the viewfinder-bracket selection marks, and
                the rotation control itself — a real dial you turn, not a slider
                wearing a costume — all come from the same place: technical
                displays, not soft craft-tool ui.
              </div>
            </motion.div>
          </div>
        </motion.section>

        {/* 06 — bugs */}
        <motion.section
          className={styles.section}
          style={{ borderTopColor: "#f0bfd0" }}
          {...reveal}
        >
          <div
            className={styles.sectionNumber}
            style={{ background: "#f0bfd0" }}
          >
            06 — four bugs worth naming
          </div>
          <h2 className={styles.sectionTitle}>what actually broke, and why</h2>
          <p className={styles.prose}>
            a case study that only shows the final state skips the part that's
            actually evidence of how someone builds. four real ones, in the
            order they surfaced — including one that took three wrong guesses
            before the actual fix.
          </p>

          <motion.div whileHover={{ y: -3 }} className={styles.bugCard}>
            <div className={styles.bugHeader}>
              <span className={styles.bugTitle}>sliders wouldn't drag</span>
              <span className={styles.bugTag} style={{ background: "#c9bce0" }}>
                react
              </span>
            </div>
            <div className={styles.bugBody}>
              <div className={styles.bugSymptom}>
                "i'm not able to drag the sliders to make adjustments, it's a
                bit finicky"
              </div>
              <p className={styles.prose}>
                the style panel's component was defined <i>inside</i> the parent
                component's function body. every slider <code>onChange</code>{" "}
                triggered a re-render, which gave react a brand-new component
                identity, which tore down and rebuilt the whole panel —
                including the native range input — mid-drag. the browser's own
                drag tracking never survived a single tick.
              </p>
              <div className={styles.codeBlock}>
                <span className={styles.del}>
                  const StylePanelContent = () =&gt; ( ... ) // recreated every
                  render
                </span>
                {"\n"}
                <span className={styles.add}>
                  function StylePanelContent({"{"} selected, updateElement, ...{" "}
                  {"}"}) {"{"} ... {"}"}
                </span>
                {"\n"}
                <span className={styles.add}>
                  {"// moved to module scope, props passed explicitly"}
                </span>
              </div>
              <p className={styles.prose}>
                moving it to module scope with explicit props fixed it
                structurally — not a css fix, not a browser quirk, an actual
                react anti-pattern with a specific name.
              </p>
            </div>
          </motion.div>

          <motion.div whileHover={{ y: -3 }} className={styles.bugCard}>
            <div className={styles.bugHeader}>
              <span className={styles.bugTitle}>
                pasted images "wouldn't move"
              </span>
              <span className={styles.bugTag} style={{ background: "#f5e6a8" }}>
                state
              </span>
            </div>
            <div className={styles.bugBody}>
              <div className={styles.bugSymptom}>
                "images when pasted are overlapping and i can't move them, they
                snap together"
              </div>
              <p className={styles.prose}>
                they weren't stuck — every pasted image landed at the exact same
                board-center coordinates, with zero offset. a second paste
                stacked precisely on top of the first, so any card you dragged
                away just got covered again by the next paste landing in that
                same spot. the fix was a cascading offset shared across paste,
                text-add, and color-block-add, so nothing spawns exactly on top
                of anything else.
              </p>
            </div>
          </motion.div>

          <motion.div whileHover={{ y: -3 }} className={styles.bugCard}>
            <div className={styles.bugHeader}>
              <span className={styles.bugTitle}>
                exporting a link card could break the whole png
              </span>
              <span className={styles.bugTag} style={{ background: "#f0bfd0" }}>
                canvas / cors
              </span>
            </div>
            <div className={styles.bugBody}>
              <p className={styles.prose}>
                link cards fetch a preview image from whatever site got pasted.
                drawing an external, cross-origin image onto a canvas without
                the right handling "taints" the canvas — the whole export throws
                a security error, not just that one card. setting{" "}
                <code>img.crossOrigin = "anonymous"</code> up front means a
                source without proper cors headers just fails to load cleanly
                (falls back to a blank card) instead of silently poisoning the
                entire download.
              </p>
            </div>
          </motion.div>

          <motion.div whileHover={{ y: -3 }} className={styles.bugCard}>
            <div className={styles.bugHeader}>
              <span className={styles.bugTitle}>
                background removal — three wrong guesses before the real one
              </span>
              <span className={styles.bugTag} style={{ background: "#f5e6a8" }}>
                next.js / webpack
              </span>
            </div>
            <div className={styles.bugBody}>
              <div className={styles.bugSymptom}>
                "background removal failed" — every time, on every browser, on
                both localhost and the deployed site.
              </div>
              <p className={styles.prose}>
                first guess: the library needs <code>SharedArrayBuffer</code>,
                which needs two response headers to cross-origin-isolate the
                page. added them, verified they actually landed with{" "}
                <code>curl -I</code> against a real production server. no
                change.
              </p>
              <p className={styles.prose}>
                second guess, and a real bug this time: every image here is a{" "}
                <code>data:</code> url, and the library's own check for "is this
                an absolute path" uses a regex requiring <code>//</code> right
                after the scheme — matches <code>http://</code>, not{" "}
                <code>data:</code>. it was reading every pasted image as a
                relative path and mangling it. found by installing the exact
                package version locally and grepping its source for every{" "}
                <code>.replace()</code> call until the actual line turned up.
                fixed it by converting to a blob first. the exact same error
                came back anyway.
              </p>
              <p className={styles.prose}>
                the real one: the crash was inside a different library entirely
                — <code>onnxruntime-web</code>, the ml runtime behind background
                removal — in a function called <code>RelativeURL</code>, trying
                to locate its own wasm file. webpack was rewriting that
                function's internal <code>import.meta.url</code> reference into
                something that isn't a plain string anymore, and the library's
                own url-building code broke on it. that's exactly the subsystem
                the library's own docs warn about: "currently only next.js 15 is
                supported." this was running on 14.
              </p>
              <p className={styles.prose}>
                the fix, after upgrading: load the library from a cdn url with a{" "}
                <code>webpackIgnore</code> comment instead of importing it
                locally. webpack never touches a webpack-ignored import, so it
                never rewrites anything inside it — the bug simply has nothing
                left to attach to.
              </p>
            </div>
          </motion.div>
        </motion.section>

        {/* 07 — stack */}
        <motion.section
          className={styles.section}
          style={{ borderTopColor: "#c9bce0" }}
          {...reveal}
        >
          <div
            className={styles.sectionNumber}
            style={{ background: "#c9bce0" }}
          >
            07 — stack
          </div>
          <h2 className={styles.sectionTitle}>what's built, what's roadmap</h2>
          <div className={styles.stackList}>
            <div className={styles.stackRow}>
              <div className={styles.stackKey}>frontend</div>
              <div className={styles.stackVal}>
                next.js, react, plain css modules — no tailwind, no build-time
                class generation.
              </div>
            </div>
            <div className={styles.stackRow}>
              <div className={styles.stackKey}>canvas</div>
              <div className={styles.stackVal}>
                hand-rolled drag/resize/select logic in this prototype; the
                planned swap is tldraw — purpose-built for freeform shapes with
                pan/zoom/undo for free, instead of reinventing canvas primitives
                by hand.
              </div>
            </div>
            <div className={styles.stackRow}>
              <div className={styles.stackKey}>sharing</div>
              <div className={styles.stackVal}>
                currently a base64 snapshot packed into the url hash — zero
                backend, but it doesn't scale past small boards. real
                persistence is a guest-editable board id in postgres (supabase),
                same no-account-required ux, actual database underneath.
              </div>
            </div>
            <div className={styles.stackRow}>
              <div className={styles.stackKey}>links</div>
              <div className={styles.stackVal}>
                one small server route (<code>/api/unfurl</code>) fetches
                og:title/og:image server-side — the one place this "no backend"
                app actually needs a sliver of one, since a browser can't fetch
                an arbitrary third-party page directly.
              </div>
            </div>
            <div className={styles.stackRow}>
              <div className={styles.stackKey}>export</div>
              <div className={styles.stackVal}>
                one shared canvas-rendering function powers both png and pdf
                export; pdf adds real clickable link annotations on top via
                jspdf (mit licensed). html export embeds everything — images,
                files, custom fonts — as a single self-contained file.
              </div>
            </div>
            <div className={styles.stackRow}>
              <div className={styles.stackKey}>fonts</div>
              <div className={styles.stackVal}>
                six presets self-hosted via <code>next/font/google</code>, plus
                custom font upload (woff/woff2/ttf/otf) injected as real{" "}
                <code>@font-face</code> rules. canvas exports call{" "}
                <code>document.fonts.load()</code> before drawing so the export
                always matches what's on screen.
              </div>
            </div>
          </div>
        </motion.section>

        {/* 09 — what's next */}
        <motion.section
          className={styles.section}
          style={{ borderTopColor: "#f5e6a8" }}
          {...reveal}
        >
          <div
            className={styles.sectionNumber}
            style={{ background: "#f5e6a8" }}
          >
            08 — edge cases and what's next
          </div>
          <h2 className={styles.sectionTitle}>the honest roadmap</h2>
          <p className={styles.prose}>
            not yet built, on purpose: <b>selecting an arbitrary subset</b> of
            pieces — right now selection is all-or-one (select-all, or click a
            single piece), with no shift-click or rubber-band way to grab just
            three specific pieces out of ten. Also missing:{" "}
            <b>live group-dragging</b> — a full selection can be copied and
            pasted back as a group, keeping every piece's position relative to
            the others, but there's no way yet to grab several selected pieces
            and drag them together with the mouse in real time; dragging still
            only ever moves one piece. Beyond that: stashes, the folder layer
            above a single patch, once the core loop has been used by more than
            one person; connections and flows between pieces, which stay
            explicitly out of scope until the basic loop is proven; and moving
            sharing off the url hash and onto real storage once boards start
            carrying real files.
          </p>
        </motion.section>
      </div>

      <footer className={styles.footer}>
        <a href="/">try cache ↗</a> ·{" "}
        <a href="https://github.com/yafira/cache">source ↗</a>
      </footer>
    </div>
  );
}
