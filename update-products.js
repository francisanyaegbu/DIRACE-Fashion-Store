const fs = require('fs');
let code = fs.readFileSync('artifacts/dirace-store/src/App.tsx', 'utf-8');

// 1. Remove the global products variable and add Context
code = code.replace(
  '// Supabase will become the source of truth for this catalog.\nconst products: Product[] = [];',
  'import { createContext, useContext, useEffect } from "react";\nconst ProductsContext = createContext<Product[]>([]);\nfunction useProducts() { return useContext(ProductsContext); }'
);

// 2. Replace products references with useProducts() hook
const components = ['Cart', 'Checkout', 'SearchPage', 'Home', 'Shop', 'ProductDetail', 'Wishlist'];
components.forEach(comp => {
  const regex = new RegExp(`(function ${comp}\\s*\\([^)]*\\)\\s*{)`);
  code = code.replace(regex, `$1\n  const products = useProducts();`);
});

// 3. Add state and fetch to App
code = code.replace(
  'function App() {',
  'function App() {\n  const [products, setProducts] = useState<Product[]>([]);\n  useEffect(() => {\n    fetch("/api/products").then(r => r.json()).then(setProducts).catch(console.error);\n  }, []);'
);

// 4. Wrap with context provider
code = code.replace(
  '<TooltipProvider>',
  '<TooltipProvider>\n<ProductsContext.Provider value={products}>'
);
code = code.replace(
  '</TooltipProvider>',
  '</ProductsContext.Provider>\n</TooltipProvider>'
);

fs.writeFileSync('artifacts/dirace-store/src/App.tsx', code);
