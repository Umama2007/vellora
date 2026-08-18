import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Logo from "../components/Logo";

/* Official Instagram Brand Logo */
function InstagramIcon({ size = 26, className = "" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <defs>
        <linearGradient id="igGradient" x1="2" y1="22" x2="22" y2="2">
          <stop offset="0%" stopColor="#FA7E1E" />
          <stop offset="25%" stopColor="#D62976" />
          <stop offset="50%" stopColor="#962FBF" />
          <stop offset="75%" stopColor="#4F5BD5" />
        </linearGradient>
      </defs>
      <rect width="22" height="22" x="1" y="1" rx="6" ry="6" fill="url(#igGradient)" />
      <rect width="14" height="14" x="5" y="5" rx="3.5" ry="3.5" stroke="#FFFFFF" strokeWidth="1.8" fill="none" />
      <circle cx="12" cy="12" r="3" stroke="#FFFFFF" strokeWidth="1.8" fill="none" />
      <circle cx="16.5" cy="7.5" r="0.9" fill="#FFFFFF" />
    </svg>
  );
}

/* Official LinkedIn Brand Logo */
function LinkedinIcon({ size = 26, className = "" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <rect width="22" height="22" x="1" y="1" rx="4" fill="#0A66C2" />
      <path
        d="M5.5 8.5H8.5V18.5H5.5V8.5ZM7 4.8C6.1 4.8 5.3 5.5 5.3 6.4C5.3 7.3 6.1 8 7 8C7.9 8 8.7 7.3 8.7 6.4C8.7 5.5 7.9 4.8 7 4.8ZM10.5 8.5H13.4V9.8H13.5C13.9 9.1 14.9 8.3 16.5 8.3C19.8 8.3 20.4 10.4 20.4 13.2V18.5H17.4V13.7C17.4 12.5 17.4 11 15.7 11C14 11 13.7 12.3 13.7 13.6V18.5H10.7L10.5 8.5Z"
        fill="#FFFFFF"
      />
    </svg>
  );
}

/* Official Email / Gmail Brand Logo */
function EmailIcon({ size = 26, className = "" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <rect width="22" height="22" x="1" y="1" rx="5" fill="#EA4335" />
      <path d="M4 7L12 12.5L20 7" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <rect width="16" height="12" x="4" y="6" rx="2" stroke="#FFFFFF" strokeWidth="1.8" fill="none" />
    </svg>
  );
}

export default function About() {
  return (
    <div className="min-h-screen bg-[#FAF6F3] text-ink relative overflow-hidden flex flex-col justify-between selection:bg-purple-200">
      {/* Subtle Ambient Glowing Elements */}
      <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] rounded-full bg-gradient-to-br from-purple-200/40 via-plum-100/30 to-transparent blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[600px] h-[600px] rounded-full bg-gradient-to-tl from-purple-200/50 via-lavender/30 to-transparent blur-[140px] pointer-events-none" />

      {/* Decorative Top-Right Lavender Stems SVG */}
      <div className="absolute top-0 right-0 w-72 sm:w-96 h-96 pointer-events-none opacity-40 select-none z-0">
        <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full text-plum-300">
          <circle cx="160" cy="50" r="80" fill="currentColor" fillOpacity="0.15" />
          <path d="M140 160 Q 150 90 180 30" stroke="#8E528D" strokeWidth="2" strokeLinecap="round" />
          <path d="M120 170 Q 140 100 165 50" stroke="#A776A6" strokeWidth="1.5" strokeLinecap="round" />
          {/* Lavender flower buds */}
          <ellipse cx="178" cy="34" rx="4" ry="7" fill="#6B386A" transform="rotate(-15 178 34)" />
          <ellipse cx="173" cy="45" rx="5" ry="8" fill="#8E528D" transform="rotate(20 173 45)" />
          <ellipse cx="166" cy="58" rx="4.5" ry="7" fill="#6B386A" transform="rotate(-10 166 58)" />
          <ellipse cx="160" cy="72" rx="5" ry="8" fill="#A776A6" transform="rotate(15 160 72)" />
          <ellipse cx="154" cy="88" rx="4" ry="7" fill="#8E528D" transform="rotate(-20 154 88)" />
        </svg>
      </div>

      {/* Main Container */}
      <div className="relative z-10 max-w-5xl mx-auto w-full px-6 sm:px-10 py-6 flex-1 flex flex-col justify-between">
        {/* 1. TOP HEADER */}
        <header className="flex items-center justify-between py-6">
          <Logo size="lg" />
          <Link
            to="/"
            className="flex items-center gap-2 text-xs sm:text-sm font-medium text-plum-500/80 hover:text-plum transition-colors group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            Back to Home
          </Link>
        </header>

        {/* MAIN CONTENT AREA */}
        <main className="my-auto py-8 sm:py-12 space-y-12 sm:space-y-16">
          {/* 2. HERO SECTION */}
          <section className="text-center relative max-w-2xl mx-auto pt-4 pb-2">
            {/* Small pill / badge */}
            <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-purple-100/70 border border-purple-200/60 text-plum-600 text-[11px] sm:text-xs font-semibold tracking-wider uppercase mb-5 shadow-xs">
              ABOUT VELLORA
            </div>

            {/* Main Heading */}
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-ink leading-[1.15]">
              A space for <br />
              <span className="font-serif italic font-normal text-plum-500 border-b-2 border-plum-200/60 pb-1">
                real stories
              </span>
            </h1>

            {/* Subtitle */}
            <p className="font-serif italic text-lg sm:text-xl text-ink-muted mt-4 sm:mt-5 tracking-wide">
              written by you, loved by many.
            </p>

            {/* Subtle decorative curved accent line */}
            <div className="mt-6 flex justify-center">
              <svg width="120" height="12" viewBox="0 0 120 12" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-plum-300/80">
                <path d="M2 9C25 2 45 11 65 5C85 -1 102 10 118 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
          </section>

          {/* 3. THE VELLORA STORY */}
          <section className="bg-white/80 backdrop-blur-md rounded-3xl p-7 sm:p-12 shadow-pop border border-purple-100/70 relative overflow-hidden transition-all duration-300 hover:shadow-lg">
            <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              {/* Left Column: Story Text */}
              <div className="lg:col-span-7 space-y-5">
                <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-semibold text-ink leading-snug">
                  The story behind <br />
                  <span className="text-plum-500 font-serif italic font-normal">Vellora</span>
                </h2>

                <div className="space-y-4 text-sm sm:text-base text-ink-muted leading-relaxed font-normal pt-2">
                  <p className="text-ink font-medium text-base sm:text-lg leading-relaxed">
                    Vellora was born from a simple thought:{" "}
                    <span className="text-plum-600 font-semibold">the internet is loud</span>, but{" "}
                    <span className="text-plum-600 font-semibold">good stories deserve a softer place to land</span>.
                  </p>

                  <p>
                    We wanted a space that feels calm, creative, and completely yours.
                  </p>

                  <ul className="space-y-2.5 pt-1 text-ink/80 font-medium">
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-plum-400 shrink-0" />
                      No algorithms chasing you.
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-plum-400 shrink-0" />
                      No pressure to be perfect.
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-plum-400 shrink-0" />
                      Just you, your words, and a community that gets it.
                    </li>
                  </ul>

                  <p className="pt-3 font-serif italic text-plum-600 text-base sm:text-lg">
                    This is Vellora — where stories feel like home.
                  </p>
                </div>
              </div>

              {/* Right Column: Editorial Arch Image Card */}
              <div className="lg:col-span-5 flex justify-center">
                <div className="relative w-full max-w-xs sm:max-w-sm">
                  {/* Arched image container */}
                  <div className="w-full aspect-[4/5] rounded-t-[120px] rounded-b-[28px] overflow-hidden shadow-pop border-4 border-white/90 relative group">
                    <img
                      src="/about-cozy-workspace.jpg"
                      alt="Umama Ume Amen"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-plum-900/20 via-transparent to-transparent pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 4. CONNECT WITH VELLORA */}
          <section className="bg-white/80 backdrop-blur-md rounded-3xl p-7 sm:p-10 shadow-pop border border-purple-100/70 space-y-8">
            <div className="text-center max-w-md mx-auto space-y-1.5">
              <h2 className="font-display text-2xl sm:text-3xl font-semibold text-ink justify-center">
                Let’s connect!
              </h2>
              <p className="text-sm text-ink-muted font-normal">
                We’re just a message away.
              </p>
            </div>

            {/* Three Social Cards with Real Official Brand Logos */}
            <div className="grid md:grid-cols-3 gap-6">
              {/* Card 1: Instagram */}
              <div className="rounded-2xl bg-[#FAF6F3] border border-purple-100/80 p-6 text-center space-y-4 hover:border-plum-300 hover:bg-white transition-all duration-300 shadow-xs group">
                <div className="w-12 h-12 rounded-full bg-white shadow-xs flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                  <InstagramIcon size={28} />
                </div>
                <div>
                  <h3 className="font-display font-semibold text-ink text-base">Instagram</h3>
                  <p className="text-xs text-ink-muted mt-0.5">@byteum.dev_</p>
                </div>
                <a
                  href="https://www.instagram.com/byteum.dev_?igsh=dTZ6ZnhvbWI0dnZs"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-white border border-purple-200/80 text-xs font-semibold text-plum-600 hover:bg-plum hover:text-white transition-all shadow-xs"
                >
                  Follow Us →
                </a>
              </div>

              {/* Card 2: LinkedIn */}
              <div className="rounded-2xl bg-[#FAF6F3] border border-purple-100/80 p-6 text-center space-y-4 hover:border-plum-300 hover:bg-white transition-all duration-300 shadow-xs group">
                <div className="w-12 h-12 rounded-full bg-white shadow-xs flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                  <LinkedinIcon size={28} />
                </div>
                <div>
                  <h3 className="font-display font-semibold text-ink text-base">LinkedIn</h3>
                  <p className="text-xs text-ink-muted mt-0.5">Umama Ume Amen</p>
                </div>
                <a
                  href="https://www.linkedin.com/in/umama-ume-amen-6916ab374?utm_source=share_via&utm_content=profile&utm_medium=member_android"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-white border border-purple-200/80 text-xs font-semibold text-plum-600 hover:bg-plum hover:text-white transition-all shadow-xs"
                >
                  Connect →
                </a>
              </div>

              {/* Card 3: Email */}
              <div className="rounded-2xl bg-[#FAF6F3] border border-purple-100/80 p-6 text-center space-y-4 hover:border-plum-300 hover:bg-white transition-all duration-300 shadow-xs group">
                <div className="w-12 h-12 rounded-full bg-white shadow-xs flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                  <EmailIcon size={28} />
                </div>
                <div>
                  <h3 className="font-display font-semibold text-ink text-base">Email</h3>
                  <p className="text-xs text-ink-muted mt-0.5">byteum.dev@gmail.com</p>
                </div>
                <a
                  href="mailto:byteum.dev@gmail.com"
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-white border border-purple-200/80 text-xs font-semibold text-plum-600 hover:bg-plum hover:text-white transition-all shadow-xs"
                >
                  Send a Mail →
                </a>
              </div>
            </div>
          </section>
        </main>

        {/* FOOTER */}
        <footer className="py-6 text-center text-xs text-ink-faint border-t border-purple-200/40">
          © {new Date().getFullYear()} Vellora. All rights reserved.
        </footer>
      </div>
    </div>
  );
}
