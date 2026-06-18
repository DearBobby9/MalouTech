export const papers = [
  {
    title:
      "MACE-Dance: Motion-Appearance Cascaded Experts for Music-Driven Dance Video Generation",
    venue: "SIGGRAPH 2026",
    type: "Motion + Appearance",
    image: "/assets/papers/display/mace-dance.png",
    authors:
      "Kaixing Yang, Jiashu Zhu, Xulong Tang, Ziqiao Peng, Xiangyue Zhang, Puwei Wang, Jiahong Wu, Xiangxiang Chu, Hongyan Liu, Jun He",
    contribution:
      "Cascaded experts separate motion reasoning and appearance fidelity for music-driven dance video generation.",
    themes: ["AI Motion", "Dance Generation", "Video"],
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
    image: "/assets/papers/display/personalized-dance.png",
    authors: "Xulong Tang, Eun Yeo, Ruiyu Mao, Xiaohu Guo, Rawan Alghofaili",
    contribution:
      "Connects personalized dance synthesis with physical and cognitive intensity for XR-facing motion systems.",
    themes: ["XR", "Human Motion", "Personalization"],
    links: [{ label: "Project", href: "https://xulongt.github.io/ARDance26/" }],
    assetCredit: "Publication preview from Xulong Tang's homepage",
    accent: "cyan",
  },
  {
    title: "TokenDance: Token-to-Token Music-to-Dance Generation with Bidirectional Mamba",
    venue: "CVPR Workshop 2026",
    type: "Token Motion",
    image: "/assets/papers/display/token-dance.png",
    authors: "Ziyue Yang, Kaixing Yang, Xulong Tang",
    contribution:
      "Frames music-to-dance generation as token-to-token sequence modeling with bidirectional temporal structure.",
    themes: ["AI Motion", "Multimodal Learning", "Sequence Modeling"],
    links: [],
    assetCredit: "Publication preview from Xulong Tang's homepage",
    accent: "amber",
  },
  {
    title: "MEGADance: Mixture-of-Experts Architecture for Genre-Aware 3D Dance Generation",
    venue: "NeurIPS 2025",
    type: "Mixture of Experts",
    image: "/assets/papers/display/megadance.png",
    authors: "Kaixing Yang*, Xulong Tang*, Ziqiao Peng, Yuxuan Hu, Jun He, Hongyan Liu",
    contribution:
      "Uses mixture-of-experts modeling to generate genre-aware 3D dance motion.",
    themes: ["3D Motion", "Dance Generation", "Generative Models"],
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
    image: "/assets/papers/display/cohedancers.png",
    authors: "Kaixing Yang*, Xulong Tang*, Haoyu Wu, Qinliang Xue, Biao Qin, Hongyan Liu, Zhaoxin Fan",
    contribution:
      "Decomposes group coherence so interactive dance generation can preserve ensemble structure.",
    themes: ["Group Motion", "Music-Driven Generation", "Interaction"],
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
    image: "/assets/papers/display/codancers.png",
    authors: "Kaixing Yang*, Xulong Tang*, Ran Diao, Hongyan Liu, Jun He, Zhaoxin Fan",
    contribution:
      "Models choreographic units to improve coherence in music-driven group dance generation.",
    themes: ["Group Motion", "Retrieval", "Dance Generation"],
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
    image: "/assets/papers/display/beatdance.png",
    authors: "Kaixing Yang, Xukun Zhou, Xulong Tang, Ran Diao, Hongyan Liu, Jun He, Zhaoxin Fan",
    contribution:
      "Uses beat-aligned contrastive learning to improve music-dance retrieval across model families.",
    themes: ["Multimedia Retrieval", "Music-Dance Alignment", "Evaluation"],
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
  },
  {
    title: "Representations",
    detail: "Kinematic structure, temporal coherence, and multimodal context are shaped before generation.",
    metric: "latent",
  },
  {
    title: "Models",
    detail: "Dance generation systems route music, motion, appearance, and group coherence through specialized model paths.",
    metric: "model",
  },
  {
    title: "Artifacts",
    detail: "Papers, code, project pages, and visual results stay visible as the public evidence layer.",
    metric: "proof",
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
      "Research collaborator across dance generation, group motion, and retrieval systems in the publication seed list.",
  },
];

export const contactLinks = [
  { label: "General email", value: "admin@maloutech.com", href: "mailto:admin@maloutech.com" },
  { label: "Research email", value: "xulong.tang@maloutech.com", href: "mailto:xulong.tang@maloutech.com" },
  { label: "GitHub", value: "MalouTech", href: "https://github.com/MalouTech" },
  { label: "X / Twitter", value: "@Malou_Tech_Inc", href: "https://twitter.com/Malou_Tech_Inc" },
  { label: "Instagram", value: "@malou_tech", href: "https://www.instagram.com/malou_tech" },
  { label: "LinkedIn", value: "Malou Tech Inc", href: "https://www.linkedin.com/company/malou-tech-inc/about/" },
];
