export default function Footer() {
  return (
    <footer className="bg-[#0D0D0D] font-inter text-white">
      {/* Footer Top: Grid and Main Content */}
      <div className="border-t-[3px] border-[#F7C948] px-10 py-12">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr]">
          
          {/* Brand Column */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <img
            src="/images/Logo 2.svg"
            alt="Golden Gatherings Logo"
            className="h-11 w-11 object-contain sm:h-8 sm:w-8"
          />
              <div>
                <div className="font-playfair text-sm font-bold leading-tight">Golden Gatherings</div>
                <div className="mt-0.5 text-[8px] uppercase tracking-[2.5px] text-[#F7C948]">Official Events Page of UST</div>
              </div>
            </div>

            {/* <div className="flex items-center gap-2 border border-[#222] p-3">
              <div className="flex flex-col gap-[3px]">
                <div className="h-[2.5px] w-[22px] bg-[#F7C948]"></div>
                <div className="h-[2.5px] w-[16px] bg-[#F7C948]"></div>
                <div className="h-[2.5px] w-[10px] bg-[#F7C948]"></div>
              </div>
              <div>
                <div className="font-playfair text-[15px] font-black tracking-wider text-[#F7C948]">Golden Gatherings</div>
                <div className="mt-0.5 text-[8px] font-semibold uppercase tracking-[3px] text-[#888]">UST Events Portal</div>
              </div>
            </div> */}

            <p className="max-w-[240px] text-xs leading-relaxed text-[#888]">
              Your official gateway to every academic forum, cultural night, sporting event, and celebration happening across the Royal Pontifical University.
            </p>

            <div className="flex gap-2">
              {/* Social Buttons */}
              {/* <a href="#" className="group flex h-[30px] w-[30px] items-center justify-center border border-[#2a2a2a] transition-colors hover:border-[#F7C948]">
                <svg className="h-[13px] w-[13px] fill-none stroke-[#888] stroke-[1.5] transition-colors group-hover:stroke-[#F7C948]" viewBox="0 0 16 16">
                  <path d="M10 3H8C7.4 3 7 3.4 7 4v2H5v2h2v5h2V8h2l.5-2H9V4.5c0-.3.2-.5.5-.5H11V3z"/>
                </svg>
              </a>
              <a href="#" className="group flex h-[30px] w-[30px] items-center justify-center border border-[#2a2a2a] transition-colors hover:border-[#F7C948]">
                <svg className="h-[13px] w-[13px] fill-none stroke-[#888] stroke-[1.5] transition-colors group-hover:stroke-[#F7C948]" viewBox="0 0 16 16">
                  <path d="M2 2l5 6-5 6h1.5l4.25-5 4.25 5H14L9 8l5-6h-1.5L8.5 7 4.5 2z"/>
                </svg>
              </a>
              <a href="#" className="group flex h-[30px] w-[30px] items-center justify-center border border-[#2a2a2a] transition-colors hover:border-[#F7C948]">
                <svg className="h-[13px] w-[13px] fill-none stroke-[#888] stroke-[1.5] transition-colors group-hover:stroke-[#F7C948]" viewBox="0 0 16 16">
                  <rect x="2" y="2" width="12" height="12" rx="3"/><circle cx="8" cy="8" r="3"/><circle cx="11.5" cy="4.5" r="0.75" fill="currentColor"/>
                </svg>
              </a> */}
            </div>
          </div>

          {/* Links Columns */}
          <div>
            <div className="mb-4 border-b border-[#1e1e1e] pb-2 text-[9px] font-bold uppercase tracking-[3px] text-[#F7C948]">Navigate</div>
            <div className="flex flex-col text-[#888]">
              <a href="#" className="group flex items-center justify-between border-b border-[#161616] py-2 text-xs transition-colors hover:text-[#F7C948]">
                Home <span className="text-[10px] text-[#333] transition-colors group-hover:text-[#F7C948]">›</span>
              </a>
              <a href="#" className="group flex items-center justify-between border-b border-[#161616] py-2 text-xs transition-colors hover:text-[#F7C948]">
                Events <span className="text-[10px] text-[#333] transition-colors group-hover:text-[#F7C948]">›</span>
              </a>
              <a href="#" className="group flex items-center justify-between border-b border-[#161616] py-2 text-xs transition-colors hover:text-[#F7C948]">
                Announcements <span className="text-[10px] text-[#333] transition-colors group-hover:text-[#F7C948]">›</span>
              </a>
              <a href="#" className="group flex items-center justify-between border-b border-[#161616] py-2 text-xs transition-colors hover:text-[#F7C948]">
                About <span className="text-[10px] text-[#333] transition-colors group-hover:text-[#F7C948]">›</span>
              </a>
            </div>
          </div>

          <div>
            <div className="mb-4 border-b border-[#1e1e1e] pb-2 text-[9px] font-bold uppercase tracking-[3px] text-[#F7C948]">Colleges</div>
            <div className="flex flex-col text-[#888]">
              <a href="#" className="group flex items-center justify-between border-b border-[#161616] py-2 text-xs transition-colors hover:text-[#F7C948]">
                Engineering <span className="text-[10px] text-[#333] transition-colors group-hover:text-[#F7C948]">›</span>
              </a>
              <a href="#" className="group flex items-center justify-between border-b border-[#161616] py-2 text-xs transition-colors hover:text-[#F7C948]">
                Nursing <span className="text-[10px] text-[#333] transition-colors group-hover:text-[#F7C948]">›</span>
              </a>
            </div>
          </div>

          {/* Quick Links & Newsletter */}
          <div className="space-y-4">
            <div>
              <div className="mb-4 border-b border-[#1e1e1e] pb-2 text-[9px] font-bold uppercase tracking-[3px] text-[#F7C948]">Quick Links</div>
              <div className="flex flex-col text-[#888]">
                <a href="#" className="group flex items-center justify-between border-b border-[#161616] py-2 text-xs transition-colors hover:text-[#F7C948]">
                  Academic Calendar <span className="text-[10px] text-[#333] transition-colors group-hover:text-[#F7C948]">›</span>
                </a>
                <a href="https://myusteportal.ust.edu.ph/" className="group flex items-center justify-between border-b border-[#161616] py-2 text-xs transition-colors hover:text-[#F7C948]">
                  MyUSTe Portal <span className="text-[10px] text-[#333] transition-colors group-hover:text-[#F7C948]">›</span>
                </a>
              </div>
            </div>

            <div className="bg-[#111] p-[14px]">
              <div className="mb-1 text-[8px] font-bold uppercase tracking-[2px] text-[#F7C948]">Stay in the loop</div>
              <div className="mb-2.5 text-[11px] text-[#888]">Get event alerts straight to your UST inbox.</div>
              <form className="flex">
                <input type="email" placeholder="yourname@ust.edu.ph" className="min-w-0 flex-1 border border-r-0 border-[#2a2a2a] bg-[#1a1a1a] px-2.5 py-[7px] text-[11px] outline-none focus:border-[#F7C948]" />
                <button type="button" className="bg-[#F7C948] px-3 py-[7px] text-[11px] font-bold text-[#0D0D0D] transition-colors hover:bg-[#e0aa00]">Subscribe</button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Mid: Stats and Badges */}
      <div className="border-t border-[#1a1a1a] px-10 py-6">
        <div className="flex flex-col items-center justify-between gap-8 lg:flex-row">
          <div className="flex flex-wrap gap-8">
            <div className="flex items-center gap-8">
              <div className="text-center md:text-left">
                <div className="font-playfair text-lg font-bold text-[#F7C948]">412</div>
                <div className="text-[9px] text-[#555]">Years of Excellence</div>
              </div>
              <div className="hidden h-8 w-px bg-[#1e1e1e] md:block"></div>
              <div className="text-center md:text-left">
                <div className="font-playfair text-lg font-bold text-[#F7C948]">45K+</div>
                <div className="text-[9px] text-[#555]">Thomasians</div>
              </div>
            </div>
          </div>
          <div className="font-playfair text-[13px] italic tracking-wide text-[#444]">Veritas in Caritate</div>
          <div className="flex gap-1.5">
            <span className="border border-[#222] bg-[#111] px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[1.5px] text-[#555]">ISO Certified</span>
            <span className="border border-[#222] bg-[#111] px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[1.5px] text-[#555]">CHED Recognized</span>
          </div>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="flex flex-col items-center justify-between border-t border-[#161616] px-10 py-4 lg:flex-row">
        <div className="flex flex-wrap items-center justify-center gap-5">
          <div className="text-[11px] text-[#444]">© 2026 <span className="text-[#F7C948]">Golden Gatherings</span> · University of Santo Tomas</div>
          <div className="flex gap-[18px]">
            <a href="#" className="text-[11px] text-[#444] hover:text-[#F7C948]">Privacy Policy</a>
            <a href="#" className="text-[11px] text-[#444] hover:text-[#F7C948]">Terms of Use</a>
          </div>
        </div>
        <div className="mt-4 flex items-center gap-2.5 lg:mt-0">
          <div className="text-[11px] text-[#333]">Powered by the Office of Student Affairs & Missions</div>
          <button onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})} className="flex items-center gap-1.5 border border-[#222] bg-[#1a1a1a] px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#888] transition-colors hover:border-[#F7C948] hover:text-[#F7C948]">
            <svg className="h-[11px] w-[11px] fill-none stroke-current stroke-2" viewBox="0 0 12 12"><polyline points="2 8 6 4 10 8"/></svg>
            Top
          </button>
        </div>
      </div>
    </footer>
  );
}