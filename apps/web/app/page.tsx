import Link from "next/link";

const categories = [
  { title: "Computers",    detail: "Laptops, desktops, workstations, monitors, and accessories.",          image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=900&q=80" },
  { title: "ICT Products", detail: "Routers, switches, storage, printers, cables, and office equipment.",  image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=900&q=80" },
  { title: "Web Hosting",  detail: "Shared hosting, business email, domains, SSL, and support packages.",  image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=900&q=80" },
];

const testingAreas = ["Functional testing","Unit testing","Path testing","Category partition testing","Dataflow testing","Integration testing","Performance testing","Security testing"];

export default function HomePage() {
  return (
    <div className="page-wrap">
      <div className="landing">
        <section className="landing-hero">
          <div className="hero-copy">
            <p className="eyebrow">Datamak Technologies — BIST4212</p>
            <h1>Datamak NexCart</h1>
            <p className="hero-sub">
              A web and mobile online shopping platform for computers, ICT products,
              and web hosting services — built for Software Testing &amp; Reliability.
            </p>
            <div className="hero-actions">
              <Link href="/products"  className="btn btn-primary">Browse catalog</Link>
              <Link href="/dashboard" className="btn btn-ghost">Open dashboard</Link>
            </div>
          </div>
        </section>

        <section className="summary-strip" aria-label="Project summary">
          <div><strong>Course</strong><span>Software Testing &amp; Reliability</span></div>
          <div><strong>Semester</strong><span>2</span></div>
          <div><strong>Deadline</strong><span>13 May 2026</span></div>
          <div><strong>Prototype</strong><span>Web, mobile, REST API, MySQL</span></div>
        </section>

        <section>
          <div className="section-header">
            <div>
              <p className="eyebrow">Storefront modules</p>
              <h2 className="section-title">Computers, ICT products &amp; hosting plans</h2>
              <p className="section-sub">Registration, login, catalog, cart, checkout, order tracking, and admin management.</p>
            </div>
            <Link href="/products" className="section-link">View catalog →</Link>
          </div>
          <div className="category-grid">
            {categories.map((c) => (
              <article className="category-card" key={c.title}>
                <img src={c.image} alt={c.title} />
                <div><h3>{c.title}</h3><p>{c.detail}</p></div>
              </article>
            ))}
          </div>
        </section>

        <section className="feature-band">
          <div>
            <p className="eyebrow">Testing requirement</p>
            <h2>Manual &amp; automated testing ready</h2>
            <p>Test plan, test cases, execution evidence, bug reporting, performance results, security notes, and installation guidance.</p>
          </div>
          <div className="test-grid">
            {testingAreas.map((a) => <span key={a}>{a}</span>)}
          </div>
        </section>

        <section>
          <div className="section-header">
            <div>
              <p className="eyebrow">Admin experience</p>
              <h2 className="section-title">Dashboard — products, users &amp; orders</h2>
              <p className="section-sub">A clean operations screen aligned with the marking criteria.</p>
            </div>
            <Link href="/dashboard" className="section-link">Go to dashboard →</Link>
          </div>
          <div className="module-grid">
            {[["Products","Add, edit, categorize, price, and stock catalog records."],["Users","Review customer accounts, roles, and login activity."],["Orders","Monitor checkout, simulated payment, and order status."],["Reports","Log defects, severity, Jira tickets, and resolution status."]].map(([t, d]) => (
              <article className="module-card" key={t}><h3>{t}</h3><p>{d}</p></article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
