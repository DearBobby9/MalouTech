import { useEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";
import { CustomEase } from "gsap/CustomEase";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { assetPath, contactLinks, papers, pillars, publicationNews } from "./data/site";

gsap.registerPlugin(
  useGSAP,
  ScrollTrigger,
  SplitText,
  DrawSVGPlugin,
  MotionPathPlugin,
  ScrambleTextPlugin,
  CustomEase,
  ScrollSmoother,
);

const researchEase = CustomEase.create("researchFluid", ".16,1,.3,1");

function App({ page = "home" }) {
  const appRef = useRef(null);
  const isPaperPage = page === "papers";
  useSmoothScroll(appRef, !isPaperPage);
  useHashAnchorSettle();

  if (isPaperPage) {
    return (
      <div className="app-root" ref={appRef}>
        <SiteTopNav page="papers" />
        <main className="site-shell paper-page-shell" id="top">
          <PaperList />
        </main>
      </div>
    );
  }

  return (
    <div className="app-root" ref={appRef}>
      <SiteTopNav page="home" />
      <div className="smooth-wrapper" id="smooth-wrapper">
        <main className="site-shell smooth-content" id="smooth-content">
          <ResearchStage />
          <PublicationProof />
          <AboutContact />
        </main>
      </div>
    </div>
  );
}

const homeNavItems = [
  { label: "Work", href: "#publications" },
  { label: "Contact", href: "#contact" },
  { label: "Paper list", href: assetPath("papers.html") },
];

const papersNavItems = [
  { label: "Home", href: assetPath("index.html#top") },
  { label: "Work", href: assetPath("index.html#publications") },
  { label: "Contact", href: assetPath("index.html#contact") },
  { label: "Paper list", href: "#paper-list" },
];

function SiteTopNav({ page }) {
  const isPaperPage = page === "papers";
  const navItems = isPaperPage ? papersNavItems : homeNavItems;

  return (
    <header className="site-top-nav" aria-label="Primary navigation">
      <a className="site-top-brand" href={isPaperPage ? assetPath("index.html#top") : "#top"} aria-label="MalouTech home">
        <img src={assetPath("assets/brand/icons/favicon-32.png")} alt="" />
        <span>Malou Tech</span>
      </a>
      <nav className="site-top-links">
        {navItems.map((item) => (
          <a key={item.href} href={item.href}>
            {item.label}
          </a>
        ))}
      </nav>
    </header>
  );
}

function useSmoothScroll(scopeRef, enabled = true) {
  useGSAP(
    () => {
      if (!enabled) {
        document.documentElement.classList.remove("has-smooth-scroll");
        return;
      }

      const mm = gsap.matchMedia();

      mm.add(
        {
          isDesktop: "(min-width: 900px)",
          reduceMotion: "(prefers-reduced-motion: reduce)",
        },
        (context) => {
          const { isDesktop, reduceMotion } = context.conditions;

          if (!isDesktop || reduceMotion || ScrollTrigger.isTouch) {
            document.documentElement.classList.remove("has-smooth-scroll");
            return;
          }

          document.documentElement.classList.add("has-smooth-scroll");
          const smoother = ScrollSmoother.create({
            wrapper: "#smooth-wrapper",
            content: "#smooth-content",
            smooth: 1.08,
            smoothTouch: 0,
            effects: true,
            normalizeScroll: false,
            ignoreMobileResize: true,
          });

          ScrollTrigger.refresh();

          return () => {
            document.documentElement.classList.remove("has-smooth-scroll");
            smoother.kill();
          };
        },
      );

      return () => mm.revert();
    },
    { scope: scopeRef, dependencies: [enabled] },
  );
}

function useHashAnchorSettle() {
  useEffect(() => {
    const timers = [];

    const settleHash = () => {
      const id = window.location.hash.slice(1);
      if (!id) return;

      const target = document.getElementById(decodeURIComponent(id));
      if (!target) return;

      const alignTarget = () => {
        ScrollTrigger.refresh();
        const smoother = ScrollSmoother.get();

        if (smoother) {
          smoother.scrollTo(target, false, "top top");
          window.requestAnimationFrame(() => {
            const delta = target.getBoundingClientRect().top;
            if (Math.abs(delta) > 4) {
              smoother.scrollTo(smoother.scrollTop() + delta, false);
            }
          });
        } else {
          target.scrollIntoView({ block: "start", inline: "nearest" });
        }
      };

      window.requestAnimationFrame(alignTarget);
      timers.push(window.setTimeout(alignTarget, 350));
      timers.push(window.setTimeout(alignTarget, 900));
    };

    settleHash();
    window.addEventListener("hashchange", settleHash);

    return () => {
      window.removeEventListener("hashchange", settleHash);
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, []);
}

function ResearchStage() {
  return (
    <section className="stage-section latent-hero-section" id="top" aria-label="MalouTech latent choreography field">
      <iframe
        className="latent-hero-frame"
        title="MalouTech latent choreography field"
        src={assetPath("latent-choreography-field/index.html?fresh=8629d4b&embed=1")}
        loading="eager"
        tabIndex="-1"
      />
    </section>
  );
}

function ResearchStageLegacy() {
  const stageRef = useRef(null);
  const [activeStage, setActiveStage] = useState("identity");

  useGSAP(
    () => {
      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      const headline = SplitText.create(".hero-title", {
        type: "lines,words",
        mask: "lines",
        aria: "auto",
      });

      const progressLabels = ["identity", "signal", "model", "spatial"];
      let currentStage = "identity";
      const setStage = (index) => {
        const nextStage = progressLabels[index] || "identity";
        if (nextStage !== currentStage) {
          currentStage = nextStage;
          setActiveStage(nextStage);
        }
      };
      const stageIndexFromProgress = (progress) => {
        if (progress >= 0.72) return 3;
        if (progress >= 0.48) return 2;
        if (progress >= 0.22) return 1;
        return 0;
      };

      gsap.set(".waveform-path", { drawSVG: "0% 0%" });
      gsap.set(".route-path", { drawSVG: "0% 0%" });
      gsap.set(".connector-path", { drawSVG: "0% 0%" });
      gsap.set(".motion-trail", { drawSVG: "0% 0%" });
      gsap.set(".stage-depth-scrim", { autoAlpha: 0 });
      gsap.set(".signal-runner", { autoAlpha: 0, scale: 0.7, transformOrigin: "50% 50%" });
      gsap.set(".route-particle", { autoAlpha: 0, scale: 0.42, transformOrigin: "50% 50%" });
      gsap.set(".route-node", { autoAlpha: 0, scale: 0.48, transformOrigin: "50% 50%" });
      gsap.set(".spectral-bar", { scaleY: 0, transformOrigin: "bottom" });
      gsap.set(".token", { autoAlpha: 0, y: 24, scale: 0.72 });
      gsap.set(".expert-card", { autoAlpha: 0, y: 40, scale: 0.92 });
      gsap.set(".xr-plane", { autoAlpha: 0, xPercent: 16, rotationY: -18 });
      gsap.set(".skeleton-node", { autoAlpha: 0, scale: 0.4 });

      const intro = gsap.timeline({
        defaults: { ease: researchEase, duration: reduceMotion ? 0 : 1 },
      });

      intro
        .from(headline.lines, { yPercent: 108, stagger: 0.12 }, 0)
        .fromTo(".hero-kicker", { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0 }, 0.12)
        .fromTo(".hero-copy", { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0 }, 0.24)
        .fromTo(
          ".hero-evidence figure",
          { autoAlpha: 0, y: 28, scale: 0.94 },
          { autoAlpha: 1, y: 0, scale: 1, stagger: 0.08 },
          0.3,
        )
        .fromTo(
          ".hero-actions .magnetic",
          { autoAlpha: 0, y: 22 },
          { autoAlpha: 1, y: 0, stagger: 0.08 },
          0.36,
        )
        .from(".stage-orb", { autoAlpha: 0, scale: 0.75, stagger: 0.08 }, 0.1);

      if (reduceMotion) {
        gsap.set(
          ".waveform-path, .route-path, .connector-path, .motion-trail, .signal-runner, .route-particle, .route-node, .spectral-bar, .token, .expert-card, .xr-plane, .skeleton-node",
          { clearProps: "all", autoAlpha: 1, scale: 1 },
        );
        return () => headline.revert();
      }

      const tl = gsap.timeline({
        defaults: { ease: "none", duration: 0.12 },
        scrollTrigger: {
          trigger: stageRef.current,
          start: "top top",
          end: "+=420%",
          scrub: 0.42,
          pin: true,
          anticipatePin: 1,
          onUpdate: (self) => {
            setStage(stageIndexFromProgress(self.progress));
          },
        },
      });

      tl.addLabel("identity", 0)
        .set(".hero-kicker, .hero-copy, .hero-actions", { autoAlpha: 1, y: 0 }, 0)
        .to(".stage-camera", { scale: 1.04, xPercent: -4, yPercent: -1 }, 0)
        .to(".stage-grid", { autoAlpha: 0.42 }, 0.04)
        .to(".stage-depth-scrim", { autoAlpha: 0 }, 0)
        .to(".stage-copy-identity", { autoAlpha: 1, y: 0 }, 0)
        .to(".stage-copy-signal", { autoAlpha: 0, y: 26 }, 0)
        .addLabel("signal", 0.25)
        .to(".hero-title-mask", { yPercent: -42, autoAlpha: 0.08 }, 0.18)
        .to(".hero-kicker, .hero-copy, .hero-actions", { autoAlpha: 0, y: -22 }, 0.2)
        .to(".hero-evidence", { autoAlpha: 0, y: -16 }, 0.2)
        .to(".stage-depth-scrim", { autoAlpha: 0.32 }, 0.22)
        .to(".stage-copy-identity", { autoAlpha: 0, y: -30 }, 0.22)
        .to(".stage-copy-signal", { autoAlpha: 1, y: 0 }, 0.25)
        .fromTo(".waveform-path", { drawSVG: "0% 0%" }, { drawSVG: "0% 100%", duration: 0.22 }, 0.26)
        .to(".signal-runner", { autoAlpha: 1, scale: 1, duration: 0.08 }, 0.28)
        .to(
          ".signal-runner",
          {
            motionPath: {
              path: ".waveform-path",
              align: ".waveform-path",
              alignOrigin: [0.5, 0.5],
            },
            duration: 0.42,
          },
          0.28,
        )
        .to(".route-source", { drawSVG: "0% 100%", duration: 0.2 }, 0.32)
        .to(".route-particle-a", { autoAlpha: 1, scale: 1, duration: 0.04 }, 0.34)
        .to(
          ".route-particle-a",
          {
            motionPath: {
              path: ".route-source",
              align: ".route-source",
              alignOrigin: [0.5, 0.5],
            },
            duration: 0.25,
          },
          0.34,
        )
        .to(".route-node-signal", { autoAlpha: 1, scale: 1, duration: 0.12, stagger: 0.035 }, 0.38)
        .to(".spectral-bar", { scaleY: 1, stagger: 0.009, duration: 0.18 }, 0.29)
        .to(".token", { autoAlpha: 1, y: 0, scale: 1, duration: 0.18, stagger: { amount: 0.28, from: "center" } }, 0.38)
        .to(".stage-camera", { xPercent: -9, scale: 1.1 }, 0.25)
        .addLabel("model", 0.5)
        .to(".stage-copy-signal", { autoAlpha: 0, y: -28 }, 0.49)
        .to(".stage-copy-model", { autoAlpha: 1, y: 0 }, 0.5)
        .to(".hero-copy", { autoAlpha: 0, y: -28, duration: 0.08 }, 0.52)
        .to(".hero-title-mask", { autoAlpha: 0.015, duration: 0.08 }, 0.5)
        .to(".stage-depth-scrim", { autoAlpha: 0.62 }, 0.5)
        .to(".route-layer", { autoAlpha: 0.62 }, 0.5)
        .to(".waveform-layer", { autoAlpha: 0.3, scale: 0.94 }, 0.5)
        .to(".token-lane-motion", { y: -96, x: 96, stagger: 0.006 }, 0.51)
        .to(".token-lane-appearance", { y: 106, x: 140, stagger: 0.006 }, 0.51)
        .to(".route-expert", { drawSVG: "0% 100%", duration: 0.2, stagger: 0.04 }, 0.52)
        .to(".route-particle-b", { autoAlpha: 1, scale: 1, duration: 0.04 }, 0.53)
        .to(
          ".route-particle-b",
          {
            motionPath: {
              path: ".route-expert-a",
              align: ".route-expert-a",
              alignOrigin: [0.5, 0.5],
            },
            duration: 0.24,
          },
          0.53,
        )
        .to(".route-particle-c", { autoAlpha: 1, scale: 1, duration: 0.04 }, 0.57)
        .to(
          ".route-particle-c",
          {
            motionPath: {
              path: ".route-expert-b",
              align: ".route-expert-b",
              alignOrigin: [0.5, 0.5],
            },
            duration: 0.24,
          },
          0.57,
        )
        .to(".route-node-model", { autoAlpha: 1, scale: 1, duration: 0.12, stagger: 0.035 }, 0.58)
        .to(".connector-path", { drawSVG: "0% 100%", stagger: 0.06 }, 0.54)
        .to(".expert-card", { autoAlpha: 0.58, y: 0, scale: 1, duration: 0.16, stagger: 0.08 }, 0.57)
        .to(".expert-pulse", { scale: 1.08, autoAlpha: 0.42, stagger: 0.05 }, 0.66)
        .to(".stage-camera", { xPercent: -11, yPercent: 1, scale: 1.1 }, 0.5)
        .addLabel("spatial", 0.75)
        .to(".stage-copy-model", { autoAlpha: 0, y: -28 }, 0.74)
        .to(".stage-copy-spatial", { autoAlpha: 1, y: 0 }, 0.75)
        .to(".hero-panel", { autoAlpha: 0, y: -34, duration: 0.12 }, 0.74)
        .to(".stage-depth-scrim", { autoAlpha: 0.74 }, 0.74)
        .to(".route-layer", { autoAlpha: 0.34 }, 0.74)
        .to(".waveform-layer", { autoAlpha: 0.12, scale: 0.86 }, 0.74)
        .to(".token-grid", { autoAlpha: 0.42, scale: 0.94 }, 0.76)
        .to(".expert-card", { xPercent: -22, autoAlpha: 0.24, scale: 0.9 }, 0.76)
        .to(".route-output", { drawSVG: "0% 100%", duration: 0.2, stagger: 0.035 }, 0.76)
        .to(".route-particle-d", { autoAlpha: 1, scale: 1, duration: 0.04 }, 0.77)
        .to(
          ".route-particle-d",
          {
            motionPath: {
              path: ".route-output-a",
              align: ".route-output-a",
              alignOrigin: [0.5, 0.5],
            },
            duration: 0.26,
          },
          0.77,
        )
        .to(".route-node-spatial", { autoAlpha: 1, scale: 1, duration: 0.14, stagger: 0.03 }, 0.8)
        .to(".motion-trail", { drawSVG: "0% 100%", autoAlpha: 0.52, duration: 0.18, stagger: 0.04 }, 0.77)
        .to(".skeleton-node", { autoAlpha: 0.62, scale: 1, duration: 0.18, stagger: { amount: 0.24, from: "center" } }, 0.78)
        .to(".xr-plane", { autoAlpha: 0.34, xPercent: 0, rotationY: 0, duration: 0.18, stagger: 0.09 }, 0.82)
        .to(".stage-camera", { xPercent: -10, yPercent: 0, scale: 1.08 }, 0.75)
        .to(".spatial-caption", { autoAlpha: 1, y: 0 }, 0.88);

      const orbTween = gsap.to(".stage-orb", {
        y: (i) => (i % 2 ? -18 : 18),
        x: (i) => (i % 2 ? 14 : -10),
        paused: true,
        repeat: -1,
        yoyo: true,
        duration: 3.8,
        ease: "sine.inOut",
        stagger: 0.45,
      });

      let stageIsActive = true;
      const syncOrbActivity = () => {
        if (document.hidden || !stageIsActive) {
          orbTween.pause();
        } else {
          orbTween.play();
        }
      };

      const orbActivity = ScrollTrigger.create({
        trigger: stageRef.current,
        start: "top bottom",
        end: "bottom top",
        onEnter: () => {
          stageIsActive = true;
          syncOrbActivity();
        },
        onEnterBack: () => {
          stageIsActive = true;
          syncOrbActivity();
        },
        onLeave: () => {
          stageIsActive = false;
          syncOrbActivity();
        },
        onLeaveBack: () => {
          stageIsActive = false;
          syncOrbActivity();
        },
      });

      syncOrbActivity();
      document.addEventListener("visibilitychange", syncOrbActivity);

      return () => {
        document.removeEventListener("visibilitychange", syncOrbActivity);
        orbActivity.kill();
        orbTween.kill();
        headline.revert();
      };
    },
    { scope: stageRef },
  );

  return (
    <section className="stage-section" ref={stageRef} aria-label="MalouTech research stage">
      <header className="topbar" aria-label="Primary navigation">
        <a className="brand" href="#top" aria-label="MalouTech home">
          <img className="brand-mark" src={assetPath("assets/brand/malou-mark.svg")} alt="" />
          MalouTech
        </a>
        <nav className="nav-links">
          <a href="#research">Research</a>
          <a href="#publications">Publications</a>
          <a href="#about">About</a>
          <a href="#contact">Contact</a>
        </nav>
      </header>

      <div className="stage-viewport" id="top">
        <div className="stage-camera">
          <img className="brand-watermark" src={assetPath("assets/brand/malou-mark.svg")} alt="" />
          <div className="stage-grid" />
          <div className="stage-orb stage-orb-a" />
          <div className="stage-orb stage-orb-b" />
          <div className="stage-orb stage-orb-c" />
          <Waveform />
          <TokenGrid />
          <RouteField />
          <ModelDiagram />
          <MotionSkeleton />
          <XRPlanes />
        </div>

        <div className="stage-depth-scrim" aria-hidden="true" />

        <div className="hero-panel">
          <p className="hero-kicker">MalouTech Research Lab</p>
          <h1 className="hero-title hero-title-mask">
            <span className="hero-line">AI Art.</span>
            <span className="hero-line">Human Motion.</span>
            <span className="hero-line">XR Systems.</span>
          </h1>
          <p className="hero-copy">
            MalouTech is a nonprofit research company exploring AI-generated
            art, human motion synthesis, and extended-reality systems.
          </p>
          <HeroEvidence />
          <div className="hero-actions" aria-label="Hero actions">
            <MagneticButton href="#research">Explore research</MagneticButton>
            <MagneticButton href="#publications" variant="quiet">
              View publications
            </MagneticButton>
          </div>
        </div>

        <StageNarration activeStage={activeStage} />
        <RouteReadout activeStage={activeStage} />
        <StageMeter activeStage={activeStage} />
      </div>
    </section>
  );
}

function HeroEvidence() {
  return (
    <div className="hero-evidence" aria-label="Featured publication evidence">
      {papers.slice(0, 3).map((paper) => (
        <figure key={paper.title} style={paperAspectStyle(paper)}>
          <PaperImage
            paper={paper}
            sizes="(max-width: 900px) 32vw, 190px"
            eager
            fallback="small"
          />
          <figcaption>
            <span>{paper.venue}</span>
            <strong>{paper.type}</strong>
          </figcaption>
        </figure>
      ))}
    </div>
  );
}

function PaperImage({ paper, sizes, eager = false, fallback = "large", className }) {
  const fallbackSrc = {
    small: paper.imageSmall,
    medium: paper.imageMedium,
    large: paper.image,
  }[fallback] || paper.image;

  return (
    <img
      className={className}
      src={fallbackSrc}
      srcSet={paper.imageSrcSet}
      sizes={sizes}
      alt=""
      loading={eager ? "eager" : "lazy"}
      decoding="async"
      fetchPriority={eager ? "high" : "auto"}
    />
  );
}

function paperAspectStyle(paper) {
  return { "--paper-aspect": paper.imageAspect || 2.2 };
}

function Waveform() {
  const bars = useMemo(
    () =>
      Array.from({ length: 46 }, (_, index) => {
        const height = 18 + Math.abs(Math.sin(index * 0.63)) * 120;
        return { height, x: 24 + index * 15 };
      }),
    [],
  );

  return (
    <svg className="waveform-layer" viewBox="0 0 760 360" aria-hidden="true">
      <defs>
        <linearGradient id="waveGradient" x1="0" x2="1">
          <stop offset="0%" stopColor="#D7A441" />
          <stop offset="100%" stopColor="#66C6C8" />
        </linearGradient>
      </defs>
      <path
        className="waveform-path"
        d="M24 186 C72 86 116 288 162 174 C212 52 252 270 306 176 C364 88 398 246 452 178 C502 118 542 224 596 176 C646 130 692 214 736 176"
        fill="none"
        stroke="url(#waveGradient)"
        strokeWidth="2.8"
        strokeLinecap="round"
      />
      <circle className="signal-runner" cx="24" cy="186" r="7" fill="#EDE6D8" stroke="#090B0C" strokeWidth="2" />
      {bars.map((bar) => (
        <rect
          key={bar.x}
          className="spectral-bar"
          x={bar.x}
          y={254 - bar.height}
          width="4"
          height={bar.height}
          rx="2"
          fill={bar.x % 3 === 0 ? "#D7A441" : "#66C6C8"}
          opacity="0.58"
        />
      ))}
    </svg>
  );
}

function TokenGrid() {
  const tokens = useMemo(
    () =>
      Array.from({ length: 54 }, (_, index) => ({
        id: index,
        lane: index % 3 === 0 ? "token-lane-motion" : "token-lane-appearance",
        active: index % 7 === 0,
      })),
    [],
  );

  return (
    <div className="token-grid" aria-hidden="true">
      {tokens.map((token) => (
        <span
          key={token.id}
          className={`token ${token.lane} ${token.active ? "is-active" : ""}`}
        />
      ))}
    </div>
  );
}

function RouteField() {
  return (
    <svg className="route-layer" viewBox="0 0 980 620" aria-hidden="true">
      <defs>
        <linearGradient id="routeGradient" x1="0" x2="1">
          <stop offset="0%" stopColor="#D7A441" />
          <stop offset="54%" stopColor="#EDE6D8" />
          <stop offset="100%" stopColor="#66C6C8" />
        </linearGradient>
      </defs>
      <path
        className="route-path route-source"
        d="M78 298 C168 204 254 196 340 254 C408 300 460 296 538 238"
      />
      <path
        className="route-path route-expert route-expert-a"
        d="M536 238 C610 130 704 128 804 164"
      />
      <path
        className="route-path route-expert route-expert-b"
        d="M536 238 C624 342 704 390 834 408"
      />
      <path
        className="route-path route-output route-output-a"
        d="M804 164 C890 206 904 306 842 382 C800 436 826 500 910 540"
      />
      <path
        className="route-path route-output route-output-b"
        d="M834 408 C878 380 906 336 910 280 C914 216 876 174 804 164"
      />
      {[
        ["route-node route-node-signal", 78, 298],
        ["route-node route-node-signal", 340, 254],
        ["route-node route-node-model", 536, 238],
        ["route-node route-node-model", 804, 164],
        ["route-node route-node-model", 834, 408],
        ["route-node route-node-spatial", 910, 280],
        ["route-node route-node-spatial", 910, 540],
      ].map(([className, cx, cy]) => (
        <circle key={`${cx}-${cy}`} className={className} cx={cx} cy={cy} r="8" />
      ))}
      <circle className="route-particle route-particle-a" cx="78" cy="298" r="6" />
      <circle className="route-particle route-particle-b" cx="536" cy="238" r="6" />
      <circle className="route-particle route-particle-c" cx="536" cy="238" r="6" />
      <circle className="route-particle route-particle-d" cx="804" cy="164" r="6" />
    </svg>
  );
}

function ModelDiagram() {
  return (
    <div className="model-layer" aria-hidden="true">
      <svg className="connector-svg" viewBox="0 0 820 460">
        <path
          className="connector-path"
          d="M158 228 C252 118 336 108 430 140 C496 162 538 150 606 108"
          fill="none"
          stroke="#D7A441"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray="7 12"
        />
        <path
          className="connector-path"
          d="M158 236 C266 336 352 352 454 320 C522 298 560 316 634 364"
          fill="none"
          stroke="#66C6C8"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray="7 12"
        />
      </svg>
      <article className="expert-card expert-motion">
        <span className="expert-pulse" />
        <p>Motion Expert</p>
        <strong>pose continuity</strong>
      </article>
      <article className="expert-card expert-appearance">
        <span className="expert-pulse" />
        <p>Appearance Expert</p>
        <strong>visual coherence</strong>
      </article>
      <article className="expert-card expert-eval">
        <span className="expert-pulse" />
        <p>Evaluation</p>
        <strong>paper artifact</strong>
      </article>
    </div>
  );
}

function MotionSkeleton() {
  const nodes = [
    [164, 46],
    [142, 96],
    [186, 94],
    [116, 154],
    [216, 152],
    [156, 178],
    [124, 246],
    [188, 248],
    [92, 324],
    [226, 322],
  ];

  return (
    <svg className="skeleton-layer" viewBox="0 0 360 390" aria-hidden="true">
      <path
        className="motion-trail"
        d="M64 344 C126 292 182 260 228 196 C264 146 238 98 186 60"
        fill="none"
        stroke="#D7A441"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        className="motion-trail"
        d="M292 340 C244 286 196 228 154 176 C118 132 118 86 164 46"
        fill="none"
        stroke="#66C6C8"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <polyline
        points="164,46 142,96 116,154 156,178 124,246 92,324"
        fill="none"
        stroke="rgba(237,230,216,0.52)"
        strokeWidth="2"
      />
      <polyline
        points="164,46 186,94 216,152 156,178 188,248 226,322"
        fill="none"
        stroke="rgba(237,230,216,0.52)"
        strokeWidth="2"
      />
      {nodes.map(([cx, cy]) => (
        <circle
          className="skeleton-node"
          key={`${cx}-${cy}`}
          cx={cx}
          cy={cy}
          r="7"
          fill="#EDE6D8"
        />
      ))}
    </svg>
  );
}

function XRPlanes() {
  return (
    <div className="xr-layer" aria-hidden="true">
      <div className="xr-plane xr-plane-a">
        <span>frustum</span>
      </div>
      <div className="xr-plane xr-plane-b">
        <span>gesture field</span>
      </div>
      <div className="xr-plane xr-plane-c">
        <span>spatial output</span>
      </div>
    </div>
  );
}

const readoutCopy = {
  identity: "calibrating open research surface",
  signal: "parsing music, pose, image, text",
  model: "routing motion and appearance experts",
  spatial: "projecting generated motion into XR",
};

const venueLabels = Array.from(new Set(papers.map((paper) => paper.venue)));
const artifactLinkCount = papers.reduce((count, paper) => count + paper.links.length, 0);
const accepted2026Count = publicationNews.filter((item) => item.date.startsWith("2026")).length;

const publicationStats = [
  {
    label: "Publication records",
    value: String(papers.length),
    detail: "papers in the current evidence set",
  },
  {
    label: "2026 acceptances",
    value: String(accepted2026Count),
    detail: "SIGGRAPH, IEEE VR, and CVPR Workshop entries",
  },
  {
    label: "Artifact links",
    value: String(artifactLinkCount),
    detail: "paper, project, and code destinations",
  },
  {
    label: "Venues",
    value: String(venueLabels.length),
    detail: "unique publication venues represented",
  },
];

function PaperLinks({ links }) {
  if (links.length === 0) return null;

  return (
    <div className="paper-links" aria-label="Paper destinations">
      {links.map((link) => (
        <MagneticButton
          key={link.href}
          href={link.href}
          target="_blank"
          rel="noreferrer"
          ariaLabel={link.label}
          variant="contact"
          className="paper-link-pill"
        >
          <strong>{link.label}</strong>
        </MagneticButton>
      ))}
    </div>
  );
}

function RouteReadout({ activeStage }) {
  const readoutRef = useRef(null);

  useGSAP(
    () => {
      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      if (reduceMotion) {
        readoutRef.current.textContent = readoutCopy[activeStage];
        return;
      }

      gsap.to(readoutRef.current, {
        duration: 0.54,
        scrambleText: {
          text: readoutCopy[activeStage],
          chars: "01",
          revealDelay: 0.06,
          speed: 0.48,
        },
        ease: "power2.out",
      });
    },
    { dependencies: [activeStage], scope: readoutRef, revertOnUpdate: true },
  );

  return (
    <p className="route-readout" aria-live="polite">
      <span>route</span>
      <strong ref={readoutRef}>{readoutCopy[activeStage]}</strong>
    </p>
  );
}

function StageNarration({ activeStage }) {
  return (
    <aside className="stage-narration" aria-live="polite">
      <div className="stage-copy stage-copy-identity">
        <span>01</span>
        <h2>Research stage opens</h2>
        <p>MalouTech frames AI art as public research, grounded in motion, perception, and spatial media.</p>
      </div>
      <div className="stage-copy stage-copy-signal">
        <span>02</span>
        <h2>Every artwork starts as a signal</h2>
        <p>Music, pose, image, text, and interaction traces become structured input for generative systems.</p>
      </div>
      <div className="stage-copy stage-copy-model">
        <span>03</span>
        <h2>The model separates motion from appearance</h2>
        <p>One path reasons about pose continuity while another protects visual coherence and evaluation.</p>
      </div>
      <div className="stage-copy stage-copy-spatial">
        <span>04</span>
        <h2>Generated motion becomes a body in space</h2>
        <p>Dance, gesture, cameras, interfaces, and environments become one spatial research surface.</p>
      </div>
      <p className="spatial-caption">
        Current beat: <strong>{activeStage}</strong>
      </p>
    </aside>
  );
}

function StageMeter({ activeStage }) {
  const stages = ["identity", "signal", "model", "spatial"];
  return (
    <div className="stage-meter" aria-label="Scroll stage progress">
      {stages.map((stage, index) => (
        <span
          key={stage}
          className={stage === activeStage ? "is-active" : ""}
          aria-label={`${index + 1}. ${stage}`}
        />
      ))}
    </div>
  );
}

function PublicationProof() {
  const proofRef = useRef(null);

  useGSAP(
    () => {
      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      const mm = gsap.matchMedia();

      gsap.set(".publication-trace-path", { drawSVG: "0% 0%" });
      gsap.set(".publication-pulse", { autoAlpha: 0, scale: 0.5, transformOrigin: "50% 50%" });
      gsap.set(".spotlight-progress-fill", { scaleX: 1 / papers.length, transformOrigin: "left center" });

      gsap.from(".proof-heading > *", {
        scrollTrigger: {
          trigger: ".proof-heading",
          start: "top 72%",
          once: true,
        },
        y: 34,
        autoAlpha: 0,
        duration: 0.8,
        ease: "power3.out",
        stagger: 0.08,
      });

      if (reduceMotion) {
        gsap.set(".publication-trace-path, .publication-pulse", {
          clearProps: "all",
          autoAlpha: 1,
          scale: 1,
        });
      } else {
        const proofTimeline = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: proofRef.current,
            start: "top 78%",
            end: "bottom 42%",
            scrub: 0.8,
          },
        });

        proofTimeline
          .to(".publication-trace-path", { drawSVG: "0% 100%", stagger: 0.06 }, 0.05)
          .to(".publication-pulse", { autoAlpha: 1, scale: 1, stagger: 0.08 }, 0.14)
          .to(".publication-pulse-a", {
            motionPath: {
              path: ".publication-trace-main",
              align: ".publication-trace-main",
              alignOrigin: [0.5, 0.5],
            },
            duration: 0.62,
          }, 0.18)
          .to(".publication-pulse-b", {
            motionPath: {
              path: ".publication-trace-side",
              align: ".publication-trace-side",
              alignOrigin: [0.5, 0.5],
            },
            duration: 0.52,
          }, 0.26);

        mm.add("(min-width: 900px)", () => {
          const spotlight = proofRef.current.querySelector(".paper-spotlight");
          const frames = gsap.utils.toArray(".spotlight-frame", spotlight);
          const panels = gsap.utils.toArray(".spotlight-copy-panel", spotlight);
          const progressFill = spotlight.querySelector(".spotlight-progress-fill");

          gsap.set(frames, {
            autoAlpha: 0,
            yPercent: 14,
            scale: 0.82,
            rotation: (index) => (index % 2 === 0 ? -5 : 5),
            transformOrigin: "50% 60%",
          });
          gsap.set(".spotlight-frame img", { scale: 1, xPercent: 0, yPercent: 0 });
          gsap.set(frames[0], { autoAlpha: 1, yPercent: 0, scale: 1, rotation: 0 });
          gsap.set(frames[0].querySelector("img"), { scale: 1 });
          gsap.set(panels, { autoAlpha: 0, y: 22 });
          gsap.set(panels[0], { autoAlpha: 1, y: 0 });
          gsap.set(progressFill, { scaleX: 1 / frames.length, transformOrigin: "left center" });

          const spotlightTimeline = gsap.timeline({
            defaults: { ease: "none" },
            scrollTrigger: {
              trigger: spotlight,
              start: "top top",
              end: () => `+=${frames.length * 520}`,
              scrub: 0.78,
              pin: true,
              anticipatePin: 1,
              invalidateOnRefresh: true,
            },
          });

          spotlightTimeline
            .to(progressFill, { scaleX: 1, duration: frames.length - 1 }, 0)
            .to(".spotlight-stage", { rotationX: 4, rotationY: -3, duration: frames.length - 1 }, 0);

          frames.slice(1).forEach((frame, index) => {
            const currentIndex = index + 1;
            const previousFrame = frames[currentIndex - 1];
            const previousPanel = panels[currentIndex - 1];
            const currentPanel = panels[currentIndex];
            const at = currentIndex;

            spotlightTimeline
              .to(previousFrame, {
                autoAlpha: 0,
                yPercent: -14,
                scale: 0.78,
                rotation: currentIndex % 2 === 0 ? -4 : 4,
                duration: 0.64,
              }, at - 0.48)
              .to(previousFrame.querySelector("img"), {
                scale: 1,
                xPercent: 0,
                yPercent: 0,
                duration: 0.64,
              }, at - 0.48)
              .to(frame, {
                autoAlpha: 1,
                yPercent: 0,
                scale: 1,
                rotation: 0,
                duration: 0.72,
              }, at - 0.4)
              .to(frame.querySelector("img"), {
                scale: 1,
                xPercent: 0,
                yPercent: 0,
                duration: 0.72,
              }, at - 0.4)
              .to(previousPanel, { autoAlpha: 0, y: -20, duration: 0.42 }, at - 0.42)
              .to(currentPanel, { autoAlpha: 1, y: 0, duration: 0.48 }, at - 0.28);
          });
        });
      }

      return () => {
        mm.revert();
      };
    },
    { scope: proofRef },
  );

  return (
    <section className="proof-section" id="publications" ref={proofRef}>
      <PublicationTrace />
      <div className="proof-heading">
        <div className="proof-summary-row">
          <h2>Application proof</h2>
          <div className="proof-venue-pills" aria-label="Publication venues">
            {venueLabels.map((venue) => (
              <span key={venue}>{venue}</span>
            ))}
          </div>
        </div>
        <div className="proof-stats" aria-label="Publication evidence statistics">
          {publicationStats.map((stat) => (
            <article key={stat.label}>
              <div className="proof-stat-line">
                <span>{stat.label}</span>
                <strong>{stat.value}</strong>
              </div>
            </article>
          ))}
        </div>
      </div>
      {/* <SourceLedger /> */}
      <div className="paper-spotlight" aria-label="Scroll-linked publication spotlight">
        <div className="spotlight-copy">
          {papers.map((paper, index) => (
            <article className="spotlight-copy-panel" key={`spotlight-copy-${paper.title}`}>
              <h3>{paper.title}</h3>
              <p className="spotlight-meta">{paper.venue} · {paper.type}</p>
              <p className="spotlight-description">{paper.contribution}</p>
              <PaperLinks links={paper.links} />
            </article>
          ))}
        </div>
        <div className="spotlight-stage" aria-hidden="true">
          <img className="spotlight-mark" src={assetPath("assets/brand/malou-mark.svg")} alt="" />
          {papers.map((paper, index) => (
            <figure
              className="spotlight-frame"
              key={`spotlight-frame-${paper.title}`}
              style={paperAspectStyle(paper)}
            >
              <PaperImage
                paper={paper}
                sizes="(max-width: 900px) 78vw, 52vw"
                eager={index === 0}
              />
            </figure>
          ))}
        </div>
        <div className="spotlight-progress" aria-hidden="true">
          <span className="spotlight-progress-fill" />
        </div>
      </div>
      {/*
      <div className="paper-list" aria-label="Featured publications">
        {papers.map((paper) => (
          <article
            key={paper.title}
            className="paper-card"
            data-title={paper.title}
            data-venue={paper.venue}
            data-type={paper.type}
            data-image={paper.image}
            data-image-preview={paper.imageMedium}
            data-image-srcset={paper.imageSrcSet}
            data-accent={paper.accent}
          >
            <figure className="paper-visual" style={paperAspectStyle(paper)}>
              <PaperImage
                paper={paper}
                sizes="(max-width: 900px) 100vw, 420px"
                fallback="medium"
              />
            </figure>
            <div>
              <p className="paper-meta">
                {paper.venue} <span>{paper.type}</span>
              </p>
              <h3>{paper.title}</h3>
              <p className="paper-authors">{paper.authors}</p>
              <p className="paper-contribution">{paper.contribution}</p>
              <PaperLinks links={paper.links} />
              <div className="paper-evidence-grid" aria-label={`Evidence matrix for ${paper.title}`}>
                {[
                  ["Signal", paper.evidence.signal],
                  ["Method", paper.evidence.method],
                  ["Output", paper.evidence.output],
                  ["Artifact", paper.evidence.artifacts],
                ].map(([label, value]) => (
                  <div className="paper-evidence-row" key={`${paper.title}-${label}`}>
                    <span>{label}</span>
                    <strong>{value}</strong>
                  </div>
                ))}
              </div>
              <div className="paper-artifact-meter" aria-hidden="true">
                <span className={`paper-artifact-fill paper-artifact-${paper.accent}`} />
              </div>
              <div className="paper-themes" aria-label={`Themes for ${paper.title}`}>
                {paper.themes.map((theme) => (
                  <span key={theme}>{theme}</span>
                ))}
              </div>
              <p className="paper-credit">{paper.assetCredit}</p>
            </div>
          </article>
        ))}
      </div>
      <div className="paper-preview" aria-hidden="true">
        <div className="preview-figure">
          <PaperImage
            paper={papers[0]}
            className="preview-image"
            sizes="320px"
            fallback="medium"
          />
        </div>
        <p className="preview-venue">SIGGRAPH 2026</p>
        <p className="preview-type">Motion + Appearance</p>
        <p className="preview-title">MACE-Dance</p>
      </div>
      */}
    </section>
  );
}

function SourceLedger() {
  return (
    <section className="source-ledger" aria-label="Publication acceptance timeline from source material">
      <svg className="ledger-trace" viewBox="0 0 980 260" aria-hidden="true">
        <path
          className="ledger-trace-path"
          d="M42 178 C180 52 314 70 438 126 C586 194 690 188 926 58"
        />
      </svg>
      <div className="source-ledger-copy">
        <p className="section-kicker">Accepted research</p>
        <h3>Latest source-backed publication milestones.</h3>
        <a href="https://xulongt.github.io/#publications" target="_blank" rel="noreferrer">
          Verified from Xulong Tang homepage
        </a>
      </div>
      <div className="source-ledger-grid">
        {publicationNews.map((item, index) => (
          <article className="source-ledger-card" key={`${item.date}-${item.title}`}>
            <div className="ledger-card-meta">
              <span>{item.date}</span>
              <strong>{String(index + 1).padStart(2, "0")}</strong>
            </div>
            <div className="ledger-card-media">
              {item.evidence.map((paperIndex) => {
                const paper = papers[paperIndex];
                return (
                  <figure
                    key={`${item.title}-${paper.title}`}
                    style={paperAspectStyle(paper)}
                  >
                    <PaperImage
                      paper={paper}
                      sizes="(max-width: 900px) 100vw, 260px"
                      fallback="small"
                    />
                    <figcaption>{paper.venue}</figcaption>
                  </figure>
                );
              })}
            </div>
            <h4>{item.title}</h4>
            <p>{item.detail}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function PublicationTrace() {
  return (
    <svg className="publication-trace" data-speed="1.05" viewBox="0 0 980 620" aria-hidden="true">
      <path
        className="publication-trace-path publication-trace-main"
        d="M62 92 C206 20 334 76 430 174 C540 286 658 278 840 176"
      />
      <path
        className="publication-trace-path publication-trace-side"
        d="M178 528 C274 410 384 370 518 410 C652 450 748 390 890 300"
      />
      <path
        className="publication-trace-path"
        d="M104 306 C230 254 324 262 414 322 C504 382 614 372 748 302"
      />
      <circle className="publication-pulse publication-pulse-a" cx="62" cy="92" r="8" />
      <circle className="publication-pulse publication-pulse-b" cx="178" cy="528" r="8" />
    </svg>
  );
}

function ContactIcon({ label }) {
  const normalized = label.toLowerCase();
  let icon = "mail";

  if (normalized.includes("github")) icon = "github";
  if (normalized.includes("twitter") || normalized.includes("x /")) icon = "x";
  if (normalized.includes("instagram")) icon = "instagram";
  if (normalized.includes("linkedin")) icon = "linkedin";

  if (icon === "github") {
    return (
      <svg className="contact-icon" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 2.25A9.75 9.75 0 0 0 8.92 21.26c.49.09.67-.21.67-.47v-1.82c-2.73.59-3.31-1.16-3.31-1.16-.45-1.13-1.1-1.43-1.1-1.43-.9-.62.07-.61.07-.61 1 .07 1.52 1.03 1.52 1.03.89 1.51 2.33 1.07 2.9.82.09-.64.35-1.07.63-1.32-2.18-.25-4.47-1.09-4.47-4.85 0-1.07.38-1.95 1.02-2.64-.1-.25-.44-1.25.1-2.61 0 0 .83-.27 2.72 1.01a9.38 9.38 0 0 1 4.96 0c1.89-1.28 2.72-1.01 2.72-1.01.54 1.36.2 2.36.1 2.61.64.69 1.02 1.57 1.02 2.64 0 3.77-2.3 4.59-4.49 4.84.36.31.68.91.68 1.84v2.65c0 .26.18.57.68.47A9.75 9.75 0 0 0 12 2.25Z" />
      </svg>
    );
  }

  if (icon === "x") {
    return (
      <svg className="contact-icon" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M14.15 10.32 21.08 2.25h-1.64l-6.02 7-4.8-7H3.08l7.27 10.58-7.27 8.47h1.64l6.36-7.4 5.08 7.4h5.54l-7.55-10.98Zm-2.25 2.62-.74-1.05-5.86-8.4h2.53l4.73 6.77.74 1.05 6.15 8.81h-2.53l-5.02-7.18Z" />
      </svg>
    );
  }

  if (icon === "instagram") {
    return (
      <svg className="contact-icon" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M7.5 2.75h9A4.76 4.76 0 0 1 21.25 7.5v9a4.76 4.76 0 0 1-4.75 4.75h-9a4.76 4.76 0 0 1-4.75-4.75v-9A4.76 4.76 0 0 1 7.5 2.75Zm0 1.7A3.05 3.05 0 0 0 4.45 7.5v9a3.05 3.05 0 0 0 3.05 3.05h9a3.05 3.05 0 0 0 3.05-3.05v-9a3.05 3.05 0 0 0-3.05-3.05h-9Zm4.5 3.3A4.25 4.25 0 1 1 7.75 12 4.25 4.25 0 0 1 12 7.75Zm0 1.7A2.55 2.55 0 1 0 14.55 12 2.55 2.55 0 0 0 12 9.45Zm4.48-2.48a.95.95 0 1 1-.95.95.95.95 0 0 1 .95-.95Z" />
      </svg>
    );
  }

  if (icon === "linkedin") {
    return (
      <svg className="contact-icon" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M5.35 7.9H2.9v13.35h2.45V7.9ZM4.13 2.75a1.42 1.42 0 1 0 0 2.84 1.42 1.42 0 0 0 0-2.84Zm6.16 5.15H7.94v13.35h2.35v-7.02c0-1.88.87-3 2.33-3 1.35 0 2.01.95 2.01 2.78v7.24h2.45v-7.82c0-3.44-1.84-5.04-4.3-5.04a3.63 3.63 0 0 0-2.49.94V7.9Z" />
      </svg>
    );
  }

  return (
    <svg className="contact-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4.25 5.75h15.5A1.25 1.25 0 0 1 21 7v10a1.25 1.25 0 0 1-1.25 1.25H4.25A1.25 1.25 0 0 1 3 17V7a1.25 1.25 0 0 1 1.25-1.25Zm.45 1.7 7.3 5.18 7.3-5.18H4.7Zm14.6 9.1V9.43l-6.81 4.83a.84.84 0 0 1-.98 0L4.7 9.43v7.12h14.6Z" />
    </svg>
  );
}

const defaultResearchLayer = pillars[0];
const researchLoopInterval = 3000;

function ResearchStructure() {
  const structureRef = useRef(null);
  const [hasEntered, setHasEntered] = useState(false);
  const [autoLayerIndex, setAutoLayerIndex] = useState(0);
  const [manualLayerId, setManualLayerId] = useState(null);
  const loopPath = "M154 38 C220 54 232 135 174 166 C126 190 78 166 58 124";
  const activeLayer = manualLayerId
    ? pillars.find((pillar) => pillar.id === manualLayerId) ?? defaultResearchLayer
    : pillars[autoLayerIndex] ?? defaultResearchLayer;
  const activeLayerId = activeLayer.id;
  const isAutoRunning = hasEntered && manualLayerId === null;

  useEffect(() => {
    const node = structureRef.current;
    if (!node) {
      setHasEntered(true);
      return undefined;
    }

    if (!("IntersectionObserver" in window)) {
      setHasEntered(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setHasEntered(true);
      },
      { threshold: 0.32 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!isAutoRunning || reduceMotion) return undefined;

    const interval = window.setInterval(() => {
      setAutoLayerIndex((index) => (index + 1) % pillars.length);
    }, researchLoopInterval);

    return () => window.clearInterval(interval);
  }, [isAutoRunning]);

  const activateLayer = (id) => setManualLayerId(id);
  const releaseLayer = (id = manualLayerId) => {
    const nextIndex = pillars.findIndex((pillar) => pillar.id === id);
    if (nextIndex >= 0) setAutoLayerIndex(nextIndex);
    setManualLayerId(null);
  };
  const selectLayer = (id) => {
    const nextIndex = pillars.findIndex((pillar) => pillar.id === id);
    if (nextIndex >= 0) setAutoLayerIndex(nextIndex);
    setManualLayerId(null);
  };
  const clearManualLayer = (event) => {
    if (event.key === "Escape") {
      setManualLayerId(null);
    }
  };

  return (
    <div
      className={`research-structure${isAutoRunning ? " is-loop-running" : ""}`}
      data-active-layer={activeLayerId}
      onKeyDown={clearManualLayer}
      ref={structureRef}
    >
      <div className="research-structure-copy">
        <p>
          Explore the stack to see how inputs become representations, models, and research artifacts.
        </p>
        <div className="research-list" aria-label="MalouTech research layers">
          {pillars.map((layer) => (
            <button
              className={`research-list-item${activeLayerId === layer.id ? " is-active" : ""}`}
              type="button"
              key={layer.id}
              aria-current={activeLayerId === layer.id ? "true" : undefined}
              onMouseEnter={() => activateLayer(layer.id)}
              onMouseLeave={() => releaseLayer(layer.id)}
              onFocus={() => activateLayer(layer.id)}
              onBlur={() => releaseLayer(layer.id)}
              onClick={() => selectLayer(layer.id)}
            >
              <span>{layer.number}</span>
              <strong>{layer.title}</strong>
              <em>{layer.summary}</em>
            </button>
          ))}
        </div>
      </div>

      <div className="research-stack-shell">
        <div className="research-stack-stage" onMouseLeave={releaseLayer}>
          <svg className="research-loop-map" viewBox="0 0 260 220" aria-hidden="true">
            <path className="research-loop-path" d={loopPath} />
            <circle className="research-loop-dot" r="5">
              <animateMotion dur="2.8s" repeatCount="indefinite" path={loopPath} />
            </circle>
          </svg>
          <div className={`research-loop-label${isAutoRunning ? " is-active" : ""}`} aria-hidden="true">
            <span>Loop</span>
            <strong>Iteration</strong>
          </div>

          <div className="research-stack-layers" aria-label="Interactive research stack">
            {pillars.map((layer, index) => (
              <button
                className={`research-layer research-layer-${layer.accent}${activeLayerId === layer.id ? " is-active" : ""}`}
                type="button"
                key={layer.id}
                style={{ "--i": pillars.length - 1 - index }}
                aria-current={activeLayerId === layer.id ? "true" : undefined}
                onMouseEnter={() => activateLayer(layer.id)}
                onMouseLeave={() => releaseLayer(layer.id)}
                onFocus={() => activateLayer(layer.id)}
                onBlur={() => releaseLayer(layer.id)}
                onClick={() => selectLayer(layer.id)}
              >
                <span className="research-layer-index">{layer.number}</span>
                <strong>{layer.title}</strong>
                <span className="research-layer-metric">{layer.metric}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="research-active-card" aria-live={manualLayerId ? "polite" : "off"}>
          <p>{activeLayer.number}</p>
          <h3>{activeLayer.title}</h3>
          <span>{activeLayer.activeDetail}</span>
        </div>
      </div>
    </div>
  );
}

function AboutContact() {
  const sectionRef = useRef(null);
  const [primaryContact, ...secondaryContactLinks] = contactLinks;

  useGSAP(
    () => {
      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      gsap.set(".about-trace-path", { drawSVG: "0% 0%" });
      gsap.set(".research-loop-path", { drawSVG: "0% 0%" });
      gsap.set(".contact-signal", { autoAlpha: 0, scale: 0.62, transformOrigin: "50% 50%" });

      gsap.fromTo(
        ".about-copy > *",
        {
          y: reduceMotion ? 0 : 34,
          autoAlpha: 0,
        },
        {
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 74%",
            once: true,
          },
          y: 0,
          autoAlpha: 1,
          duration: reduceMotion ? 0.01 : 0.74,
          ease: "power3.out",
          stagger: 0.08,
          immediateRender: false,
        },
      );

      gsap.fromTo(
        ".research-structure > *",
        {
          y: reduceMotion ? 0 : 34,
          autoAlpha: 0,
        },
        {
          scrollTrigger: {
            trigger: ".research-structure",
            start: "top 78%",
            once: true,
          },
          y: 0,
          autoAlpha: 1,
          duration: reduceMotion ? 0.01 : 0.78,
          ease: "power3.out",
          stagger: 0.08,
          immediateRender: false,
        },
      );

      gsap.fromTo(
        ".contact-panel > *",
        {
          y: reduceMotion ? 0 : 34,
          autoAlpha: 0,
        },
        {
          scrollTrigger: {
            trigger: ".contact-panel",
            start: "top 76%",
            once: true,
          },
          y: 0,
          autoAlpha: 1,
          duration: reduceMotion ? 0.01 : 0.74,
          ease: "power3.out",
          stagger: 0.08,
          immediateRender: false,
        },
      );

      if (reduceMotion) {
        gsap.set(".about-trace-path, .research-loop-path, .contact-signal", {
          clearProps: "all",
          autoAlpha: 1,
          scale: 1,
        });
        return;
      }

      gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 80%",
          end: "bottom 46%",
          scrub: 0.75,
        },
      })
        .to(".about-trace-path", { drawSVG: "0% 100%", stagger: 0.08 }, 0)
        .to(".contact-signal", { autoAlpha: 1, scale: 1, stagger: 0.12 }, 0.16)
        .to(".contact-signal-a", {
          motionPath: {
            path: ".about-trace-main",
            align: ".about-trace-main",
            alignOrigin: [0.5, 0.5],
          },
          duration: 0.7,
        }, 0.2);

      gsap.timeline({
        defaults: { ease: "power2.out" },
        scrollTrigger: {
          trigger: ".research-structure",
          start: "top 76%",
          once: true,
        },
      })
        .to(".research-loop-path", { drawSVG: "0% 100%", duration: 1.15 }, 0.12);

    },
    { scope: sectionRef },
  );

  return (
    <section className="about-section" id="about" ref={sectionRef}>
      <svg className="about-trace" data-speed="1.08" viewBox="0 0 980 520" aria-hidden="true">
        <path
          className="about-trace-path about-trace-main"
          d="M70 128 C220 42 354 82 466 198 C584 322 734 326 908 218"
        />
        <path
          className="about-trace-path"
          d="M118 408 C270 326 410 320 522 374 C648 434 752 392 884 322"
        />
        <circle className="contact-signal contact-signal-a" cx="70" cy="128" r="8" />
        <circle className="contact-signal" cx="884" cy="322" r="7" />
      </svg>

      <div className="about-copy">
        <h2>A research stack for generative motion and XR.</h2>
        <p>
          MalouTech builds systems that translate multimodal signals into
          structured representations, generative models, and inspectable
          research artifacts for AI-generated art, 3D human motion, and spatial interfaces.
        </p>
      </div>

      <ResearchStructure />

      <div className="contact-panel" id="contact">
        <div className="contact-panel-main">
          <div className="contact-copy">
            <h2>Contact MalouTech.</h2>
          </div>
          <div className="contact-primary">
            <a className="contact-primary-link" href={primaryContact.href}>
              <span className="contact-icon-shell">
                <ContactIcon label={primaryContact.label} />
              </span>
              <span>{primaryContact.value}</span>
            </a>
            <MagneticButton href={primaryContact.href}>Email</MagneticButton>
          </div>
        </div>
        <div className="contact-grid" aria-label="MalouTech contact links">
          {secondaryContactLinks.map((link) => (
            <MagneticButton
              key={`${link.label}-${link.href}`}
              href={link.href}
              target={link.href.startsWith("http") ? "_blank" : undefined}
              rel={link.href.startsWith("http") ? "noreferrer" : undefined}
              ariaLabel={link.label}
              variant="contact"
              className="contact-social-link"
            >
              <span className="contact-icon-shell">
                <ContactIcon label={link.label} />
              </span>
              <strong>{link.value}</strong>
            </MagneticButton>
          ))}
        </div>
      </div>

      <footer className="site-footer">
        <span>Malou Tech Inc © 2026</span>
        <span>
          Design by{" "}
          <a href="https://dearbobby9.github.io/" target="_blank" rel="noreferrer">
            Difan Jia
          </a>{" "}
          and build with Codex.
        </span>
      </footer>
    </section>
  );
}

function PaperList() {
  const listRef = useRef(null);

  useGSAP(
    () => {
      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      if (reduceMotion) return;

      ScrollTrigger.batch(".paper-list-section .paper-card", {
        start: "top 84%",
        once: true,
        onEnter: (batch) => {
          const evidenceRows = batch.flatMap((card) =>
            gsap.utils.toArray(".paper-evidence-row", card),
          );
          const artifactFills = batch.flatMap((card) =>
            gsap.utils.toArray(".paper-artifact-fill", card),
          );

          gsap.from(batch, {
            y: 42,
            autoAlpha: 0,
            scale: 0.98,
            duration: 0.72,
            ease: "power3.out",
            stagger: 0.08,
            overwrite: true,
          });
          gsap.from(evidenceRows, {
            y: 14,
            autoAlpha: 0,
            duration: 0.52,
            ease: "power3.out",
            stagger: 0.03,
            overwrite: true,
          });
          gsap.fromTo(
            artifactFills,
            { scaleX: 0 },
            {
              scaleX: 1,
              duration: 0.68,
              ease: "power3.out",
              stagger: 0.04,
              overwrite: true,
            },
          );
        },
      });
    },
    { scope: listRef },
  );

  return (
    <section className="paper-list-section" id="paper-list" ref={listRef}>
      <div className="paper-list-heading">
        <p className="section-kicker">Paper list</p>
        <h2>Seven publication records with links, methods, outputs, and artifact status.</h2>
      </div>
      <div className="paper-list" aria-label="Complete publication list">
        {papers.map((paper) => (
          <article
            key={paper.title}
            className="paper-card"
            data-title={paper.title}
            data-venue={paper.venue}
            data-type={paper.type}
            data-image={paper.image}
            data-image-preview={paper.imageMedium}
            data-image-srcset={paper.imageSrcSet}
            data-accent={paper.accent}
          >
            <figure className="paper-visual" style={paperAspectStyle(paper)}>
              <PaperImage
                paper={paper}
                sizes="(max-width: 900px) 100vw, 420px"
                fallback="medium"
              />
            </figure>
            <div>
              <p className="paper-meta">
                {paper.venue} <span>{paper.type}</span>
              </p>
              <h3>{paper.title}</h3>
              <p className="paper-authors">{paper.authors}</p>
              <p className="paper-contribution">{paper.contribution}</p>
              <PaperLinks links={paper.links} />
              <div className="paper-evidence-grid" aria-label={`Evidence matrix for ${paper.title}`}>
                {[
                  ["Signal", paper.evidence.signal],
                  ["Method", paper.evidence.method],
                  ["Output", paper.evidence.output],
                  ["Artifact", paper.evidence.artifacts],
                ].map(([label, value]) => (
                  <div className="paper-evidence-row" key={`${paper.title}-${label}`}>
                    <span>{label}</span>
                    <strong>{value}</strong>
                  </div>
                ))}
              </div>
              <div className="paper-artifact-meter" aria-hidden="true">
                <span className={`paper-artifact-fill paper-artifact-${paper.accent}`} />
              </div>
              <div className="paper-themes" aria-label={`Themes for ${paper.title}`}>
                {paper.themes.map((theme) => (
                  <span key={theme}>{theme}</span>
                ))}
              </div>
              <p className="paper-credit">{paper.assetCredit}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function MagneticButton({
  href,
  children,
  variant = "solid",
  className = "",
  target,
  rel,
  ariaLabel,
}) {
  const buttonRef = useRef(null);

  useGSAP(
    () => {
      const el = buttonRef.current;
      const xTo = gsap.quickTo(el, "x", { duration: 0.32, ease: "power3.out" });
      const yTo = gsap.quickTo(el, "y", { duration: 0.32, ease: "power3.out" });

      const onMove = (event) => {
        const rect = el.getBoundingClientRect();
        xTo((event.clientX - rect.left - rect.width / 2) * 0.2);
        yTo((event.clientY - rect.top - rect.height / 2) * 0.28);
      };
      const onLeave = () => {
        xTo(0);
        yTo(0);
      };

      el.addEventListener("pointermove", onMove);
      el.addEventListener("pointerleave", onLeave);
      return () => {
        el.removeEventListener("pointermove", onMove);
        el.removeEventListener("pointerleave", onLeave);
      };
    },
    { scope: buttonRef },
  );

  return (
    <a
      ref={buttonRef}
      className={`magnetic magnetic-${variant}${className ? ` ${className}` : ""}`}
      href={href}
      target={target}
      rel={rel}
      aria-label={ariaLabel}
    >
      {children}
    </a>
  );
}

export default App;
