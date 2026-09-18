import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.log("To seed Supabase, set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your environment.");
  process.exit(0);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const sampleProducts = [
  {
    id: "prod_1",
    name: "The Oversized Blazer",
    category: "Outerwear",
    price: 350000,
    image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&q=80",
    alt: "Oversized black blazer",
    badge: "New Arrival",
    description: "Structured, severe, and meticulously tailored. The Oversized Blazer forms the cornerstone of any modern uniform.",
    sizes: ["XS", "S", "M", "L"],
    stock: 14,
  },
  {
    id: "prod_2",
    name: "Pleated Trousers",
    category: "Bottoms",
    price: 220000,
    image: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=800&q=80",
    alt: "Wide leg pleated trousers",
    description: "Fluid motion captured in fabric. These high-waisted pleated trousers offer unparalleled drape and movement.",
    sizes: ["28", "30", "32", "34"],
    stock: 22,
  },
  {
    id: "prod_3",
    name: "Heavyweight Crewneck",
    category: "Tops",
    price: 180000,
    image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&q=80",
    alt: "Minimalist grey crewneck sweater",
    badge: "Essential",
    description: "The Platonic ideal of a sweatshirt. Cut from dense 500gsm cotton terry with a slightly cropped, boxy fit.",
    sizes: ["S", "M", "L", "XL"],
    stock: 35,
  },
  {
    id: "prod_4",
    name: "Structured Tote",
    category: "Accessories",
    price: 450000,
    image: "https://images.unsplash.com/photo-1584916201218-f4242ceb4809?w=800&q=80",
    alt: "Black leather structural tote bag",
    badge: "Limited",
    description: "Architectural carry. Crafted from rigid Italian calfskin that develops a profound patina with extended use.",
    sizes: ["OS"],
    stock: 8,
  }
];

async function seed() {
  console.log("Seeding products to Supabase...");
  const { data, error } = await supabase.from('products').upsert(sampleProducts);
  if (error) console.error("Error:", error);
  else console.log("Seeded successfully:", data);
  process.exit(0);
}

seed();
