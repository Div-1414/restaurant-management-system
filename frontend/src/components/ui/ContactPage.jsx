import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

// ─── YOUR EMAILJS CREDENTIALS ─────────────────────────────────────────────
// Step 1: Go to https://www.emailjs.com/ and sign up free
// Step 2: Add Service → Gmail → connect restro.platform@gmail.com → copy Service ID
// Step 3: Email Templates → Create Template → use these variables:
//           {{from_name}}   {{from_email}}   {{topic}}   {{message}}
//         Set "To Email" in template to: restro.platform@gmail.com
// Step 4: Account → API Keys → copy Public Key
// Replace the three values below:
const EMAILJS_SERVICE_ID  = 'YOUR_SERVICE_ID';
const EMAILJS_TEMPLATE_ID = 'YOUR_TEMPLATE_ID';
const EMAILJS_PUBLIC_KEY  = 'YOUR_PUBLIC_KEY';

const CONTACT_EMAIL = 'restro.platform@gmail.com';

const TOPICS = ['Product Demo Request','Pricing Inquiry','Technical Support','Partnership','Other'];

const C = {
  cream:'#faf6f0', cream2:'#f5ede0',
  amber:'#C9A24D', amber2:'#e8b95a',
  brown:'#2c1810', brown2:'#5a3a1a', muted:'#8a6a4a',
  white:'#ffffff',  bdr:'rgba(201,162,77,0.22)',
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@700;800&family=DM+Sans:wght@400;500;600;700&display=swap');
  .cp-root * { box-sizing: border-box; }
  .cp-root {
    background: #faf6f0 !important; color: #2c1810 !important;
    font-family: 'DM Sans', sans-serif !important; min-height: 100vh; overflow-x: hidden;
  }
  .cp-serif { font-family: 'Cormorant Garamond', serif !important; }
  @keyframes cp-fadeUp { from{opacity:0;transform:translateY(20px);} to{opacity:1;transform:translateY(0);} }
  @keyframes cp-shimmer { 0%{background-position:-200% center;} 100%{background-position:200% center;} }
  @keyframes cp-spin { to{transform:rotate(360deg);} }
  @keyframes cp-pulse { 0%,100%{box-shadow:0 0 0 0 rgba(201,162,77,0.4);} 50%{box-shadow:0 0 0 10px rgba(201,162,77,0);} }
  .cp-fu{animation:cp-fadeUp 0.6s ease forwards;}
  .cp-d1{animation-delay:.08s;opacity:0;} .cp-d2{animation-delay:.2s;opacity:0;} .cp-d3{animation-delay:.34s;opacity:0;}
  .cp-shimmer {
    background: linear-gradient(90deg,#b8842a 0%,#e8b95a 35%,#C9A24D 55%,#a0701e 100%);
    background-size:200% auto; -webkit-background-clip:text; -webkit-text-fill-color:transparent;
    background-clip:text; animation:cp-shimmer 3s linear infinite;
  }
  .cp-input {
    width:100%; background:#fff; border:1.5px solid rgba(201,162,77,0.25);
    border-radius:9px; padding:13px 15px; color:#2c1810; font-size:.91rem;
    font-family:'DM Sans',sans-serif; outline:none;
    transition:border-color .22s ease,box-shadow .22s ease;
  }
  .cp-input:focus { border-color:#C9A24D; box-shadow:0 0 0 3px rgba(201,162,77,0.12); }
  .cp-input::placeholder { color:#b8a090; }
  .cp-reveal{opacity:0;transform:translateY(20px);transition:opacity .5s ease,transform .5s ease;}
  .cp-visible{opacity:1 !important;transform:translateY(0) !important;}
  .cp-divider{height:1px;background:linear-gradient(to right,transparent,#C9A24D,transparent);}
  .cp-submit {
    width:100%; background:linear-gradient(135deg,#C9A24D,#e8b95a); color:#1a0f00;
    font-weight:700; border:none; border-radius:9px; padding:14px; font-size:.9rem;
    letter-spacing:.05em; text-transform:uppercase; cursor:pointer;
    transition:all .28s ease; font-family:'DM Sans',sans-serif;
    animation:cp-pulse 2.5s ease infinite;
  }
  .cp-submit:hover:not(:disabled){transform:translateY(-2px);box-shadow:0 8px 24px rgba(201,162,77,.45);}
  .cp-submit:disabled{opacity:.6;cursor:not-allowed;animation:none;}
  .cp-spinner{width:17px;height:17px;border:2px solid rgba(26,15,0,.25);border-top-color:#1a0f00;border-radius:50%;animation:cp-spin .7s linear infinite;display:inline-block;vertical-align:middle;margin-right:8px;}
  .cp-info-card{background:#fff;border:1px solid rgba(201,162,77,.2);border-radius:12px;padding:18px 20px;display:flex;gap:13px;align-items:flex-start;transition:border-color .25s;box-shadow:0 2px 10px rgba(44,24,16,.05);}
  .cp-info-card:hover{border-color:rgba(201,162,77,.5);}
  .cp-form-card{background:#fff;border:1px solid rgba(201,162,77,.2);border-radius:16px;padding:34px 30px;box-shadow:0 4px 24px rgba(44,24,16,.08);}
  .cp-pill{font-size:.72rem;background:rgba(201,162,77,.1);color:#7a5218;border:1px solid rgba(201,162,77,.22);border-radius:999px;padding:5px 13px;font-weight:600;cursor:pointer;transition:all .2s;font-family:'DM Sans',sans-serif;white-space:nowrap;}
  .cp-pill:hover,.cp-pill.active{background:rgba(201,162,77,.22);border-color:#C9A24D;color:#5a3a1a;}
  .cp-footer{background:#2c1810 !important;border-top:1px solid rgba(201,162,77,.18);padding:34px 24px;text-align:center;}
  @media(max-width:640px){.cp-grid2{grid-template-columns:1fr !important;}}
`;

function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll('.cp-reveal');
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => { if(e.isIntersecting){e.target.classList.add('cp-visible');io.unobserve(e.target);}});
    }, { threshold:.08 });
    els.forEach(el => io.observe(el));
    return () => io.disconnect();
  }, []);
}

const ContactPage = () => {
  useReveal();
  const [form, setForm]     = useState({ name:'', email:'', topic:'', message:'' });
  const [status, setStatus] = useState(null);
  const [errMsg, setErrMsg] = useState('');

  useEffect(() => {
    window.scrollTo(0, 0);
    if (!document.getElementById('cp-css')) {
      const s = document.createElement('style'); s.id='cp-css'; s.textContent=css; document.head.appendChild(s);
    }
    // Load EmailJS SDK
    if (!document.getElementById('emailjs-sdk')) {
      const sc = document.createElement('script');
      sc.id = 'emailjs-sdk';
      sc.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js';
      sc.onload = () => window.emailjs && window.emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });
      document.head.appendChild(sc);
    } else if (window.emailjs) {
      window.emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });
    }
  }, []);

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  const setTopic     = t => setForm(f => ({ ...f, topic: t }));

  const handleSubmit = async e => {
    e.preventDefault();
    setStatus('sending'); setErrMsg('');
    try {
      await window.emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
        from_name:  form.name,
        from_email: form.email,
        topic:      form.topic || 'Not specified',
        message:    form.message,
        to_email:   CONTACT_EMAIL,
      });
      setStatus('success');
      setForm({ name:'', email:'', topic:'', message:'' });
    } catch(err) {
      console.error('EmailJS:', err);
      setErrMsg(`Failed to send. Please email us directly at ${CONTACT_EMAIL}`);
      setStatus('error');
    }
  };

  const lbl = { display:'block', fontSize:'.71rem', color:C.muted, fontWeight:700, letterSpacing:'.09em', textTransform:'uppercase', marginBottom:7, fontFamily:"'DM Sans',sans-serif" };

  return (
    <div className="cp-root">

      {/* NAV */}
      <nav style={{ position:'fixed', top:0, left:0, right:0, zIndex:9999, height:66, background:'rgba(250,246,240,0.97)', backdropFilter:'blur(16px)', WebkitBackdropFilter:'blur(16px)', borderBottom:'1px solid rgba(201,162,77,0.22)', display:'flex', alignItems:'center', width:'100%' }}>
        <div style={{ width:'100%', maxWidth:1180, margin:'0 auto', padding:'0 32px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <Link to="/" style={{ display:'flex', alignItems:'center', gap:10, textDecoration:'none', flexShrink:0 }}>
            <img src="/logo.png" alt="Restro" style={{ height:40, borderRadius:6 }} />
            <span style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:'1.4rem', color:C.amber, fontWeight:800 }}>Restro</span>
          </Link>
          <div style={{ display:'flex', alignItems:'center', gap:28 }}>
            {[['Home','/'],['About','/about'],['Contact','/contact']].map(([l,p]) => (
              <Link key={l} to={p} style={{ color:C.brown2, textDecoration:'none', fontSize:'.87rem', fontWeight:500, letterSpacing:'.03em', transition:'color .2s', fontFamily:"'DM Sans',sans-serif", whiteSpace:'nowrap' }}
                onMouseEnter={e=>e.target.style.color=C.amber} onMouseLeave={e=>e.target.style.color=C.brown2}>{l}</Link>
            ))}
            <Link to="/owner-login" style={{ background:'linear-gradient(135deg,#C9A24D,#e8b95a)', color:'#1a0f00', fontWeight:700, borderRadius:8, padding:'10px 22px', fontSize:'.82rem', letterSpacing:'.05em', textTransform:'uppercase', textDecoration:'none', fontFamily:"'DM Sans',sans-serif", whiteSpace:'nowrap', display:'inline-block', transition:'all .28s' }}
              onMouseEnter={e=>e.currentTarget.style.boxShadow='0 6px 20px rgba(201,162,77,.45)'}
              onMouseLeave={e=>e.currentTarget.style.boxShadow='none'}>Login</Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ padding:'130px 24px 56px', textAlign:'center', position:'relative', overflow:'hidden', background:'linear-gradient(160deg,#fdf9f3 0%,#f5ede0 100%)' }}>
        <div style={{ position:'absolute', top:'40%', left:'50%', transform:'translate(-50%,-50%)', width:500, height:500, borderRadius:'50%', background:'radial-gradient(circle,rgba(201,162,77,.1) 0%,transparent 68%)', filter:'blur(40px)', pointerEvents:'none' }} />
        <div style={{ position:'relative', zIndex:1, maxWidth:640, margin:'0 auto' }}>
          <p className="cp-fu cp-d1" style={{ fontSize:'.71rem', color:C.amber, letterSpacing:'.16em', textTransform:'uppercase', fontWeight:700, marginBottom:14, fontFamily:"'DM Sans',sans-serif" }}>Contact Us</p>
          <h1 className="cp-serif cp-fu cp-d2" style={{ fontSize:'clamp(2.2rem,4.8vw,3.6rem)', fontWeight:800, lineHeight:1.1, color:C.brown, marginBottom:16 }}>
            Let's Talk About{' '}<span className="cp-shimmer">Your Restaurant</span>
          </h1>
          <p className="cp-fu cp-d3" style={{ fontSize:'clamp(.95rem,1.6vw,1.05rem)', color:C.muted, lineHeight:1.75, maxWidth:500, margin:'0 auto', fontFamily:"'DM Sans',sans-serif" }}>
            Questions about pricing, platform, or getting started? We'd love to hear from you.
          </p>
        </div>
      </section>

      <div className="cp-divider" />

      {/* MAIN */}
      <section style={{ padding:'68px 24px 80px', background:C.cream }}>
        <div style={{ maxWidth:1040, margin:'0 auto', display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(300px,1fr))', gap:44, alignItems:'start' }}>

          {/* LEFT */}
          <div className="cp-reveal">
            <p style={{ fontSize:'.71rem', color:C.amber, letterSpacing:'.16em', textTransform:'uppercase', fontWeight:700, marginBottom:18, fontFamily:"'DM Sans',sans-serif" }}>Get In Touch</p>

            {/* Email highlight card */}
            <div style={{ background:'linear-gradient(135deg,#2c1810,#4a2c10)', borderRadius:14, padding:'24px 22px', marginBottom:16, position:'relative', overflow:'hidden' }}>
              <div style={{ position:'absolute', inset:0, background:'radial-gradient(circle at top right,rgba(201,162,77,.14),transparent 65%)', pointerEvents:'none' }} />
              <div style={{ position:'relative', zIndex:1 }}>
                <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:8 }}>
                  <div style={{ width:38, height:38, borderRadius:9, background:'linear-gradient(135deg,#C9A24D,#e8b95a)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1rem', flexShrink:0 }}>📧</div>
                  <p style={{ fontSize:'.68rem', color:'rgba(253,249,243,.5)', letterSpacing:'.1em', textTransform:'uppercase', fontWeight:700, fontFamily:"'DM Sans',sans-serif" }}>Email Us Directly</p>
                </div>
                <a href={`mailto:${CONTACT_EMAIL}`} style={{ fontSize:'1rem', color:C.amber, textDecoration:'none', fontWeight:700, fontFamily:"'DM Sans',sans-serif", display:'block', marginBottom:5 }}>{CONTACT_EMAIL}</a>
                <p style={{ fontSize:'.78rem', color:'rgba(253,249,243,.45)', fontFamily:"'DM Sans',sans-serif", lineHeight:1.5 }}>We respond within 24 hours on business days.</p>
              </div>
            </div>

            {[
              { icon:'🏢', label:'Company',  text:'Restro Management — Developed by Chitass' },
              { icon:'🌐', label:'Platform', text:'Web-based SaaS · Works on any device' },
              { icon:'⚡', label:'Setup',    text:'Instant account · Credentials via email' },
            ].map((item,i) => (
              <div key={i} className="cp-info-card" style={{ marginBottom:10 }}>
                <span style={{ fontSize:'1.2rem', flexShrink:0, marginTop:1 }}>{item.icon}</span>
                <div>
                  <p style={{ fontSize:'.67rem', color:C.muted, letterSpacing:'.1em', textTransform:'uppercase', fontWeight:700, marginBottom:2, fontFamily:"'DM Sans',sans-serif" }}>{item.label}</p>
                  <p style={{ fontSize:'.83rem', color:C.brown2, lineHeight:1.5, fontFamily:"'DM Sans',sans-serif" }}>{item.text}</p>
                </div>
              </div>
            ))}

            <div style={{ marginTop:22 }}>
              <p style={{ fontSize:'.69rem', color:C.amber, letterSpacing:'.1em', textTransform:'uppercase', fontWeight:700, marginBottom:10, fontFamily:"'DM Sans',sans-serif" }}>Quick Topics</p>
              <div style={{ display:'flex', flexWrap:'wrap', gap:7 }}>
                {TOPICS.map(t => (
                  <span key={t} className={`cp-pill${form.topic===t?' active':''}`} onClick={()=>setTopic(t)}>{t}</span>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT — Form */}
          <div className="cp-reveal">
            <div className="cp-form-card">
              <p style={{ fontSize:'.71rem', color:C.amber, letterSpacing:'.16em', textTransform:'uppercase', fontWeight:700, marginBottom:22, fontFamily:"'DM Sans',sans-serif" }}>Send a Message</p>

              {status === 'success' ? (
                <div style={{ textAlign:'center', padding:'32px 0' }}>
                  <div style={{ fontSize:'3rem', marginBottom:12 }}>✅</div>
                  <h3 className="cp-serif" style={{ fontSize:'1.75rem', color:C.brown, marginBottom:8, fontWeight:800 }}>Message Sent!</h3>
                  <p style={{ color:C.muted, lineHeight:1.6, fontSize:'.9rem', fontFamily:"'DM Sans',sans-serif", marginBottom:6 }}>Your message has been delivered to</p>
                  <a href={`mailto:${CONTACT_EMAIL}`} style={{ color:C.amber, fontWeight:700, fontSize:'.93rem', textDecoration:'none', fontFamily:"'DM Sans',sans-serif" }}>{CONTACT_EMAIL}</a>
                  <p style={{ color:C.muted, marginTop:6, fontSize:'.83rem', fontFamily:"'DM Sans',sans-serif" }}>We'll reply within 24 hours.</p>
                  <button onClick={()=>setStatus(null)} style={{ marginTop:22, background:'transparent', border:`1.5px solid ${C.amber}`, color:C.brown2, borderRadius:8, padding:'10px 22px', fontSize:'.82rem', fontWeight:600, cursor:'pointer', fontFamily:"'DM Sans',sans-serif", letterSpacing:'.04em', textTransform:'uppercase' }}>
                    Send Another
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:16 }}>
                  <div className="cp-grid2" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:13 }}>
                    <div>
                      <label style={lbl}>Your Name *</label>
                      <input className="cp-input" type="text" name="name" required placeholder="e.g. Arjun Patel" value={form.name} onChange={handleChange} />
                    </div>
                    <div>
                      <label style={lbl}>Email Address *</label>
                      <input className="cp-input" type="email" name="email" required placeholder="you@example.com" value={form.email} onChange={handleChange} />
                    </div>
                  </div>

                  <div>
                    <label style={lbl}>Topic</label>
                    <select className="cp-input" name="topic" value={form.topic} onChange={handleChange} style={{ cursor:'pointer' }}>
                      <option value="">Select a topic…</option>
                      {TOPICS.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>

                  <div>
                    <label style={lbl}>Message *</label>
                    <textarea className="cp-input" name="message" required rows={5} placeholder="Tell us about your restaurant and what you need…" value={form.message} onChange={handleChange} style={{ resize:'vertical', minHeight:130 }} />
                  </div>

                  {status === 'error' && (
                    <div style={{ background:'rgba(220,53,53,.08)', border:'1px solid rgba(220,53,53,.25)', borderRadius:8, padding:'11px 14px', fontSize:'.82rem', color:'#c0392b', fontFamily:"'DM Sans',sans-serif", lineHeight:1.5 }}>
                      {'\u26a0\ufe0f'} {errMsg}
                    </div>
                  )}

                  <button type="submit" className="cp-submit" disabled={status==='sending'}>
                    {status==='sending' ? <><span className="cp-spinner" />Sending…</> : 'Send Message →'}
                  </button>

                  <p style={{ fontSize:'.73rem', color:C.muted, textAlign:'center', lineHeight:1.55, fontFamily:"'DM Sans',sans-serif" }}>
                    Or email us directly at{' '}
                    <a href={`mailto:${CONTACT_EMAIL}`} style={{ color:C.amber, textDecoration:'none', fontWeight:600 }}>{CONTACT_EMAIL}</a>
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* BOTTOM CTA */}
      <section style={{ padding:'64px 24px', background:C.cream2, textAlign:'center' }}>
        <div className="cp-reveal" style={{ maxWidth:500, margin:'0 auto' }}>
          <h2 className="cp-serif" style={{ fontSize:'clamp(1.65rem,3vw,2.2rem)', fontWeight:800, color:C.brown, marginBottom:10 }}>Ready to Get Started?</h2>
          <p style={{ color:C.muted, lineHeight:1.7, marginBottom:24, fontSize:'.91rem', fontFamily:"'DM Sans',sans-serif" }}>Already have an account? Log in to your dashboard now.</p>
          <div style={{ display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap' }}>
            <Link to="/owner-login" style={{ background:'linear-gradient(135deg,#C9A24D,#e8b95a)', color:'#1a0f00', fontWeight:700, borderRadius:8, padding:'11px 26px', fontSize:'.83rem', letterSpacing:'.05em', textTransform:'uppercase', textDecoration:'none', fontFamily:"'DM Sans',sans-serif", display:'inline-block', transition:'all .28s' }}
              onMouseEnter={e=>e.currentTarget.style.boxShadow='0 6px 22px rgba(201,162,77,.45)'}
              onMouseLeave={e=>e.currentTarget.style.boxShadow='none'}>Go to Login</Link>
            <Link to="/" style={{ background:'transparent', color:C.brown2, fontWeight:600, borderRadius:8, padding:'11px 26px', fontSize:'.83rem', letterSpacing:'.05em', textTransform:'uppercase', border:`1.5px solid ${C.amber}`, textDecoration:'none', fontFamily:"'DM Sans',sans-serif", display:'inline-block', transition:'all .28s' }}
              onMouseEnter={e=>{ e.currentTarget.style.background='rgba(201,162,77,.1)'; e.currentTarget.style.color=C.amber; }}
              onMouseLeave={e=>{ e.currentTarget.style.background='transparent'; e.currentTarget.style.color=C.brown2; }}>Explore Platform</Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="cp-footer">
        <div style={{ maxWidth:1100, margin:'0 auto' }}>
          <div style={{ display:'flex', justifyContent:'center', alignItems:'center', gap:10, marginBottom:13 }}>
            <img src="/logo.png" alt="Restro" style={{ height:27, borderRadius:5 }} />
            <span style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:'1.1rem', color:C.amber, fontWeight:800 }}>Restro Management</span>
          </div>
          <div className="cp-divider" style={{ marginBottom:13, opacity:.25 }} />
          <p style={{ fontSize:'.74rem', color:'rgba(253,249,243,.38)', fontFamily:"'DM Sans',sans-serif" }}>
            {'\u00a9'} {new Date().getFullYear()} Restro Management {'\u00b7'} Developed by Chitass {'\u00b7'} All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default ContactPage;