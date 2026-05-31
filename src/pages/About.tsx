import { useState } from 'react';
import { Link } from 'wouter';

const TEAM_MEMBERS = [
  {
    name:  'Eng. Mariam Mohammed',
    role: 'UI/UX Designer',
    bio: 'شغوفة بتصميم واجهات مستخدم مذهلة تركز على تحسين تجربة المتبرعين وجعلها فائقة السلاسة.',
    // github: 'https://github.com',
    // linkedin: 'https://linkedin.com',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300'
  },
  {
    name: 'Eng. Fatma Tamer',
    role: 'UI/UX Designer',
    bio: 'متخصصة في بناء الهوية البصرية وأنظمة التصميم لضمان اتساق وجمال المنصة في جميع الشاشات.',
    // github: 'https://github.com',
    // linkedin: 'https://linkedin.com',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300'
  },
  {
    name: 'Eng. Sayed Herzallah',
    role: 'Full Stack Developer',
    bio: 'مطور خبير في تقنيات MERN و .NET Core. يحرص على بناء بنية تحتية سحابية آمنة وقابلة للتوسع.',
    github: 'https://github.com/sayed-herzallah',
    linkedin: 'https://www.linkedin.com/in/sayed-herzallah/',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300'
  },
  {
    name: 'Eng. Abdallah Sayed',
    role: 'Front End Developer',
    bio: 'تبني واجهات تفاعلية سريعة الاستجابة باستخدام React و TypeScript مع اهتمام دقيق بالتفاصيل.',
    // github: 'https://github.com',
    // linkedin: 'https://linkedin.com',
    image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300'
  },
  {
    name: 'Eng. Rana Hamada',
    role: 'Front End Developer',
    bio: 'شغوفة بتحويل التصاميم الفنية إلى أكواد برمجية تفاعلية غنية بالرسوم الناعمة وتأثيرات الـ Micro-animations.',
    // github: 'https://github.com',
    // linkedin: 'https://linkedin.com',
    image: 'https://images.unsplash.com/photo-1554151228-14d9def656e4?w=300'
  },
  {
    name: 'Eng. Abdulrahman Haitham',
    role: 'Front End Developer',
    bio: 'متخصص في دمج الـ APIs وتحسين أداء صفحات الويب وضمان تجربة استخدام متوافقة بالكامل.',
    // github: 'https://github.com',
    // linkedin: 'https://linkedin.com',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300'
  },
  {
    name: 'Eng. Yara Zakria',
    role: 'Front End Developer',
    bio: 'تدمج بين حس التصميم والبرمجة لبناء صفحات متناسقة وجذابة متوافقة مع أحدث معايير الويب.',
    // github: 'https://github.com',
    linkedin: 'https://www.linkedin.com/in/yara-zakria-21311a344',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300'
  },
  {
    name: 'Eng. Alaa Sayed',
    role: 'Front End Developer',
    bio: 'يركز على تطوير أنظمة التحكم والتحقق من البيانات لضمان دقة معلومات التبرعات.',
    // github: 'https://github.com',
    // linkedin: 'https://linkedin.com',
    image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300'
  }
];

interface Member {
  name: string;
  role: string;
  bio: string;
  image: string;
  github: string;
  linkedin: string;
  dribbble?: string;
}

function getMemberIcon(role: string): string {
  if (role.includes('Full Stack')) return 'fa-solid fa-crown';
  if (role.includes('UI/UX')) return 'fa-solid fa-palette';
  return 'fa-solid fa-code';
}

function TeamCard({ member, variant }: { member: Member; variant: 'lead' | 'uiux' | 'frontend' }) {
  const isLead = variant === 'lead';
  const iconClass = getMemberIcon(member.role);
  
  return (
    <div className={`pt-card pt-card--${variant}`}>
      <div className="pt-card-inner">
        {/* Glow backdrop behind avatar */}
        <div className="pt-glow" />
        
        {/* Glowing Icon Avatar Container */}
        <div className="pt-avatar-wrap">
          <div className="pt-icon-avatar">
            <i className={iconClass} />
          </div>
          {isLead && <span className="pt-lead-badge">Lead Architect</span>}
        </div>

        {/* Member Info */}
        <div className="pt-info">
          <h3>{member.name}</h3>
          <span className="pt-role">{member.role}</span>
          <p className="pt-bio">{member.bio}</p>
          
          {/* Action social links with dynamic hover states */}
          <div className="pt-social">
            {member.linkedin && (
              <a href={member.linkedin} target="_blank" rel="noreferrer" title="LinkedIn" className="social-ln">
                <i className="fab fa-linkedin" />
              </a>
            )}
            {member.github && (
              <a href={member.github} target="_blank" rel="noreferrer" title="GitHub" className="social-gh">
                <i className="fab fa-github" />
              </a>
            )}
            {member.dribbble && (
              <a href={member.dribbble} target="_blank" rel="noreferrer" title="Dribbble" className="social-db">
                <i className="fab fa-dribbble" />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function About() {
  const fullStackMember = TEAM_MEMBERS.find(m => m.role === 'Full Stack Developer')!;
  const uiuxMembers = TEAM_MEMBERS.filter(m => m.role === 'UI/UX Designer');
  const frontendMembers = TEAM_MEMBERS.filter(m => m.role === 'Front End Developer');

  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [centerHovered, setCenterHovered] = useState(false);

  return (
    <div className="page-wrapper">
      <div className="page-hero">
        <div className="breadcrumb">
          <Link href="/">الرئيسية</Link>
          <span>›</span>
          <span>عن المنصة</span>
        </div>
        <h1>عن منصة <span style={{ color: 'var(--gold-400)' }}>عطاء</span></h1>
        <p>تعرف على قصتنا وأهدافنا وفريقنا الذي يعمل بشغف لجعل التبرع أسهل وأكثر أثراً</p>
      </div>

      {/* Goals */}
      <section className="goals-sec">
        <div className="container">
          <div className="goals-grid">
            <div className="goals-img">
              <img
              src="/images/hero.jpeg"
                alt="أهدافنا"
                // onError={e => { (e.target as HTMLImageElement).src = '../../public/images/children.jpeg'; }}
                // onError={e => {
                  // (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=800';
                // }}

                />
            </div>
            <div>
              <span className="sec-label">🎯 أهدافنا</span>
              <h2 className="sec-title">نسعى لعالم <span>أكثر تكافلًا</span></h2>
              <p className="sec-sub" style={{ marginBottom: 32 }}>
                منصة عطاء وُلدت من إيمان بأن كل قطعة ملابس غير مستخدمة يمكنها أن تصنع فرقًا في حياة إنسان يحتاجها.
              </p>
              <div className="goals-list">
                {[
                  { icon: '🔗', title: 'ربط المتبرعين بالجمعيات', desc: 'نوفر منصة سهلة تربط من يريد التبرع بالجمعيات الخيرية المعتمدة والموثوقة.' },
                  { icon: '🌟', title: 'الشفافية والمصداقية', desc: 'نضمن وصول تبرعاتك لمستحقيها مع تقارير متابعة تُظهر أثر تبرعك الحقيقي.' },
                  { icon: '♻️', title: 'الاقتصاد الدائري', desc: 'نشجع إعادة استخدام الملابس للحفاظ على البيئة وتقليل الهدر.' },
                  { icon: '📱', title: 'سهولة الوصول', desc: 'نجعل التبرع بسيطًا ومريحًا عبر منصة رقمية سهلة الاستخدام.' },
                ].map(g => (
                  <div key={g.title} className="goal-item">
                    <div className="goal-icon">{g.icon}</div>
                    <div>
                      <h4>{g.title}</h4>
                      <p>{g.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="values-sec">
        <div className="container">
          <div className="values-header">
            <span className="sec-label">💎 قيمنا</span>
            <h2 className="sec-title">القيم التي <span>تحركنا</span></h2>
            <p className="sec-sub">هذه القيم هي البوصلة التي تحدد كيف نعمل وكيف نتعامل مع مجتمعنا</p>
          </div>
          <div className="values-grid">
            {[
              { icon: '🤝', title: 'التكامل', desc: 'نؤمن بأن التكامل بين أفراد المجتمع يصنع مجتمعًا أقوى وأكثر إنسانية.' },
              { icon: '🔍', title: 'الشفافية', desc: 'نلتزم بالشفافية الكاملة في كل عملياتنا لبناء الثقة مع مجتمعنا.' },
              { icon: '🌱', title: 'الاستدامة', desc: 'نعمل نحو مستقبل أخضر مستدام يحافظ على مواردنا للأجيال القادمة.' },
              { icon: '❤️', title: 'التعاطف', desc: 'نضع إنسانية المستفيد في مقدمة كل قراراتنا وخدماتنا.' },
              { icon: '🚀', title: 'الابتكار', desc: 'نبحث دائمًا عن حلول مبتكرة تجعل تجربة التبرع أفضل وأكثر أثرًا.' },
              { icon: '🛡️', title: 'المصداقية', desc: 'نلتزم بأعلى معايير المصداقية والأمانة في تعاملنا مع الجميع.' },
              { icon: '🌟', title: 'الوصول', desc: 'نتمكن من الوصول لكافة المستفيدين بطريقة سهلة وسرية.' },
              { icon: '🌐', title: 'التواصل', desc: 'نتمكن من التواصل مع جميع المستفيدين بطريقة سهلة وسرية.' },
              { icon: '💡', title: 'الابتكار', desc: 'نبحث دائمًا عن حلول مبتكرة تجعل تجربة التبرع أفضل وأكثر أثرًا.' },
              { icon: '🌍', title: 'التأثير الاجتماعي', desc: 'نهدف إلى إحداث تأثير إيجابي ملموس في حياة المستفيدين ومجتمعاتهم.' },
              { icon: '🤗', title: 'الاحترام', desc: 'نحترم كرامة كل فرد ونسعى لتعزيزها من خلال خدماتنا.' },  
              { icon: '🎉', title: 'الاستقبال', desc: 'نحب كل فرد ونسعى لتعزيزه من خلال خدماتنا.' },    
            ].map(v => (
              <div key={v.title} className="value-card">
                <div className="value-icon">{v.icon}</div>
                <h3>{v.title}</h3>
                <p>{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="team-sec">
        <div className="container">
          <div className="team-header">
            <span className="sec-label">👥 فريق العمل</span>
            <h2 className="sec-title">الفريق الذي <span>يصنع التغيير</span></h2>
            <p className="sec-sub">نخبة من المصممين والمطورين يعملون بشغف لبناء أفضل تجربة تبرع رقمية موثوقة وسلسة</p>
          </div>
          
          <div className="pt-orbit-container">
            {/* Circular background rings */}
            <div className="pt-orbit-ring" />
            <div className="pt-orbit-ring pt-orbit-ring--outer" />

            {/* Glowing SVG connector lines */}
            <svg className="pt-connector-lines" viewBox="0 0 960 960">
              {(() => {
                const satellites = [...uiuxMembers, ...frontendMembers];
                const r = 370; // High-end radius to avoid overlap
                
                // Helper to get satellite coordinates
                const getCoords = (index: number) => {
                  const angle = (index * 360) / 7;
                  const radians = (angle * Math.PI) / 180;
                  return {
                    x: 480 + Math.cos(radians) * r,
                    y: 480 + Math.sin(radians) * r,
                  };
                };

                const coords = satellites.map((_, i) => getCoords(i));

                return (
                  <>
                    {/* 1. Radial connection lines (Satellites to Lead) */}
                    {satellites.map((_, i) => {
                      const pt = coords[i];
                      const isActive = hoveredIndex === i || centerHovered;
                      return (
                        <line
                          key={`radial-${i}`}
                          x1="480"
                          y1="480"
                          x2={pt.x}
                          y2={pt.y}
                          className={`pt-connector-line pt-connector-line--radial ${isActive ? 'active' : ''}`}
                        />
                      );
                    })}

                    {/* 2. Satellite Ring Inter-connections (0 -> 1 -> 2 -> 3 -> 4 -> 5 -> 6 -> 0) */}
                    {[
                      [0, 1, 'uiux'],
                      [1, 2, 'bridge'],
                      [2, 3, 'fe'],
                      [3, 4, 'fe'],
                      [4, 5, 'fe'],
                      [5, 6, 'fe'],
                      [6, 0, 'bridge']
                    ].map(([idxA, idxB, type], idx) => {
                      const ptA = coords[idxA as number];
                      const ptB = coords[idxB as number];
                      const isActive = hoveredIndex === idxA || hoveredIndex === idxB || centerHovered;
                      return (
                        <line
                          key={`satellite-inter-${idx}`}
                          x1={ptA.x}
                          y1={ptA.y}
                          x2={ptB.x}
                          y2={ptB.y}
                          className={`pt-connector-line pt-connector-line--inter pt-connector-line--${type} ${isActive ? 'active' : ''}`}
                        />
                      );
                    })}
                  </>
                );
              })()}
            </svg>

            {/* Central Member: Full Stack Lead Architect */}
            <div 
              className="pt-center-member"
              onMouseEnter={() => setCenterHovered(true)}
              onMouseLeave={() => setCenterHovered(false)}
            >
              <TeamCard member={fullStackMember} variant="lead" />
            </div>

            {/* Orbiting Satellites (7 members) */}
            {(() => {
              const satellites = [...uiuxMembers, ...frontendMembers];
              return satellites.map((m, i) => {
                const angle = (i * 360) / 7;
                const radians = (angle * Math.PI) / 180;
                const r = 370; // Increased Radius of orbit
                const x = Math.cos(radians) * r;
                const y = Math.sin(radians) * r;

                const variant = m.role.includes('UI/UX') ? 'uiux' : 'frontend';

                return (
                  <div
                    key={i}
                    className={`pt-satellite-member pt-satellite--${i}`}
                    style={{
                      transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`
                    } as React.CSSProperties}
                    onMouseEnter={() => setHoveredIndex(i)}
                    onMouseLeave={() => setHoveredIndex(null)}
                  >
                    <TeamCard member={m} variant={variant} />
                  </div>
                );
              });
            })()}
          </div>
        </div>
      </section>

      {/* CTA */}
      <div className="cta-banner">
        <div className="cta-text">
          <h2>انضم إلى مجتمع عطاء</h2>
          <p>كن جزءًا من حركة التغيير الاجتماعي وساهم في بناء مجتمع أكثر تكافلًا وإنسانية.</p>
        </div>
        <div className="cta-btns">
          <Link href="/charities" className="btn-gold">تصفح الجمعيات</Link>
          <Link href="/contact" className="btn-outline">تواصل معنا</Link>
        </div>
      </div>
    </div>
  );
}
