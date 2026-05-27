import { useEffect, useState } from 'react';
import { Link, useLocation } from 'wouter';
import { charityApi, Charity } from '../services';
import { useAuth } from '../contexts/AuthContext';
import DonationModal from '../components/shared/DonationModal';

export default function Home() {
  const [charities, setCharities] = useState<Charity[]>([]);
  const [loadingCharities, setLoadingCharities] = useState(true);
  const [showDonate, setShowDonate] = useState(false);
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  const handleDonateClick = () => {
    if (user) {
      setShowDonate(true);
    } else {
      setLocation('/authModals');
    }
  };

  useEffect(() => {
    charityApi.getAll()
      .then(d => setCharities(d.charities?.slice(0, 3) || []))
      .catch(() => setCharities([]))
      .finally(() => setLoadingCharities(false));
  }, []);

  return (
    <div className="page-wrapper" style={{ paddingTop: 0 }}>
      {/* ==================== Hero Section ==================== */}
      <section className="hero">
        <div className="hero-bg" />
        <div className="hero-gradient" />
        <div className="hero-circle hero-circle-1" />
        <div className="hero-circle hero-circle-2" />
        <div className="hero-inner">
          <div>
            <div className="hero-badge">✨ منصة التبرع بالملابس الأولى في مصر</div>
            <h1 className="hero-title">
              تبرّع بملابسك<br />وأضف <span>قيمة حقيقية</span>
            </h1>
            <p className="hero-desc">
              منصة عطاء تربط المتبرعين بالجمعيات الخيرية المعتمدة لتوصيل ملابسك
              المستعملة لمن يحتاجها بطريقة سهلة وآمنة وشفافة.
            </p>

            <div className="hero-btns">
              <button className="btn-gold" onClick={handleDonateClick}>
                <i className="fas fa-heart" /> تبرع الآن
              </button>
              <Link href="/charities" className="btn-outline">
                <i className="fas fa-building-columns" /> تصفح الجمعيات
              </Link>
            </div>

            <div className="hero-stats">
              <div>
                <span className="hero-stat-val">+10,000</span>
                <span className="hero-stat-lbl">قطعة ملابس وُزّعت</span>
              </div>
              <div>
                <span className="hero-stat-val">+50</span>
                <span className="hero-stat-lbl">جمعية خيرية شريكة</span>
              </div>
              <div>
                <span className="hero-stat-val">+1,200</span>
                <span className="hero-stat-lbl">متبرع فعال</span>
              </div>
            </div>
          </div>
          <div className="hero-visual">
            <div className="hero-img-wrap">
              <img
                src="/images/hero.jpeg"
                alt="عطاء"
                onError={e => {
                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=800';
                }}
              />
              <div className="hero-img-badge">
                <div className="hero-img-badge-icon">🤝</div>
                <div>
                  <p>تبرعات هذا الشهر</p>
                  <strong>+500 قطعة</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== How It Works Section ==================== */}
      <section className="how">
        <div className="container">
          <div className="how-header" data-reveal="up">
            <span className="sec-label">🛤️ رحلة التبرع</span>
            <h2 className="sec-title">كيف <span>يعمل عطاء؟</span></h2>
            <p className="sec-sub">ثلاث خطوات بسيطة تحوّل ملابسك لأثر حقيقي في حياة إنسان محتاج</p>
          </div>
          <div className="how-steps" data-stagger>
            {[
              {
                num: '١',
                icon: '📦',
                color: 'teal',
                title: 'سجّل تبرعك',
                desc: 'أدخل تفاصيل الملابس التي تريد التبرع بها وارفع صورها لنقيّمها ونتأكد من جودتها.',
              },
              {
                num: '٢',
                icon: '🏠',
                color: 'gold',
                title: 'اختر الجمعية',
                desc: 'اختر الجمعية الخيرية المعتمدة الأقرب إليك لاستلام تبرعك أو تحديد موعد للاستلام.',
              },
              {
                num: '٣',
                icon: '🚚',
                color: 'blue',
                title: 'توصيل التبرع',
                desc: 'سنتولى توصيل تبرعك للجمعية المختارة بأمان وسرعة، لتصل لمستحقيها في الوقت المناسب.',
              },
            ].map(s => (
              <div key={s.num} className="step-card">
                <div className="step-num">{s.num}</div>
                <div className={`step-icon ${s.color}`}>{s.icon}</div>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== Stats Bar ==================== */}
      <div className="stats-bar" data-reveal="up">
        <div className="stats-inner" data-stagger>
          <div className="stat-item">
            <span className="stat-num"><span className="stat-plus">+</span><span data-target="10000">10,000</span></span>
            <p className="stat-label">قطعة ملابس وُزّعت على المحتاجين</p>
          </div>
          <div className="stat-item">
            <span className="stat-num"><span className="stat-plus">+</span><span data-target="50">50</span></span>
            <p className="stat-label">جمعية خيرية شريكة</p>
          </div>
          <div className="stat-item">
            <span className="stat-num"><span className="stat-plus">+</span><span data-target="1200">1,200</span></span>
            <p className="stat-label">متبرع فعال على المنصة</p>
          </div>
        </div>
      </div>

      {/* ==================== Charities Section ==================== */}
      <section className="charities">
        <div className="container">
          <div className="charities-header" data-reveal="up">
            <div>
              <span className="sec-label">🤝 شركاؤنا</span>
              <h2 className="sec-title">الجمعيات <span>المعتمدة</span></h2>
              <p className="sec-sub">نعمل مع أبرز الجمعيات الخيرية لضمان وصول تبرعاتك لمستحقيها.</p>
            </div>
            <Link href="/charities" className="btn-primary">عرض كل الجمعيات</Link>
          </div>

          {loadingCharities ? (
            <div className="spinner"><div className="spinner-ring" /></div>
          ) : charities.length > 0 ? (
            <div className="charity-cards" data-stagger>
              {charities.map((c, i) => (
                <div key={c._id} className="charity-card">
                  <div className="charity-card-img">
                    <img
                      src={i === 0 ? '/images/images11.jpg' : i === 1 ? '/images/hero.jpeg' : '/images/hero-img-aleslah.png'}
                      alt={c.charityName}
                      onError={e => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=500';
                      }}
                    />
                    <span className="charity-card-badge">{c.address}</span>
                  </div>
                  <div className="charity-card-body">
                    <div className="charity-card-logo">
                      <img
                        src={i === 0 ? '/images/logo2.png' : i === 1 ? '/images/Resala-logo.png' : '/images/logo-header-eslah.png'}
                        alt={c.charityName}
                        onError={e => {
                          (e.target as HTMLImageElement).src = '';
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>
                    <h3>{c.charityName}</h3>
                    <p>{c.description}</p>
                    <div className="charity-card-footer">
                      <span className="charity-loc">
                        <i className="fas fa-location-dot" /> {c.address}
                      </span>
                      <Link href={`/charities/${c._id}`} className="btn-sm">عرض التفاصيل</Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <FallbackCharities onDonate={handleDonateClick} />
          )}
        </div>
      </section>

      {/* ==================== CTA Banner ==================== */}
      <div className="cta-banner" data-reveal="scale">
        <div className="cta-text">
          <h2>جاهز تبدأ رحلة العطاء؟</h2>
          <p>انضم لآلاف المتبرعين الذين يصنعون فرقًا حقيقيًا في حياة المحتاجين كل يوم.</p>
        </div>
        <div className="cta-btns">
          <button className="btn-gold" onClick={handleDonateClick}>
            <i className="fas fa-heart" /> تبرع الآن
          </button>
          <Link href="/charities" className="btn-outline">تعرف على الجمعيات</Link>
        </div>
      </div>

      {/* ==================== Donation Modal ==================== */}
      <DonationModal isOpen={showDonate} onClose={() => setShowDonate(false)} />
    </div>
  );
}

// ==================== FallbackCharities Component ====================
function FallbackCharities({ onDonate }: { onDonate: () => void }) {
  const items = [
    {
      name: 'مؤسسة الإصلاح الخيرية',
      desc: 'نسعى لتحقيق الاستدامة في العمل الخيري من خلال برامجنا المتنوعة وتوزيع الملابس.',
      city: 'الجيزة',
      img: '/images/sadka.jpg',
      logo: '/images/logo2.png',
    },
    {
      name: 'جمعية رسالة الخيرية',
      desc: 'متخصصون في جمع وتوزيع التبرعات العينية للأسر الأكثر احتياجًا بطريقة إنسانية.',
      city: 'الإسكندرية',
      img: '/images/Resala-logo.png',
      logo: '/images/Resala-logo.png',
    },
    {
      name: 'بنك كساء المصري',
      desc: 'نعمل على دعم الأسر المتعففة وتوفير احتياجاتهم الأساسية من ملابس واحتياجات أخرى.',
      city: 'القاهرة',
      img: '/images/hero-img-aleslah.png',
      logo: '/images/logo-fotter.jpg',
    },
  ];

  return (
    <div className="charity-cards">
      {items.map(c => (
        <div key={c.name} className="charity-card">
          <div className="charity-card-img">
            <img
              src={c.img}
              alt={c.name}
              onError={e => {
                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=500';
              }}
            />
            <span className="charity-card-badge">{c.city}</span>
          </div>
          <div className="charity-card-body">
            <div className="charity-card-logo">
              <img
                src={c.logo}
                alt={c.name}
                onError={e => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
            <h3>{c.name}</h3>
            <p>{c.desc}</p>
            <div className="charity-card-footer">
              <span className="charity-loc">
                <i className="fas fa-location-dot" /> {c.city}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}