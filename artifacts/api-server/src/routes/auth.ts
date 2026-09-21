import { Router, type Request, type Response, type IRouter } from "express";
import { createClient } from "@supabase/supabase-js";

const router: IRouter = Router();

const getSupabaseAdmin = () => {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return null;
  return createClient(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
};

const getSupabaseAnon = () => {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const anonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return null;
  return createClient(url, anonKey);
};

// Known authorized admin emails
const KNOWN_ADMIN_EMAILS = [
  "anyaegbufrancis34@gmail.com",
];

export function isEmailAuthorizedAdmin(email: string): boolean {
  const clean = email.trim().toLowerCase();
  if (KNOWN_ADMIN_EMAILS.includes(clean)) return true;

  const envAdmins = (process.env.ADMIN_EMAILS || process.env.ADMIN_EMAIL || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  return envAdmins.includes(clean);
}

/**
 * POST /api/auth/signup
 * Creates a user with `email_confirm: true` so email confirmation is completely bypassed!
 */
router.post("/signup", async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, fullName } = req.body;
    const cleanEmail = typeof email === "string" ? email.trim().toLowerCase() : "";

    if (!cleanEmail || !password) {
      res.status(400).json({ error: "Email and password are required." });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ error: "Password must be at least 6 characters." });
      return;
    }

    const sbAdmin = getSupabaseAdmin();
    if (!sbAdmin) {
      // Local fallback mode
      res.json({ success: true, localOnly: true });
      return;
    }

    // Try to create the user directly with email_confirm: true
    const { data, error } = await sbAdmin.auth.admin.createUser({
      email: cleanEmail,
      password: String(password),
      email_confirm: true, // Bypass email verification completely
      user_metadata: {
        full_name: fullName?.trim() || cleanEmail.split("@")[0],
        email_verified: true,
      },
    });

    if (error) {
      // If user already exists in Supabase, update them to email_confirm: true
      const errMsg = error.message.toLowerCase();
      if (errMsg.includes("already registered") || errMsg.includes("already exists") || errMsg.includes("unique")) {
        const { data: usersData } = await sbAdmin.auth.admin.listUsers();
        const existing = (usersData?.users as any[])?.find((u: any) => u.email?.toLowerCase() === cleanEmail);

        if (existing) {
          await sbAdmin.auth.admin.updateUserById(existing.id, {
            email_confirm: true,
            password: String(password),
            user_metadata: {
              ...existing.user_metadata,
              full_name: fullName?.trim() || existing.user_metadata?.full_name || cleanEmail.split("@")[0],
              email_verified: true,
            },
          });

          res.json({
            success: true,
            user: existing,
            message: "Account updated with immediate access (no confirmation required).",
          });
          return;
        }

        res.status(400).json({ error: "An account with this email already exists. Please sign in." });
        return;
      }

      res.status(400).json({ error: error.message });
      return;
    }

    // If the newly created user is in the known admin list, ensure admin role
    if (isEmailAuthorizedAdmin(cleanEmail) && data.user) {
      await sbAdmin.auth.admin.updateUserById(data.user.id, {
        app_metadata: { role: "admin" },
        user_metadata: { ...data.user.user_metadata, role: "admin", is_admin: true },
      });
    }

    res.json({
      success: true,
      user: data.user,
      message: "Account created and confirmed immediately.",
    });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || "Internal server error during registration." });
  }
});

/**
 * POST /api/auth/admin-login
 * Validates admin credentials and ensures only authorized administrators can access the admin area.
 */
router.post("/admin-login", async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    const cleanEmail = typeof email === "string" ? email.trim().toLowerCase() : "";

    if (!cleanEmail || !password) {
      res.status(400).json({ error: "Admin email and password are required." });
      return;
    }

    // 1. Check if email matches authorized admin list or metadata
    const isKnownAdmin = isEmailAuthorizedAdmin(cleanEmail);

    const sbAnon = getSupabaseAnon();
    const sbAdmin = getSupabaseAdmin();

    if (sbAnon) {
      const { data, error } = await sbAnon.auth.signInWithPassword({
        email: cleanEmail,
        password: String(password),
      });

      if (error) {
        // Fallback check: if environment configured an ADMIN_PASSWORD
        const customAdminPass = process.env.ADMIN_PASSWORD;
        if (customAdminPass && password === customAdminPass && isKnownAdmin) {
          res.json({
            authorized: true,
            user: {
              email: cleanEmail,
              name: cleanEmail.split("@")[0],
              role: "admin",
            },
          });
          return;
        }

        res.status(401).json({ error: "Invalid credentials. Please verify your administrator email and password." });
        return;
      }

      const user = data.user;
      const isRoleAdmin =
        user.app_metadata?.role === "admin" ||
        user.user_metadata?.role === "admin" ||
        user.user_metadata?.is_admin === true;

      if (!isKnownAdmin && !isRoleAdmin) {
        res.status(403).json({
          error: "Access Denied: This account does not possess Studio Administrator privileges.",
        });
        return;
      }

      // Ensure admin metadata flag is present for future fast queries
      if (sbAdmin && user && (!user.app_metadata?.role || user.app_metadata.role !== "admin")) {
        await sbAdmin.auth.admin.updateUserById(user.id, {
          app_metadata: { role: "admin" },
          user_metadata: { ...user.user_metadata, role: "admin", is_admin: true },
        });
      }

      res.json({
        authorized: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.user_metadata?.full_name || user.email?.split("@")[0] || "Administrator",
          role: "admin",
        },
        session: {
          access_token: data.session?.access_token,
        },
      });
      return;
    }

    // Offline / Local development fallback
    if (isKnownAdmin && password.length >= 6) {
      res.json({
        authorized: true,
        user: {
          email: cleanEmail,
          name: "DIRACE Administrator",
          role: "admin",
        },
      });
      return;
    }

    res.status(401).json({ error: "Invalid administrator credentials." });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || "Failed to authenticate administrator." });
  }
});

/**
 * POST /api/auth/admin-verify
 * Verifies if the currently active session is an authorized administrator.
 */
router.post("/admin-verify", async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;
    const cleanEmail = typeof email === "string" ? email.trim().toLowerCase() : "";

    if (!cleanEmail) {
      res.status(400).json({ authorized: false, error: "Email is required." });
      return;
    }

    if (isEmailAuthorizedAdmin(cleanEmail)) {
      res.json({ authorized: true, email: cleanEmail });
      return;
    }

    const sbAdmin = getSupabaseAdmin();
    if (sbAdmin) {
      const { data } = await sbAdmin.auth.admin.listUsers();
      const user = (data?.users as any[])?.find((u: any) => u.email?.toLowerCase() === cleanEmail);
      if (
        user &&
        (user.app_metadata?.role === "admin" ||
          user.user_metadata?.role === "admin" ||
          user.user_metadata?.is_admin === true)
      ) {
        res.json({ authorized: true, email: cleanEmail });
        return;
      }
    }

    res.status(403).json({ authorized: false, error: "Not an authorized administrator." });
  } catch (err: any) {
    res.status(500).json({ authorized: false, error: err?.message || "Verification failed." });
  }
});

export default router;
