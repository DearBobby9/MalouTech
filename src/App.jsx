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
import { contactLinks, papers, people, pillars } from "./data/site";

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

function App() {
  const appRef = useRef(null);
  useSmoothScroll(appRef);
  useHashAnchorSettle();

  return (
    <div className="app-root" ref={appRef}>
      <div className="smooth-wrapper" id="smooth-wrapper">
        <main className="site-shell smooth-content" id="smooth-content">
          <ResearchStage />
          <PublicationProof />
          <OpenResearch />
          <AboutContact />
        </main>
      </div>
    </div>
  );
}

function useSmoothScroll(scopeRef) {
  useGSAP(
    () => {
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
    { scope: scopeRef },
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
      gsap.set(".signal-runner", { autoAlpha: 0, scale: 0.7, transformOrigin: "50% 50%" });
      gsap.set(".route-particle", { autoAlpha: 0, scale: 0.42, transformOrigin: "50% 50%" });
      gsap.set(".route-node", { autoAlpha: 0, scale: 0.48, transformOrigin: "50% 50%" });
      gsap.set(".spectral-bar", { scaleY: 0, transformOrigin: "bottom" });
      gsap.set(".token", { autoAlpha: 0, y: 24, scale: 0.72 });
      gsap.set(".expert-card", { autoAlpha: 0, y: 40, scale: 0.92 });
      gsap.set(".xr-plane", { autoAlpha: 0, xPercent: 16, rotationY: -18 });
      gsap.set(".skeleton-node", { autoAlpha: 0, scale: 0.4 });
      gsap.set(".orbit-path", { drawSVG: "0% 0%" });
      gsap.set(".orbit-node", { autoAlpha: 0, scale: 0.48, transformOrigin: "50% 50%" });
      gsap.set(".paper-orbit-card", {
        autoAlpha: 0,
        y: 38,
        z: -120,
        rotationY: -24,
        scale: 0.72,
        transformOrigin: "50% 50%",
      });
      gsap.set(".paper-orbit-card img", { scale: 1.14, transformOrigin: "50% 50%" });

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
        .from(".stage-orb", { autoAlpha: 0, scale: 0.75, stagger: 0.08 }, 0.1)
        .to(".orbit-path", { drawSVG: "0% 78%", stagger: 0.08 }, 0.44)
        .to(".orbit-node", { autoAlpha: 1, scale: 1, stagger: 0.04 }, 0.52)
        .to(
          ".paper-orbit-card",
          { autoAlpha: 0.82, y: 0, z: 0, rotationY: 0, scale: 1, stagger: { amount: 0.42, from: "center" } },
          0.48,
        )
        .to(".paper-orbit-card img", { scale: 1.04, stagger: { amount: 0.34, from: "center" } }, 0.52);

      if (reduceMotion) {
        gsap.set(
          ".waveform-path, .route-path, .connector-path, .motion-trail, .signal-runner, .route-particle, .route-node, .spectral-bar, .token, .expert-card, .xr-plane, .skeleton-node, .orbit-path, .orbit-node, .paper-orbit-card, .paper-orbit-card img",
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
        .to(".research-orbit", { xPercent: -3, yPercent: -2 }, 0.04)
        .to(".stage-copy-identity", { autoAlpha: 1, y: 0 }, 0)
        .to(".stage-copy-signal", { autoAlpha: 0, y: 26 }, 0)
        .addLabel("signal", 0.25)
        .to(".hero-title-mask", { yPercent: -42, autoAlpha: 0.1 }, 0.18)
        .to(".hero-kicker, .hero-copy, .hero-actions", { autoAlpha: 0, y: -22 }, 0.2)
        .to(".hero-evidence", { autoAlpha: 0, y: -16 }, 0.2)
        .to(".stage-copy-identity", { autoAlpha: 0, y: -30 }, 0.22)
        .to(".stage-copy-signal", { autoAlpha: 1, y: 0 }, 0.25)
        .to(".paper-orbit-card", {
          xPercent: (index) => [-12, 8, 16, -18, 12, -8, 20][index] || 0,
          yPercent: (index) => [-8, -14, 10, 16, -18, 12, 4][index] || 0,
          rotation: (index) => [-4, 5, -2, 3, -5, 4, -3][index] || 0,
          autoAlpha: 0.72,
          scale: 0.96,
          stagger: 0.012,
        }, 0.26)
        .to(".paper-orbit-card img", { scale: 1.1, stagger: 0.01 }, 0.26)
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
        .to(".hero-title-mask", { autoAlpha: 0.04, duration: 0.1 }, 0.58)
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
        .to(".expert-card", { autoAlpha: 1, y: 0, scale: 1, duration: 0.16, stagger: 0.08 }, 0.57)
        .to(".expert-pulse", { scale: 1.08, autoAlpha: 0.65, stagger: 0.05 }, 0.66)
        .to(".paper-orbit-card", {
          xPercent: (index) => [-34, -18, 18, 30, -24, 22, 8][index] || 0,
          yPercent: (index) => [24, -28, -22, 26, 4, -8, 30][index] || 0,
          rotationY: (index) => (index % 2 === 0 ? 16 : -18),
          z: (index) => (index % 3 === 0 ? 90 : -40),
          autoAlpha: 0.54,
          scale: 0.84,
          stagger: 0.01,
        }, 0.52)
        .to(".stage-camera", { xPercent: -15, yPercent: 2, scale: 1.16 }, 0.5)
        .addLabel("spatial", 0.75)
        .to(".stage-copy-model", { autoAlpha: 0, y: -28 }, 0.74)
        .to(".stage-copy-spatial", { autoAlpha: 1, y: 0 }, 0.75)
        .to(".hero-panel", { autoAlpha: 0, y: -34, duration: 0.12 }, 0.74)
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
        .to(".motion-trail", { drawSVG: "0% 100%", duration: 0.18, stagger: 0.04 }, 0.77)
        .to(".skeleton-node", { autoAlpha: 1, scale: 1, duration: 0.18, stagger: { amount: 0.24, from: "center" } }, 0.78)
        .to(".xr-plane", { autoAlpha: 1, xPercent: 0, rotationY: 0, duration: 0.18, stagger: 0.09 }, 0.82)
        .to(".paper-orbit-card", {
          xPercent: (index) => [-56, -34, 24, 48, -42, 34, 60][index] || 0,
          yPercent: (index) => [38, -42, -34, 36, 8, -12, 42][index] || 0,
          rotationX: (index) => (index % 2 === 0 ? 10 : -8),
          rotationY: (index) => (index % 2 === 0 ? -22 : 24),
          autoAlpha: 0.38,
          scale: 0.74,
          stagger: 0.01,
        }, 0.78)
        .to(".stage-camera", { xPercent: -18, yPercent: 0, scale: 1.2 }, 0.75)
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
          <img className="brand-mark" src="/assets/brand/malou-mark.svg" alt="" />
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
          <img className="brand-watermark" src="/assets/brand/malou-mark.svg" alt="" />
          <div className="stage-grid" />
          <div className="stage-orb stage-orb-a" />
          <div className="stage-orb stage-orb-b" />
          <div className="stage-orb stage-orb-c" />
          <Waveform />
          <TokenGrid />
          <RouteField />
          <ResearchOrbit />
          <ModelDiagram />
          <MotionSkeleton />
          <XRPlanes />
        </div>

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

function ResearchOrbit() {
  return (
    <div className="research-orbit" aria-hidden="true">
      <svg className="orbit-map" viewBox="0 0 940 560">
        <path
          className="orbit-path orbit-path-main"
          d="M78 334 C210 148 390 96 542 166 C698 238 704 398 858 458"
        />
        <path
          className="orbit-path"
          d="M132 160 C270 258 386 292 514 258 C650 222 734 260 828 344"
        />
        <path
          className="orbit-path"
          d="M236 466 C342 338 448 318 574 378 C660 420 734 402 840 278"
        />
        {[
          [78, 334],
          [236, 466],
          [390, 96],
          [514, 258],
          [704, 398],
          [828, 344],
          [858, 458],
        ].map(([cx, cy]) => (
          <circle className="orbit-node" key={`${cx}-${cy}`} cx={cx} cy={cy} r="7" />
        ))}
      </svg>
      <div className="orbit-stack">
        {papers.map((paper, index) => (
          <figure className="paper-orbit-card" key={`orbit-${paper.title}`}>
            <img src={paper.image} alt="" loading={index < 3 ? "eager" : "lazy"} />
            <figcaption>
              <span>{paper.venue}</span>
              <strong>{paper.type}</strong>
            </figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}

function HeroEvidence() {
  return (
    <div className="hero-evidence" aria-label="Featured publication evidence">
      {papers.slice(0, 3).map((paper) => (
        <figure key={paper.title}>
          <img src={paper.image} alt="" loading="eager" />
          <figcaption>
            <span>{paper.venue}</span>
            <strong>{paper.type}</strong>
          </figcaption>
        </figure>
      ))}
    </div>
  );
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
  const previewRef = useRef(null);
  const [activeSpotlightIndex, setActiveSpotlightIndex] = useState(0);

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
          .to(".publication-atlas", { yPercent: -12, rotation: -4, autoAlpha: 0.3 }, 0)
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
          const railItems = gsap.utils.toArray(".spotlight-rail-item", spotlight);
          const progressFill = spotlight.querySelector(".spotlight-progress-fill");
          let currentSpotlightIndex = 0;
          const syncSpotlightIndex = (progress) => {
            const nextIndex = Math.min(
              frames.length - 1,
              Math.max(0, Math.round(progress * (frames.length - 1))),
            );
            if (nextIndex !== currentSpotlightIndex) {
              currentSpotlightIndex = nextIndex;
              setActiveSpotlightIndex(nextIndex);
            }
          };

          gsap.set(frames, {
            autoAlpha: 0,
            yPercent: 14,
            scale: 0.82,
            rotation: (index) => (index % 2 === 0 ? -5 : 5),
            transformOrigin: "50% 60%",
          });
          gsap.set(".spotlight-frame img", { scale: 1.08, xPercent: 0, yPercent: 0 });
          gsap.set(frames[0], { autoAlpha: 1, yPercent: 0, scale: 1, rotation: 0 });
          gsap.set(frames[0].querySelector("img"), { scale: 1.02 });
          gsap.set(panels, { autoAlpha: 0, y: 22 });
          gsap.set(panels[0], { autoAlpha: 1, y: 0 });
          gsap.set(railItems, { autoAlpha: 0.52, scale: 0.92, transformOrigin: "50% 50%" });
          gsap.set(railItems[0], { autoAlpha: 1, scale: 1 });
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
              onUpdate: (self) => syncSpotlightIndex(self.progress),
            },
          });

          spotlightTimeline
            .to(progressFill, { scaleX: 1, duration: frames.length - 1 }, 0)
            .to(".spotlight-stage", { rotationX: 4, rotationY: -3, duration: frames.length - 1 }, 0)
            .to(".spotlight-rail", { yPercent: -8, duration: frames.length - 1 }, 0);

          frames.slice(1).forEach((frame, index) => {
            const currentIndex = index + 1;
            const previousFrame = frames[currentIndex - 1];
            const previousPanel = panels[currentIndex - 1];
            const currentPanel = panels[currentIndex];
            const previousRail = railItems[currentIndex - 1];
            const currentRail = railItems[currentIndex];
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
                scale: 1.16,
                xPercent: currentIndex % 2 === 0 ? -3 : 3,
                yPercent: -2,
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
                scale: 1.02,
                xPercent: 0,
                yPercent: 0,
                duration: 0.72,
              }, at - 0.4)
              .to(previousPanel, { autoAlpha: 0, y: -20, duration: 0.42 }, at - 0.42)
              .to(currentPanel, { autoAlpha: 1, y: 0, duration: 0.48 }, at - 0.28)
              .to(previousRail, { autoAlpha: 0.52, scale: 0.92, duration: 0.34 }, at - 0.36)
              .to(currentRail, { autoAlpha: 1, scale: 1, duration: 0.36 }, at - 0.28);
          });
        });
      }

      ScrollTrigger.batch(".paper-card", {
        start: "top 82%",
        once: true,
        onEnter: (batch) => {
          gsap.from(batch, {
            y: 46,
            autoAlpha: 0,
            scale: 0.97,
            duration: 0.72,
            ease: "power3.out",
            stagger: 0.1,
            overwrite: true,
          });
        },
      });

      const preview = previewRef.current;
      const xTo = gsap.quickTo(preview, "x", { duration: 0.36, ease: "power3" });
      const yTo = gsap.quickTo(preview, "y", { duration: 0.36, ease: "power3" });
      let previewVisible = false;

      const onMove = (event) => {
        xTo(event.clientX + 28);
        yTo(event.clientY - 64);
      };
      const hidePreview = () => {
        if (!previewVisible) return;
        previewVisible = false;
        gsap.to(preview, {
          autoAlpha: 0,
          scale: 0.94,
          duration: 0.18,
          ease: "power2.out",
          overwrite: true,
        });
      };

      const cards = proofRef.current.querySelectorAll(".paper-card");
      const cleanups = [];
      cards.forEach((card) => {
        const onEnter = () => {
          previewVisible = true;
          preview.querySelector(".preview-title").textContent = card.dataset.title;
          preview.querySelector(".preview-venue").textContent = card.dataset.venue;
          preview.querySelector(".preview-type").textContent = card.dataset.type;
          const previewImage = preview.querySelector(".preview-image");
          previewImage.src = card.dataset.image;
          previewImage.alt = "";
          preview.dataset.accent = card.dataset.accent;
          gsap.to(preview, {
            autoAlpha: 1,
            scale: 1,
            duration: 0.22,
            ease: "power2.out",
            overwrite: true,
          });
        };

        card.addEventListener("pointermove", onMove);
        card.addEventListener("pointerenter", onEnter);
        card.addEventListener("pointerleave", hidePreview);
        cleanups.push(() => {
          card.removeEventListener("pointermove", onMove);
          card.removeEventListener("pointerenter", onEnter);
          card.removeEventListener("pointerleave", hidePreview);
        });
      });
      window.addEventListener("scroll", hidePreview, { passive: true });

      return () => {
        mm.revert();
        cleanups.forEach((cleanup) => cleanup());
        window.removeEventListener("scroll", hidePreview);
      };
    },
    { scope: proofRef },
  );

  return (
    <section className="proof-section" id="publications" ref={proofRef}>
      <div className="publication-atlas" data-speed="0.86" aria-hidden="true">
        {Array.from({ length: 14 }, (_, index) => (
          <figure key={index} className={index % 4 === 0 ? "is-hot" : ""}>
            <img src={papers[index % papers.length].image} alt="" loading="lazy" />
          </figure>
        ))}
      </div>
      <PublicationTrace />
      <div className="proof-heading">
        <p className="section-kicker">Publication proof</p>
        <h2>Research evidence backed by papers, code, project pages, and real publication imagery.</h2>
        <div className="venue-strip" aria-label="Venues represented in the seed publication list">
          {["SIGGRAPH", "IEEE VR", "CVPR W", "NeurIPS", "ACM MM", "ICMR"].map((venue) => (
            <span key={venue}>{venue}</span>
          ))}
        </div>
        <a className="proof-source" href="https://xulongt.github.io/#publications" target="_blank" rel="noreferrer">
          Source: Xulong Tang publication list
        </a>
      </div>
      <div className="paper-spotlight" aria-label="Scroll-linked publication spotlight">
        <div className="spotlight-copy">
          {papers.map((paper, index) => (
            <article className="spotlight-copy-panel" key={`spotlight-copy-${paper.title}`}>
              <p>{String(index + 1).padStart(2, "0")} / {String(papers.length).padStart(2, "0")}</p>
              <h3>{paper.title}</h3>
              <strong>{paper.venue} · {paper.type}</strong>
              <span>{paper.contribution}</span>
              <div className="spotlight-themes" aria-label={`Spotlight themes for ${paper.title}`}>
                {paper.themes.map((theme) => (
                  <em key={`${paper.title}-${theme}`}>{theme}</em>
                ))}
              </div>
            </article>
          ))}
        </div>
        <div className="spotlight-stage" aria-hidden="true">
          <img className="spotlight-mark" src="/assets/brand/malou-mark.svg" alt="" />
          {papers.map((paper, index) => (
            <figure className="spotlight-frame" key={`spotlight-frame-${paper.title}`}>
              <img src={paper.image} alt="" loading={index === 0 ? "eager" : "lazy"} />
              <figcaption>
                <span>{paper.venue}</span>
                <strong>{paper.type}</strong>
              </figcaption>
            </figure>
          ))}
        </div>
        <div className="spotlight-rail" aria-hidden="true">
          {papers.map((paper, index) => (
            <figure
              className={`spotlight-rail-item ${index === activeSpotlightIndex ? "is-active" : ""}`}
              key={`spotlight-rail-${paper.title}`}
            >
              <img src={paper.image} alt="" loading="lazy" />
              <figcaption>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <strong>{paper.venue}</strong>
              </figcaption>
            </figure>
          ))}
        </div>
        <div className="spotlight-progress" aria-hidden="true">
          <span className="spotlight-progress-fill" />
        </div>
      </div>
      <div className="paper-list" aria-label="Featured publications">
        {papers.map((paper) => (
          <article
            key={paper.title}
            className="paper-card"
            data-title={paper.title}
            data-venue={paper.venue}
            data-type={paper.type}
            data-image={paper.image}
            data-accent={paper.accent}
          >
            <div className="paper-index" />
            <figure className="paper-visual">
              <img src={paper.image} alt="" loading="lazy" />
            </figure>
            <div>
              <p className="paper-meta">
                {paper.venue} <span>{paper.type}</span>
              </p>
              <h3>{paper.title}</h3>
              <p className="paper-authors">{paper.authors}</p>
              <p className="paper-contribution">{paper.contribution}</p>
              <div className="paper-themes" aria-label={`Themes for ${paper.title}`}>
                {paper.themes.map((theme) => (
                  <span key={theme}>{theme}</span>
                ))}
              </div>
              {paper.links.length > 0 && (
                <div className="paper-links">
                  {paper.links.map((link) => (
                    <a key={link.href} href={link.href} target="_blank" rel="noreferrer">
                      {link.label}
                    </a>
                  ))}
                </div>
              )}
              <p className="paper-credit">{paper.assetCredit}</p>
            </div>
          </article>
        ))}
      </div>
      <div ref={previewRef} className="paper-preview" aria-hidden="true">
        <div className="preview-figure">
          <img className="preview-image" src={papers[0].image} alt="" />
        </div>
        <p className="preview-venue">SIGGRAPH 2026</p>
        <p className="preview-type">Motion + Appearance</p>
        <p className="preview-title">MACE-Dance</p>
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

function OpenResearch() {
  const sectionRef = useRef(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      if (reduceMotion) {
        gsap.set(".pipeline-progress-fill", { scaleX: 1, transformOrigin: "left center" });
        return () => mm.revert();
      }

      mm.add("(min-width: 820px)", () => {
        const track = sectionRef.current.querySelector(".pipeline-track");
        const cards = sectionRef.current.querySelectorAll(".pipeline-card");
        const progressFill = sectionRef.current.querySelector(".pipeline-progress-fill");
        const setProgress = gsap.quickSetter(progressFill, "scaleX");
        gsap.set(progressFill, { scaleX: 0, transformOrigin: "left center" });

        const tween = gsap.to(track, {
          x: () => -(track.scrollWidth - window.innerWidth + 96),
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top top",
            end: () => `+=${track.scrollWidth}`,
            scrub: 0.8,
            pin: true,
            invalidateOnRefresh: true,
            onUpdate: (self) => setProgress(self.progress),
          },
        });

        gsap.to(".pipeline-field", {
          xPercent: -8,
          autoAlpha: 0.54,
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top top",
            end: () => `+=${track.scrollWidth}`,
            scrub: 0.8,
            invalidateOnRefresh: true,
          },
        });

        cards.forEach((card, index) => {
          const evidenceItems = card.querySelectorAll(
            ".pillar-evidence figure, .collab-evidence figure",
          );
          const evidenceImages = card.querySelectorAll(
            ".pillar-evidence img, .collab-evidence img",
          );

          gsap.from(card.querySelectorAll(".pipeline-card > *"), {
            x: 48,
            autoAlpha: 0,
            stagger: 0.07,
            duration: 0.6,
            ease: "power3.out",
            scrollTrigger: {
              trigger: card,
              containerAnimation: tween,
              start: "left 72%",
              end: "right 32%",
              toggleActions: "play none none reverse",
            },
          });

          if (evidenceItems.length > 0) {
            gsap.from(evidenceItems, {
              y: 26,
              autoAlpha: 0,
              scale: 0.92,
              stagger: 0.06,
              duration: 0.58,
              ease: "power3.out",
              scrollTrigger: {
                trigger: card,
                containerAnimation: tween,
                start: "left 68%",
                end: "right 30%",
                toggleActions: "play none none reverse",
              },
            });

            gsap.to(evidenceImages, {
              scale: 1.1,
              xPercent: index % 2 === 0 ? -4 : 4,
              ease: "none",
              scrollTrigger: {
                trigger: card,
                containerAnimation: tween,
                start: "left right",
                end: "right left",
                scrub: true,
              },
            });
          }

          gsap.to(card, {
            y: index % 2 === 0 ? -32 : 32,
            rotation: index % 2 === 0 ? -1.2 : 1.2,
            ease: "none",
            scrollTrigger: {
              trigger: card,
              containerAnimation: tween,
              start: "left right",
              end: "right left",
              scrub: true,
            },
          });
        });
      });

      return () => mm.revert();
    },
    { scope: sectionRef },
  );

  return (
    <section className="open-section" id="research" ref={sectionRef}>
      <div className="pipeline-field" data-speed="0.9" aria-hidden="true">
        {Array.from({ length: 18 }, (_, index) => (
          <span key={index} />
        ))}
      </div>
      <div className="open-copy">
        <p className="section-kicker">Research translation</p>
        <h2>From source signal to public artifact.</h2>
      </div>
      <div className="pipeline-progress" aria-hidden="true">
        <span className="pipeline-progress-fill" />
      </div>
      <div className="pipeline-track">
        {pillars.map((pillar, index) => (
          <article className="pipeline-card" key={pillar.title}>
            <p>0{index + 1}</p>
            <h3>{pillar.title}</h3>
            <strong>{pillar.metric}</strong>
            <span>{pillar.detail}</span>
            <div className="pillar-evidence" aria-label={`${pillar.title} publication evidence`}>
              {pillar.evidence.map((paperIndex) => {
                const paper = papers[paperIndex];
                return (
                  <figure key={`${pillar.title}-${paper.title}`}>
                    <img src={paper.image} alt="" loading="lazy" />
                    <figcaption>
                      <span>{paper.venue}</span>
                      <strong>{paper.type}</strong>
                    </figcaption>
                  </figure>
                );
              })}
            </div>
          </article>
        ))}
        <article className="pipeline-card pipeline-card-wide" id="collaborate">
          <p>05</p>
          <h3>Collaborate with MalouTech</h3>
          <strong>open research</strong>
          <span>
            Research inquiries should land on evidence: publications, code,
            project pages, prototype media, and clearly scoped collaboration.
          </span>
          <div className="collab-evidence" aria-label="Featured publication artifacts">
            {papers.slice(0, 4).map((paper) => (
              <figure key={`collab-${paper.title}`}>
                <img src={paper.image} alt="" loading="lazy" />
                <figcaption>{paper.venue}</figcaption>
              </figure>
            ))}
          </div>
          <MagneticButton href="#contact">Contact the lab</MagneticButton>
        </article>
      </div>
    </section>
  );
}

function AboutContact() {
  const sectionRef = useRef(null);

  useGSAP(
    () => {
      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      gsap.set(".about-trace-path", { drawSVG: "0% 0%" });
      gsap.set(".contact-signal", { autoAlpha: 0, scale: 0.62, transformOrigin: "50% 50%" });

      gsap.from(".about-copy > *, .people-card, .contact-panel > *", {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 74%",
          once: true,
        },
        y: reduceMotion ? 0 : 34,
        autoAlpha: 0,
        duration: reduceMotion ? 0.01 : 0.74,
        ease: "power3.out",
        stagger: 0.08,
      });

      if (reduceMotion) {
        gsap.set(".about-trace-path, .contact-signal", {
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

      ScrollTrigger.batch(".about-evidence-tile", {
        start: "top 82%",
        once: true,
        onEnter: (batch) => {
          gsap.from(batch, {
            y: 46,
            autoAlpha: 0,
            scale: 0.94,
            rotation: (index) => (index % 2 === 0 ? -1.4 : 1.4),
            duration: 0.78,
            ease: "power3.out",
            stagger: { amount: 0.32, from: "center" },
            overwrite: true,
          });
        },
      });

      gsap.to(".about-evidence-tile img", {
        yPercent: -8,
        scale: 1.08,
        ease: "none",
        scrollTrigger: {
          trigger: ".about-evidence",
          start: "top bottom",
          end: "bottom top",
          scrub: 0.8,
        },
      });
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
        <p className="section-kicker">About MalouTech</p>
        <h2>Nonprofit research for expressive human-AI creation.</h2>
        <p>
          MalouTech connects AI-generated art, 3D human motion generation,
          multimodal learning, and extended reality through public research
          outputs, project pages, prototype media, and collaboration channels.
        </p>
      </div>

      <div className="people-grid" aria-label="MalouTech team">
        {people.map((person) => (
          <article className="people-card" key={person.name}>
            <p>{person.role}</p>
            <h3>{person.name}</h3>
            <span>{person.detail}</span>
          </article>
        ))}
      </div>

      <div className="about-evidence" aria-label="Research evidence surface">
        <div className="about-evidence-copy">
          <img src="/assets/brand/malou-mark.svg" alt="" />
          <p>Evidence surface</p>
          <h3>Publication artifacts form the lab's public research surface.</h3>
          <span>
            Recent work spans motion-appearance video generation, XR dance
            synthesis, group choreography, retrieval, and token-based
            music-to-dance modeling.
          </span>
        </div>
        {papers.slice(0, 5).map((paper, index) => (
          <figure
            className={`about-evidence-tile ${index === 0 ? "is-large" : ""}`}
            key={`about-${paper.title}`}
          >
            <img src={paper.image} alt="" loading="lazy" />
            <figcaption>
              <span>{paper.venue}</span>
              <strong>{paper.type}</strong>
            </figcaption>
          </figure>
        ))}
      </div>

      <div className="contact-panel" id="contact">
        <p className="section-kicker">Contact / collaboration</p>
        <h2>Share research inquiries, collaboration ideas, and publication updates.</h2>
        <MagneticButton href="mailto:admin@maloutech.com">Email MalouTech</MagneticButton>
        <div className="contact-grid" aria-label="MalouTech contact links">
          {contactLinks.map((link) => (
            <a key={`${link.label}-${link.href}`} href={link.href} target={link.href.startsWith("http") ? "_blank" : undefined} rel={link.href.startsWith("http") ? "noreferrer" : undefined}>
              <span>{link.label}</span>
              <strong>{link.value}</strong>
            </a>
          ))}
        </div>
      </div>

      <footer className="site-footer">
        <span>Malou Tech Inc | Copyright © 2024</span>
        <a href="https://www.maloutech.com/contact" target="_blank" rel="noreferrer">
          Current site source
        </a>
        <a href="https://xulongt.github.io/" target="_blank" rel="noreferrer">
          Publication data source
        </a>
      </footer>
    </section>
  );
}

function MagneticButton({ href, children, variant = "solid" }) {
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
    <a ref={buttonRef} className={`magnetic magnetic-${variant}`} href={href}>
      <span>{children}</span>
    </a>
  );
}

export default App;
