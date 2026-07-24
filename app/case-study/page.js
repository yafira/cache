import styles from "./case-study.module.css";

export const metadata = {
  title: "cache — case study",
  description: "a paste-first moodboard tool, and the decisions behind it",
};

export default function CaseStudy() {
  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.heroEyebrow}>case study</div>
          <h1 className={styles.heroTitle}>cache</h1>
          <p className={styles.heroThesis}>
            a moodboard tool for people who dread opening figma just to arrange
            references. paste anything — an image, a link, a pdf — and it's
            already on the board. no account, no "create new project" dialog, no
            auto layout to fight with.
          </p>
          <div className={styles.heroMeta}>
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
          </div>

          <svg
            width="76"
            height="52"
            viewBox="0 0 76 52"
            className={styles.tag}
          >
            <rect
              x="1"
              y="1"
              width="74"
              height="50"
              rx="3"
              fill="#d9cfb0"
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
              strokeWidth="1.2"
              strokeDasharray="2 3"
              strokeLinecap="round"
              opacity="0.6"
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
                strokeWidth="1"
              />
            ))}
          </svg>
        </div>
      </section>

      <div className={styles.body}>
        {/* 01 — the idea */}
        <section className={styles.section}>
          <div className={styles.sectionNumber}>01 — the idea</div>
          <h2 className={styles.sectionTitle}>
            moodboards aren't the killer feature
          </h2>
          <p className={styles.prose}>
            i like making moodboards for my own projects, and i find it dreadful
            every time — opening figma just to drag some references around feels
            like using a table saw to cut a piece of tape. the actual want
            underneath that is simple:{" "}
            <b>collect things fast, arrange them loosely, move on.</b>
          </p>
          <p className={styles.prose}>
            the reframe that made the product make sense: it's not a moodboard
            tool, it's a room. a moodboard implies a finished artifact you're
            building toward. a room is a space you keep walking back into. so
            the entry point isn't "create a new board" — it's opening the app to
            nothing, hitting <code>cmd+v</code>, and it's just there.
          </p>
          <div className={styles.shotFrame}>
            <div className={styles.shotLabel}>
              [ screenshot: empty patch, cursor mid-paste, first card landing ]
            </div>
          </div>
        </section>

        {/* 02 — the landscape */}
        <section className={styles.section}>
          <div className={styles.sectionNumber}>02 — the landscape</div>
          <h2 className={styles.sectionTitle}>where it sits</h2>
          <p className={styles.prose}>
            this space is more crowded than it looks from the outside. are.na,
            cosmos, milanote, mymind, kinopio, pureref, and figma's own figjam
            are all circling the same territory — "visual, freeform,
            collect-anything." most of the obvious wedges are already taken.
          </p>
          <p className={styles.prose}>
            the one that wasn't: kinopio deliberately gives you almost no
            styling control — that's the whole point of it, a place to think
            without fussing over how it looks. that's the exact opposite of what
            i wanted. the actual gap was{" "}
            <b>paste-anything simplicity + real, figma-grade styling control</b>{" "}
            — nobody else was doing both at once.
          </p>
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
        </section>

        {/* 03 — naming */}
        <section className={styles.section}>
          <div className={styles.sectionNumber}>
            03 — naming as a decision, not an afterthought
          </div>
          <h2 className={styles.sectionTitle}>patches, stashes, cached</h2>
          <p className={styles.prose}>
            every tool in this category names its unit of work differently —
            figma has files, are.na has channels, notion has pages, cosmos has
            clusters. picking a vocabulary on purpose, instead of defaulting to
            "board" and "save," was worth the extra round of naming work.
          </p>
          <div className={styles.vocabGrid}>
            <div className={styles.vocabCell}>
              <div className={styles.vocabGeneric}>board / canvas</div>
              <div className={styles.vocabOwn}>patch</div>
            </div>
            <div className={styles.vocabCell}>
              <div className={styles.vocabGeneric}>folder</div>
              <div className={styles.vocabOwn}>stash</div>
            </div>
            <div className={styles.vocabCell}>
              <div className={styles.vocabGeneric}>saved</div>
              <div className={styles.vocabOwn}>cached</div>
            </div>
          </div>
          <p className={styles.prose} style={{ marginTop: 20 }}>
            the product name went through a real shortlist first — found gems,
            swatch, patch, trinket — before landing on <b>cache</b>: short, and
            it does double duty as both "a stash of something valuable" and
            literally what a computer does to store things for fast retrieval.
            that it also folded neatly into "cached" as the save-state verb was
            a bonus, not the plan.
          </p>
        </section>

        {/* 04 — visual direction */}
        <section className={styles.section}>
          <div className={styles.sectionNumber}>04 — visual direction</div>
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
            outside the usual moodboard aesthetic entirely — dieter rams, rick
            owens, margiela — and translating restraint and monochrome into
            actual interface decisions instead of literal fashion references.
          </p>
          <div className={styles.evolution}>
            <div className={`${styles.evolutionStep} ${styles.rejected}`}>
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
              <div className={styles.evolutionLabel}>pass 1 — poetronics</div>
              <div className={styles.evolutionNote}>
                pastel, running-stitch borders. reads as craft-tool default.
              </div>
            </div>
            <div className={`${styles.evolutionStep} ${styles.rejected}`}>
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
              <div className={styles.evolutionLabel}>pass 2 — vibrant</div>
              <div className={styles.evolutionNote}>
                same palette, more saturated. same problem, louder.
              </div>
            </div>
            <div className={`${styles.evolutionStep} ${styles.evolutionFinal}`}>
              <div className={styles.evolutionSwatches}>
                <div
                  className={styles.evolutionSwatch}
                  style={{ background: "#1c1b19" }}
                />
                <div
                  className={styles.evolutionSwatch}
                  style={{ background: "#e7e2d6" }}
                />
                <div
                  className={styles.evolutionSwatch}
                  style={{ background: "#c9bce0" }}
                />
                <div
                  className={styles.evolutionSwatch}
                  style={{ background: "#f2d675" }}
                />
              </div>
              <div className={styles.evolutionLabel}>
                final — rams / owens / margiela
              </div>
              <div className={styles.evolutionNote}>
                dark chrome, bone paper canvas, sharp corners, one pastel accent
                per function.
              </div>
            </div>
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
          <div className={styles.miniToolbar}>
            <span className={styles.miniBrand}>CACHE</span>
            <span className={styles.miniBtn}>text</span>
            <div className={styles.miniSwatchRow}>
              <div
                className={styles.miniSwatch}
                style={{ background: "#e7e2d6" }}
              />
              <div
                className={styles.miniSwatch}
                style={{ background: "#c9bce0" }}
              />
              <div
                className={styles.miniSwatch}
                style={{ background: "#f2d675" }}
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
        </section>

        {/* 05 — bugs */}
        <section className={styles.section}>
          <div className={styles.sectionNumber}>
            05 — three bugs worth naming
          </div>
          <h2 className={styles.sectionTitle}>what actually broke, and why</h2>
          <p className={styles.prose}>
            a case study that only shows the final state skips the part that's
            actually evidence of how someone builds. three real ones, in the
            order they surfaced.
          </p>

          <div className={styles.bugCard}>
            <div className={styles.bugHeader}>
              <span className={styles.bugTitle}>sliders wouldn't drag</span>
              <span className={styles.bugTag}>react</span>
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
          </div>

          <div className={styles.bugCard}>
            <div className={styles.bugHeader}>
              <span className={styles.bugTitle}>
                pasted images "wouldn't move"
              </span>
              <span className={styles.bugTag}>state</span>
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
          </div>

          <div className={styles.bugCard}>
            <div className={styles.bugHeader}>
              <span className={styles.bugTitle}>
                exporting a link card could break the whole png
              </span>
              <span className={styles.bugTag}>canvas / cors</span>
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
          </div>
        </section>

        {/* 06 — judgment call */}
        <section className={styles.section}>
          <div className={styles.sectionNumber}>06 — a judgment call</div>
          <h2 className={styles.sectionTitle}>
            catching a license before it shipped
          </h2>
          <div className={styles.callout}>
            <div className={styles.calloutLabel}>
              flagged, not silently shipped
            </div>
            <p className={styles.prose}>
              background removal for images runs on{" "}
              <code>@imgly/background-removal</code> — a real, client-side ml
              model, no backend needed. it's also licensed agpl-3.0. running
              agpl code in a network-facing app generally means the whole app's
              source has to be released under agpl too, unless a commercial
              license gets purchased from the vendor. for a project headed
              toward an actual kickstarter, that's not a detail to bury in a
              changelog — it's a decision that needs to be made on purpose
              before this ships past a personal prototype.
            </p>
          </div>
        </section>

        {/* 07 — stack */}
        <section className={styles.section}>
          <div className={styles.sectionNumber}>07 — stack</div>
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
          </div>
        </section>

        {/* 08 — what's next */}
        <section className={styles.section}>
          <div className={styles.sectionNumber}>08 — what's next</div>
          <h2 className={styles.sectionTitle}>the honest roadmap</h2>
          <p className={styles.prose}>
            resolve the agpl question before anything public. move sharing off
            the url hash and onto real storage once boards start carrying real
            files. add stashes — the folder layer above a single patch — once
            the core paste-arrange-export loop has been used by more than one
            person. connections and flows between pieces stay explicitly out of
            scope until the basic loop is proven.
          </p>
        </section>
      </div>

      <footer className={styles.footer}>
        built in the open. <a href="/">back to the patch →</a>
      </footer>
    </div>
  );
}
