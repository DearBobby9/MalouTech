export const assetPath = (path) => `${import.meta.env.BASE_URL}${path}`;

const paperImage = (slug, imageAspect) => {
  const large = assetPath(`assets/papers/display/${slug}.webp`);
  const medium = assetPath(`assets/papers/display/${slug}-720.webp`);
  const small = assetPath(`assets/papers/display/${slug}-420.webp`);

  return {
    image: large,
    imageMedium: medium,
    imageSmall: small,
    imageSrcSet: `${small} 420w, ${medium} 720w, ${large} 1400w`,
    imageAspect,
  };
};

export const papers = [
  {
    title:
      "MACE-Dance: Motion-Appearance Cascaded Experts for Music-Driven Dance Video Generation",
    venue: "SIGGRAPH 2026",
    type: "Motion + Appearance",
    ...paperImage("mace-dance", 1400 / 627),
    authors:
      "Kaixing Yang, Jiashu Zhu, Xulong Tang, Ziqiao Peng, Xiangyue Zhang, Puwei Wang, Jiahong Wu, Xiangxiang Chu, Hongyan Liu, Jun He",
    contribution:
      "Cascaded experts separate motion reasoning and appearance fidelity for music-driven dance video generation.",
    themes: ["AI Motion", "Dance Generation", "Video"],
    evidence: {
      signal: "Music input",
      method: "Motion-appearance cascaded experts",
      output: "Dance video generation",
      artifacts: "Paper, project, code",
    },
    links: [
      { label: "Paper", href: "https://arxiv.org/abs/2512.18181" },
      { label: "Project", href: "https://sun-happy-ykx.github.io/MACE-Dance/" },
      { label: "Code", href: "https://github.com/AMAP-ML/MACE-Dance" },
    ],
    assetCredit: "Publication preview from Xulong Tang's homepage",
    accent: "amber",
  },
  {
    title: "Personalized Dance Synthesis Based on Physical and Cognitive Intensities",
    venue: "IEEE VR 2026",
    type: "XR Motion",
    ...paperImage("personalized-dance", 1400 / 383),
    authors: "Xulong Tang, Eun Yeo, Ruiyu Mao, Xiaohu Guo, Rawan Alghofaili",
    contribution:
      "Connects personalized dance synthesis with physical and cognitive intensity for XR-facing motion systems.",
    themes: ["XR", "Human Motion", "Personalization"],
    evidence: {
      signal: "Physical and cognitive intensities",
      method: "Personalized dance synthesis",
      output: "XR-facing motion system",
      artifacts: "Project page",
    },
    links: [{ label: "Project", href: "https://xulongt.github.io/ARDance26/" }],
    assetCredit: "Publication preview from Xulong Tang's homepage",
    accent: "cyan",
  },
  {
    title: "TokenDance: Token-to-Token Music-to-Dance Generation with Bidirectional Mamba",
    venue: "CVPR Workshop 2026",
    type: "Token Motion",
    ...paperImage("token-dance", 1400 / 426),
    authors: "Ziyue Yang, Kaixing Yang, Xulong Tang",
    contribution:
      "Frames music-to-dance generation as token-to-token sequence modeling with bidirectional temporal structure.",
    themes: ["AI Motion", "Multimodal Learning", "Sequence Modeling"],
    evidence: {
      signal: "Music and motion tokens",
      method: "Token-to-token Bidirectional Mamba",
      output: "Music-to-dance generation",
      artifacts: "Publication preview",
    },
    links: [],
    assetCredit: "Publication preview from Xulong Tang's homepage",
    accent: "amber",
  },
  {
    title: "MEGADance: Mixture-of-Experts Architecture for Genre-Aware 3D Dance Generation",
    venue: "NeurIPS 2025",
    type: "Mixture of Experts",
    ...paperImage("megadance", 1400 / 767),
    authors: "Kaixing Yang*, Xulong Tang*, Ziqiao Peng, Yuxuan Hu, Jun He, Hongyan Liu",
    contribution:
      "Uses mixture-of-experts modeling to generate genre-aware 3D dance motion.",
    themes: ["3D Motion", "Dance Generation", "Generative Models"],
    evidence: {
      signal: "Genre-aware dance input",
      method: "Mixture-of-experts architecture",
      output: "3D dance generation",
      artifacts: "Paper, code",
    },
    links: [
      { label: "Paper", href: "https://openreview.net/pdf/16fa3852729d55b9ccb266a7467e35baa1439a7c.pdf" },
      { label: "Code", href: "https://github.com/XulongT/MEGADance" },
    ],
    assetCredit: "Publication preview from Xulong Tang's homepage",
    accent: "cyan",
  },
  {
    title: "CoheDancers: Interactive Group Dance Generation via Music-Driven Coherence Decomposition",
    venue: "ACM MM 2025",
    type: "Group Coherence",
    ...paperImage("cohedancers", 1400 / 363),
    authors: "Kaixing Yang*, Xulong Tang*, Haoyu Wu, Qinliang Xue, Biao Qin, Hongyan Liu, Zhaoxin Fan",
    contribution:
      "Decomposes group coherence so interactive dance generation can preserve ensemble structure.",
    themes: ["Group Motion", "Music-Driven Generation", "Interaction"],
    evidence: {
      signal: "Music-driven group motion",
      method: "Coherence decomposition",
      output: "Interactive group dance generation",
      artifacts: "Paper, code",
    },
    links: [
      { label: "Paper", href: "https://dl.acm.org/doi/epdf/10.1145/3746027.3755267" },
      { label: "Code", href: "https://github.com/XulongT/CoheDancers" },
    ],
    assetCredit: "Publication preview from Xulong Tang's homepage",
    accent: "rust",
  },
  {
    title: "CoDancers: Music-Driven Coherent Group Dance Generation with Choreographic Unit",
    venue: "ICMR 2024",
    type: "Group Dance",
    ...paperImage("codancers", 1400 / 730),
    authors: "Kaixing Yang*, Xulong Tang*, Ran Diao, Hongyan Liu, Jun He, Zhaoxin Fan",
    contribution:
      "Models choreographic units to improve coherence in music-driven group dance generation.",
    themes: ["Group Motion", "Retrieval", "Dance Generation"],
    evidence: {
      signal: "Music and choreographic units",
      method: "Choreographic unit modeling",
      output: "Coherent group dance generation",
      artifacts: "Paper, code",
    },
    links: [
      { label: "Paper", href: "https://dl.acm.org/doi/epdf/10.1145/3652583.3657998" },
      { label: "Code", href: "https://github.com/XulongT/CoDancers" },
    ],
    assetCredit: "Publication preview from Xulong Tang's homepage",
    accent: "amber",
  },
  {
    title: "BeatDance: A Beat-Based Model-Agnostic Contrastive Learning Framework for Music-Dance Retrieval",
    venue: "ICMR 2024",
    type: "Retrieval",
    ...paperImage("beatdance", 1400 / 533),
    authors: "Kaixing Yang, Xukun Zhou, Xulong Tang, Ran Diao, Hongyan Liu, Jun He, Zhaoxin Fan",
    contribution:
      "Uses beat-aligned contrastive learning to improve music-dance retrieval across model families.",
    themes: ["Multimedia Retrieval", "Music-Dance Alignment", "Evaluation"],
    evidence: {
      signal: "Beat-aligned music and dance",
      method: "Model-agnostic contrastive learning",
      output: "Music-dance retrieval",
      artifacts: "Paper, code",
    },
    links: [
      { label: "Paper", href: "https://dl.acm.org/doi/epdf/10.1145/3652583.3658045" },
      { label: "Code", href: "https://github.com/XulongT/BeatDance" },
    ],
    assetCredit: "Publication preview from Xulong Tang's homepage",
    accent: "rust",
  },
];

export const pillars = [
  {
    title: "Signals",
    detail: "Music, pose, image, text, and interaction traces become structured inputs for generative research.",
    metric: "input",
    evidence: [1, 2, 6],
  },
  {
    title: "Representations",
    detail: "Kinematic structure, temporal coherence, and multimodal context are shaped before generation.",
    metric: "latent",
    evidence: [3, 5, 4],
  },
  {
    title: "Models",
    detail: "Dance generation systems route music, motion, appearance, and group coherence through specialized model paths.",
    metric: "model",
    evidence: [0, 3, 2],
  },
  {
    title: "Artifacts",
    detail: "Papers, code, project pages, and visual results stay visible as the public evidence layer.",
    metric: "proof",
    evidence: [0, 1, 4],
  },
];

export const publicationNews = [
  {
    date: "2026.03",
    title: "SIGGRAPH 2026 conditional acceptance",
    detail: "MACE-Dance was conditionally accepted at SIGGRAPH 2026.",
    evidence: [0],
  },
  {
    date: "2026.03",
    title: "CVPR Workshop 2026 acceptance",
    detail: "TokenDance was accepted at CVPR Workshop 2026.",
    evidence: [2],
  },
  {
    date: "2026.01",
    title: "IEEE VR 2026 acceptance",
    detail: "Personalized Dance Synthesis was accepted at IEEE VR 2026.",
    evidence: [1],
  },
  {
    date: "2025.09",
    title: "NeurIPS 2025 acceptance",
    detail: "MEGADance was accepted at NeurIPS 2025.",
    evidence: [3],
  },
  {
    date: "2025.07",
    title: "ACM Multimedia 2025 acceptance",
    detail: "CoheDancers was accepted at ACM Multimedia 2025.",
    evidence: [4],
  },
  {
    date: "2024.06",
    title: "ICMR 2024 acceptances",
    detail: "CoDancers and BeatDance were accepted at ICMR 2024.",
    evidence: [5, 6],
  },
];

export const people = [
  {
    name: "Xulong Tang",
    role: "CEO & Co-Founder",
    detail:
      "Computer scientist specializing in multimodal learning, multimedia retrieval, and extended reality.",
  },
  {
    name: "Kaixing Yang",
    role: "CTO & Co-Founder",
    detail:
      "Research collaborator across dance generation, group motion, and retrieval systems in the publication record.",
  },
];

export const contactLinks = [
  { label: "General email", value: "admin@maloutech.com", href: "mailto:admin@maloutech.com" },
  { label: "Research email", value: "xulong.tang@maloutech.com", href: "mailto:xulong.tang@maloutech.com" },
  { label: "GitHub", value: "MalouTech", href: "https://github.com/MalouTech" },
  { label: "X / Twitter", value: "@Malou_Tech_Inc", href: "https://twitter.com/Malou_Tech_Inc" },
  { label: "Instagram", value: "@Malou_Tech_Inc", href: "https://www.instagram.com/Malou_Tech_Inc" },
  { label: "LinkedIn", value: "@Malou_Tech_Inc", href: "https://www.linkedin.com/company/malou-tech-inc/about/" },
];
