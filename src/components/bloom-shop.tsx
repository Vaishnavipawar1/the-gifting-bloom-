import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, Heart, Search, ShoppingBag, SlidersHorizontal } from "lucide-react";
import { useState } from "react";
import { occasions, type Product } from "@/lib/bloom";
import { useBloom } from "./bloom-shell";
import { PageHeading, ProductGrid, ProductImage, ProductPurchase } from "./bloom-products";

export function Shop({
  category,
  initialOccasion = "",
  initialCategory = "",
  embedded = false,
}: {
  category?: string;
  initialOccasion?: string | undefined;
  initialCategory?: string;
  embedded?: boolean;
}) {
  const { products, cloud, categories, settings, cart } = useBloom();
  const navigate = useNavigate();
  const currentCategory = categories.find(({ slug }) => slug === category);
  const categoryImage = currentCategory && settings["category-image:" + currentCategory.id];
  const [search, setSearch] = useState("");
  const [localCategory, setLocalCategory] = useState("");
  const [colour, setColour] = useState("");
  const [localOccasion, setLocalOccasion] = useState(initialOccasion);
  const [budget, setBudget] = useState("");
  const [available, setAvailable] = useState(false);
  const [sort, setSort] = useState("");
  const filterCategory = embedded ? initialCategory : localCategory;
  const occasion = embedded ? initialOccasion : localOccasion;
  function updateFilters(category: string, occasion: string) {
    if (embedded) {
      void navigate({
        to: "/",
        search: { ...(category && { category }), ...(occasion && { occasion }) },
        hash: true,
        resetScroll: false,
        hashScrollIntoView: false,
        replace: true,
      });
    } else {
      setLocalCategory(category);
      setLocalOccasion(occasion);
    }
  }
  const options = new Map(
    products
      .filter((item) => item.category)
      .map(({ category, categoryName }) => [category, categoryName]),
  );
  const choices = [...new Set(products.flatMap(({ colors }) => colors))].sort();
  const matches = products
    .filter((item) => {
      return (
        (!(category || filterCategory) || item.category === (category || filterCategory)) &&
        (!search ||
          [item.name, item.description, item.categoryName].some((field) =>
            field.toLowerCase().includes(search.trim().toLowerCase()),
          )) &&
        (!colour || item.colors.includes(colour)) &&
        (!occasion || item.occasions.includes(occasion)) &&
        (!budget || item.price_cents <= Number(budget) * 100) &&
        (!available || item.stock_count > 0)
      );
    })
    .sort((a, b) =>
      sort === "low"
        ? a.price_cents - b.price_cents
        : sort === "high"
          ? b.price_cents - a.price_cents
          : sort === "name"
            ? a.name.localeCompare(b.name)
            : 0,
    );
  const reset = () => {
    setSearch("");
    updateFilters("", "");
    setColour("");
    setBudget("");
    setAvailable(false);
    setSort("");
  };
  const Container = embedded ? "section" : "main";
  const bagCount = cart.reduce((count, item) => count + item.quantity, 0);
  return (
    <Container
      id={embedded ? "collection" : undefined}
      className={embedded ? "wrap home-section" : "wrap inner-page"}
    >
      <PageHeading
        as={embedded ? "h2" : "h1"}
        label="The collection"
        title={
          category === "bouquets"
            ? "Handmade Bouquets"
            : category === "mini-gifts"
              ? "Little gifts, big feelings."
              : "Find a bloom to give."
        }
      >
        {category === "mini-gifts"
          ? "Small keepsakes for the people who make your days brighter."
          : "Handmade flowers and thoughtful keepsakes for the moments you want to hold on to."}
      </PageHeading>
      {categoryImage && (
        <div className="category-banner">
          <ProductImage src={categoryImage} alt="" />
        </div>
      )}
      {embedded ? (
        <div className="shop-tabs" aria-label="Gift collections">
          <button
            type="button"
            aria-pressed={!filterCategory}
            onClick={() => updateFilters("", occasion)}
          >
            Shop all
          </button>
          <button
            type="button"
            aria-pressed={filterCategory === "bouquets"}
            onClick={() => updateFilters("bouquets", occasion)}
          >
            Bouquets
          </button>
          <button
            type="button"
            aria-pressed={filterCategory === "mini-gifts"}
            onClick={() => updateFilters("mini-gifts", occasion)}
          >
            Mini gifts
          </button>
          <Link to="/" hash="gift-finder" search={true}>
            Gift finder <ArrowRight size={15} />
          </Link>
          <Link to="/wishlist">
            <Heart size={15} /> Wishlist
          </Link>
          <Link to="/cart">
            <ShoppingBag size={15} /> Bag{bagCount > 0 && " (" + bagCount + ")"}
          </Link>
        </div>
      ) : (
        <div className="shop-tabs">
          <Link to="/shop" search={{}} activeOptions={{ exact: true, includeSearch: false }}>
            Shop all
          </Link>
          <Link to="/bouquets">Bouquets</Link>
          <Link to="/mini-gifts">Mini gifts</Link>
          <Link to="/gift-finder">
            Gift finder <ArrowRight size={15} />
          </Link>
        </div>
      )}
      <div className="filters" id="filters">
        <div className="filter-heading">
          <SlidersHorizontal size={17} /> Filters{" "}
          <button className="text-link" onClick={reset}>
            Clear all
          </button>
        </div>
        <div className="filter-grid">
          <label>
            Search
            <span className="search-field">
              <Search size={16} />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Find a gift"
              />
            </span>
          </label>
          {!category && (
            <label>
              Category
              <select
                value={filterCategory}
                onChange={(event) => updateFilters(event.target.value, occasion)}
              >
                <option value="">All categories</option>
                {[...options].map(([value, name]) => (
                  <option value={value} key={value}>
                    {name}
                  </option>
                ))}
              </select>
            </label>
          )}
          <label>
            Colour
            <select value={colour} onChange={(event) => setColour(event.target.value)}>
              <option value="">Any colour</option>
              {choices.map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>
          </label>
          <label>
            Occasion
            <select
              value={occasion}
              onChange={(event) => updateFilters(filterCategory, event.target.value)}
            >
              <option value="">Any occasion</option>
              {occasions.map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>
          </label>
          <label>
            Max price
            <select value={budget} onChange={(event) => setBudget(event.target.value)}>
              <option value="">Any price</option>
              {[250, 500, 750, 1000, 1500, 2500, 5000].map((value) => (
                <option key={value} value={value}>
                  ₹{value}
                </option>
              ))}
            </select>
          </label>
          <label>
            Sort by
            <select value={sort} onChange={(event) => setSort(event.target.value)}>
              <option value="">Featured</option>
              <option value="low">Price, low to high</option>
              <option value="high">Price, high to low</option>
              <option value="name">Name, A to Z</option>
            </select>
          </label>
        </div>
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={available}
            onChange={(event) => setAvailable(event.target.checked)}
          />{" "}
          In stock only
        </label>
      </div>
      {!cloud && (
        <p className="notice">
          {products.some(({ is_demo }) => is_demo)
            ? "The live catalogue is unavailable. Sample gifts are labelled Demo."
            : "The live catalogue is unavailable."}
        </p>
      )}
      <p className="fine result-count" aria-live="polite">
        {matches.length} {matches.length === 1 ? "gift" : "gifts"}
      </p>
      {matches.length ? (
        <ProductGrid items={matches} embedded={embedded} />
      ) : (
        <div className="empty">
          <h2>No blooms match these filters.</h2>
          <button className="btn btn-outline" onClick={reset}>
            Clear filters
          </button>
        </div>
      )}
    </Container>
  );
}

export function Detail({ product }: { product: Product }) {
  const store = useBloom();
  const [active, setActive] = useState(0);
  const gallery = [...new Set([product.image_url, ...product.images].filter(Boolean))];
  const related = store.products
    .filter((item) => item.id !== product.id && item.category === product.category)
    .slice(0, 4);
  const reviews = store.reviews.filter(
    (review) => review.product_name.trim().toLowerCase() === product.name.toLowerCase(),
  );
  return (
    <main className="wrap inner-page">
      <p className="breadcrumb">
        <Link to="/shop">Shop</Link> / {product.categoryName} / {product.name}
      </p>
      <div className="detail-layout">
        <div>
          <div className="detail-image">
            <ProductImage src={gallery[active]} alt={product.image_alt || product.name} eager />
          </div>
          {gallery.length > 1 && (
            <div className="gallery-thumbs">
              {gallery.map((url, index) => (
                <button
                  type="button"
                  aria-label={"View photo " + (index + 1)}
                  aria-pressed={active === index}
                  key={url}
                  onClick={() => setActive(index)}
                >
                  <ProductImage src={url} alt="" />
                </button>
              ))}
            </div>
          )}
          {product.video && (
            <video
              className="product-video"
              controls
              playsInline
              preload="none"
              src={product.video}
            />
          )}
        </div>
        <div>
          <p className="eyebrow">{product.categoryName}</p>
          <h1>{product.name}</h1>
          <ProductPurchase product={product} />
        </div>
      </div>
      <section className="section-space">
        <h2>Little notes from customers</h2>
        {reviews.length ? (
          <div className="review-strip">
            {reviews.map((review) => (
              <blockquote key={review.id}>
                <p>{review.review}</p>
                <cite>
                  {review.customer_name}
                  {review.rating && " · " + review.rating + "/5"}
                </cite>
              </blockquote>
            ))}
          </div>
        ) : (
          <p>No customer notes for this gift yet.</p>
        )}
      </section>
      {!!related.length && (
        <section className="section-space">
          <h2>You might also like</h2>
          <ProductGrid items={related} />
        </section>
      )}
    </main>
  );
}
export function Wishlist() {
  const { products, saved, ready } = useBloom();
  const items = products.filter(({ id }) => saved.includes(id));
  return (
    <main className="wrap inner-page">
      <PageHeading label="Saved for later" title="Your wishlist" />
      {!ready ? (
        <p role="status">Loading your saved blooms…</p>
      ) : items.length ? (
        <ProductGrid items={items} />
      ) : (
        <div className="empty">
          <h2>Nothing saved yet.</h2>
          <p>Tap the heart on any gift to keep it here.</p>
          <Link to="/shop" className="btn btn-primary">
            Find a bloom <ArrowRight size={16} />
          </Link>
        </div>
      )}
    </main>
  );
}

export function GiftFinder({ embedded = false }: { embedded?: boolean } = {}) {
  const { products } = useBloom();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<[string, string, string, string]>(["", "", "", ""]);
  const palette = [...new Set(products.flatMap(({ colors }) => colors))];
  const questions = [
    ["Who are you gifting?", ["Partner", "Friend", "Family", "Colleague", "Anyone"]],
    ["What’s the occasion?", [...occasions, "Any occasion"]],
    ["What’s your budget?", ["₹500", "₹750", "₹1,000", "₹1,500", "Any budget"]],
    ["Which colours do they love?", [...palette, "Any colour"]],
  ] as const;
  const limit = Number(answers[2].replace(/[^0-9]/g, "")) * 100;
  const rank = (item: Product) =>
    Number(item.occasions.includes(answers[1])) * 3 +
    Number(item.colors.includes(answers[3])) * 2 +
    Number(
      answers[0] === "Partner"
        ? item.category === "bouquets"
        : ["Friend", "Colleague"].includes(answers[0]) && item.category === "mini-gifts",
    );
  const matches = products
    .filter(
      (item) =>
        item.stock_count > 0 &&
        (!limit || item.price_cents <= limit) &&
        (answers[3] === "Any colour" || item.colors.includes(answers[3])) &&
        (answers[1] === "Any occasion" || item.occasions.includes(answers[1])),
    )
    .sort((a, b) => rank(b) - rank(a))
    .slice(0, 4);
  const Container = embedded ? "section" : "main";
  return (
    <Container
      id={embedded ? "gift-finder" : undefined}
      className={embedded ? "wrap home-section" : "wrap inner-page"}
    >
      <PageHeading
        as={embedded ? "h2" : "h1"}
        label="Gift finder"
        title="Find something that feels like them."
      />
      {step < 4 ? (
        <div className="question-panel">
          <p className="eyebrow">Question {step + 1} of 4</p>
          <progress value={step + 1} max={4} aria-label="Gift finder progress" />
          <h2>{questions[step]![0]}</h2>
          <div className="choice-grid">
            {questions[step]![1].map((value) => (
              <button
                key={value}
                className="choice"
                aria-pressed={answers[step] === value}
                onClick={() =>
                  setAnswers((current) => {
                    const next: typeof current = [...current];
                    next[step] = value;
                    return next;
                  })
                }
              >
                {value}
              </button>
            ))}
          </div>
          <div className="button-row">
            {step > 0 && (
              <button className="btn btn-outline" onClick={() => setStep(step - 1)}>
                Back
              </button>
            )}
            <button
              className="btn btn-primary"
              disabled={!answers[step]}
              onClick={() => setStep(step + 1)}
            >
              {step === 3 ? "See matches" : "Continue"} <ArrowRight size={16} />
            </button>
          </div>
        </div>
      ) : (
        <div>
          <h2>{matches.length ? "Blooms picked for you" : "No exact matches this time."}</h2>
          {matches.length ? (
            <ProductGrid items={matches} embedded={embedded} />
          ) : (
            <p>Try a different occasion, colour, or budget to see more gifts.</p>
          )}
          <div className="button-row section-space">
            <button className="btn btn-outline" onClick={() => setStep(0)}>
              Change answers
            </button>
            <button
              className="btn btn-primary"
              onClick={() =>
                void (embedded
                  ? navigate({ to: "/", hash: "collection", search: {} })
                  : navigate({ to: "/shop", search: {} }))
              }
            >
              Browse all gifts
            </button>
          </div>
        </div>
      )}
    </Container>
  );
}
