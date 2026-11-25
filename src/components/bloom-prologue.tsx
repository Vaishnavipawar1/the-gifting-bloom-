import type { Product } from "@/lib/bloom";
import { ease } from "@/lib/bloom-timing";
import actors from "@/assets/story-prologue-cast.webp";
import entrance from "@/assets/story-prologue-entrance.webp";
import bouquet from "@/assets/story-sunflower-bouquet.webp";
import { ProductImage } from "./bloom-products";
import { BloomLogo } from "./bloom-logo";

export function updatePrologue(section: HTMLElement, time: number) {
  const reveal = ease(time, 5.66, 6.15);
  const detail = ease(time, 3.77, 4.04);
  const lift = ease(time, 5.94, 6.77);
  const properties = {
    "prologue-end": ease(time, 7.9, 8.62),
    "phone-zoom": ease(time, 1.02, 2.47) * (1 - ease(time, 5.2, 5.94)),
    "phone-ui": 0.92 + 0.08 * ease(time, 1.04, 1.85),
    "opening-caption": 1 - ease(time, 0.82, 1.51),
    "profile-scroll": ease(time, 2.49, 3.5),
    "bouquet-focus": ease(time, 3.26, 3.69),
    "phone-profile": 1 - detail,
    "phone-detail": detail,
    "screen-tap": ease(time, 3.59, 3.76) * (1 - ease(time, 3.76, 3.98)),
    "bouquet-reveal-shot": reveal,
    "gift-lift": lift,
    "reaction-nod": Math.sin(lift * Math.PI),
    "gift-caption": ease(time, 6.4, 6.85) * (1 - ease(time, 7.86, 8.43)),
  };
  for (const [name, value] of Object.entries(properties)) {
    section.style.setProperty(`--${name}`, String(value));
  }
}

function BouquetArt() {
  return (
    <span className="prologue-bouquet-art" aria-hidden="true">
      <img src={bouquet} alt="" draggable={false} />
    </span>
  );
}

type PreviewProps = {
  logo: string | undefined;
  gifts: Product[];
  sunflower: Product | undefined;
};

function PhoneScreen({ logo, gifts, sunflower }: PreviewProps) {
  return (
    <div className="prologue-phone" aria-hidden="true">
      <div className="prologue-screen">
        <div className="prologue-phone-bar">
          <span>Instagram</span>
          <span>Demo preview</span>
        </div>
        <div className="prologue-phone-panel prologue-profile">
          <div className="prologue-profile-header">
            <span className="prologue-avatar">
              <BloomLogo src={logo} />
            </span>
            <div>
              <strong>The Gifting Bloom</strong>
              <span>@the_gifting_bloom11</span>
            </div>
          </div>
          <div
            className="prologue-feed"
            style={{
              transform: `translateY(calc(-${gifts.length * 77}cqw * var(--profile-scroll, 0)))`,
            }}
          >
            {gifts.map((gift) => (
              <div className="prologue-feed-card" key={gift.id}>
                <ProductImage src={gift.image_url} alt="" />
                <span>{gift.name}</span>
              </div>
            ))}
            <div className="prologue-feed-card prologue-feed-bouquet">
              {sunflower ? <ProductImage src={sunflower.image_url} alt="" /> : <BouquetArt />}
              <span>{sunflower?.name ?? "Sunflower Bouquet"}</span>
              <i className="prologue-tap" />
            </div>
          </div>
        </div>
        <div className="prologue-phone-panel prologue-product">
          {sunflower ? (
            <span className="prologue-product-photo">
              <ProductImage src={sunflower.image_url} alt="" />
            </span>
          ) : (
            <BouquetArt />
          )}
          <strong>Sunflower Bouquet</strong>
          <span>That’s the one!</span>
        </div>
      </div>
    </div>
  );
}

export function BloomPrologue({ logo, gifts, sunflower }: PreviewProps) {
  return (
    <div className="bloom-prologue">
      <div className="prologue-phone-shot">
        <div className="prologue-camera">
          <div className="prologue-actor prologue-browsing">
            <img src={actors} alt="" fetchPriority="high" draggable={false} />
            <span className="prologue-blink" aria-hidden="true" />
            <PhoneScreen logo={logo} gifts={gifts} sunflower={sunflower} />
            <img className="prologue-thumb" src={actors} alt="" draggable={false} />
          </div>
        </div>
        <div className="prologue-caption prologue-opening-caption">
          <h1>Every Beautiful Gift Begins With a Thought.</h1>
          <p>A little surprise. A beautiful smile. A memory forever.</p>
        </div>
      </div>
      <div className="prologue-bouquet-reveal">
        <img className="prologue-entrance" src={entrance} alt="" draggable={false} />
        <div className="prologue-receiving">
          <div className="prologue-actor prologue-smile">
            <img className="prologue-reaction-body" src={actors} alt="" draggable={false} />
            <img className="prologue-reaction-head" src={actors} alt="" draggable={false} />
          </div>
          <div className="prologue-held-bouquet">
            <BouquetArt />
          </div>
        </div>
        <div className="prologue-caption prologue-smile-caption">
          <p>Some Surprises Are Worth Every Smile.</p>
        </div>
      </div>
    </div>
  );
}
