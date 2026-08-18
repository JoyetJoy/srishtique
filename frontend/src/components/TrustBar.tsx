import './TrustBar.css';

const features = [
  {
    icon: '/new_design/icon_heritage.png',
    title: 'AUTHENTIC HERITAGE',
    subtitle: "Inspired by Kerala's legacy",
  },
  {
    icon: '/new_design/icon_quality.png',
    title: 'PREMIUM QUALITY',
    subtitle: 'Finest Materials',
  },
  {
    icon: '/new_design/icon_craft.png',
    title: 'EXPERT CRAFTMANSHIP',
    subtitle: 'Skilled artisans, timeless creations',
  },
];

const TrustBar = () => {
  return (
    <section className="trust-bar">
      <div className="container">
        <div className="trust-grid">
          {features.map((f, i) => (
            <div key={i} className="trust-item">
              <img src={f.icon} alt={f.title} className="trust-icon-img" />
              <div className="trust-text-container">
                <p className="trust-title">{f.title}</p>
                <p className="trust-subtitle">{f.subtitle}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustBar;
