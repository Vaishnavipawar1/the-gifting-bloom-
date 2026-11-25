import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, Flower2, Heart, ShoppingBag } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { colours, money, whatsapp, type Product } from "@/lib/bloom";
import { useBloom, type CartLine } from "./bloom-shell";

export function ProductImage({
  src,
  alt,
  eager = false,
}: {
  src?: string | undefined;
  alt: string;
  eager?: boolean;
}) {
  const [failed, setFailed] = useState("");
  return src && failed !== src ? (
    <img
      src={src}
      alt={alt}
      loading={eager ? "eager" : "lazy"}
      decoding="async"
      onError={() => setFailed(src)}
    />
  ) : (
    <div className="image-fallback" role="img" aria-label={alt}>
      <Flower2 size={64} strokeWidth={1} />
    </div>
  );
}

export function Swatches({
  values,
  selected,
  onSelect,
}: {
  values: string[];
  selected?: string;
  onSelect?: (value: string) => void;
}) {
  return (
    <div className="swatches">
      {values.map((name) => {
        const value =
          colours[name as keyof typeof colours] || (/^#[\da-f]{6}$/i.test(name) ? name : "#e9d1c4");
        return onSelect ? (
          <button
            key={name}
            type="button"
            title={name}
            aria-label={name}
            aria-pressed={selected === name}
            className="swatch"
            style={{ backgroundColor: value }}
            onClick={() => onSelect(name)}
          />
        ) : (
          <span key={name} className="swatch" title={name} style={{ backgroundColor: value }} />
        );
      })}
    </div>
  );
}

function productLine(
  product: Product,
  quantity = 1,
  colour = product.colors[0] || "",
  variant = product.variants[0] || "",
  note = "",
): Extract<CartLine, { kind: "product" }> {
  return {
    key: JSON.stringify([product.id, colour, variant, note]),
    name: product.name,
    kind: "product",
    id: product.id,
    slug: product.slug,
    colour,
    variant,
    note,
    quantity,
    image: product.image_url,
    unit: product.price_cents,
    demo: product.is_demo,
    max: product.stock_count,
  };
}

export function ProductPurchase({
  product,
  compact = false,
  embedded = false,
}: {
  product: Product;
  compact?: boolean;
  embedded?: boolean;
}) {
  const [colour, setColour] = useState(product.colors[0] || "");
  const [variant, setVariant] = useState(product.variants[0] || "");
  const [quantity, setQuantity] = useState(1);
  const [note, setNote] = useState("");
  const store = useBloom();
  const navigate = useNavigate();
  const line = productLine(product, quantity, colour, variant, note.trim());
  const remaining = store.remaining(line);
  const chat = whatsapp(
    store.settings["whatsapp"],
    "Hi! I would like to ask about " + product.name + (colour ? " in " + colour : "") + ".",
  );
  return (
    <div className="purchase">
      {product.is_demo && <span className="pill">Demo listing</span>}
      <p className="product-price">{money(product.price_cents)}</p>
      <p>{product.description}</p>
      {!!product.colors.length && (
        <div>
          Colour <strong>{colour}</strong>
          <Swatches values={product.colors} selected={colour} onSelect={setColour} />
        </div>
      )}
      {!!product.variants.length && (
        <label>
          Variant
          <select value={variant} onChange={(event) => setVariant(event.target.value)}>
            {product.variants.map((value) => (
              <option key={value}>{value}</option>
            ))}
          </select>
        </label>
      )}
      <p className="fine">
        {product.stock_count
          ? product.dispatch ||
            store.settings["dispatch"] ||
            "Dispatch timing is confirmed when the order is accepted."
          : "Currently out of stock"}
      </p>
      {!compact && (
        <label>
          Personalisation{" "}
          <input
            maxLength={500}
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="Add a name or a short note"
          />
        </label>
      )}
      <div className="button-row">
        <label className="quantity-field">
          Qty{" "}
          <input
            type="number"
            min={1}
            max={Math.max(1, Math.min(remaining, 50))}
            value={quantity}
            onChange={(event) =>
              setQuantity(
                Math.max(
                  1,
                  Math.min(Number(event.target.value) || 1, Math.max(1, Math.min(50, remaining))),
                ),
              )
            }
          />
        </label>
        <button
          className="btn btn-primary"
          disabled={!store.ready || quantity > remaining}
          onClick={() => store.add(line)}
        >
          <ShoppingBag size={17} /> Add to bag
        </button>
        {!compact && (
          <button
            className="btn btn-outline"
            disabled={!store.ready || quantity > remaining}
            onClick={() => {
              if (store.add(line)) void navigate({ to: "/checkout" });
            }}
          >
            Buy now
          </button>
        )}
      </div>
      {!compact && (
        <div className="button-row">
          {!embedded && (
            <Link to="/customise" className="text-link">
              Customise a bouquet <ArrowRight size={16} />
            </Link>
          )}
          {chat && !product.is_demo && (
            <a className="text-link" href={chat} target="_blank" rel="noreferrer">
              Ask on WhatsApp
            </a>
          )}
        </div>
      )}
    </div>
  );
}

export function ProductPreview({
  product,
  embedded = false,
}: {
  product: Product;
  embedded?: boolean;
}) {
  const gallery = [...new Set([product.image_url, ...product.images].filter(Boolean))];
  const [photo, selectPhoto] = useState(0);
  return (
    <DialogContent className="bloom-dialog quick-view">
      <DialogTitle>{product.name}</DialogTitle>
      <div>
        <div>
          <ProductImage src={gallery[photo]} alt={product.image_alt || product.name} />
          {embedded && gallery.length > 1 && (
            <div className="gallery-thumbs">
              {gallery.map((image, index) => (
                <button
                  key={image}
                  type="button"
                  aria-label={"View photo " + (index + 1)}
                  aria-pressed={index === photo}
                  onClick={() => selectPhoto(index)}
                >
                  <ProductImage src={image} alt="" />
                </button>
              ))}
            </div>
          )}
          {embedded && product.video && (
            <video
              className="product-video"
              src={product.video}
              controls
              playsInline
              preload="none"
            />
          )}
        </div>
        <ProductPurchase product={product} compact={!embedded} embedded={embedded} />
      </div>
    </DialogContent>
  );
}

export function ProductCard({
  product,
  embedded = false,
}: {
  product: Product;
  embedded?: boolean;
}) {
  const store = useBloom();
  const active = store.saved.includes(product.id);
  const line = productLine(product);
  return (
    <Dialog>
      <article className="product-card">
        <div className="product-media">
          {embedded ? (
            <DialogTrigger asChild>
              <button
                type="button"
                className="product-preview-trigger"
                aria-label={"View " + product.name}
              >
                <ProductImage src={product.image_url} alt={product.image_alt || product.name} />
              </button>
            </DialogTrigger>
          ) : (
            <Link to="/product/$slug" params={{ slug: product.slug }} aria-label={product.name}>
              <ProductImage src={product.image_url} alt={product.image_alt || product.name} />
            </Link>
          )}
          {product.is_demo && <span className="pill demo-pill">Demo</span>}
          <button
            className="icon-button card-heart"
            aria-label={"Save " + product.name}
            aria-pressed={active}
            onClick={() => store.toggle(product.id)}
          >
            <Heart size={19} fill={active ? "currentColor" : "none"} />
          </button>
          <button
            className="icon-button card-add"
            aria-label={
              "Add " +
              [product.name, line.colour, line.variant].filter(Boolean).join(", ") +
              " to your bag"
            }
            disabled={!store.ready || !store.remaining(line)}
            onClick={() => store.add(line)}
          >
            <ShoppingBag size={17} />
          </button>
        </div>
        <div className="product-info">
          <div className="product-title">
            <h3>
              {embedded ? (
                product.name
              ) : (
                <Link to="/product/$slug" params={{ slug: product.slug }}>
                  {product.name}
                </Link>
              )}
            </h3>
            <strong>{money(product.price_cents)}</strong>
          </div>
          <Swatches values={product.colors} />
          <div className="product-actions">
            <DialogTrigger asChild>
              <button type="button" className="text-link">
                {embedded ? "View gift" : "Quick view"}
              </button>
            </DialogTrigger>
            {product.category === "bouquets" ? (
              <Link className="text-link" to="/" hash="customise" search={true}>
                Customise <ArrowRight size={14} />
              </Link>
            ) : (
              !embedded && (
                <Link className="text-link" to="/product/$slug" params={{ slug: product.slug }}>
                  View gift <ArrowRight size={14} />
                </Link>
              )
            )}
          </div>
        </div>
      </article>
      <ProductPreview product={product} embedded={embedded} />
    </Dialog>
  );
}
export function ProductGrid({ items, embedded = false }: { items: Product[]; embedded?: boolean }) {
  return (
    <div className="product-grid">
      {items.map((product) => (
        <ProductCard key={product.id} product={product} embedded={embedded} />
      ))}
    </div>
  );
}
export function PageHeading({
  label,
  title,
  children,
  as: Title = "h1",
}: {
  label?: string;
  title: string;
  children?: React.ReactNode;
  as?: "h1" | "h2";
}) {
  return (
    <div className="page-heading">
      {label && <p className="eyebrow">{label}</p>}
      <Title>{title}</Title>
      {children && <p>{children}</p>}
    </div>
  );
}
