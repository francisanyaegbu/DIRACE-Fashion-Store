const fs = require('fs');
let code = fs.readFileSync('artifacts/dirace-store/src/App.tsx', 'utf-8');

const authCode = `
import { auth, googleAuthProvider } from './lib/firebase.ts';
import { signInWithPopup, signOut, onAuthStateChanged, User } from 'firebase/auth';

function Account() {
  const [user, setUser] = useState<User | null>(null);
  
  useEffect(() => {
    return onAuthStateChanged(auth, setUser);
  }, []);

  const login = () => signInWithPopup(auth, googleAuthProvider);
  const logout = () => signOut(auth);

  return <main className="page-wrap"><div className="page-header"><div className="eyebrow accent">DIRACE / Personal</div><h1 className="display">YOUR SPACE.</h1></div><div className="content-narrow"><div className="account-panel"><div className="eyebrow accent">Client account</div><h2 className="display" style={{ fontSize: 45, margin: '18px 0' }}>WELCOME IN.</h2><p className="muted" style={{ fontSize: 13, lineHeight: 1.8 }}>Account access, saved pieces, order history, and faster checkout enabled securely.</p><div className="rule" style={{ margin: '25px 0' }} />
  
  {user ? (
    <div>
      <p>Signed in as <strong>{user.email}</strong></p>
      <button className="primary-btn" onClick={logout} style={{marginTop: 20}}>Sign Out</button>
    </div>
  ) : (
    <div className="empty-state" style={{ padding: '52px 24px' }}><UserRound size={24} className="accent" /><h2 className="display" style={{ fontSize: 32 }}>AUTH NOT CONNECTED.</h2><p>Sign in with your Google account to access your personal space.</p><button className="primary-btn" onClick={login} style={{marginTop: 20}}>Sign in with Google</button></div>
  )}
  
  </div></div></main>;
}
`;

code = code.replace(/function Account\(\) \{[\s\S]*?\}[\s\n]*function Admin/m, 'function Admin');
code = code.replace('import { useMemo', 'import { auth, googleAuthProvider } from "./lib/firebase";\nimport { signInWithPopup, signOut, onAuthStateChanged, type User } from "firebase/auth";\nimport { useMemo');
code = code.replace('function Admin', authCode.split('function Account() {')[1] ? 'function Account() {' + authCode.split('function Account() {')[1] + '\nfunction Admin' : 'function Admin');

fs.writeFileSync('artifacts/dirace-store/src/App.tsx', code);
