import { db } from "./src/db/index.js";
import { products } from "./src/db/schema.js";

const sampleProducts = [
  {
    id: "prod_1",
    name: "The Oversized Blazer",
    category: "Outerwear",
    price: 35000, // 350.00
    image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&q=80",
    alt: "Oversized black blazer",
    badge: "New Arrival",
    description: "Structured, severe, and meticulously tailored. The Oversized Blazer forms the cornerstone of any modern uniform.",
    sizes: ["XS", "S", "M", "L"]
  },
  {
    id: "prod_2",
    name: "Pleated Trousers",
    category: "Bottoms",
    price: 22000,
    image: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=800&q=80",
    alt: "Wide leg pleated trousers",
    description: "Fluid motion captured in fabric. These high-waisted pleated trousers offer unparalleled drape and movement.",
    sizes: ["28", "30", "32", "34"]
  },
  {
    id: "prod_3",
    name: "Heavyweight Crewneck",
    category: "Tops",
    price: 18000,
    image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&q=80",
    alt: "Minimalist grey crewneck sweater",
    badge: "Essential",
    description: "The Platonic ideal of a sweatshirt. Cut from dense 500gsm cotton terry with a slightly cropped, boxy fit.",
    sizes: ["S", "M", "L", "XL"]
  },
  {
    id: "prod_4",
    name: "Structured Tote",
    category: "Accessories",
    price: 45000,
    image: "https://images.unsplash.com/photo-1584916201218-f4242ceb4809?w=800&q=80",
    alt: "Black leather structural tote bag",
    description: "Architectural carry. Crafted from rigid Italian calfskin that develops a profound patina with extended use.",
    sizes: ["OS"]
  }
];

async function seed() {
  console.log("Seeding products...");
  for (const p of sampleProducts) {
    await db.insert(products).values(p).onConflictDoNothing();
  }
  console.log("Done.");
  process.exit(0);
}

seed();
