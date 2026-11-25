import { Link, useRouterState } from "@tanstack/react-router";
import {
  ArrowUpRight,
  Heart,
  Instagram,
  Menu,
  MessageCircle,
  Search,
  ShoppingBag,
} from "lucide-react";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { toast, Toaster } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { instagram, whatsapp, type Custom } from "@/lib/bloom";
import type { StoreData } from "@/lib/bloom-api";
import { BloomLogo } from "./bloom-logo";

export type CartLine = {
  key: string;
  name: string;
  quantity: number;
  unit: number;
  image: string;
  note: string;
  max: number;
  demo: boolean;
} & (
  | { kind: "product"; id: string; slug: string; colour: string; variant: string }
  | { kind: "custom"; custom: Custom }
);
function useShopping(store: StoreData) {
  const [cart, setCart] = useState<CartLine[]>([]);
  const [saved, setSaved] = useState<string[]>([]);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("bloom-bag-v1") ?? "[]");
      const wishlist = JSON.parse(localStorage.getItem("bloom-saved-v1") ?? "[]");
      if (Array.isArray(stored))
        setCart(
          stored.filter(
            (row) =>
              row &&
              typeof row.key === "string" &&
              Number.isFinite(row.unit) &&
              Number.isInteger(row.quantity) &&
              row.quantity > 0,
          ),
        );
      if (Array.isArray(wishlist)) setSaved(wishlist.filter((id) => typeof id === "string"));
    } catch {
      /* Local storage may be unavailable. */
    }
    setReady(true);
  }, []);
  useEffect(() => {
    if (ready)
      try {
        localStorage.setItem("bloom-bag-v1", JSON.stringify(cart));
        localStorage.setItem("bloom-saved-v1", JSON.stringify(saved));
      } catch {
        /* Keep the current tab usable without local storage. */
      }
  }, [cart, saved, ready]);
  function remaining(line: CartLine) {
    return line.kind === "product"
      ? Math.max(
          0,
          line.max -
            cart
              .filter((row) => row.kind === "product" && row.id === line.id)
              .reduce((total, row) => total + row.quantity, 0),
        )
      : Math.max(0, line.max - (cart.find((row) => row.key === line.key)?.quantity ?? 0));
  }
  function add(line: CartLine) {
    if (
      !ready ||
      line.quantity > remaining(line) ||
      (cart.length >= 50 && !cart.some(({ key }) => key === line.key))
    ) {
      toast.error("Your bag has reached the available quantity.");
      return false;
    }
    setCart((current) =>
      current.some(({ key }) => key === line.key)
        ? current.map((row) =>
            row.key === line.key ? { ...line, quantity: row.quantity + line.quantity } : row,
          )
        : [...current, line],
    );
    toast.success(line.name + " added to your bag.");
    return true;
  }
  function quantity(line: CartLine, value: number) {
    const limit = line.quantity + remaining(line);
    setCart((current) =>
      value <= 0
        ? current.filter(({ key }) => key !== line.key)
        : current.map((row) =>
            row.key === line.key ? { ...row, quantity: Math.min(value, limit) } : row,
          ),
    );
  }
  return {
    ...store,
    ready,
    cart,
    saved,
    add,
    quantity,
    remaining,
    clear: () => setCart([]),
    toggle: (id: string) =>
      setSaved((current) =>
        current.includes(id) ? current.filter((entry) => entry !== id) : [...current, id],
      ),
  };
}
const StoreContext = createContext<ReturnType<typeof useShopping> | null>(null);
export function useBloom() {
  const store = useContext(StoreContext);
  if (!store) throw new Error("Store context is missing");
  return store;
}

const links = [
  ["home", "Home"],
  ["collection", "Shop"],
  ["customise", "Customise"],
  ["our-story", "Our Story"],
  ["instagram", "Instagram"],
  ["contact", "Contact"],
] as const;
const activeSection = { exact: true, includeHash: true, includeSearch: false };
export function BloomShell({ store, children }: { store: StoreData; children: ReactNode }) {
  const shopping = useShopping(store);
  const path = useRouterState({ select: (state) => state.location.pathname });
  const [menu, setMenu] = useState(false);
  const brand = store.settings["brand_name"] || "The Gifting Bloom";
  const social = store.settings["instagram"] || instagram;
  const chat = whatsapp(
    store.settings["whatsapp"],
    "Hi " + brand + "! I'd like to ask about a gift.",
  );
  const count = shopping.cart.reduce((sum, line) => sum + line.quantity, 0);
  return (
    <StoreContext.Provider value={shopping}>
      <Toaster position="bottom-center" />
      {path !== "/" && !path.startsWith("/admin") && (
        <header className="bloom-nav bloom-nav-solid">
          <div className="nav-inner">
            <Dialog open={menu} onOpenChange={setMenu}>
              <DialogTrigger asChild>
                <button className="icon-button mobile-menu" aria-label="Open menu">
                  <Menu size={22} />
                </button>
              </DialogTrigger>
              <DialogContent className="bloom-dialog mobile-menu-panel">
                <DialogTitle>Explore the shop</DialogTitle>
                <nav aria-label="Mobile navigation">
                  {[...links, ["gift-finder", "Gift Finder"]].map(([hash, name]) => (
                    <DialogClose asChild key={hash}>
                      <Link
                        to="/"
                        hash={hash}
                        search={hash === "collection" ? {} : true}
                        activeOptions={activeSection}
                      >
                        {name}
                        <ArrowUpRight size={17} />
                      </Link>
                    </DialogClose>
                  ))}
                  <DialogClose asChild>
                    <Link to="/wishlist">
                      Wishlist <ArrowUpRight size={17} />
                    </Link>
                  </DialogClose>
                </nav>
              </DialogContent>
            </Dialog>
            <Link to="/" className="wordmark" aria-label={brand + " home"}>
              <BloomLogo src={store.settings["logo"]} />
              <span>{brand}</span>
            </Link>
            <nav className="desktop-menu" aria-label="Main navigation">
              {links.map(([hash, name]) => (
                <Link
                  key={hash}
                  to="/"
                  hash={hash}
                  search={hash === "collection" ? {} : true}
                  activeOptions={activeSection}
                >
                  {name}
                </Link>
              ))}
            </nav>
            <div className="nav-actions">
              <Link
                to="/"
                hash="filters"
                aria-label="Search gifts"
                className="icon-button nav-search"
              >
                <Search size={20} />
              </Link>
              <Link to="/wishlist" aria-label="Wishlist" className="icon-button nav-wishlist">
                <Heart size={20} />
              </Link>
              <Link
                to="/cart"
                aria-label={"Shopping bag, " + count + " items"}
                className="icon-button bag-icon"
              >
                <ShoppingBag size={20} />
                {count > 0 && <span>{count}</span>}
              </Link>
            </div>
          </div>
        </header>
      )}
      {children}
      {!path.startsWith("/admin") && (
        <>
          <footer className="bloom-footer">
            <div className="wrap footer-grid">
              <div>
                <Link to="/" className="wordmark">
                  <BloomLogo src={store.settings["logo"]} />
                  <span>{brand}</span>
                </Link>
                <p>{store.settings["tagline"] || "Handmade with love. Gifted with feelings."}</p>
                <a className="text-link" href={social} target="_blank" rel="noreferrer">
                  <Instagram size={17} /> Instagram <ArrowUpRight size={14} />
                </a>
              </div>
              <div>
                <h2>Discover</h2>
                <Link to="/" hash="collection" search={{}}>
                  Shop all
                </Link>
                <Link to="/" hash="collection" search={{ category: "mini-gifts" }}>
                  Mini gifts
                </Link>
                <Link to="/" hash="gift-finder">
                  Gift finder
                </Link>
                <Link to="/" hash="instagram">
                  Bloom Diaries
                </Link>
              </div>
              <div>
                <h2>Customer care</h2>
                <Link to="/" hash="contact">
                  Contact & FAQs
                </Link>
                <Link to="/shipping-policy">Shipping</Link>
                <Link to="/return-refund-policy">Returns & refunds</Link>
              </div>
              <div>
                <h2>Information</h2>
                <Link to="/privacy-policy">Privacy</Link>
                <Link to="/terms-conditions">Terms & conditions</Link>
                <Link to="/admin/login">Owner sign-in</Link>
              </div>
            </div>
            <div className="wrap footer-bottom">
              © {new Date().getFullYear()} {brand}
              <span>Made by hand, gifted by heart.</span>
            </div>
          </footer>
          {chat && (
            <a
              className="floating-chat"
              href={chat}
              aria-label="Chat on WhatsApp"
              target="_blank"
              rel="noreferrer"
            >
              <MessageCircle size={23} />
            </a>
          )}
        </>
      )}
    </StoreContext.Provider>
  );
}
