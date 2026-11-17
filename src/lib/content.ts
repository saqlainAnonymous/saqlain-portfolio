/**
 * ══════════════════════════════════════════════════════════════
 *  EDIT YOUR INFO HERE — every identity detail lives in this file.
 *  Swap these values and the whole site updates.
 * ══════════════════════════════════════════════════════════════
 */

export const SITE = {
  name: "Saqlain Shah",
  brand: "SAQLAIN", // nav logo mark
  role: "AI Enthusiast & Developer",
  location: "Abbottabad, Pakistan",
  availability: "Open to remote opportunities",
  tagline:
    "I build things at the intersection of technology, artificial intelligence, creativity, and problem-solving.",
  // only profiles that actually exist are listed here
  socials: [
    { label: "GitHub", url: "https://github.com/saqlainAnonymous" },
  ],
};

export type Project = {
  slug: string;
  index: string;
  title: string;
  /** shown in the card's meta slot — honest state, not a fabricated year */
  status: string;
  role: string;
  stack: string[];
  blurb: string;
  description: string[];
  /** only verified destinations */
  links?: { label: string; url: string }[];
  /** gradient pair for the placeholder art block */
  art: [string, string];
};

const GITHUB = "https://github.com/saqlainAnonymous";

export const PROJECTS: Project[] = [
  {
    slug: "github-profile-analyzer",
    index: "01",
    title: "GitHub Profile Analyzer",
    status: "Personal project",
    role: "Developer",
    stack: ["Python", "Streamlit", "GitHub API"],
    blurb:
      "A tool that reads a GitHub profile and presents developer activity and profile insights through an accessible interface.",
    description: [
      "GitHub Profile Analyzer is a tool I built to make GitHub profiles easier to read. Point it at a profile and it pulls together the public activity behind the numbers, then lays it out in one clear, accessible interface instead of scattered across tabs.",
      "The aim is simple: help anyone understand what a developer actually builds. It is an ongoing personal project, and I keep refining what is surfaced and how it is presented.",
    ],
    links: [{ label: "GitHub profile", url: GITHUB }],
    art: ["#1b1712", "#d9a951"],
  },
  {
    slug: "repodoctor",
    index: "02",
    title: "RepoDoctor",
    status: "Open source",
    role: "Open-source project",
    stack: ["GitHub", "Developer tooling", "Open source"],
    blurb:
      "An open-source project that helps developers find problems in their repositories and improve them.",
    description: [
      "RepoDoctor is an open-source project focused on repository health. It helps developers identify issues in their GitHub repositories and understand what to fix, so a project is easier for the next person to pick up.",
      "The work happens in the open: the repository is public, and the project grows one issue at a time.",
    ],
    links: [{ label: "GitHub profile", url: GITHUB }],
    art: ["#12121a", "#9aa3b5"],
  },
  {
    slug: "saqlain-decodes",
    index: "03",
    title: "SAQLAIN DECODES",
    status: "Ongoing",
    role: "Creator & researcher",
    stack: ["Documentary", "Research", "Digital storytelling"],
    blurb:
      "A documentary and educational brand exploring technology, global developments, economics, society and the stories behind them.",
    description: [
      "SAQLAIN DECODES is my documentary and educational content brand. It explores technology, global developments, economics, society and the important stories that connect them — researched, written and produced as digital media.",
      "The work sits where research meets storytelling: following a question until it makes sense, then explaining it clearly to people who do not have the time to read everything.",
    ],
    art: ["#140e0e", "#e05c4c"],
  },
];

/**
 * No proficiency percentages: the stack is a map of what I work with,
 * grouped the way I actually think about it.
 */
export const SKILLS: { name: string; category: string }[] = [
  { name: "Python", category: "Programming" },
  { name: "JavaScript", category: "Programming" },
  { name: "HTML", category: "Programming" },
  { name: "CSS", category: "Programming" },

  { name: "Git & GitHub", category: "Development" },
  { name: "VS Code", category: "Development" },
  { name: "Streamlit", category: "Development" },
  { name: "Web Development", category: "Development" },

  { name: "Artificial Intelligence", category: "AI & Technology" },
  { name: "AI-powered tools", category: "AI & Technology" },
  { name: "Prompt Engineering", category: "AI & Technology" },
  { name: "AI-assisted workflows", category: "AI & Technology" },
  { name: "Emerging AI technologies", category: "AI & Technology" },

  { name: "Documentary Research", category: "Creative" },
  { name: "Content Creation", category: "Creative" },
  { name: "Digital Storytelling", category: "Creative" },
  { name: "Video Production", category: "Creative" },
];

/**
 * Short facts, not achievements — nothing here claims experience,
 * clients or awards that do not exist.
 */
export const STATS: { value: string; label: string }[] = [
  { value: "PK", label: "Abbottabad, Pakistan" },
  { value: "AI", label: "Core focus" },
  { value: "OSS", label: "Open source" },
  { value: "∞", label: "Always learning" },
];
