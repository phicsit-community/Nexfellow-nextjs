"use client";
import { useEffect } from "react";
import { SignIn, useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

const clerkAppearance = {
  variables: {
    colorPrimary: "#00d4a8",
    colorBackground: "#131f35",
    colorForeground: "#f1f5f9",
    colorMutedForeground: "#94a3b8",
    colorInput: "#0d1829",
    colorInputForeground: "#f1f5f9",
    colorNeutral: "#94a3b8",
    colorDanger: "#f87171",
    borderRadius: "14px",
    fontFamily: "inherit",
    fontSize: "14px",
    spacingUnit: "16px",
  },
  elements: {
    rootBox: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      width: "100%",
    },
    card: {
      background: "#131f35",
      border: "1px solid rgba(255,255,255,0.1)",
      boxShadow:
        "0 0 0 1px rgba(0,0,0,0.3), 0 8px 24px rgba(0,0,0,0.4), 0 32px 80px rgba(0,0,0,0.5)",
      borderRadius: "18px",
      padding: "36px 32px",
      width: "100%",
      maxWidth: "400px",
    },
    headerTitle: {
      color: "#f1f5f9",
      fontSize: "20px",
      fontWeight: "700",
      letterSpacing: "-0.3px",
    },
    headerSubtitle: {
      color: "#64748b",
      fontSize: "14px",
    },
    socialButtonsBlockButton: {
      background: "#0d1829",
      border: "1px solid rgba(255,255,255,0.12)",
      color: "#f1f5f9",
      borderRadius: "10px",
      padding: "10px 16px",
      fontWeight: "500",
      transition: "background 0.15s ease, border-color 0.15s ease",
    },
    socialButtonsBlockButtonText: {
      color: "#f1f5f9",
      fontWeight: "500",
    },
    socialButtonsProviderIcon: {
      width: "18px",
      height: "18px",
    },
    dividerLine: {
      background: "rgba(255,255,255,0.08)",
      height: "1px",
    },
    dividerText: {
      color: "#475569",
      fontSize: "12px",
      fontWeight: "500",
      textTransform: "uppercase",
      letterSpacing: "0.08em",
    },
    formFieldLabel: {
      color: "#94a3b8",
      fontSize: "13px",
      fontWeight: "500",
      marginBottom: "6px",
    },
    formFieldInput: {
      background: "#0d1829",
      border: "1px solid rgba(255,255,255,0.1)",
      borderRadius: "10px",
      color: "#f1f5f9",
      fontSize: "14px",
      padding: "10px 14px",
      outline: "none",
      transition: "border-color 0.15s ease, box-shadow 0.15s ease",
      "&::placeholder": {
        color: "#64748b",
      },
    },
    formButtonPrimary: {
      background: "linear-gradient(135deg, #00d4a8 0%, #00b894 100%)",
      color: "#0a0f1e",
      fontWeight: "700",
      fontSize: "15px",
      borderRadius: "10px",
      padding: "12px",
      letterSpacing: "0.01em",
      boxShadow: "0 4px 20px rgba(0,212,168,0.35)",
      border: "none",
    },
    footerActionText: {
      color: "#64748b",
      fontSize: "13px",
    },
    footerActionLink: {
      color: "#00d4a8",
      fontWeight: "600",
      fontSize: "13px",
    },
    identityPreviewText: {
      color: "#f1f5f9",
    },
    identityPreviewEditButton: {
      color: "#00d4a8",
    },
    formResendCodeLink: {
      color: "#00d4a8",
      fontWeight: "500",
    },
    otpCodeFieldInput: {
      background: "#0d1829",
      border: "1px solid rgba(255,255,255,0.12)",
      borderRadius: "10px",
      color: "#f1f5f9",
      caretColor: "#00d4a8",
      fontSize: "20px",
      fontWeight: "600",
    },
    badge: {
      background: "rgba(0,212,168,0.12)",
      color: "#00d4a8",
      border: "1px solid rgba(0,212,168,0.25)",
      borderRadius: "6px",
    },
    alert: {
      background: "rgba(248,113,113,0.1)",
      border: "1px solid rgba(248,113,113,0.3)",
      borderRadius: "10px",
    },
    alertIcon: {
      color: "#f87171",
    },
    alertText: {
      color: "#fca5a5",
    },
    formFieldSuccessText: {
      color: "#00d4a8",
    },
    formFieldErrorText: {
      color: "#f87171",
    },
    formFieldErrorTextIcon: {
      color: "#f87171",
    },
    footer: {
      background: "transparent",
      borderTop: "1px solid rgba(255,255,255,0.06)",
      marginTop: "8px",
      paddingTop: "16px",
    },
    footerItem: {
      color: "#94a3b8",
      opacity: 1,
    },
  },
};

export default function SignInPage() {
  const { isSignedIn, isLoaded } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.replace("/feed");
    }
  }, [isLoaded, isSignedIn, router]);

  if (!isLoaded || isSignedIn) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background:
          "radial-gradient(ellipse at 50% 40%, #0d1e3a 0%, #080d18 70%)",
        padding: "24px",
        overflowY: "auto",
        overflowX: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          width: "min(500px, 100%)",
          height: "500px",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(0,212,168,0.07) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px", zIndex: 1, width: "100%", maxWidth: "400px" }}>
        <div
          style={{
            width: "100%",
            background: "rgba(0,212,168,0.08)",
            border: "1px solid rgba(0,212,168,0.25)",
            borderRadius: "12px",
            padding: "12px 16px",
            display: "flex",
            alignItems: "flex-start",
            gap: "10px",
          }}
        >
          <p style={{ margin: 0, fontSize: "13px", color: "#94a3b8", lineHeight: "1.5" }}>
            <strong style={{ color: "#00d4a8", fontWeight: "600" }}>Already have a Nexfellow account?</strong>
            <br />
            Sign up with the email address associated with your account to access your existing profile and data.
          </p>
        </div>
        <SignIn appearance={clerkAppearance} />
      </div>
    </div>
  );
}
