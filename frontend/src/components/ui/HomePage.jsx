import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600;700;800&family=DM+Sans:wght@300;400;500;600;700&display=swap');

  .rp-root * { box-sizing: border-box; }

  .rp-root {
    background: #faf6f0 !important;
    color: #2c1810 !important;
    font-family: 'DM Sans', sans-serif !important;
    min-height: 100vh;
    overflow-x: hidden;
  }

  .rp-serif { font-family: 'Cormorant Garamond', serif !important; }

  @keyframes rp-fadeUp  { from { opacity:0; transform:translateY(22px); } to { opacity:1; transform:translateY(0); } }
  @keyframes rp-float   { 0%,100% { transform:translateY(0); } 50% { transform:translateY(-10px); } }
  @keyframes rp-shimmer { 0% { background-position:-200% center; } 100% { background-position:200% center; } }
  @keyframes rp-marquee { from { transform:translateX(0); } to { transform:translateX(-50%); } }
  @keyframes rp-spin    { from { transform:rotate(0deg); } to { transform:rotate(360deg); } }
  @keyframes rp-pulse   { 0%,100% { box-shadow:0 0 0 0 rgba(201,162,77,0.45); } 50% { box-shadow:0 0 0 10px rgba(201,162,77,0); } }
  @keyframes rp-glow    { 0%,100% { border-color:rgba(201,162,77,0.25); } 50% { border-color:rgba(201,162,77,0.65); } }

  .rp-fu  { animation: rp-fadeUp 0.65s ease forwards; }
  .rp-d1  { animation-delay:0.05s; opacity:0; }
  .rp-d2  { animation-delay:0.18s; opacity:0; }
  .rp-d3  { animation-delay:0.32s; opacity:0; }
  .rp-d4  { animation-delay:0.46s; opacity:0; }
  .rp-d5  { animation-delay:0.60s; opacity:0; }
  .rp-float { animation: rp-float 4.5s ease-in-out infinite; }
  .rp-spin  { animation: rp-spin 22s linear infinite; }

  .rp-shimmer-text {
    background: linear-gradient(90deg, #b8842a 0%, #e8b95a 35%, #C9A24D 55%, #a0701e 100%);
    background-size: 200% auto;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: rp-shimmer 3s linear infinite;
  }

  .rp-nav {
    position: fixed !important;
    top: 0; left: 0; right: 0;
    z-index: 9999 !important;
    height: 66px;
    background: rgba(250, 246, 240, 0.97) !important;
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border-bottom: 1px solid rgba(201,162,77,0.22) !important;
    display: flex !important;
    align-items: center !important;
  }
  .rp-nav-inner {
    max-width: 1180px; margin: 0 auto; padding: 0 28px;
    width: 100%; display: flex; align-items: center;
    justify-content: space-between; gap: 16px;
  }
  .rp-nav-link {
    color: #6b4c2a !important; text-decoration: none !important;
    font-size: 0.87rem; font-weight: 500; letter-spacing: 0.03em;
    transition: color 0.2s; white-space: nowrap;
    font-family: 'DM Sans', sans-serif;
  }
  .rp-nav-link:hover { color: #C9A24D !important; }

  .rp-btn {
    background: linear-gradient(135deg, #C9A24D 0%, #e8b95a 100%) !important;
    color: #1a0f00 !important; font-weight: 700 !important;
    border-radius: 8px; padding: 11px 26px; font-size: 0.83rem;
    letter-spacing: 0.05em; text-transform: uppercase;
    transition: all 0.28s ease; border: none; cursor: pointer;
    display: inline-block; text-decoration: none !important;
    font-family: 'DM Sans', sans-serif;
    animation: rp-pulse 2.5s ease infinite; white-space: nowrap;
  }
  .rp-btn:hover { transform:translateY(-2px); box-shadow:0 6px 24px rgba(201,162,77,0.45); }

  .rp-btn-outline {
    background: transparent !important; color: #5a3a1a !important;
    font-weight: 600; border-radius: 8px; padding: 11px 26px;
    font-size: 0.83rem; letter-spacing: 0.05em; text-transform: uppercase;
    border: 1.5px solid #C9A24D !important; transition: all 0.28s ease;
    cursor: pointer; display: inline-block; text-decoration: none !important;
    font-family: 'DM Sans', sans-serif; white-space: nowrap;
  }
  .rp-btn-outline:hover { background: rgba(201,162,77,0.1) !important; color: #a0701e !important; }

  .rp-card {
    background: #ffffff !important; border: 1px solid rgba(201,162,77,0.2) !important;
    border-radius: 14px; padding: 28px 24px; transition: all 0.3s ease;
    box-shadow: 0 2px 12px rgba(44,24,16,0.06);
  }
  .rp-card:hover { border-color: rgba(201,162,77,0.5) !important; transform:translateY(-5px); box-shadow:0 16px 44px rgba(44,24,16,0.11); }

  .rp-why-card {
    background: #fff8f0 !important; border: 1px solid rgba(201,162,77,0.18) !important;
    border-radius: 12px; padding: 22px 20px; display: flex; gap: 14px;
    transition: all 0.28s ease;
  }
  .rp-why-card:hover { border-color: #C9A24D !important; transform:translateY(-3px); box-shadow:0 10px 28px rgba(44,24,16,0.09); }

  .rp-step-circle {
    width:46px; height:46px; border-radius:50%;
    background: linear-gradient(135deg, #C9A24D, #e8b95a);
    display:flex; align-items:center; justify-content:center; flex-shrink:0;
    box-shadow: 0 4px 14px rgba(201,162,77,0.38);
    font-size:0.72rem; font-weight:800; color:#1a0f00;
    letter-spacing:0.04em; font-family:'DM Sans',sans-serif;
  }

  .rp-divider { height:1px; background:linear-gradient(to right, transparent, #C9A24D, transparent); }

  .rp-mwrap { overflow:hidden; }
  .rp-minner { display:flex; width:max-content; animation: rp-marquee 30s linear infinite; }
  .rp-minner:hover { animation-play-state:paused; }

  .rp-stat {
    background:#ffffff !important; border:1px solid rgba(201,162,77,0.25) !important;
    border-radius:12px; padding:24px 20px; text-align:center;
    box-shadow:0 2px 12px rgba(44,24,16,0.06);
    animation: rp-glow 3.5s ease infinite;
  }

  .rp-badge {
    display:inline-flex; align-items:center; gap:8px;
    background:rgba(201,162,77,0.1); border:1px solid rgba(201,162,77,0.32);
    border-radius:999px; padding:6px 18px;
  }

  .rp-tag {
    font-size:0.62rem; background:rgba(201,162,77,0.12); color:#7a5218;
    border:1px solid rgba(201,162,77,0.26); border-radius:999px;
    padding:3px 10px; font-weight:700; letter-spacing:0.08em;
    text-transform:uppercase; font-family:'DM Sans',sans-serif;
  }

  .rp-reveal { opacity:0; transform:translateY(22px); transition:opacity 0.55s ease, transform 0.55s ease; }
  .rp-visible { opacity:1 !important; transform:translateY(0) !important; }

  .rp-cta-box {
    background: linear-gradient(135deg, #2c1810 0%, #4a2c10 100%) !important;
    border-radius:20px; padding:60px 40px; text-align:center;
    position:relative; overflow:hidden;
  }
  .rp-cta-box::before {
    content:''; position:absolute; inset:0;
    background:radial-gradient(ellipse at center, rgba(201,162,77,0.14) 0%, transparent 68%);
    pointer-events:none;
  }

  .rp-footer {
    background: #2c1810 !important;
    border-top:1px solid rgba(201,162,77,0.18);
    padding:52px 24px 32px;
  }

  @media (max-width:820px) {
    .rp-desktop  { display:none !important; }
    .rp-hamburger { display:flex !important; }
  }
  @media (min-width:821px) {
    .rp-hamburger { display:none !important; }
  }
`;

const FEATURES = [
  { icon:"📱", title:"QR-Based Ordering",   tag:"Customer",   desc:"Guests scan the table QR, browse your live menu, pick add-ons, and order — no waiter needed." },
  { icon:"🍳", title:"Kitchen Dashboard",    tag:"Kitchen",    desc:"Real-time order tiles with sound alerts, countdown timers, and per-item checkboxes." },
  { icon:"🪑", title:"Table Management",     tag:"Operations", desc:"Visual floor plan, table combining, session transfers, and live occupancy tracking." },
  { icon:"📦", title:"Parcel & Takeaway",    tag:"Takeaway",   desc:"Dedicated takeaway flow: accept, track prep, generate bills, record every payment." },
  { icon:"🧾", title:"Billing System",       tag:"Billing",    desc:"Auto-generate bills with GST/tax. Mark paid, choose payment mode, print in one tap." },
  { icon:"⚡", title:"Real-Time WebSocket",  tag:"Technology", desc:"Django Channels pushes every order update instantly — zero refresh, zero lag." },
  { icon:"📊", title:"Analytics & Reports",  tag:"Insights",   desc:"Daily sales totals, order counts, and activity summaries at a glance." },
  { icon:"👥", title:"Multi-Role Access",    tag:"Security",   desc:"Owner, Manager, Kitchen, Customer — each with their own dashboard and permissions." },
];

const STEPS = [
  { n:"01", title:"Customer Scans QR",  desc:"QR on the table opens your live digital menu — no app download required." },
  { n:"02", title:"Order is Placed",     desc:"Guest picks items, adds options, and submits the order from their phone." },
  { n:"03", title:"Kitchen Gets Alert",  desc:"Order appears on the Kitchen Dashboard instantly with a sound alert and timer." },
  { n:"04", title:"Food is Prepared",    desc:"Staff tick off each item and mark the order ready in real time." },
  { n:"05", title:"Bill is Generated",   desc:"System creates the bill with taxes automatically. Staff select payment mode." },
  { n:"06", title:"Session Closed",      desc:"Table session closes, analytics update, table is ready for next guests." },
];

const WHY = [
  { icon:"🚀", h:"Faster Operations",   b:"Orders reach the kitchen in seconds — no paper, no shouting, no mistakes." },
  { icon:"💡", h:"Digital-First Menu",  b:"Update prices and items instantly from anywhere — no reprinting ever." },
  { icon:"🔔", h:"Zero Missed Orders",  b:"WebSocket delivery guarantees every order reaches the kitchen immediately." },
  { icon:"📉", h:"Reduced Staff Load",  b:"Self-service QR ordering lets one waiter handle more tables comfortably." },
  { icon:"🌐", h:"Works Everywhere",    b:"Cafes, hotels,  full-service restaurants — all supported." },
  { icon:"🔐", h:"Role-Based Security", b:"Every team member sees exactly what they need — nothing more, nothing less." },
];

const TICKER = ["QR Ordering","Kitchen Dashboard","Table Management","Parcel System","Billing & Tax","Real-Time Updates","Multi-Role Access","Analytics","Digital Menu","WebSockets"];

function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll('.rp-reveal');
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('rp-visible'); io.unobserve(e.target); }});
    }, { threshold: 0.08 });
    els.forEach(el => io.observe(el));
    return () => io.disconnect();
  }, []);
}

const HomePage = () => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  useReveal();

  useEffect(() => {
    if (!document.getElementById('rp-css')) {
      const s = document.createElement('style');
      s.id = 'rp-css';
      s.textContent = css;
      document.head.appendChild(s);
    }
  }, []);

  const CREAM  = '#faf6f0';
  const CREAM2 = '#f5ede0';
  const AMBER  = '#C9A24D';
  const BROWN  = '#2c1810';
  const BROWN2 = '#5a3a1a';
  const MUTED  = '#8a6a4a';
  const WHITE  = '#ffffff';
  const BDR    = 'rgba(201,162,77,0.22)';

  return (
    <div className="rp-root">

      {/* NAV */}
      <nav className="rp-nav">
        <div className="rp-nav-inner">
          <Link to="/" style={{ display:'flex', alignItems:'center', gap:10, textDecoration:'none', flexShrink:0 }}>
            <img src="/logo.png" alt="Restro" style={{ height:40, borderRadius:6 }} />
            <span className="rp-serif" style={{ fontSize:'1.4rem', color:AMBER, fontWeight:800 }}>Restro</span>
          </Link>

          <div className="rp-desktop" style={{ display:'flex', alignItems:'center', gap:22 }}>
            {[['Features','#features'],['How It Works','#how'],['Why Us','#why']].map(([l,h]) => (
              <a key={l} href={h} className="rp-nav-link">{l}</a>
            ))}
            <Link to="/about"   className="rp-nav-link">About</Link>
            <Link to="/contact" className="rp-nav-link">Contact</Link>
            <Link to="/login"   className="rp-btn" style={{ padding:'9px 20px', fontSize:'0.8rem', marginLeft:6 }}>Login</Link>
          </div>

          <button className="rp-hamburger" onClick={() => setMenuOpen(o=>!o)}
            style={{ background:'none', border:'none', cursor:'pointer', display:'none', flexDirection:'column', gap:5, padding:4 }}>
            {[0,1,2].map(i => <span key={i} style={{ display:'block', width:22, height:2, background:BROWN, borderRadius:2 }} />)}
          </button>
        </div>

        {menuOpen && (
          <div style={{ background:CREAM, borderTop:`1px solid ${BDR}`, padding:'16px 28px 24px', display:'flex', flexDirection:'column', gap:14 }}>
            {[['Features','#features'],['How It Works','#how'],['Why Us','#why']].map(([l,h]) => (
              <a key={l} href={h} className="rp-nav-link" onClick={()=>setMenuOpen(false)}>{l}</a>
            ))}
            <Link to="/about"   className="rp-nav-link" onClick={()=>setMenuOpen(false)}>About</Link>
            <Link to="/contact" className="rp-nav-link" onClick={()=>setMenuOpen(false)}>Contact</Link>
            <Link to="/login"   className="rp-btn" style={{ textAlign:'center', marginTop:8 }} onClick={()=>setMenuOpen(false)}>Login</Link>
          </div>
        )}
      </nav>

      {/* HERO */}
      <section style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', position:'relative', overflow:'hidden', padding:'100px 24px 60px', background:'linear-gradient(160deg, #fdf9f3 0%, #f5ede0 50%, #efe3d0 100%)' }}>
        {[560,380,220].map((s,i) => (
          <div key={i} style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', width:s, height:s, borderRadius:'50%', border:`1px solid rgba(201,162,77,${0.07+i*0.05})`, pointerEvents:'none' }} className={i===2?'rp-spin':''} />
        ))}
        <div style={{ position:'absolute', top:'15%', right:'8%', width:340, height:340, borderRadius:'50%', background:'radial-gradient(circle, rgba(201,162,77,0.18) 0%, transparent 70%)', filter:'blur(48px)', pointerEvents:'none' }} className="rp-float" />
        <div style={{ position:'absolute', bottom:'12%', left:'6%', width:260, height:260, borderRadius:'50%', background:'radial-gradient(circle, rgba(201,162,77,0.1) 0%, transparent 70%)', filter:'blur(36px)', pointerEvents:'none' }} />

        <div style={{ position:'relative', zIndex:1, textAlign:'center', maxWidth:820, width:'100%' }}>
          <div className="rp-badge rp-fu rp-d1" style={{ marginBottom:26 }}>
            <span style={{ width:7, height:7, borderRadius:'50%', background:AMBER, display:'inline-block', animation:'rp-pulse 2s ease infinite' }} />
            <span style={{ fontSize:'0.7rem', color:BROWN2, fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', fontFamily:"'DM Sans', sans-serif" }}>Complete Restaurant Technology Platform</span>
          </div>

          <div className="rp-fu rp-d2" style={{ display:'flex', justifyContent:'center', marginBottom:22 }}>
            <img src="/logo.png" alt="Restro" className="rp-float" style={{ height:96, borderRadius:12, boxShadow:'0 8px 40px rgba(201,162,77,0.28), 0 2px 12px rgba(44,24,16,0.1)' }} />
          </div>

          <h1 className="rp-serif rp-fu rp-d3" style={{ fontSize:'clamp(2.5rem, 5.2vw, 4.4rem)', fontWeight:900, lineHeight:1.1, marginBottom:18, color:BROWN }}>
            The Smartest Way to{' '}
            <span className="rp-shimmer-text">Run Your Restaurant</span>
          </h1>

          <p className="rp-fu rp-d4" style={{ fontSize:'clamp(0.96rem, 1.7vw, 1.1rem)', color:MUTED, lineHeight:1.75, maxWidth:560, margin:'0 auto 36px', fontFamily:"'DM Sans', sans-serif" }}>
            From QR ordering to real-time kitchen display, table management to billing —
            Restro Management replaces manual operations with a seamless digital system.
          </p>

          <div className="rp-fu rp-d5" style={{ display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap' }}>
            <Link to="/owner-login"   className="rp-btn">Get Started — Login</Link>
            <a    href="#features" className="rp-btn-outline">Explore Features</a>
            <Link to="/contact" className="rp-btn-outline">Contact Us</Link>
          </div>

          <div style={{ marginTop:50, display:'flex', flexDirection:'column', alignItems:'center', gap:5, opacity:0.4 }}>
            <span style={{ fontSize:'0.67rem', letterSpacing:'0.18em', textTransform:'uppercase', color:BROWN2, fontFamily:"'DM Sans', sans-serif" }}>Scroll to explore</span>
            <div style={{ width:1, height:34, background:`linear-gradient(to bottom, ${AMBER}, transparent)` }} />
          </div>
        </div>
      </section>

      {/* STATS */}
      <div className="rp-divider" />
      <section style={{ padding:'42px 24px', background:CREAM2 }}>
        <div style={{ maxWidth:980, margin:'0 auto', display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(175px, 1fr))', gap:16 }}>
          {[['10+','Platform Services'],['5','User Roles'],['Real-Time','WebSocket Orders'],['100%','Digital Ops']].map(([n,l],i) => (
            <div key={i} className="rp-stat rp-reveal">
              <div className="rp-serif rp-shimmer-text" style={{ fontSize:'1.95rem', fontWeight:800, marginBottom:4 }}>{n}</div>
              <div style={{ fontSize:'0.76rem', color:MUTED, letterSpacing:'0.07em', textTransform:'uppercase', fontWeight:600, fontFamily:"'DM Sans', sans-serif" }}>{l}</div>
            </div>
          ))}
        </div>
      </section>
      <div className="rp-divider" />

      {/* TICKER */}
      <div style={{ background:'#f0e6d6', padding:'13px 0', borderBottom:`1px solid ${BDR}` }}>
        <div className="rp-mwrap">
          <div className="rp-minner">
            {[...TICKER,...TICKER].map((t,i) => (
              <span key={i} style={{ marginRight:38, fontSize:'0.72rem', letterSpacing:'0.13em', textTransform:'uppercase', color: i%2===0 ? AMBER : MUTED, fontWeight:600, whiteSpace:'nowrap', fontFamily:"'DM Sans', sans-serif" }}>
                {i%2===0?'✦':'○'} {t}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* FEATURES */}
      <section id="features" style={{ padding:'88px 24px', background:CREAM }}>
        <div style={{ maxWidth:1180, margin:'0 auto' }}>
          <div className="rp-reveal" style={{ textAlign:'center', marginBottom:52 }}>
            <p style={{ fontSize:'0.71rem', color:AMBER, letterSpacing:'0.16em', textTransform:'uppercase', fontWeight:700, marginBottom:10, fontFamily:"'DM Sans', sans-serif" }}>Platform Services</p>
            <h2 className="rp-serif" style={{ fontSize:'clamp(1.85rem, 3.6vw, 2.9rem)', fontWeight:800, lineHeight:1.12, color:BROWN }}>
              Everything You Need,{' '}
              <span className="rp-shimmer-text">In One Place</span>
            </h2>
            <p style={{ marginTop:12, color:MUTED, maxWidth:490, margin:'12px auto 0', lineHeight:1.7, fontFamily:"'DM Sans', sans-serif", fontSize:'0.93rem' }}>
              Eight integrated services covering every part of your restaurant operation.
            </p>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(260px, 1fr))', gap:17 }}>
            {FEATURES.map((f,i) => (
              <div key={i} className="rp-card rp-reveal">
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:14 }}>
                  <span style={{ fontSize:'1.85rem' }}>{f.icon}</span>
                  <span className="rp-tag">{f.tag}</span>
                </div>
                <h3 style={{ fontSize:'0.98rem', fontWeight:700, color:BROWN, marginBottom:7, fontFamily:"'DM Sans', sans-serif" }}>{f.title}</h3>
                <p  style={{ fontSize:'0.84rem', color:MUTED, lineHeight:1.65, fontFamily:"'DM Sans', sans-serif" }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" style={{ padding:'88px 24px', background:CREAM2 }}>
        <div style={{ maxWidth:740, margin:'0 auto' }}>
          <div className="rp-reveal" style={{ textAlign:'center', marginBottom:60 }}>
            <p style={{ fontSize:'0.71rem', color:AMBER, letterSpacing:'0.16em', textTransform:'uppercase', fontWeight:700, marginBottom:10, fontFamily:"'DM Sans', sans-serif" }}>Workflow</p>
            <h2 className="rp-serif" style={{ fontSize:'clamp(1.85rem, 3.6vw, 2.9rem)', fontWeight:800, color:BROWN, lineHeight:1.12 }}>
              From QR Scan to{' '}
              <span className="rp-shimmer-text">Completed Payment</span>
            </h2>
          </div>
          {STEPS.map((step,i) => (
            <div key={i} className="rp-reveal" style={{ display:'flex', gap:20 }}>
              <div style={{ display:'flex', flexDirection:'column', alignItems:'center', minWidth:46 }}>
                <div className="rp-step-circle">{step.n}</div>
                {i < STEPS.length-1 && <div style={{ flex:1, width:1.5, background:`linear-gradient(to bottom, ${AMBER}, rgba(201,162,77,0.1))`, minHeight:46, marginTop:4 }} />}
              </div>
              <div style={{ paddingBottom: i < STEPS.length-1 ? 38 : 0 }}>
                <h3 style={{ fontSize:'1.01rem', fontWeight:700, color:BROWN, marginBottom:5, fontFamily:"'DM Sans', sans-serif" }}>{step.title}</h3>
                <p  style={{ fontSize:'0.86rem', color:MUTED, lineHeight:1.65, fontFamily:"'DM Sans', sans-serif" }}>{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* WHY US */}
      <section id="why" style={{ padding:'88px 24px', background:CREAM }}>
        <div style={{ maxWidth:1060, margin:'0 auto' }}>
          <div className="rp-reveal" style={{ textAlign:'center', marginBottom:52 }}>
            <p style={{ fontSize:'0.71rem', color:AMBER, letterSpacing:'0.16em', textTransform:'uppercase', fontWeight:700, marginBottom:10, fontFamily:"'DM Sans', sans-serif" }}>Advantages</p>
            <h2 className="rp-serif" style={{ fontSize:'clamp(1.85rem, 3.6vw, 2.9rem)', fontWeight:800, color:BROWN, lineHeight:1.12 }}>
              Why Restaurants Choose{' '}
              <span className="rp-shimmer-text">Restro Management</span>
            </h2>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(272px, 1fr))', gap:17 }}>
            {WHY.map((w,i) => (
              <div key={i} className="rp-why-card rp-reveal">
                <span style={{ fontSize:'1.65rem', flexShrink:0, marginTop:2 }}>{w.icon}</span>
                <div>
                  <h3 style={{ fontSize:'0.92rem', fontWeight:700, color:BROWN, marginBottom:5, fontFamily:"'DM Sans', sans-serif" }}>{w.h}</h3>
                  <p  style={{ fontSize:'0.82rem', color:MUTED, lineHeight:1.65, fontFamily:"'DM Sans', sans-serif" }}>{w.b}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BUILT FOR */}
      <section style={{ padding:'70px 24px', background:CREAM2 }}>
        <div style={{ maxWidth:840, margin:'0 auto', textAlign:'center' }}>
          <div className="rp-reveal" style={{ marginBottom:38 }}>
            <p style={{ fontSize:'0.71rem', color:AMBER, letterSpacing:'0.16em', textTransform:'uppercase', fontWeight:700, marginBottom:10, fontFamily:"'DM Sans', sans-serif" }}>Built For</p>
            <h2 className="rp-serif" style={{ fontSize:'clamp(1.65rem, 3vw, 2.4rem)', fontWeight:800, color:BROWN }}>Every Type of Food Business</h2>
          </div>
          <div className="rp-reveal" style={{ display:'flex', justifyContent:'center', gap:15, flexWrap:'wrap' }}>
            {[['🍽️','Restaurants'],['☕','Cafes'],['🏨','Hotels']].map(([icon,label]) => (
              <div key={label} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:9, padding:'22px 30px', border:`1.5px solid ${BDR}`, borderRadius:12, background:WHITE, minWidth:126, cursor:'default', transition:'all 0.28s ease', boxShadow:'0 2px 10px rgba(44,24,16,0.05)' }}
                onMouseEnter={e=>{ e.currentTarget.style.borderColor=AMBER; e.currentTarget.style.transform='translateY(-4px)'; e.currentTarget.style.boxShadow='0 10px 26px rgba(44,24,16,0.1)'; }}
                onMouseLeave={e=>{ e.currentTarget.style.borderColor=BDR; e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='0 2px 10px rgba(44,24,16,0.05)'; }}>
                <span style={{ fontSize:'1.9rem' }}>{icon}</span>
                <span style={{ fontSize:'0.86rem', fontWeight:600, color:BROWN2, fontFamily:"'DM Sans', sans-serif" }}>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding:'84px 24px', background:CREAM }}>
        <div style={{ maxWidth:1080, margin:'0 auto' }}>
          <div className="rp-cta-box rp-reveal">
            <div style={{ position:'relative', zIndex:1 }}>
              <div style={{ marginBottom:14, fontSize:'2rem' }}>🚀</div>
              <h2 className="rp-serif" style={{ fontSize:'clamp(1.85rem, 3.6vw, 2.7rem)', fontWeight:800, color:'#fdf9f3', lineHeight:1.12, marginBottom:12 }}>
                Ready to Modernise Your{' '}
                <span className="rp-shimmer-text">Restaurant?</span>
              </h2>
              <p style={{ color:'rgba(253,249,243,0.65)', lineHeight:1.72, marginBottom:30, fontSize:'0.95rem', maxWidth:480, margin:'0 auto 30px', fontFamily:"'DM Sans', sans-serif" }}>
                Setup is instant — your credentials arrive in your inbox the moment your account is created.
              </p>
              <div style={{ display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap' }}>
                <Link to="/owner-login" className="rp-btn">Login to Dashboard</Link>
                <Link to="/contact" style={{ background:'rgba(255,255,255,0.12)', color:'#fdf9f3', fontWeight:600, borderRadius:8, padding:'11px 26px', fontSize:'0.83rem', letterSpacing:'0.05em', textTransform:'uppercase', border:'1.5px solid rgba(255,255,255,0.22)', transition:'all 0.28s ease', cursor:'pointer', display:'inline-block', textDecoration:'none', fontFamily:"'DM Sans', sans-serif" }}
                  onMouseEnter={e=>{ e.currentTarget.style.background='rgba(255,255,255,0.2)'; }}
                  onMouseLeave={e=>{ e.currentTarget.style.background='rgba(255,255,255,0.12)'; }}>
                  Talk to Us
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="rp-footer">
        <div style={{ maxWidth:1100, margin:'0 auto' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:32, marginBottom:36 }}>
            <div style={{ maxWidth:255 }}>
              <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:12 }}>
                <img src="/logo.png" alt="Restro" style={{ height:30, borderRadius:5 }} />
                <span className="rp-serif" style={{ fontSize:'1.15rem', color:AMBER, fontWeight:800 }}>Restro Management</span>
              </div>
              <p style={{ fontSize:'0.82rem', color:'rgba(253,249,243,0.5)', lineHeight:1.65, fontFamily:"'DM Sans', sans-serif" }}>
                A complete digital platform replacing manual operations with modern restaurant technology.
              </p>
              <p style={{ fontSize:'0.73rem', color:AMBER, marginTop:10, fontWeight:600, fontFamily:"'DM Sans', sans-serif", opacity:0.7 }}>Developed by Chitass</p>
            </div>
            <div style={{ display:'flex', gap:44, flexWrap:'wrap' }}>
              <div>
                <p style={{ fontSize:'0.69rem', fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:AMBER, marginBottom:14, fontFamily:"'DM Sans', sans-serif" }}>Platform</p>
                {[['Features','#features'],['How It Works','#how'],['Why Us','#why']].map(([l,h]) => (
                  <a key={l} href={h} style={{ display:'block', color:'rgba(253,249,243,0.45)', textDecoration:'none', fontSize:'0.83rem', marginBottom:8, transition:'color 0.2s', fontFamily:"'DM Sans', sans-serif" }}
                    onMouseEnter={e=>e.target.style.color='#fdf9f3'}
                    onMouseLeave={e=>e.target.style.color='rgba(253,249,243,0.45)'}>{l}</a>
                ))}
              </div>
              <div>
                <p style={{ fontSize:'0.69rem', fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:AMBER, marginBottom:14, fontFamily:"'DM Sans', sans-serif" }}>Company</p>
                {[['About','/about'],['Contact','/contact'],['Login','/login']].map(([l,h]) => (
                  <Link key={l} to={h} style={{ display:'block', color:'rgba(253,249,243,0.45)', textDecoration:'none', fontSize:'0.83rem', marginBottom:8, transition:'color 0.2s', fontFamily:"'DM Sans', sans-serif" }}
                    onMouseEnter={e=>e.target.style.color='#fdf9f3'}
                    onMouseLeave={e=>e.target.style.color='rgba(253,249,243,0.45)'}>{l}</Link>
                ))}
              </div>
            </div>
          </div>
          <div className="rp-divider" style={{ marginBottom:18, opacity:0.25 }} />
          <div style={{ display:'flex', justifyContent:'space-between', flexWrap:'wrap', gap:8 }}>
            <p style={{ fontSize:'0.74rem', color:'rgba(253,249,243,0.35)', fontFamily:"'DM Sans', sans-serif" }}>
              {'\u00a9'} {new Date().getFullYear()} Restro Management {'\u00b7'} Developed by Chitass
            </p>
            <p style={{ fontSize:'0.74rem', color:'rgba(253,249,243,0.35)', fontFamily:"'DM Sans', sans-serif" }}>All rights reserved.</p>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default HomePage;