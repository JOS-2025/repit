import * as client from "openid-client";
import { Strategy, type VerifyFunction } from "openid-client/passport";

import passport from "passport";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import memoize from "memoizee";
import connectPg from "connect-pg-simple";
import { storage } from "./storage";
import { randomUUID } from "crypto";

if (!process.env.REPLIT_DOMAINS) {
  throw new Error("Environment variable REPLIT_DOMAINS not provided");
}

const getOidcConfig = memoize(
  async () => {
    return await client.discovery(
      new URL(process.env.ISSUER_URL ?? "https://replit.com/oidc"),
      process.env.REPL_ID!
    );
  },
  { maxAge: 3600 * 1000 }
);

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions",
  });
  
  // Add error handling for session store
  sessionStore.on('error', (error) => {
    console.error('[AUTH] Session store error:', error);
  });
  
  return session({
    secret: process.env.SESSION_SECRET!,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      maxAge: sessionTtl,
    },
    // Add session error handling
    genid: () => {
      try {
        const id = randomUUID();
        console.log('[AUTH] Generated session ID:', id.substring(0, 8) + '...');
        return id;
      } catch (error) {
        // Fallback to timestamp-based ID
        const id = Date.now().toString(36) + Math.random().toString(36).substr(2);
        console.log('[AUTH] Generated fallback session ID:', id.substring(0, 8) + '...');
        return id;
      }
    }
  });
}

function updateUserSession(
  user: any,
  tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers
) {
  user.claims = tokens.claims();
  user.access_token = tokens.access_token;
  user.refresh_token = tokens.refresh_token;
  user.expires_at = user.claims?.exp;
}

async function upsertUser(
  claims: any,
) {
  try {
    console.log("[AUTH] Upserting user with claims:", {
      id: claims["sub"],
      email: claims["email"],
      firstName: claims["first_name"]
    });
    
    await storage.upsertUser({
      id: claims["sub"],
      email: claims["email"],
      firstName: claims["first_name"],
      lastName: claims["last_name"],
      profileImageUrl: claims["profile_image_url"],
    });
    
    console.log("[AUTH] User upserted successfully");
  } catch (error: any) {
    console.error("[AUTH] Error upserting user:", error);
    throw new Error(`Failed to save user data: ${error.message}`);
  }
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  const config = await getOidcConfig();

  const verify: VerifyFunction = async (
    tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers,
    verified: passport.AuthenticateCallback
  ) => {
    console.log("[AUTH] Verify function called");
    const user = {};
    updateUserSession(user, tokens);
    await upsertUser(tokens.claims());
    console.log("[AUTH] User authenticated successfully");
    verified(null, user);
  };

  for (const domain of process.env
    .REPLIT_DOMAINS!.split(",")) {
    const strategy = new Strategy(
      {
        name: `replitauth:${domain}`,
        config,
        scope: "openid email profile offline_access",
        callbackURL: `https://${domain}/api/callback`,
      },
      verify,
    );
    passport.use(strategy);
    console.log("[AUTH] Registered strategy for domain:", domain);
  }

  passport.serializeUser((user: Express.User, cb) => cb(null, user));
  passport.deserializeUser((user: Express.User, cb) => cb(null, user));

  app.get("/api/login", (req, res, next) => {
    console.log("[AUTH] Login attempt for hostname:", req.hostname);
    
    // Handle localhost for development
    let hostname = req.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      // Get the first domain from REPLIT_DOMAINS for localhost development
      const domains = process.env.REPLIT_DOMAINS!.split(",");
      hostname = domains[0];
      console.log("[AUTH] Using first domain for localhost:", hostname);
    }
    
    const strategyName = `replitauth:${hostname}`;
    console.log("[AUTH] Using strategy:", strategyName);
    
    passport.authenticate(strategyName, {
      scope: ["openid", "email", "profile", "offline_access"],
    })(req, res, next);
  });

  app.get("/api/callback", (req, res, next) => {
    console.log("[AUTH] Callback received for hostname:", req.hostname);
    
    // Handle localhost for development
    let hostname = req.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      // Get the first domain from REPLIT_DOMAINS for localhost development
      const domains = process.env.REPLIT_DOMAINS!.split(",");
      hostname = domains[0];
      console.log("[AUTH] Using first domain for localhost:", hostname);
    }
    
    const strategyName = `replitauth:${hostname}`;
    
    passport.authenticate(strategyName, {
      successRedirect: "/",
      failureRedirect: "/?error=auth_failed",
    })(req, res, next);
  });

  app.get("/api/logout", (req, res) => {
    req.logout(() => {
      res.redirect(
        client.buildEndSessionUrl(config, {
          client_id: process.env.REPL_ID!,
          post_logout_redirect_uri: `${req.protocol}://${req.hostname}`,
        }).href
      );
    });
  });
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  try {
    const user = req.user as any;
    
    // Check if user is authenticated
    if (!req.isAuthenticated()) {
      console.log("[AUTH] Request not authenticated");
      return res.status(401).json({ message: "Unauthorized", reason: "not_authenticated" });
    }
    
    if (!user) {
      console.log("[AUTH] No user object in session");
      return res.status(401).json({ message: "Unauthorized", reason: "no_user_session" });
    }
    
    if (!user.expires_at) {
      console.log("[AUTH] No expiration time in user session");
      return res.status(401).json({ message: "Unauthorized", reason: "no_expiration" });
    }

    const now = Math.floor(Date.now() / 1000);
    
    // Token is still valid
    if (now <= user.expires_at) {
      return next();
    }
    
    console.log("[AUTH] Token expired, attempting refresh");
    
    const refreshToken = user.refresh_token;
    if (!refreshToken) {
      console.log("[AUTH] No refresh token available");
      return res.status(401).json({ message: "Unauthorized", reason: "no_refresh_token" });
    }

    try {
      const config = await getOidcConfig();
      const tokenResponse = await client.refreshTokenGrant(config, refreshToken);
      updateUserSession(user, tokenResponse);
      console.log("[AUTH] Token refreshed successfully");
      return next();
    } catch (refreshError: any) {
      console.error("[AUTH] Token refresh failed:", refreshError);
      return res.status(401).json({ 
        message: "Unauthorized", 
        reason: "refresh_failed",
        error: refreshError.message 
      });
    }
  } catch (error: any) {
    console.error("[AUTH] Authentication middleware error:", error);
    return res.status(500).json({ 
      message: "Authentication error", 
      error: error.message 
    });
  }
};
