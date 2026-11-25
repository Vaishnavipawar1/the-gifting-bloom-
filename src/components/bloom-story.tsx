import { ChevronsDown, SkipForward } from "lucide-react";
import {
  Component,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type ComponentType,
  type MouseEvent,
  type ReactNode,
} from "react";
import { ProductImage } from "./bloom-products";
import { useBloom } from "./bloom-shell";
import type { Playhead } from "./bloom-stage";
import { Link } from "@tanstack/react-router";
import { ease, gardenTimeAt, storyEnd } from "@/lib/bloom-timing";
import { BloomPrologue, updatePrologue } from "./bloom-prologue";
import "./bloom-prologue.css";
import heartAura from "@/assets/story-heart-aura.jpg";
import mobileHeartAura from "@/assets/story-heart-aura-mobile.jpg";
import gardenBackdrop from "@/assets/story-garden.webp";
import bouquetImage from "@/assets/story-sunflower-bouquet.webp";

const petals = [
  [-138, 155, -64],
  [75, 124, 100],
  [-104, 74, 65],
  [123, 53, -85],
  [35, 180, 12],
  [-37, 126, 145],
  [151, 156, -75],
  [-159, 23, 120],
];
export function ChenilleFlower({
  hue = "#b94c69",
  stem = true,
  scattered = false,
}: {
  hue?: string;
  stem?: boolean;
  scattered?: boolean;
}) {
  const id = useId();
  return (
    <svg viewBox="0 0 380 360" className="chenille" aria-hidden="true">
      <defs>
        <radialGradient id={id + "petal"} cx="40%" cy="20%" r="83%">
          <stop stopColor="#ffd4d7" />
          <stop offset=".46" stopColor={hue} />
          <stop offset="1" stopColor="#813650" />
        </radialGradient>
        <linearGradient id={id + "stem"}>
          <stop stopColor="#9caf7e" />
          <stop offset="1" stopColor="#576a4c" />
        </linearGradient>
        <filter id={id + "fuzz"} x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence type="fractalNoise" baseFrequency=".28" numOctaves="2" result="noise" />
          <feDisplacementMap
            in="SourceGraphic"
            in2="noise"
            scale="6"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </defs>
      {stem && (
        <g fill={"url(#" + id + "stem)"} className="flower-stem" filter={"url(#" + id + "fuzz)"}>
          <path
            fill="none"
            stroke={"url(#" + id + "stem)"}
            strokeWidth="11"
            strokeLinecap="round"
            d="M189 121Q222 235 181 332"
          />
          <path className="flower-leaf" d="M201 235Q235 184 277 195Q268 226 201 235Z" />
          <path className="flower-leaf" d="M201 269Q142 267 121 224Q168 220 201 269Z" />
        </g>
      )}
      <g transform="translate(190 125)" filter={"url(#" + id + "fuzz)"}>
        {petals.map(([x, y, angle], i) => (
          <g
            key={i}
            transform={scattered ? `translate(${x} ${y}) rotate(${angle}) scale(.52)` : undefined}
            data-petal=""
            data-x={x}
            data-y={y}
            data-angle={angle}
            className="flower-piece"
          >
            <g transform={"rotate(" + i * 45 + ")"}>
              <path
                d="M0 8C-18 0-49-32-26-60C-7-83 27-75 32-48C37-25 21-7 0 8Z"
                fill={"url(#" + id + "petal)"}
              />
              <path
                d="M-8-5Q-22-26-13-47Q-5-64 11-53Q20-39 7-20"
                fill="none"
                stroke="#ffe2d9"
                strokeOpacity=".38"
                strokeWidth="4"
                strokeLinecap="round"
              />
            </g>
          </g>
        ))}
        <g className="flower-core" visibility={scattered ? "hidden" : "visible"}>
          <circle r="21" fill="#76334d" />
          <circle r="15" fill="#e3ad77" />
          {[0, 60, 120, 180, 240, 300].map((n) => (
            <circle key={n} cy="-9" r="3.5" transform={"rotate(" + n + ")"} fill="#9d604f" />
          ))}
        </g>
      </g>
    </svg>
  );
}

type Stage = ComponentType<{ playhead: Playhead; onReady: () => void }>;

class StoryBoundary extends Component<
  { children: ReactNode; onUnavailable: () => void },
  { failed: boolean }
> {
  override state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  override componentDidCatch() {
    this.props.onUnavailable();
  }
  override render() {
    return this.state.failed ? null : this.props.children;
  }
}

export function BloomStory() {
  const root = useRef<HTMLElement>(null);
  const meter = useRef<HTMLProgressElement>(null);
  const playhead = useRef<Playhead>({ time: 0 });
  const pinned = useRef(false);
  const skippedBeforePin = useRef(false);
  const [Stage, setStage] = useState<Stage>();
  const [disabled, setDisabled] = useState(false);
  const [opening, setOpening] = useState(true);
  const { products, settings } = useBloom();
  const readyStage = useCallback(() => playhead.current.render?.(), []);
  const noStage = useCallback(() => setDisabled(true), []);

  useEffect(() => {
    const hash = window.location.hash.slice(1);
    const target = hash !== "home" && document.getElementById(hash);
    if (!target) return;
    skippedBeforePin.current = true;
    setDisabled(true);
    setOpening(false);
    const frame = requestAnimationFrame(() => target.scrollIntoView());
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    let alive = true;
    function load() {
      if (skippedBeforePin.current) return;
      if (preference.matches) {
        setDisabled(true);
        return;
      }
      setDisabled(false);
      import("./bloom-stage")
        .then(({ default: Renderer }) => {
          if (alive) setStage(() => Renderer);
        })
        .catch((error: unknown) => {
          if (import.meta.env.DEV) console.warn("The 3D intro could not load.", error);
          if (alive) setDisabled(true);
        });
    }
    load();
    preference.addEventListener("change", load);
    return () => {
      alive = false;
      preference.removeEventListener("change", load);
    };
  }, []);

  useEffect(() => {
    const section = root.current;
    if (!section || disabled) return;
    let alive = true;
    let revert: (() => void) | undefined;
    const state = playhead.current;
    const master = { time: 0 };
    Promise.all([import("gsap"), import("gsap/ScrollTrigger")])
      .then(([{ gsap }, { ScrollTrigger }]) => {
        if (!alive || skippedBeforePin.current) return;
        gsap.registerPlugin(ScrollTrigger);
        const scope = gsap.context(() => {
          const update = () => {
            state.time = gardenTimeAt(master.time);
            if (meter.current) meter.current.value = master.time / storyEnd;
            updatePrologue(section, master.time);
            section.style.setProperty("--bouquet-reveal", String(ease(state.time, 6.85, 7.58)));
            section.style.setProperty("--intro-glow", String(ease(state.time, 5.4, 6.6)));
            section.style.setProperty("--heart-backdrop", String(ease(state.time, 5.27, 6.18)));
            section.style.setProperty("--scroll-cue", String(1 - ease(master.time, 0, 0.85)));
            section.style.setProperty(
              "--love-caption",
              String(ease(state.time, 5.7, 6.1) * (1 - ease(state.time, 6.62, 7.1))),
            );
            section.toggleAttribute("data-revealed", state.time >= 7.53);
            state.render?.();
          };
          gsap.to(master, {
            time: storyEnd,
            ease: "none",
            onUpdate: update,
            scrollTrigger: {
              trigger: section,
              start: "top top",
              end: () =>
                "+=" + Math.round(window.innerHeight * (window.innerWidth <= 700 ? 7.6 : 9.1)),
              pin: true,
              anticipatePin: 1,
              scrub: 0.27,
              onLeave: () => setOpening(false),
              onEnterBack: () => setOpening(true),
              onRefresh: (trigger) => setOpening(trigger.progress < 1),
            },
          });
          update();
        }, section);
        pinned.current = true;
        revert = () => scope.revert();
      })
      .catch(noStage);
    return () => {
      alive = false;
      pinned.current = false;
      revert?.();
    };
  }, [disabled, noStage]);

  const bouquets = products
    .filter((product) => product.category === "bouquets" && product.image_url)
    .slice(0, 3);
  const sunflower = products.find(
    (product) =>
      product.image_url && (product.slug === "pocketful-of-sun" || /sunflower/i.test(product.name)),
  );
  const previewGifts = products
    .filter((product) => product.image_url && product.id !== sunflower?.id)
    .slice(0, 3);

  function skipBeforePin(event: MouseEvent<HTMLAnchorElement>) {
    if (pinned.current || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    skippedBeforePin.current = true;
    setDisabled(true);
    requestAnimationFrame(() => {
      const gallery = document.getElementById("gift-gallery");
      gallery?.scrollIntoView();
      gallery?.focus({ preventScroll: true });
    });
  }

  return (
    <section
      ref={root}
      className="bloom-story"
      data-opening={!disabled && opening}
      data-static={disabled}
      aria-label="The Gifting Bloom love story"
    >
      <img className="story-garden" src={gardenBackdrop} alt="" decoding="async" />
      <picture className="story-heart-aura">
        <source media="(max-aspect-ratio: 4/5)" srcSet={mobileHeartAura} />
        <img src={heartAura} alt="" decoding="async" />
      </picture>
      <div className="story-grain" aria-hidden="true" />
      <BloomPrologue logo={settings["logo"]} gifts={previewGifts} sunflower={sunflower} />
      <a
        className="intro-skip"
        href="#gift-gallery"
        aria-label="Skip animation and explore the gallery"
        onClick={skipBeforePin}
      >
        <SkipForward size={19} aria-hidden="true" />
      </a>

      <div className="intro-art" aria-hidden="true">
        <div className="intro-glow" />
        <div className="intro-canvas">
          {!disabled && Stage && (
            <StoryBoundary onUnavailable={noStage}>
              <Stage playhead={playhead.current} onReady={readyStage} />
            </StoryBoundary>
          )}
        </div>
        <div className="intro-bouquets">
          {bouquets.map((product) => (
            <div key={product.id}>
              <ProductImage src={product.image_url} alt="" />
            </div>
          ))}
          {!bouquets.length && <img className="intro-bouquet-fallback" src={bouquetImage} alt="" />}
        </div>
      </div>

      <p className="story-love-caption">And Just Like That… A Love Story Begins.</p>
      <div className="story-gallery-reveal">
        <p>Every Love Story Deserves a Bloom.</p>
        <div>
          <Link to="/" hash="collection" search={{ category: "bouquets" }}>
            Explore Our Bouquets
          </Link>
          <Link to="/" hash="collection" search={{}}>
            Explore the Gallery
          </Link>
          <Link to="/" hash="customise" search={true}>
            Customise Your Gift
          </Link>
        </div>
      </div>
      <div className="intro-scroll-cue" aria-hidden="true">
        <span>Scroll to Discover</span>
        <ChevronsDown size={22} />
      </div>
      <progress
        className="sr-only"
        ref={meter}
        max={1}
        defaultValue={0}
        aria-label="Story progress"
      />
    </section>
  );
}
