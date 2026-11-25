import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, Check, Flower2, Gift, ShoppingBag, Trash2 } from "lucide-react";
import { useState, type FormEvent } from "react";
import {
  colours,
  describeCustom,
  money,
  occasions,
  quote,
  whatsapp,
  type Custom,
} from "@/lib/bloom";
import { requestCustom, requestOrder } from "@/lib/bloom-api";
import { useBloom, type CartLine } from "./bloom-shell";
import { PageHeading, ProductImage, Swatches } from "./bloom-products";
import { ChenilleFlower } from "./bloom-story";

const initial: Custom = {
  flower: "rose",
  count: 5,
  colours: ["Blush", "Ivory"],
  size: "classic",
  wrap: "Ivory",
  ribbon: "Rose",
  occasion: "",
  message: "",
  packaging: false,
};
const titleCase = (name: string) => name.charAt(0).toUpperCase() + name.slice(1);
export function Customise({ embedded = false }: { embedded?: boolean } = {}) {
  const { add, ready, settings, pricing, cloud } = useBloom();
  const [custom, setCustom] = useState(initial);
  const [step, setStep] = useState(0);
  const [pending, setPending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [enquire, setEnquire] = useState(false);
  const set = <K extends keyof Custom>(key: K, value: Custom[K]) =>
    setCustom((current) => ({ ...current, [key]: value }));
  const total = quote(custom, pricing);
  const chat = whatsapp(
    settings["whatsapp"],
    "Hi! Could you quote this custom bouquet? " +
      describeCustom(custom) +
      ". Estimate " +
      money(total) +
      ".",
  );
  function addBouquet() {
    const line: CartLine = {
      kind: "custom",
      key: JSON.stringify(custom),
      custom,
      name: "Custom bouquet",
      note: describeCustom(custom),
      max: 10,
      unit: total,
      quantity: 1,
      image: "",
      demo: !cloud,
    };
    add(line);
  }
  async function saveEnquiry(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    const form = new FormData(event.currentTarget);
    setError("");
    setPending(true);
    try {
      await requestCustom({
        data: {
          custom,
          customer_name: String(form.get("name")),
          email: String(form.get("email")),
          phone: String(form.get("phone")),
        },
      });
      setSent(true);
    } catch {
      setError("We couldn’t save your request. Check your contact details and try again.");
    } finally {
      setPending(false);
    }
  }
  const Container = embedded ? "section" : "main";
  return (
    <Container
      id={embedded ? "customise" : undefined}
      className={embedded ? "wrap home-section" : "wrap inner-page"}
    >
      <PageHeading as={embedded ? "h2" : "h1"} label="Bespoke gifts" title="Create your own bloom.">
        Pick the stems, wrap and little details. We’ll confirm your bouquet with you before it’s
        made.
      </PageHeading>
      <div className="split-page builder-layout">
        <div className="panel">
          <p className="eyebrow">Step {step + 1} of 3</p>
          <progress value={step + 1} max={3} aria-label="Bouquet builder progress" />
          <h2>{["Choose the flowers", "Wrap it with care", "Make it personal"][step]}</h2>
          {step === 0 && (
            <div className="form-stack">
              <label>
                Flower type
                <select
                  value={custom.flower}
                  onChange={(event) => set("flower", event.target.value as Custom["flower"])}
                >
                  {(["rose", "daisy", "sunflower"] as const).map((value) => (
                    <option key={value} value={value}>
                      {titleCase(value)} · {money(pricing[value])} per stem
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Number of stems <strong>{custom.count}</strong>
                <input
                  type="range"
                  min={1}
                  max={24}
                  value={custom.count}
                  onChange={(event) => set("count", Number(event.target.value))}
                />
              </label>
              <fieldset>
                <legend>Flower colours (choose up to four)</legend>
                <div className="choice-grid">
                  {(Object.keys(colours) as Custom["colours"]).map((value) => (
                    <button
                      key={value}
                      className="choice"
                      aria-pressed={custom.colours.includes(value)}
                      onClick={() => {
                        if (custom.colours.includes(value)) {
                          if (custom.colours.length > 1)
                            set(
                              "colours",
                              custom.colours.filter((colour) => colour !== value),
                            );
                        } else if (custom.colours.length < 4)
                          set("colours", [...custom.colours, value]);
                      }}
                    >
                      <span className="swatch" style={{ backgroundColor: colours[value] }} />
                      {value}
                    </button>
                  ))}
                </div>
              </fieldset>
            </div>
          )}
          {step === 1 && (
            <div className="form-stack">
              <label>
                Bouquet size
                <select
                  value={custom.size}
                  onChange={(event) => set("size", event.target.value as Custom["size"])}
                >
                  <option value="petite">Petite</option>
                  <option value="classic">Classic (+{money(pricing.classic)})</option>
                  <option value="grand">Grand (+{money(pricing.grand)})</option>
                </select>
              </label>
              <fieldset>
                <legend>Wrapping colour · {custom.wrap}</legend>
                <Swatches
                  values={["Ivory", "Blush", "Lavender", "Sage"]}
                  selected={custom.wrap}
                  onSelect={(value) => set("wrap", value as Custom["wrap"])}
                />
              </fieldset>
              <fieldset>
                <legend>Ribbon colour · {custom.ribbon}</legend>
                <Swatches
                  values={["Ivory", "Rose", "Gold", "Plum"]}
                  selected={custom.ribbon}
                  onSelect={(value) => set("ribbon", value as Custom["ribbon"])}
                />
              </fieldset>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={custom.packaging}
                  onChange={(event) => set("packaging", event.target.checked)}
                />{" "}
                Add a gift box (+{money(pricing.packaging)})
              </label>
            </div>
          )}
          {step === 2 && (
            <div className="form-stack">
              <label>
                Occasion
                <select
                  value={custom.occasion}
                  onChange={(event) => set("occasion", event.target.value)}
                >
                  <option value="">Choose an occasion</option>
                  {occasions.map((value) => (
                    <option key={value}>{value}</option>
                  ))}
                </select>
              </label>
              <label>
                Message for your gift
                <textarea
                  maxLength={500}
                  rows={3}
                  value={custom.message}
                  onChange={(event) => set("message", event.target.value)}
                  placeholder="A little note for someone special…"
                />
              </label>
            </div>
          )}
          <div className="button-row builder-buttons">
            {step > 0 && (
              <button className="btn btn-outline" onClick={() => setStep(step - 1)}>
                Back
              </button>
            )}
            {step < 2 ? (
              <button className="btn btn-primary" onClick={() => setStep(step + 1)}>
                Continue <ArrowRight size={16} />
              </button>
            ) : (
              <>
                <button className="btn btn-primary" disabled={!ready} onClick={addBouquet}>
                  <ShoppingBag size={17} /> Add to bag
                </button>
                {chat && (
                  <a className="btn btn-outline" href={chat} target="_blank" rel="noreferrer">
                    Ask on WhatsApp
                  </a>
                )}
                {cloud && (
                  <button
                    className="text-link"
                    aria-expanded={enquire}
                    onClick={() => setEnquire(!enquire)}
                  >
                    Request a quote
                  </button>
                )}
              </>
            )}
          </div>
          {step === 2 &&
            enquire &&
            (sent ? (
              <p role="status">Your quote request has been sent.</p>
            ) : (
              <form onSubmit={saveEnquiry} className="form-stack section-space">
                <ContactFields />
                {error && (
                  <p className="error-note" role="alert">
                    {error}
                  </p>
                )}
                <button className="btn btn-primary" disabled={pending}>
                  {pending ? "Sending…" : "Send quote request"}
                </button>
              </form>
            ))}
        </div>
        <aside className="panel builder-preview">
          <div className="preview-art" style={{ backgroundColor: colours[custom.wrap] }}>
            <div className={"preview-flowers preview-" + custom.size}>
              {Array.from({ length: Math.min(7, custom.count) }, (_, index) => (
                <div
                  key={index}
                  style={
                    {
                      "--angle": (index - (Math.min(7, custom.count) - 1) / 2) * 13 + "deg",
                    } as React.CSSProperties
                  }
                >
                  <ChenilleFlower
                    hue={colours[custom.colours[index % custom.colours.length] ?? "Blush"]}
                  />
                </div>
              ))}
            </div>
            <div className="preview-wrap" style={{ backgroundColor: colours[custom.wrap] }} />
            <div className="preview-ribbon" style={{ backgroundColor: colours[custom.ribbon] }} />
          </div>
          <p className="eyebrow">Bouquet illustration</p>
          <p>
            {custom.count} {titleCase(custom.flower)} {custom.count === 1 ? "stem" : "stems"} ·{" "}
            {titleCase(custom.size)}
          </p>
          <strong className="product-price" aria-live="polite">
            {money(total)}
          </strong>
          <p className="fine">
            {cloud ? "Estimated total before delivery." : "Demo estimate before delivery."}
          </p>
        </aside>
      </div>
    </Container>
  );
}
function ContactFields() {
  return (
    <>
      <label>
        Full name
        <input name="name" required minLength={2} maxLength={120} autoComplete="name" />
      </label>
      <label>
        Email
        <input name="email" type="email" required maxLength={254} autoComplete="email" />
      </label>
      <label>
        Phone
        <input name="phone" type="tel" required minLength={7} maxLength={26} autoComplete="tel" />
      </label>
    </>
  );
}
export function Bag() {
  const store = useBloom();
  const total = store.cart.reduce((sum, line) => sum + line.unit * line.quantity, 0);
  const mixed = store.cart.some(({ demo }) => demo) && store.cart.some(({ demo }) => !demo);
  return (
    <main className="wrap inner-page">
      <PageHeading label="Your picks" title="Your shopping bag." />
      {!store.ready ? (
        <p role="status">Loading your bag…</p>
      ) : store.cart.length ? (
        <div className="split-page checkout-layout">
          <div className="cart-lines">
            {store.cart.map((line) => (
              <article key={line.key} className="cart-line">
                <div className="cart-thumb">
                  <ProductImage src={line.image} alt="" />
                </div>
                <div>
                  <h3>
                    {line.kind === "product" ? (
                      <Link to="/product/$slug" params={{ slug: line.slug }}>
                        {line.name}
                      </Link>
                    ) : (
                      line.name
                    )}
                  </h3>
                  {line.demo && <span className="pill">Demo</span>}
                  <p className="fine">
                    {line.note ||
                      (line.kind === "product"
                        ? [line.colour, line.variant].filter(Boolean).join(" · ")
                        : "")}
                  </p>
                  <div className="button-row">
                    <button
                      aria-label={"Decrease quantity of " + line.name}
                      className="icon-button quantity-button"
                      disabled={line.quantity <= 1}
                      onClick={() => store.quantity(line, line.quantity - 1)}
                    >
                      −
                    </button>
                    <span aria-live="polite">{line.quantity}</span>
                    <button
                      className="icon-button quantity-button"
                      aria-label={"Increase quantity of " + line.name}
                      disabled={!store.remaining(line)}
                      onClick={() => store.quantity(line, line.quantity + 1)}
                    >
                      +
                    </button>
                    <button
                      className="icon-button"
                      aria-label={"Remove " + line.name}
                      onClick={() => store.quantity(line, 0)}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
                <strong>{money(line.unit * line.quantity)}</strong>
              </article>
            ))}
          </div>
          <aside className="panel">
            <h2>Bag summary</h2>
            <div className="summary-total">
              <span>Subtotal</span>
              <strong>{money(total)}</strong>
            </div>
            <p className="fine">Delivery charges are confirmed by the shop.</p>
            {mixed ? (
              <p className="notice">Remove demo gifts before checking out with shop items.</p>
            ) : (
              <Link className="btn btn-primary" to="/checkout">
                Go to checkout <ArrowRight size={16} />
              </Link>
            )}
          </aside>
        </div>
      ) : (
        <div className="empty">
          <Flower2 size={60} strokeWidth={1} />
          <h2>A little room for a bloom.</h2>
          <p>Your bag is empty.</p>
          <Link to="/shop" className="btn btn-primary">
            Explore the shop <ArrowRight size={16} />
          </Link>
        </div>
      )}
    </main>
  );
}
export function Checkout() {
  const { cart, ready, settings, clear } = useBloom();
  const [requestId, setRequestId] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const total = cart.reduce((sum, line) => sum + line.unit * line.quantity, 0);
  const demo = cart.every((line) => line.demo);
  const mixed = !demo && cart.some((line) => line.demo);
  const wa = whatsapp(
    settings["whatsapp"],
    "Hi! I’d like to request these gifts:\n" +
      cart.map((line) => line.quantity + " × " + line.name + " (" + line.note + ")").join("\n") +
      "\nSubtotal " +
      money(total),
  );
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending || !cart.length || demo || mixed) return;
    const form = new FormData(event.currentTarget);
    setPending(true);
    setError("");
    const id = requestId || crypto.randomUUID();
    setRequestId(id);
    try {
      const data = await requestOrder({
        data: {
          request_id: id,
          customer_name: String(form.get("name")),
          email: String(form.get("email")),
          phone: String(form.get("phone")),
          address: String(form.get("address")),
          postal_code: String(form.get("pin")),
          gift_message: String(form.get("message")),
          delivery_instructions: String(form.get("instructions")),
          lines: cart,
        },
      });
      clear();
      await navigate({ to: "/order-confirmation", search: { ref: data.reference } });
    } catch (cause) {
      setError(
        cause instanceof Error && cause.message.length < 220
          ? cause.message
          : "We couldn’t save your request. Please try again.",
      );
    } finally {
      setPending(false);
    }
  }
  return (
    <main className="wrap inner-page">
      <PageHeading label="Checkout" title="Send a little joy.">
        Review your bag and request delivery from The Gifting Bloom.
      </PageHeading>
      {!ready ? (
        <p role="status">Loading checkout…</p>
      ) : !cart.length || mixed ? (
        <div className="empty">
          <p>
            {mixed
              ? "Please separate demo gifts from your order."
              : "Add a gift to begin checkout."}
          </p>
          <Link className="btn btn-primary" to={mixed ? "/cart" : "/shop"}>
            {mixed ? "Edit bag" : "Explore the shop"}
          </Link>
        </div>
      ) : (
        <div className="split-page checkout-layout">
          <div className="panel">
            <h2>{demo ? "Demo checkout" : "Delivery details"}</h2>
            {demo ? (
              <>
                <p>Try the checkout preview with no payment or personal details.</p>
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    clear();
                    void navigate({ to: "/order-confirmation", search: { demo: true } });
                  }}
                >
                  Complete demo checkout <ArrowRight size={16} />
                </button>
              </>
            ) : (
              <form className="form-stack" onSubmit={submit}>
                <ContactFields />
                <label>
                  Delivery address
                  <textarea
                    name="address"
                    required
                    minLength={5}
                    maxLength={500}
                    rows={3}
                    autoComplete="street-address"
                  />
                </label>
                <label>
                  PIN code
                  <input
                    name="pin"
                    required
                    pattern="[0-9]{6}"
                    inputMode="numeric"
                    maxLength={6}
                    autoComplete="postal-code"
                  />
                </label>
                <label>
                  Gift message
                  <textarea name="message" maxLength={500} rows={2} />
                </label>
                <label>
                  Delivery instructions
                  <textarea name="instructions" maxLength={500} rows={2} />
                </label>
                <label>
                  Payment method
                  <select>
                    <option>Arrange payment with the shop</option>
                  </select>
                </label>
                {error && (
                  <p role="alert" className="error-note">
                    {error}
                  </p>
                )}
                <button className="btn btn-primary" disabled={pending}>
                  {pending ? "Sending order…" : "Send order request"} <ArrowRight size={16} />
                </button>
              </form>
            )}
          </div>
          <aside className="panel">
            <h2>Your gifts</h2>
            {cart.map((line) => (
              <div className="summary-line" key={line.key}>
                <span>
                  {line.quantity} × {line.name}
                </span>
                <strong>{money(line.unit * line.quantity)}</strong>
              </div>
            ))}
            <div className="summary-total">
              <span>Subtotal</span>
              <strong>{money(total)}</strong>
            </div>
            <p className="fine">Delivery and payment are confirmed by the shop.</p>
            {wa && !demo && (
              <a href={wa} className="btn btn-outline" target="_blank" rel="noreferrer">
                Request on WhatsApp
              </a>
            )}
            <Link to="/cart" className="text-link">
              Edit bag
            </Link>
          </aside>
        </div>
      )}
    </main>
  );
}
export function Confirmation({
  reference,
  demo,
}: {
  reference?: string | undefined;
  demo?: boolean | undefined;
}) {
  const { settings } = useBloom();
  const chat =
    reference &&
    whatsapp(
      settings["whatsapp"],
      "Hi! I’ve sent order request " +
        reference +
        ". Could you confirm availability and delivery details?",
    );
  return (
    <main className="wrap inner-page">
      <div className="confirmation panel">
        {[0, 1, 2, 3, 4, 5].map((n) => (
          <span key={n} className="confetti" style={{ "--n": n } as React.CSSProperties} />
        ))}
        <div className="gift-animation">
          {demo || reference ? <Gift size={54} strokeWidth={1.25} /> : <Check size={48} />}
        </div>
        <h1>
          {demo
            ? "Your demo bloom is wrapped."
            : reference
              ? "Your request is in bloom."
              : "Order confirmation"}
        </h1>
        <p>
          {demo
            ? "You completed the demo checkout."
            : reference
              ? "Keep this reference to ask about availability, delivery and payment."
              : "Use the order reference from checkout when contacting the shop."}
        </p>
        {reference && <p className="order-ref">{reference}</p>}
        <div className="button-row">
          {chat && (
            <a className="btn btn-primary" href={chat} target="_blank" rel="noreferrer">
              Continue on WhatsApp
            </a>
          )}
          <Link className="btn btn-outline" to="/shop">
            Back to the blooms <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </main>
  );
}
