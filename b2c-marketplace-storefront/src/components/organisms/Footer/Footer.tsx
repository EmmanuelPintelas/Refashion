"use client";

import React from "react";
import { Roboto } from "next/font/google";

const roboto = Roboto({
  subsets: ["latin", "greek"],
  weight: ["400", "500", "700"],
});

const FOOTER_LINKS = [
  { text: "ΕΜΠ-ΕΕΕΕ", url: "https://orlog.simor.ntua.gr/" },
  { text: "Neotextile", url: "https://neotextile.eco/" },
  { text: "ΠΑ.ΠΕΛ", url: "http://disyd-lab.ece.uop.gr/" },
  { text: "CYCLEFI", url: "https://cyclefi.com/" },
  { text: "ΕΚΑΝ", url: "https://ekanrecycling.gr/" },
];

const QUICK_LINKS = [
  { text: "About Us", url: "/about_us" },
  { text: "Privacy Policy", url: "/privacy" },
  { text: "Terms of Service", url: "/terms" },
];

export function Footer() {
  return (
    <footer className={`${roboto.className} w-full relative overflow-hidden`}>
      {/* Top Footer Section */}
      <div
        className="w-full text-white relative z-10"
        style={{
          background: `
            linear-gradient(
              135deg,
              rgba(var(--brand-700), 0.95) 0%,
              rgba(var(--brand-600), 0.9) 50%,
              rgba(var(--brand-500), 0.85) 100%
            )
          `,
        }}
      >
        <div className="container mx-auto flex flex-col lg:flex-row items-center justify-between p-8 md:p-12 relative z-10">
          {/* Logo */}
          <div className="flex flex-col justify-center mb-6 lg:mb-0">
            <img
              src="/NextGen.png"
              alt="ReFashion Logo"
              className="max-w-xs lg:max-w-sm h-auto mx-auto lg:mx-0 object-contain"
            />
          </div>

          {/* Links Area */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 px-4 lg:px-0 text-center lg:text-left">
            {/* Partners */}
            <div>
              <h2
                className="text-xl font-semibold mb-4 uppercase text-white"
                style={{ textShadow: "0 1px 3px rgba(0,0,0,0.5)" }}
              >
                Εταιροι
              </h2>

              <nav className="flex flex-col space-y-3 text-sm lg:text-base">
                {FOOTER_LINKS.map((link) => (
                  <a
                    key={link.text}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[rgb(var(--neutral-0))] hover:text-[rgb(var(--brand-100))] transition-colors"
                  >
                    {link.text}
                  </a>
                ))}
              </nav>
            </div>

            {/* Quick Links */}
            <div>
              <h2
                className="text-xl font-semibold mb-4 uppercase text-white"
                style={{ textShadow: "0 1px 3px rgba(0,0,0,0.5)" }}
              >
                Quick Links
              </h2>

              <nav className="flex flex-col space-y-3 text-sm lg:text-base">
                {QUICK_LINKS.map((link) => (
                  <a
                    key={link.text}
                    href={link.url}
                    className="text-[rgb(var(--neutral-0))] hover:text-[rgb(var(--brand-100))] transition-colors"
                  >
                    {link.text}
                  </a>
                ))}
              </nav>
            </div>
          </div>
        </div>

        {/* Abstract Shapes */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-[rgba(var(--brand-500),0.15)] rounded-full mix-blend-overlay filter blur-3xl rotate-12 pointer-events-none"></div>
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-[rgba(var(--brand-600),0.12)] rounded-full mix-blend-overlay filter blur-3xl -rotate-6 pointer-events-none"></div>
        <div className="absolute bottom-0 right-1/3 w-72 h-72 bg-[rgba(var(--brand-700),0.18)] rounded-full mix-blend-overlay filter blur-3xl rotate-45 pointer-events-none"></div>
        <div className="absolute bottom-10 left-0 w-64 h-64 bg-[rgba(var(--brand-500),0.1)] rounded-full mix-blend-overlay filter blur-2xl -rotate-30 pointer-events-none"></div>
      </div>

      {/* Bottom Frosted Bar */}
      <div
        className="w-full border-t backdrop-blur-sm"
        style={{
          backgroundColor: "rgba(var(--neutral-0), 0.85)",
          color: "rgb(var(--neutral-900))",
          borderColor: "rgba(var(--neutral-300), 0.3)",
        }}
      >
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between py-2 px-4">
          <p className="text-sm text-center md:text-left flex-1 order-2 md:order-1 mt-2 md:mt-0">
            Η δράση υλοποιείται στο πλαίσιο του Εθνικού Σχεδίου Ανάκαμψης και
            Ανθεκτικότητας Ελλάδα 2.0 με τη χρηματοδότηση της Ευρωπαϊκής Ένωσης
            NextGenerationEU
          </p>

          <div className="flex justify-center space-x-4 order-1 md:order-2">
            <a
              href="https://x.com/refashion_eu"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="ReFashion Twitter"
              className="text-[rgb(var(--neutral-700))] hover:text-[rgb(var(--brand-600))] transition-colors"
            >
              <svg
                className="w-5 h-5"
                fill="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M18.901 1.127H23.951L15.892 9.456L24 22.882H17.844L12.448 15.656L6.502 22.882H1L9.438 14.128L1 1.127H6.162L10.596 7.427L17.514 1.127H18.901ZM18.571 20.375L19.988 20.375L7.545 3.321L6.071 3.321L18.571 20.375Z" />
              </svg>
            </a>

            <a
              href="https://www.linkedin.com/company/refashion-eu"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="ReFashion LinkedIn"
              className="text-[rgb(var(--neutral-700))] hover:text-[rgb(var(--brand-600))] transition-colors"
            >
              <svg
                className="w-5 h-5"
                fill="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm12 0h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}