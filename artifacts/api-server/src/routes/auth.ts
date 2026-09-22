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

// Fixed Studio Administrator credentials sourced from environment variables (.env)
export const getFixedAdminEmail = (): string => {
  return (
    process.env.FIXED_ADMIN_EMAIL ||
    process.env.fixed_admin_email ||
    process.env.ADMIN_EMAILS ||
    process.env.ADMIN_EMAIL ||
    "diraceadmin@gmail.com"
  ).trim().toLowerCase();
};

export const getFixedAdminPassword = (): string => {
  return (
    process.env.FIXED_ADMIN_PASSWORD ||
    process.env.fixed_admin_password ||
    process.env.ADMIN_PASSWORD ||
    "diraceadminonly"
  );
};

export const FIXED_ADMIN_EMAIL = getFixedAdminEmail();
export const FIXED_ADMIN_PASSWORD = getFixedAdminPassword();

export function isEmailAuthorizedAdmin(email: string): boolean {
  const clean = email.trim().toLowerCase();
  return clean === getFixedAdminEmail();
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

    const targetAdminEmail = getFixedAdminEmail();
    const targetAdminPassword = getFixedAdminPassword();

    // If the newly created user matches the fixed admin email, ensure admin role
    if (cleanEmail === targetAdminEmail && data.user) {
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
 * Validates admin credentials and ensures only the fixed admin credentials can access the admin area.
 */
router.post("/admin-login", async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    const cleanEmail = typeof email === "string" ? email.trim().toLowerCase() : "";

    if (!cleanEmail || !password) {
      res.status(400).json({ error: "Administrator email and password are required." });
      return;
    }

    const targetAdminEmail = getFixedAdminEmail();
    const targetAdminPassword = getFixedAdminPassword();

    // STRICT ACCESS CONTROL:
    // Regular user accounts MUST NOT be able to access the admin page at all even with an active account.
    // It is ONLY available to the admin with the fixed login credentials configured in .env.
    if (cleanEmail !== targetAdminEmail) {
      res.status(403).json({
        error: "Access Denied: Only authorized administrator credentials are valid.",
      });
      return;
    }

    if (password !== targetAdminPassword) {
      res.status(401).json({
        error: "Invalid administrator credentials. Please check your administrator password.",
      });
      return;
    }

    const sbAnon = getSupabaseAnon();
    let accessToken: string | undefined;
    let userId = "admin_fixed";

    if (sbAnon) {
      const { data } = await sbAnon.auth.signInWithPassword({
        email: targetAdminEmail,
        password: targetAdminPassword,
      }).catch(() => ({ data: null }));

      if (data?.user?.id) userId = data.user.id;
      if (data?.session?.access_token) accessToken = data.session.access_token;
    }

    res.json({
      authorized: true,
      user: {
        id: userId,
        email: targetAdminEmail,
        name: "DIRACE Studio Administrator",
        role: "admin",
      },
      session: {
        access_token: accessToken,
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || "Failed to authenticate administrator." });
  }
});

/**
 * POST /api/auth/admin-verify
 * Verifies if the session email is the authorized fixed administrator.
 */
router.post("/admin-verify", async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;
    const cleanEmail = typeof email === "string" ? email.trim().toLowerCase() : "";

    if (!cleanEmail) {
      res.status(400).json({ authorized: false, error: "Email is required." });
      return;
    }

    const targetAdminEmail = getFixedAdminEmail();

    if (cleanEmail !== targetAdminEmail) {
      res.status(403).json({
        authorized: false,
        error: "Access Denied: Standard user accounts cannot access the administration portal.",
      });
      return;
    }

    res.json({ authorized: true, email: targetAdminEmail });
  } catch (err: any) {
    res.status(500).json({ authorized: false, error: err?.message || "Verification failed." });
  }
});

export default router;
