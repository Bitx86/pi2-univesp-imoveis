"use client";

import React, { useState } from "react";
import { ArrowRight, Compass, CheckCircle2, ShieldCheck } from "lucide-react";

interface FeltCTASectionProps {
  onExploreMap: () => void;
}

export function FeltCTASection({ onExploreMap }: FeltCTASectionProps) {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
    }
  };

  return (
    <section
      style={{
        maxWidth: "var(--page-max-width)",
        margin: "0 auto",
        padding: "0 24px",
        marginBottom: "var(--spacing-80)",
        position: "relative",
        zIndex: 10,
      }}
    >
      <div
        style={{
          backgroundColor: "var(--color-forest-floor)",
          border: "1px solid var(--color-lichen)",
          borderRadius: "var(--radius-cards)",
          padding: "64px 36px",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
          boxShadow: "var(--shadow-panel)",
        }}
      >
        {/* Top Amber Needle Accent Border */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: "20%",
            right: "20%",
            height: 2,
            background: "linear-gradient(90deg, transparent, var(--color-amber-compass), transparent)",
          }}
        />

        {/* Eyebrow */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            backgroundColor: "var(--color-deep-bog)",
            border: "1px solid var(--color-lichen)",
            padding: "6px 14px",
            borderRadius: "var(--radius-badges)",
            marginBottom: "var(--spacing-24)",
          }}
        >
          <Compass size={14} color="var(--color-amber-compass)" />
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              fontWeight: 500,
              letterSpacing: "0.08em",
              color: "var(--color-bone-white)",
              textTransform: "uppercase",
            }}
          >
            ACESSO ANTECIPADO AO ATLAS GIS
          </span>
        </div>

        {/* Serif Headline */}
        <h2
          className="serif-heading-lg"
          style={{
            maxWidth: 820,
            margin: "0 auto var(--spacing-20) auto",
            color: "var(--color-bone-white)",
          }}
        >
          Traga a precisão cartográfica para suas decisões imobiliárias.
        </h2>

        {/* Subtitle */}
        <p
          className="sans-body"
          style={{
            maxWidth: 640,
            margin: "0 auto var(--spacing-36) auto",
            color: "var(--color-parchment)",
          }}
        >
          Pare de tomar decisões baseadas em médias arbitrárias. Comece a explorar dispersão por micro-regiões e dados georreferenciados em tempo real.
        </p>

        {/* Lead Capture or Direct Action */}
        {submitted ? (
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              backgroundColor: "var(--color-deep-bog)",
              border: "1px solid var(--color-amber-compass)",
              padding: "16px 28px",
              borderRadius: "var(--radius-cards)",
              color: "var(--color-bone-white)",
            }}
          >
            <CheckCircle2 size={20} color="var(--color-amber-compass)" />
            <span style={{ fontSize: 15, fontWeight: 500 }}>
              Acesso solicitado! Enviamos os detalhes do atlas para seu e-mail.
            </span>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 12,
              maxWidth: 520,
              margin: "0 auto var(--spacing-24) auto",
              flexWrap: "wrap",
            }}
          >
            <input
              type="email"
              required
              placeholder="Digite seu e-mail corporativo..."
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                flex: "1 1 280px",
                padding: "14px 18px",
                borderRadius: "var(--radius-buttons)",
                border: "1px solid var(--color-lichen)",
                backgroundColor: "var(--color-deep-bog)",
                color: "var(--color-bone-white)",
                fontFamily: "var(--font-sans)",
                fontSize: 14,
                outline: "none",
              }}
            />
            <button
              type="submit"
              className="btn-amber"
              style={{
                padding: "14px 28px",
                fontSize: 14,
              }}
            >
              <span>Solicitar Acesso</span>
              <ArrowRight size={16} />
            </button>
          </form>
        )}

        {/* Reassurance notes */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 24,
            fontSize: 12,
            color: "var(--color-limestone)",
            flexWrap: "wrap",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <ShieldCheck size={14} color="var(--color-amber-compass)" />
            <span>Sem fidelidade ou cartão de crédito</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Compass size={14} color="var(--color-amber-compass)" />
            <span>Dados sincronizados Neon Postgres</span>
          </div>
        </div>
      </div>
    </section>
  );
}
