import { useEffect } from 'react';
import { Link } from 'react-router-dom';

function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll('.reveal');
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); } });
    }, { threshold: 0.12 });
    els.forEach(el => io.observe(el));
    return () => io.disconnect();
  }, []);
}

const VALUES = [
  { icon: '🎯', title: 'Purpose-Driven', desc: 'Every feature we build solves a real pain point that restaurant operators face daily.' },
  { icon: '⚡', title: 'Built for Speed', desc: 'WebSocket-powered real-time updates mean zero delays between customer order and kitchen action.' },
  { icon: '🔒', title: 'Secure by Design', desc: 'Role-based access ensures every team member sees exactly what they need — nothing more.' },
  { icon: '📱', title: 'Mobile-First', desc: 'Customers order from their phones, staff manage from tablets. No specialized hardware required.' },
  { icon: '🌐', title: 'Multi-Business Ready', desc: 'Whether you run a small café or a hotel with multiple kitchens, the platform scales with you.' },
  { icon: '💡', title: 'Continuously Improving', desc: 'We ship updates regularly based on operator feedback from real restaurant environments.' },
];

const TEAM_VALUES = [
  'Replace paper and manual relay with instant digital workflows',
  'Give owners complete visibility into their restaurant from any device',
  'Reduce order errors caused by handwriting and miscommunication',
  'Enable small restaurants to operate like enterprise-grade businesses',
  'Build technology that kitchen staff and waiters actually enjoy using',
];

const AboutPage = () => {
  useReveal();

  useEffect(() => {
    window.scrollTo(0, 0);
    // Ensure global CSS is injected (if landing page hasn't been visited)
    const tag = document.getElementById('restro-global-css');
    if (!tag) {
      const style = document.createElement('style');
      style.id = 'restro-global-css';
      style.textContent = `
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600;700;800&family=Syne:wght@400;500;600;700&display=swap');
        :root{--ink:#0c0f14;--ink2:#141820;--ink3:#1c2230;--amber:#C9A24D;--amber2:#e8b95a;--amber3:#f5d48a;--muted:#6b7a96;--light:#d4c5aa;--white:#f8f3eb;--card:#13181f;--border:rgba(201,162,77,0.18);--glow:rgba(201,162,77,0.12);}
        html{scroll-behavior:smooth;}
        body{overflow-x:hidden;}
        .rp-root{background:#faf6f0 !important;color:#2c1810 !important;font-family:'DM Sans',sans-serif !important;min-height:100vh;overflow-x:hidden;}
        body::before{content:'';position:fixed;inset:0;background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.035'/%3E%3C/svg%3E");pointer-events:none;z-index:9999;opacity:0.4;}
        .display{font-family:'Cormorant Garamond',serif;}
        @keyframes fadeUp{from{opacity:0;transform:translateY(32px);}to{opacity:1;transform:translateY(0);}}
        @keyframes shimmer{0%{background-position:-200% center;}100%{background-position:200% center;}}
        @keyframes float{0%,100%{transform:translateY(0px);}50%{transform:translateY(-12px);}}
        .animate-fadeUp{animation:fadeUp 0.7s ease forwards;}
        .delay-1{animation-delay:0.1s;opacity:0;}.delay-2{animation-delay:0.25s;opacity:0;}.delay-3{animation-delay:0.4s;opacity:0;}
        .shimmer-text{background:linear-gradient(90deg,var(--amber) 0%,var(--amber3) 40%,var(--amber) 60%,var(--amber2) 100%);background-size:200% auto;-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;animation:shimmer 3s linear infinite;}
        .nav-blur{backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);background:rgba(12,15,20,0.85);border-bottom:1px solid var(--border);}
        .btn-primary{background:linear-gradient(135deg,var(--amber) 0%,var(--amber2) 100%);color:#0c0f14;font-weight:700;border-radius:6px;padding:13px 32px;font-size:0.92rem;letter-spacing:0.06em;text-transform:uppercase;transition:all 0.3s ease;border:none;cursor:pointer;display:inline-block;}
        .btn-primary:hover{transform:translateY(-2px);box-shadow:0 8px 32px rgba(201,162,77,0.4);}
        .btn-ghost{background:transparent;color:var(--white);font-weight:600;border-radius:6px;padding:13px 32px;font-size:0.92rem;letter-spacing:0.06em;text-transform:uppercase;border:1px solid var(--border);transition:all 0.3s ease;cursor:pointer;display:inline-block;}
        .btn-ghost:hover{border-color:var(--amber);color:var(--amber);background:rgba(201,162,77,0.06);}
        .amber-divider{height:1px;background:linear-gradient(to right,transparent,var(--amber),transparent);}
        .reveal{opacity:0;transform:translateY(28px);transition:opacity 0.6s ease,transform 0.6s ease;}
        .reveal.visible{opacity:1;transform:translateY(0);}
        ::-webkit-scrollbar{width:6px;}::-webkit-scrollbar-track{background:var(--ink);}::-webkit-scrollbar-thumb{background:#7c4d00;border-radius:3px;}
      `;
      document.head.appendChild(style);
    }
  }, []);

  return (
    <div className="rp-root">
      {/* NAV */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999, height: 66, background: 'rgba(250,246,240,0.97)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(201,162,77,0.22)', display: 'flex', alignItems: 'center', width: '100%' }}>
        <div style={{ width: '100%', maxWidth: 1180, margin: '0 auto', padding: '0 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>

          {/* Brand — left */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', flexShrink: 0 }}>
            <img src="/logo.png" alt="Restro Logo" style={{ height: 40, borderRadius: 6 }} />
            <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.4rem', color: '#C9A24D', fontWeight: 800 }}>Restro</span>
          </Link>

          {/* Links — right */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
            {[['Home', '/'], ['About', '/about'], ['Contact', '/contact']].map(([label, path]) => (
              <Link key={label} to={path} style={{ color: '#6b4c2a', textDecoration: 'none', fontSize: '0.87rem', fontWeight: 500, letterSpacing: '0.03em', transition: 'color 0.2s', fontFamily: "'DM Sans', sans-serif", whiteSpace: 'nowrap' }}
                onMouseEnter={e => e.target.style.color = '#C9A24D'}
                onMouseLeave={e => e.target.style.color = '#6b4c2a'}>
                {label}
              </Link>
            ))}
            <Link to="/owner-login" style={{ background: 'linear-gradient(135deg, #C9A24D, #e8b95a)', color: '#1a0f00', fontWeight: 700, borderRadius: 8, padding: '10px 22px', fontSize: '0.82rem', letterSpacing: '0.05em', textTransform: 'uppercase', textDecoration: 'none', fontFamily: "'DM Sans', sans-serif", whiteSpace: 'nowrap', transition: 'all 0.28s ease', display: 'inline-block' }}
              onMouseEnter={e => e.currentTarget.style.boxShadow = '0 6px 20px rgba(201,162,77,0.45)'}
              onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}>
              Login
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ minHeight: '55vh', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: 100, paddingBottom: 60, padding: '120px 24px 80px', position: 'relative', overflow: 'hidden', textAlign: 'center' }}>
        <div style={{ position: 'absolute', top: '30%', left: '50%', transform: 'translate(-50%,-50%)', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(201,162,77,0.07) 0%, transparent 65%)', filter: 'blur(30px)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 760 }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
            <img src="/logo.png" alt="Restro" className="animate-fadeUp delay-1" style={{ height: 72, filter: 'drop-shadow(0 0 20px rgba(201,162,77,0.3))' }} />
          </div>
          <p className="animate-fadeUp delay-1" style={{ fontSize: '0.78rem', color: 'var(--amber)', letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 700, marginBottom: 16 }}>— About Us —</p>
          <h1 className="display animate-fadeUp delay-2" style={{ fontSize: 'clamp(2.4rem, 5vw, 4rem)', fontWeight: 800, lineHeight: 1.1, color: 'var(--white)', marginBottom: 20 }}>
            Built to Transform<br /><span className="shimmer-text">Restaurant Operations</span>
          </h1>
          <p className="animate-fadeUp delay-3" style={{ fontSize: '1.05rem', color: 'var(--muted)', lineHeight: 1.75, maxWidth: 600, margin: '0 auto' }}>
            Restro Management is a complete digital restaurant platform designed to eliminate manual processes and connect every part of your operation — from customer to kitchen to cashier.
          </p>
        </div>
      </section>

      <div className="amber-divider" />

      {/* OUR STORY */}
      <section style={{ padding: '90px 24px', background: 'var(--ink2)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 60, alignItems: 'center' }}>
          <div className="reveal">
            <p style={{ fontSize: '0.78rem', color: 'var(--amber)', letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 700, marginBottom: 16 }}>— Our Story —</p>
            <h2 className="display" style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)', fontWeight: 800, color: 'var(--white)', lineHeight: 1.15, marginBottom: 20 }}>
              The Problem We<br /><span className="shimmer-text">Set Out to Solve</span>
            </h2>
            <p style={{ color: 'var(--muted)', lineHeight: 1.75, marginBottom: 16, fontSize: '0.95rem' }}>
              Restaurants everywhere rely on paper tickets, handwritten orders, and shouted kitchen updates. Orders get lost. Mistakes multiply. Staff burn out.
            </p>
            <p style={{ color: 'var(--muted)', lineHeight: 1.75, marginBottom: 16, fontSize: '0.95rem' }}>
              We built Restro Management to change that. By connecting every touchpoint — QR-based customer ordering, real-time kitchen displays, digital billing, and table tracking — we give restaurant operators a single platform that replaces chaos with clarity.
            </p>
            <p style={{ color: 'var(--muted)', lineHeight: 1.75, fontSize: '0.95rem' }}>
              Whether you run a single café or a hotel with multiple kitchen sections, our platform adapts to your operation without expensive hardware or complex setup.
            </p>
          </div>

          <div className="reveal" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <p style={{ fontSize: '0.82rem', color: 'var(--amber)', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4 }}>Our Mission</p>
            {TEAM_VALUES.map((v, i) => (
              <div key={i} style={{ display: 'flex', gap: 14, alignItems: 'flex-start', padding: '16px 20px', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, transition: 'border-color 0.3s ease' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(201,162,77,0.4)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}>
                <span style={{ color: 'var(--amber)', fontWeight: 700, fontSize: '1rem', flexShrink: 0, marginTop: 1 }}>✓</span>
                <span style={{ fontSize: '0.88rem', color: 'var(--light)', lineHeight: 1.6 }}>{v}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* VALUES */}
      <section style={{ padding: '90px 24px', background: 'var(--ink)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div className="reveal" style={{ textAlign: 'center', marginBottom: 56 }}>
            <p style={{ fontSize: '0.78rem', color: 'var(--amber)', letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 700, marginBottom: 12 }}>— What We Stand For —</p>
            <h2 className="display" style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)', fontWeight: 800, color: 'var(--white)', lineHeight: 1.15 }}>
              The Values Behind<br /><span className="shimmer-text">Every Decision</span>
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(270px, 1fr))', gap: 20 }}>
            {VALUES.map((v, i) => (
              <div key={i} className="reveal" style={{ padding: '28px 26px', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, transition: 'all 0.3s ease' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(201,162,77,0.4)'; e.currentTarget.style.transform = 'translateY(-4px)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'translateY(0)'; }}>
                <div style={{ fontSize: '2rem', marginBottom: 14 }}>{v.icon}</div>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--white)', marginBottom: 8 }}>{v.title}</h3>
                <p style={{ fontSize: '0.86rem', color: 'var(--muted)', lineHeight: 1.65 }}>{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DEVELOPER CREDIT */}
      <section style={{ padding: '80px 24px', background: 'var(--ink2)' }}>
        <div style={{ maxWidth: 700, margin: '0 auto', textAlign: 'center' }}>
          <div className="reveal" style={{ border: '1px solid var(--border)', borderRadius: 16, padding: '52px 40px', background: 'rgba(20,24,32,0.5)', backdropFilter: 'blur(12px)' }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg, var(--amber), var(--amber2))', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: '1.8rem' }}>🐅</div>
            <p style={{ fontSize: '0.75rem', color: 'var(--amber)', letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 700, marginBottom: 12 }}>Development</p>
            <h3 className="display" style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--white)', marginBottom: 12 }}>
              Developed by <span className="shimmer-text">Chitass</span>
            </h3>
            <p style={{ color: 'var(--muted)', lineHeight: 1.7, fontSize: '0.93rem', maxWidth: 480, margin: '0 auto 28px' }}>
              Restro Management is designed to transform restaurant operations with a modern digital platform. It connects customers, kitchen staff, and management in one seamless system to make ordering, preparation, and billing faster and more efficient.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
              {['React + Vite', 'Django', 'WebSockets', 'REST API', 'Tailwind CSS'].map(t => (
                <span key={t} style={{ fontSize: '0.72rem', background: 'rgba(201,162,77,0.1)', color: 'var(--amber)', border: '1px solid rgba(201,162,77,0.2)', borderRadius: 999, padding: '5px 14px', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{t}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '80px 24px', background: 'var(--ink)', textAlign: 'center' }}>
        <div className="reveal" style={{ maxWidth: 560, margin: '0 auto' }}>
          <h2 className="display" style={{ fontSize: 'clamp(1.8rem, 3vw, 2.4rem)', fontWeight: 800, color: 'var(--white)', marginBottom: 16 }}>
            Curious About the Platform?
          </h2>
          <p style={{ color: 'var(--muted)', lineHeight: 1.7, marginBottom: 32 }}>
            Explore the features or get in touch with us to learn how Restro Management can work for your business.
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/" className="btn-primary" style={{ textDecoration: 'none' }}>See All Features</Link>
            <Link to="/contact" className="btn-ghost" style={{ textDecoration: 'none' }}>Contact Us</Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: 'var(--ink2)', borderTop: '1px solid var(--border)', padding: '32px 24px', textAlign: 'center' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <img src="/logo.png" alt="Restro" style={{ height: 28 }} />
            <span className="display" style={{ fontSize: '1.1rem', color: 'var(--amber)', fontWeight: 700 }}>Restro Management</span>
          </div>
          <div className="amber-divider" style={{ marginBottom: 16 }} />
          <p style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>© {new Date().getFullYear()} Restro Management · Developed by Chitass · All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default AboutPage;