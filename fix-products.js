const fs = require('fs');
let code = fs.readFileSync('artifacts/dirace-store/src/App.tsx', 'utf-8');

// Clean up all existing injections
code = code.replace(/\n\s*const products = useProducts\(\);\n/g, '');

const inject = (name) => {
  const funcIdx = code.indexOf(`function ${name}(`);
  if (funcIdx === -1) return;
  // find the closing parenthesis of the function parameters
  let parens = 0;
  let idx = funcIdx + `function ${name}`.length;
  while(idx < code.length) {
    if (code[idx] === '(') parens++;
    if (code[idx] === ')') {
      parens--;
      if (parens === 0) {
        break;
      }
    }
    idx++;
  }
  // now find the '{' that opens the body
  const bodyIdx = code.indexOf('{', idx);
  if (bodyIdx !== -1) {
    code = code.slice(0, bodyIdx + 1) + '\n  const products = useProducts();\n' + code.slice(bodyIdx + 1);
  }
};

['Cart', 'Checkout', 'SearchPage', 'Home', 'Shop', 'ProductDetail', 'Wishlist'].forEach(inject);

fs.writeFileSync('artifacts/dirace-store/src/App.tsx', code);
