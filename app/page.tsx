"use client";

import { useEffect, useState } from "react";

const PRICES = {
  starter: { monthly: 9, annual: 90 },
  creator: { monthly: 19, annual: 190 },
  studio: { monthly: 49, annual: 490 },
};

const PLAN_DETAILS = {
  starter: {
    name: "Starter",
    badge: "For trying it out",
    credits: "120 credits / month",
    blurb: "Good when you are starting out.",
    cta: "Choose Starter",
    features: [
      "Try-on and style ideas",
      "Good for light use",
      "Download every image",
      "Email support",
    ],
  },
  creator: {
    name: "Creator",
    badge: "Most popular",
    credits: "320 credits / month",
    blurb: "Good for creators and regular use.",
    cta: "Choose Creator",
    features: [
      "More monthly credits",
      "Good for regular use",
      "Priority when possible",
      "Priority email support",
    ],
  },
  studio: {
    name: "Studio",
    badge: "For teams",
    credits: "950 credits / month",
    blurb: "Good for teams and heavy use.",
    cta: "Choose Studio",
    features: [
      "Highest credit pack",
      "Priority when possible",
      "Good for teams",
      "Priority support lane",
    ],
  },
} as const;

const HOW_STEPS = [
  {
    title: "Upload your photos",
    description:
      "Add a person photo and clothing photo for try-on, or upload a fabric swatch.",
  },
  {
    title: "Choose the clothing type",
    description:
      "Pick what to make — shirt, dress, kurta, saree blouse, and more.",
  },
  {
    title: "Download the final image",
    description:
      "Get a ready-to-use outfit preview you can share or use in your store.",
  },
] as const;

const CLOTHING_TYPES = ["Shirt", "Dress", "Kurta", "Blouse", "Jacket", "Skirt"];

const TESTIMONIALS = [
  {
    quote:
      "We made product photos faster and easier. The images look good on mobile pages.",
    author: "Sneha Rao",
    role: "Store owner",
    stars: "★★★★★",
  },
  {
    quote:
      "Customers understand the fit better before they buy. That helps us avoid returns.",
    author: "Tobias Klein",
    role: "Online seller",
    stars: "★★★★★",
  },
  {
    quote:
      "I upload a fabric, choose the clothing type, and get a clear image in minutes.",
    author: "Amara Chukwu",
    role: "Fashion creator",
    stars: "★★★★★",
  },
];

export default function Home() {
  const [isAnnual, setIsAnnual] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add("visible");
        });
      },
      { threshold: 0.1 }
    );
    const nodes = document.querySelectorAll(".fade-up");
    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const id = window.setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % TESTIMONIALS.length);
    }, 4200);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="landing-page">
      <section className="hero">
        <div className="container">
          <div className="hero-badge fade-up visible">
            <span className="hero-badge-dot"></span>
            Make outfit photos with AI
          </div>
          <h1 className="hero-title fade-up visible">
            Turn fabric and clothing photos
            <br />
            into <em>real outfit previews</em>
          </h1>
          <p className="hero-sub fade-up visible">
            Upload a person photo and clothing photo for try-on. Or upload fabric,
            choose what to make, and see it worn by a person.
          </p>
          <div className="hero-actions fade-up visible">
            <a href="/studio" className="btn btn-primary btn-lg">
              Open studio
            </a>
            <a href="#demo" className="btn btn-outline btn-lg">
              See how it works
            </a>
          </div>
        </div>
      </section>

      <div id="demo" className="video-section">
        <div className="container">
          <p className="video-label">Product demo</p>
          <div
            className="video-placeholder"
            role="img"
            aria-label="Product demo video placeholder"
          >
            <div className="video-placeholder-pattern" aria-hidden />
            <div className="video-placeholder-inner">
              <div className="video-placeholder-play" aria-hidden>
                <svg width="28" height="32" viewBox="0 0 28 32" fill="currentColor">
                  <path d="M27.2 16.8 2.4 31.2A2 2 0 0 1 0 29.6V2.4A2 2 0 0 1 2.4.8l24.8 14.4a2 2 0 0 1 0 3.2z" />
                </svg>
              </div>
              <p className="video-placeholder-title">
                See fabric become an outfit in the studio
              </p>
              <span className="video-placeholder-badge">Video coming soon</span>
            </div>
            <div className="video-placeholder-duration" aria-hidden>
              2:14
            </div>
          </div>
        </div>
      </div>

      <section id="features" className="features-bg">
        <div className="container">
          <div className="section-header">
            <p className="section-eyebrow">What it does</p>
            <h2 className="section-title">
              Simple tools for outfit photos
              <br />
              and fabric ideas
            </h2>
            <p className="section-sub">
              Use it for online stores, custom stitching, fabric previews,
              and quick fashion ideas.
            </p>
          </div>
          <div className="features-grid">
            {[
              "Virtual try-on",
              "Fabric to outfit",
              "Person photo optional",
              "Clear previews",
              "Credit balance",
              "Fast downloads",
            ].map((title) => (
              <div key={title} className="feature-card fade-up">
                <p className="feature-title">{title}</p>
                <p className="feature-desc">
                  Made to be simple: upload images, choose an option, and create.
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="how-it-works">
        <div className="container">
          <div className="how-grid">
            <div>
              <p className="section-eyebrow">How it works</p>
              <h2 className="section-title">Create an outfit in three steps</h2>
              <p className="section-sub section-sub-space">
                You do not need complex prompts. Add photos, pick what you want,
                and download the result.
              </p>
              <div className="steps">
                {HOW_STEPS.map((step, idx) => (
                  <div
                    key={step.title}
                    className={`step ${activeStep === idx ? "active" : ""}`}
                    onClick={() => setActiveStep(idx)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setActiveStep(idx);
                      }
                    }}
                    role="button"
                    tabIndex={0}
                    aria-pressed={activeStep === idx}
                  >
                    <div className="step-num">{idx + 1}</div>
                    <div className="step-content">
                      <h3>{step.title}</h3>
                      <p>{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="how-visual" aria-live="polite">
              {activeStep === 0 && (
                <div className="step-panel step-panel-upload">
                  <p className="step-panel-label">Studio upload</p>
                  <div className="upload-slots">
                    <div className="upload-slot">
                      <span className="upload-slot-icon upload-slot-icon-person" />
                      <span className="upload-slot-name">Person</span>
                      <span className="upload-slot-hint">Optional for fabric mode</span>
                    </div>
                    <div className="upload-slot upload-slot-accent">
                      <span className="upload-slot-icon upload-slot-icon-fabric" />
                      <span className="upload-slot-name">Fabric or clothing</span>
                      <span className="upload-slot-hint">PNG, JPG up to 10 MB</span>
                    </div>
                  </div>
                  <div className="upload-drop-hint">
                    <span className="upload-drop-plus">+</span>
                    Drag and drop or click to browse
                  </div>
                </div>
              )}
              {activeStep === 1 && (
                <div className="step-panel step-panel-picker">
                  <p className="step-panel-label">What should we make?</p>
                  <div className="picker-grid">
                    {CLOTHING_TYPES.map((type, idx) => (
                      <button
                        key={type}
                        type="button"
                        className={`picker-chip ${idx === 2 ? "selected" : ""}`}
                        tabIndex={-1}
                        aria-hidden
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                  <div className="picker-preview">
                    <div className="picker-preview-swatch" />
                    <div>
                      <p className="picker-preview-title">Kurta from your fabric</p>
                      <p className="picker-preview-sub">Style preview before generation</p>
                    </div>
                  </div>
                </div>
              )}
              {activeStep === 2 && (
                <div className="step-panel step-panel-result">
                  <p className="step-panel-label">Your preview is ready</p>
                  <div className="result-preview">
                    <div className="result-preview-image">
                      <span className="result-preview-badge">AI preview</span>
                    </div>
                  </div>
                  <div className="result-file">
                    <div className="result-file-icon">✓</div>
                    <div className="result-file-meta">
                      <p className="result-file-name">outfit-preview.jpg</p>
                      <p className="result-file-sub">1.2 MB · Ready to download</p>
                    </div>
                    <span className="result-download-btn">Download</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <section id="pricing" className="pricing-bg">
        <div className="container">
          <div className="section-header section-center">
            <p className="section-eyebrow">Pricing</p>
            <h2 className="section-title">Simple pricing</h2>
          </div>

          <div className="pricing-toggle">
            <span className={`toggle-label ${!isAnnual ? "active" : ""}`}>
              Monthly
            </span>
            <button
              type="button"
              className={`toggle-switch ${isAnnual ? "on" : ""}`}
              onClick={() => setIsAnnual((v) => !v)}
              aria-label="Toggle billing period"
            >
              <span className="toggle-knob"></span>
            </button>
            <span className={`toggle-label ${isAnnual ? "active" : ""}`}>
              Annual
            </span>
            <span className="save-badge">Save ~17%</span>
          </div>

          <div className="pricing-grid">
            {(["starter", "creator", "studio"] as const).map((plan) => (
              <div
                key={plan}
                className={`plan-card ${plan === "creator" ? "featured" : ""}`}
              >
                <div className="plan-head">
                  <p className="plan-name">{PLAN_DETAILS[plan].name}</p>
                  <p className="plan-badge">{PLAN_DETAILS[plan].badge}</p>
                </div>
                <div className="plan-price">
                  <div className="price-amount">
                    ${isAnnual ? PRICES[plan].annual : PRICES[plan].monthly}
                  </div>
                  <div className="price-period">
                    {isAnnual
                      ? "per year, billed annually"
                      : "per month, billed monthly"}
                  </div>
                </div>
                <div className="plan-credits">{PLAN_DETAILS[plan].credits}</div>
                <p className="plan-blurb">{PLAN_DETAILS[plan].blurb}</p>
                <ul className="plan-features-list">
                  {PLAN_DETAILS[plan].features.map((feature) => (
                    <li key={feature}>{feature}</li>
                  ))}
                </ul>
                <a
                  href="/pricing"
                  className={`btn ${plan === "creator" ? "btn-primary" : "btn-outline"} full`}
                >
                  {PLAN_DETAILS[plan].cta}
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="testimonials" className="testimonials-bg">
        <div className="container">
          <div className="section-header section-center">
            <p className="section-eyebrow">Customer stories</p>
            <h2 className="section-title">Teams shipping smarter</h2>
          </div>
          <div className="testimonial-carousel fade-up">
            <div
              className="testimonial-track"
              style={{
                transform: `translateX(-${activeTestimonial * 100}%)`,
              }}
            >
              {TESTIMONIALS.map((item) => (
                <article key={item.author} className="testimonial-card">
                  <p className="testimonial-stars">{item.stars}</p>
                  <p className="testimonial-quote">&ldquo;{item.quote}&rdquo;</p>
                  <div className="testimonial-author">
                    <p className="testimonial-name">{item.author}</p>
                    <p className="testimonial-role">{item.role}</p>
                  </div>
                </article>
              ))}
            </div>
            <div className="testimonial-controls">
              <button
                type="button"
                className="carousel-btn"
                onClick={() =>
                  setActiveTestimonial((prev) =>
                    prev === 0 ? TESTIMONIALS.length - 1 : prev - 1
                  )
                }
                aria-label="Previous testimonial"
              >
                ‹
              </button>
              <div className="carousel-dots">
                {TESTIMONIALS.map((item, idx) => (
                  <button
                    key={item.author}
                    type="button"
                    className={`carousel-dot ${activeTestimonial === idx ? "active" : ""}`}
                    onClick={() => setActiveTestimonial(idx)}
                    aria-label={`Go to testimonial ${idx + 1}`}
                  />
                ))}
              </div>
              <button
                type="button"
                className="carousel-btn"
                onClick={() =>
                  setActiveTestimonial((prev) => (prev + 1) % TESTIMONIALS.length)
                }
                aria-label="Next testimonial"
              >
                ›
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="cta-section">
        <div className="container">
          <div className="cta-box">
            <p className="section-eyebrow section-center">Ready to launch</p>
            <h2 className="section-title cta-title">
              Ship your first try-on <em>this week</em>
            </h2>
            <p className="cta-sub">
              Start with free credits. Buy more only when you need them.
            </p>
            <div className="hero-actions">
              <a href="/studio" className="btn btn-primary btn-lg">
                Open studio
              </a>
              <a href="/pricing" className="btn btn-outline btn-lg">
                View pricing
              </a>
            </div>
          </div>
        </div>
      </section>

      <style jsx>{`
        * {
          box-sizing: border-box;
        }
        .landing-page {
          --bg: #07070f;
          --bg-1: #0d0d1c;
          --bg-2: #12121f;
          --bg-3: #1a1a2e;
          --text-primary: #f2ede4;
          --text-secondary: #8b8ba0;
          --text-muted: #555570;
          --accent: #1bcea8;
          --accent-dim: rgba(27, 206, 168, 0.12);
          --accent-glow: rgba(27, 206, 168, 0.25);
          --amber: #f0b429;
          --border: rgba(255, 255, 255, 0.07);
          --border-accent: rgba(27, 206, 168, 0.25);
          --font-display: var(--font-geist-sans), system-ui, sans-serif;
          --font-body: var(--font-geist-sans), system-ui, sans-serif;
          background: var(--bg);
          color: var(--text-primary);
          font-family: var(--font-body);
          overflow-x: hidden;
        }
        h1,
        h2,
        h3 {
          font-family: var(--font-display);
          letter-spacing: -0.02em;
        }
        .container {
          max-width: 1120px;
          margin: 0 auto;
          padding: 0 24px;
        }
        .btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 10px 22px;
          border-radius: 999px;
          font-size: 14px;
          font-weight: 600;
          text-decoration: none;
          border: none;
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-primary {
          background: var(--accent);
          color: #07070f;
        }
        .btn-outline {
          border: 1px solid var(--border);
          color: var(--text-primary);
          background: transparent;
        }
        .btn-lg {
          padding: 14px 32px;
          font-size: 15px;
        }
        .hero {
          padding: 96px 0 80px;
          text-align: center;
          position: relative;
          overflow: hidden;
        }
        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 6px 14px;
          border-radius: 999px;
          border: 1px solid var(--border-accent);
          background: var(--accent-dim);
          color: var(--accent);
          margin-bottom: 28px;
          font-size: 13px;
          font-weight: 600;
        }
        .hero-badge-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--accent);
        }
        .hero-title {
          font-size: clamp(42px, 6vw, 80px);
          line-height: 1.08;
          max-width: 900px;
          margin: 0 auto 24px;
        }
        .hero-title em {
          font-style: normal;
          color: var(--accent);
        }
        .hero-sub {
          max-width: 560px;
          margin: 0 auto 40px;
          color: var(--text-secondary);
          font-size: 17px;
        }
        .hero-actions {
          display: flex;
          gap: 12px;
          justify-content: center;
          flex-wrap: wrap;
        }
        .video-section {
          padding: 0 0 100px;
        }
        .video-label {
          text-align: center;
          margin-bottom: 24px;
          color: var(--text-muted);
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }
        .video-placeholder {
          border: 1px solid var(--border);
          border-radius: 28px;
          overflow: hidden;
          background: var(--bg-1);
          aspect-ratio: 16 / 9;
          position: relative;
          display: grid;
          place-items: center;
        }
        .video-placeholder-pattern {
          position: absolute;
          inset: 0;
          background:
            radial-gradient(
              ellipse 80% 60% at 50% 100%,
              rgba(27, 206, 168, 0.12),
              transparent 70%
            ),
            linear-gradient(180deg, var(--bg-2) 0%, var(--bg-1) 100%);
        }
        .video-placeholder-pattern::after {
          content: "";
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(var(--border) 1px, transparent 1px),
            linear-gradient(90deg, var(--border) 1px, transparent 1px);
          background-size: 48px 48px;
          opacity: 0.35;
          mask-image: radial-gradient(ellipse at center, black 20%, transparent 75%);
        }
        .video-placeholder-inner {
          position: relative;
          z-index: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
          text-align: center;
          padding: 24px;
        }
        .video-placeholder-play {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: rgba(27, 206, 168, 0.15);
          border: 1px solid var(--border-accent);
          display: grid;
          place-items: center;
          color: var(--accent);
          box-shadow: 0 0 0 20px rgba(27, 206, 168, 0.06);
        }
        .video-placeholder-play svg {
          margin-left: 4px;
        }
        .video-placeholder-title {
          font-size: 16px;
          font-weight: 600;
          max-width: 320px;
          color: var(--text-secondary);
        }
        .video-placeholder-badge {
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          padding: 6px 14px;
          border-radius: 999px;
          border: 1px solid var(--border);
          background: rgba(7, 7, 15, 0.6);
          color: var(--text-muted);
        }
        .video-placeholder-duration {
          position: absolute;
          right: 20px;
          bottom: 20px;
          z-index: 1;
          font-size: 12px;
          font-weight: 700;
          padding: 4px 10px;
          border-radius: 8px;
          background: rgba(7, 7, 15, 0.75);
          border: 1px solid var(--border);
          color: var(--text-muted);
        }
        section {
          padding: 100px 0;
        }
        .section-eyebrow {
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          color: var(--accent);
          margin-bottom: 14px;
        }
        .section-title {
          font-size: clamp(30px, 4vw, 50px);
          line-height: 1.1;
          margin-bottom: 18px;
        }
        .section-sub {
          max-width: 520px;
          color: var(--text-secondary);
          font-size: 16px;
        }
        .section-sub-space {
          margin-bottom: 48px;
        }
        .section-center {
          text-align: center;
        }
        .features-bg,
        .pricing-bg {
          background: var(--bg-1);
          border-top: 1px solid var(--border);
          border-bottom: 1px solid var(--border);
        }
        .testimonials-bg {
          background: var(--bg-1);
          border-top: 1px solid var(--border);
          border-bottom: 1px solid var(--border);
        }
        .features-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1px;
          background: var(--border);
          border: 1px solid var(--border);
          border-radius: 24px;
          overflow: hidden;
        }
        .feature-card {
          padding: 30px 26px;
          background: var(--bg-1);
        }
        .feature-title {
          font-size: 17px;
          margin-bottom: 8px;
          font-weight: 700;
        }
        .feature-desc {
          color: var(--text-secondary);
          font-size: 14px;
          line-height: 1.7;
        }
        .how-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 70px;
          align-items: center;
        }
        .steps {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .step {
          display: flex;
          gap: 16px;
          padding: 22px;
          border-radius: 16px;
          border: 1px solid transparent;
          cursor: pointer;
        }
        .step.active {
          border-color: var(--border-accent);
          background: var(--bg-2);
        }
        .step-num {
          width: 34px;
          height: 34px;
          border-radius: 50%;
          display: grid;
          place-items: center;
          border: 1px solid var(--border);
          color: var(--text-muted);
          background: var(--bg-3);
        }
        .step-content h3 {
          font-size: 15px;
          margin-bottom: 6px;
        }
        .step-content p {
          color: var(--text-secondary);
          font-size: 14px;
        }
        .how-visual {
          border: 1px solid var(--border);
          border-radius: 24px;
          background: var(--bg-1);
          padding: 28px;
          min-height: 380px;
        }
        .step-panel {
          display: flex;
          flex-direction: column;
          gap: 18px;
          animation: step-fade 0.35s ease;
        }
        @keyframes step-fade {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .step-panel-label {
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: var(--accent);
        }
        .upload-slots {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }
        .upload-slot {
          border: 2px dashed var(--border);
          border-radius: 16px;
          padding: 20px 14px;
          background: var(--bg-2);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          text-align: center;
        }
        .upload-slot-accent {
          border-color: var(--border-accent);
          background: rgba(27, 206, 168, 0.04);
        }
        .upload-slot-icon {
          width: 40px;
          height: 40px;
          border-radius: 12px;
          border: 1px solid var(--border);
          background: var(--bg-3);
        }
        .upload-slot-icon-person {
          background: linear-gradient(
            180deg,
            rgba(255, 255, 255, 0.08) 0%,
            transparent 45%
          );
        }
        .upload-slot-icon-fabric {
          background: linear-gradient(
            135deg,
            #c45c3e 0%,
            #e8a87c 50%,
            #6b8cce 100%
          );
          border-color: var(--border-accent);
        }
        .upload-slot-name {
          font-size: 13px;
          font-weight: 700;
        }
        .upload-slot-hint {
          font-size: 11px;
          color: var(--text-muted);
        }
        .upload-drop-hint {
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 14px;
          text-align: center;
          font-size: 13px;
          color: var(--text-secondary);
          background: var(--bg-2);
        }
        .upload-drop-plus {
          display: inline-block;
          margin-right: 6px;
          color: var(--accent);
          font-weight: 700;
        }
        .picker-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
        }
        .picker-chip {
          padding: 12px 8px;
          border-radius: 12px;
          border: 1px solid var(--border);
          background: var(--bg-2);
          color: var(--text-secondary);
          font-size: 12px;
          font-weight: 600;
          cursor: default;
        }
        .picker-chip.selected {
          border-color: var(--border-accent);
          background: var(--accent-dim);
          color: var(--accent);
        }
        .picker-preview {
          display: flex;
          gap: 14px;
          align-items: center;
          padding: 16px;
          border-radius: 14px;
          border: 1px solid var(--border);
          background: var(--bg-2);
        }
        .picker-preview-swatch {
          width: 56px;
          height: 56px;
          border-radius: 12px;
          flex-shrink: 0;
          background: linear-gradient(
            135deg,
            #c45c3e 0%,
            #e8a87c 40%,
            #6b8cce 100%
          );
          border: 1px solid var(--border);
        }
        .picker-preview-title {
          font-size: 14px;
          font-weight: 700;
          margin-bottom: 4px;
        }
        .picker-preview-sub {
          font-size: 12px;
          color: var(--text-muted);
        }
        .result-preview {
          border-radius: 16px;
          overflow: hidden;
          border: 1px solid var(--border);
        }
        .result-preview-image {
          aspect-ratio: 4 / 5;
          max-height: 200px;
          background: linear-gradient(
            160deg,
            var(--bg-3) 0%,
            rgba(27, 206, 168, 0.15) 50%,
            var(--bg-2) 100%
          );
          position: relative;
          display: grid;
          place-items: end;
          padding: 14px;
        }
        .result-preview-badge {
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          padding: 4px 10px;
          border-radius: 999px;
          background: rgba(7, 7, 15, 0.7);
          border: 1px solid var(--border-accent);
          color: var(--accent);
        }
        .result-file {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px 16px;
          border-radius: 14px;
          border: 1px solid var(--border-accent);
          background: var(--bg-2);
        }
        .result-file-icon {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: var(--accent-dim);
          color: var(--accent);
          display: grid;
          place-items: center;
          font-size: 14px;
          font-weight: 700;
          flex-shrink: 0;
        }
        .result-file-name {
          font-size: 13px;
          font-weight: 700;
        }
        .result-file-sub {
          font-size: 12px;
          color: var(--text-muted);
        }
        .result-file-meta {
          flex: 1;
          min-width: 0;
        }
        .result-download-btn {
          font-size: 12px;
          font-weight: 700;
          padding: 8px 14px;
          border-radius: 10px;
          background: var(--accent);
          color: #07070f;
          flex-shrink: 0;
        }
        .pricing-toggle {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 14px;
          margin-bottom: 52px;
        }
        .toggle-label {
          color: var(--text-secondary);
          font-size: 14px;
          font-weight: 600;
        }
        .toggle-label.active {
          color: var(--text-primary);
        }
        .toggle-switch {
          width: 48px;
          height: 26px;
          border-radius: 999px;
          border: 1px solid var(--border);
          background: var(--bg-3);
          position: relative;
        }
        .toggle-switch.on {
          background: var(--accent);
          border-color: var(--accent);
        }
        .toggle-knob {
          position: absolute;
          top: 3px;
          left: 3px;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: var(--text-primary);
          transition: transform 0.2s;
        }
        .toggle-switch.on .toggle-knob {
          transform: translateX(22px);
        }
        .save-badge {
          color: var(--amber);
          border: 1px solid rgba(240, 180, 41, 0.3);
          background: rgba(240, 180, 41, 0.15);
          font-size: 11px;
          font-weight: 700;
          padding: 3px 10px;
          border-radius: 999px;
        }
        .pricing-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
        }
        .plan-card {
          border: 1px solid var(--border);
          background: var(--bg-2);
          border-radius: 30px;
          padding: 28px 24px;
        }
        .plan-card.featured {
          border-color: var(--border-accent);
          box-shadow: 0 0 0 1px var(--border-accent);
        }
        .plan-name {
          font-size: 16px;
          font-weight: 700;
        }
        .plan-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 10px;
        }
        .plan-badge {
          font-size: 11px;
          color: var(--accent);
          border: 1px solid var(--border-accent);
          background: var(--accent-dim);
          border-radius: 999px;
          padding: 3px 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }
        .price-amount {
          font-size: 48px;
          line-height: 1;
        }
        .price-period {
          color: var(--text-muted);
          font-size: 13px;
          margin-top: 4px;
          margin-bottom: 20px;
        }
        .plan-credits {
          color: var(--text-primary);
          background: var(--bg-3);
          border: 1px solid var(--border);
          border-radius: 12px;
          font-size: 13px;
          font-weight: 600;
          padding: 10px 12px;
          margin-bottom: 12px;
        }
        .plan-blurb {
          color: var(--text-secondary);
          font-size: 13px;
          line-height: 1.6;
          margin-bottom: 14px;
        }
        .plan-features-list {
          margin: 0 0 18px;
          padding: 0;
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .plan-features-list li {
          color: var(--text-secondary);
          font-size: 13px;
          line-height: 1.5;
          display: flex;
          align-items: flex-start;
          gap: 8px;
        }
        .plan-features-list li::before {
          content: "✓";
          color: var(--accent);
          font-weight: 700;
          margin-top: -1px;
        }
        .full {
          width: 100%;
          justify-content: center;
        }
        .fade-up {
          opacity: 0;
          transform: translateY(30px);
          transition: opacity 0.6s ease, transform 0.6s ease;
        }
        .fade-up.visible {
          opacity: 1;
          transform: translateY(0);
        }
        .testimonial-carousel {
          max-width: 860px;
          margin: 0 auto;
          overflow: hidden;
        }
        .testimonial-track {
          display: flex;
          transition: transform 0.45s ease;
          will-change: transform;
        }
        .testimonial-card {
          min-width: 100%;
          background: var(--bg-2);
          border: 1px solid var(--border);
          border-radius: 24px;
          padding: 30px;
        }
        .testimonial-stars {
          color: var(--amber);
          letter-spacing: 2px;
          margin-bottom: 14px;
          font-size: 14px;
        }
        .testimonial-quote {
          color: var(--text-secondary);
          font-size: 17px;
          line-height: 1.7;
          margin-bottom: 18px;
        }
        .testimonial-author {
          border-top: 1px solid var(--border);
          padding-top: 14px;
        }
        .testimonial-name {
          color: var(--text-primary);
          font-size: 15px;
          font-weight: 700;
        }
        .testimonial-role {
          color: var(--text-muted);
          font-size: 13px;
          margin-top: 2px;
        }
        .testimonial-controls {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 14px;
          margin-top: 18px;
        }
        .carousel-btn {
          width: 34px;
          height: 34px;
          border-radius: 999px;
          border: 1px solid var(--border);
          background: var(--bg-2);
          color: var(--text-primary);
          font-size: 20px;
          line-height: 1;
          cursor: pointer;
        }
        .carousel-dots {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .carousel-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          border: 0;
          background: var(--text-muted);
          cursor: pointer;
          padding: 0;
        }
        .carousel-dot.active {
          background: var(--accent);
        }
        .cta-section {
          padding: 100px 0;
          text-align: center;
        }
        .cta-box {
          background: var(--bg-1);
          border: 1px solid var(--border);
          border-radius: 30px;
          padding: 64px 32px;
        }
        .cta-title em {
          color: var(--accent);
          font-style: normal;
        }
        .cta-sub {
          color: var(--text-secondary);
          max-width: 520px;
          margin: 0 auto 30px;
        }
        @media (max-width: 900px) {
          .features-grid,
          .pricing-grid,
          .how-grid {
            grid-template-columns: 1fr;
          }
          .hero {
            padding: 72px 0 60px;
          }
          .upload-slots {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
