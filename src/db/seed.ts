import { count } from "drizzle-orm";
import { db } from "@/db";
import { products } from "./schema";

const SEED_PRODUCTS = [
  {
    slug: "aurore-necklace",
    name: "The Aurore Necklace",
    category: "Necklaces",
    description:
      "Three hand-woven strands of 22k gold falling in a sunrise gradient, set with nine blush Burmese rubies. A piece that holds the first light of morning against your collarbone.",
    metal: "22k BIS-hallmarked yellow gold",
    stone: "Burmese ruby · 1.4 ct total",
    price: 84500,
    compareAt: 99000,
    image: "/images/necklace-aurore.jpg",
    rating: "4.9",
    reviews: 132,
    stock: 9,
    featured: true,
  },
  {
    slug: "eternel-ring",
    name: "Solitaire Éternel Ring",
    category: "Rings",
    description:
      "A 0.72 carat brilliant-cut solitaire suspended in a whisper of 18k gold. Cut for fire, polished for silence — the ring that asks the question for you.",
    metal: "18k BIS-hallmarked yellow gold",
    stone: "Round brilliant diamond · 0.72 ct · VVS1",
    price: 125000,
    compareAt: 142000,
    image: "/images/ring-eternel.jpg",
    rating: "4.8",
    reviews: 96,
    stock: 6,
    featured: true,
  },
  {
    slug: "perle-earrings",
    name: "Perle Cascade Earrings",
    category: "Earrings",
    description:
      "South Sea pearls with a champagne lustre, capped in fluted 18k gold. They sway when you laugh and hold still when you mean it.",
    metal: "18k BIS-hallmarked yellow gold",
    stone: "South Sea pearl · 9–11 mm",
    price: 42000,
    compareAt: 48000,
    image: "/images/earrings-perle.jpg",
    rating: "4.7",
    reviews: 88,
    stock: 14,
    featured: true,
  },
  {
    slug: "heritage-bangle",
    name: "Heritage Temple Bangle",
    category: "Bracelets",
    description:
      "Hand-engraved over forty hours by our Jaipur karigars, the temple motif circles the wrist like an heirloom that started with you.",
    metal: "22k BIS-hallmarked yellow gold",
    stone: "Uncut polki accents",
    price: 96000,
    compareAt: 110000,
    image: "/images/bangle-heritage.jpg",
    rating: "4.9",
    reviews: 204,
    stock: 7,
    featured: true,
  },
  {
    slug: "noor-pendant",
    name: "Noor Polki Pendant",
    category: "Necklaces",
    description:
      "Uncut polki diamonds arranged around a single Colombian emerald drop, strung on a fine 18k chain. Old-world Hyderabad, edited for now.",
    metal: "18k BIS-hallmarked yellow gold",
    stone: "Polki diamond · emerald drop · 0.9 ct",
    price: 58500,
    compareAt: 66000,
    image: "/images/pendant-noor.jpg",
    rating: "4.8",
    reviews: 74,
    stock: 11,
    featured: false,
  },
  {
    slug: "riviere-bracelet",
    name: "Rivière Tennis Bracelet",
    category: "Bracelets",
    description:
      "Forty-two perfectly matched diamonds in a river of 18k white gold. It catches candlelight, boardrooms, and everything in between.",
    metal: "18k rhodium-finished white gold",
    stone: "42 round brilliants · 3.2 ct total",
    price: 148000,
    compareAt: 165000,
    image: "/images/bracelet-riviere.jpg",
    rating: "4.9",
    reviews: 61,
    stock: 5,
    featured: true,
  },
  {
    slug: "maharani-choker",
    name: "Maharani Kundan Choker",
    category: "Necklaces",
    description:
      "A regal kundan choker finished with hand-knotted pearl drops — the centrepiece of our bridal atelier, made for the moment every head turns.",
    metal: "22k BIS-hallmarked yellow gold",
    stone: "Kundan polki · Japanese pearls",
    price: 215000,
    compareAt: 249000,
    image: "/images/choker-maharani.jpg",
    rating: "5.0",
    reviews: 41,
    stock: 3,
    featured: true,
  },
  {
    slug: "eclat-studs",
    name: "Éclat Diamond Studs",
    category: "Earrings",
    description:
      "Twin brilliant cuts, north-star bright, set so close to the ear they seem to hover. The pair you will never take off.",
    metal: "18k BIS-hallmarked yellow gold",
    stone: "2 round brilliants · 1.0 ct total",
    price: 68000,
    compareAt: 77000,
    image: "/images/studs-eclat.jpg",
    rating: "4.8",
    reviews: 118,
    stock: 16,
    featured: false,
  },
];

let seededPromise: Promise<void> | null = null;

function explainConnectionError(error: unknown) {
  if (process.env.NODE_ENV === "production") return;
  const cause = (error as { cause?: { code?: string; address?: string; port?: number } })
    ?.cause;
  if (!cause) return;
  if (cause.code === "ECONNREFUSED") {
    console.error(`
────────────────────────────────────────────────────────────────────
[AURELLE] PostgreSQL is NOT running (${cause.address ?? "127.0.0.1"}:${
      cause.port ?? 5432
    } refused the connection).

Fix it in under a minute — pick ONE:

  · Docker (easiest):   docker compose up -d
    (the included docker-compose.yml starts Postgres with the right
     database, user and password — .env.example already matches it)

  · Windows install:    winget install PostgreSQL.PostgreSQL.17
    then:  createdb -U postgres app_db

  · Zero install:       create a free database at https://neon.tech
    and paste its connection string as DATABASE_URL in .env

Then create the tables and restart:

  npx drizzle-kit push
  npm run dev

See README.md → "Troubleshooting" for every common DB error.
────────────────────────────────────────────────────────────────────
`);
  } else if (cause.code === "3D000") {
    console.error(
      '[AURELLE] The database in DATABASE_URL does not exist. Create it with: createdb -U postgres app_db',
    );
  } else if (cause.code === "28P01") {
    console.error(
      "[AURELLE] PostgreSQL rejected the username/password in DATABASE_URL. Update .env to match your local Postgres credentials.",
    );
  }
}

export function ensureSeeded(): Promise<void> {
  if (!seededPromise) {
    seededPromise = (async () => {
      try {
        const rows = await db.select({ count: count() }).from(products);
        if (rows[0].count === 0) {
          await db.insert(products).values(SEED_PRODUCTS);
          if (process.env.NODE_ENV !== "production") {
            console.log("[seed] inserted", SEED_PRODUCTS.length, "products");
          }
        }
      } catch (error) {
        seededPromise = null; // allow retry on next request
        explainConnectionError(error);
        if (process.env.NODE_ENV !== "production") {
          console.error("[seed] failed", error);
        }
        throw error;
      }
    })();
  }
  return seededPromise;
}

