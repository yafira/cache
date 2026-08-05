import CaseStudyClient from "./CaseStudyClient";

export const metadata = {
  title: "cache — case study",
  description: "a paste-first moodboard tool, and the decisions behind it",
  openGraph: {
    title: "cache — case study",
    description: "a paste-first moodboard tool, and the decisions behind it",
    url: "https://cachecraft.io/case-study",
    images: ["/cache-og-image.png"],
  },
};

export default function CaseStudy() {
  return <CaseStudyClient />;
}
