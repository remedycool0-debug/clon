'use client';

import { FormEvent, useState } from 'react';
import {
  ArrowRight,
  BookOpen,
  Calculator,
  ChevronDown,
  CircleCheck,
  Landmark,
  Mail,
  Menu,
  Play,
  Search,
  ShieldCheck,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const navigation = [
  'Aprende a invertir',
  'Herramientas financieras',
  'Protege tus decisiones',
  'Recursos públicos',
];

const relatedTopics = [
  'Antes de empezar',
  'Organiza tus finanzas',
  'Conoce tu perfil de riesgo',
  'Elige a un orientador',
  'Verifica sus credenciales',
  'Haz las preguntas correctas',
];

const featured = [
  {
    icon: Calculator,
    title: 'Calcula una meta de ahorro',
    text: 'Proyecta cuánto necesitas aportar cada mes para alcanzar tu próximo objetivo.',
    tone: 'teal',
  },
  {
    icon: ShieldCheck,
    title: 'Detecta señales de alerta',
    text: 'Aprende a reconocer promesas poco realistas antes de entregar tu dinero.',
    tone: 'navy',
  },
  {
    icon: BookOpen,
    title: 'Guía para tu primera reunión',
    text: 'Lleva una lista clara de preguntas sobre costos, experiencia y posibles conflictos.',
    tone: 'gold',
  },
  {
    icon: Landmark,
    title: 'Explora productos financieros',
    text: 'Compara las características básicas de fondos, bonos y cuentas de inversión.',
    tone: 'coral',
  },
];

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [verification, setVerification] = useState('');
  const [verificationMessage, setVerificationMessage] = useState('');
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  function verifyProfessional(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = verification.trim();
    setVerificationMessage(
      name
        ? `Listo. Preparamos una ruta de verificación para “${name}”.`
        : 'Escribe un nombre o institución para comenzar.',
    );
  }

  function subscribe(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email.trim()) return;
    setSubscribed(true);
  }

  return (
    <>
      <a className="skip-link" href="#contenido">
        Saltar al contenido principal
      </a>

      <div className="utility-bar">
        <div className="shell utility-inner">
          <div className="official-note">
            <span className="mini-mark" aria-hidden="true">HC</span>
            <span>Una iniciativa educativa para tomar mejores decisiones</span>
            <button type="button">Conoce el proyecto <ChevronDown size={13} /></button>
          </div>
          <nav aria-label="Enlaces de utilidad" className="utility-links">
            <a href="#nosotros">Nosotros</a>
            <a href="#contacto">Contacto</a>
            <a href="#boletin">Boletín</a>
          </nav>
        </div>
      </div>

      <header className="site-header" id="inicio">
        <div className="shell brand-row">
          <a className="brand" href="#inicio" aria-label="Horizonte Ciudadano, inicio">
            <span className="brand-seal" aria-hidden="true">
              <span>H</span>
              <i />
            </span>
            <span className="brand-copy">
              <strong>Horizonte</strong>
              <span>CIUDADANO</span>
            </span>
          </a>

          <div className="header-tools">
            <div className={`search-wrap ${searchOpen ? 'is-open' : ''}`}>
              <label className="sr-only" htmlFor="site-search">Buscar en el sitio</label>
              <Input id="site-search" className="site-search" placeholder="¿Qué quieres aprender?" />
              <Button aria-label="Buscar" className="search-button" size="icon-lg" type="button">
                <Search size={20} />
              </Button>
            </div>
            <Button
              aria-expanded={searchOpen}
              aria-label="Mostrar buscador"
              className="mobile-search-toggle"
              onClick={() => setSearchOpen((open) => !open)}
              size="icon-lg"
              type="button"
              variant="ghost"
            >
              <Search size={21} />
            </Button>
            <Button
              aria-expanded={menuOpen}
              aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
              className="menu-toggle"
              onClick={() => setMenuOpen((open) => !open)}
              size="icon-lg"
              type="button"
              variant="ghost"
            >
              {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </Button>
          </div>
        </div>

        <nav aria-label="Navegación principal" className={`primary-nav ${menuOpen ? 'is-open' : ''}`}>
          <div className="shell primary-nav-inner">
            {navigation.map((item) => (
              <a href="#recursos" key={item} onClick={() => setMenuOpen(false)}>
                <span>{item}</span>
                <ChevronDown size={17} />
              </a>
            ))}
          </div>
        </nav>
      </header>

      <div className="breadcrumb-band">
        <nav aria-label="Migas de pan" className="shell breadcrumbs">
          <a href="#inicio">Inicio</a>
          <span>/</span>
          <a href="#aprender">Primeros pasos</a>
          <span>/</span>
          <span aria-current="page">Elegir orientación</span>
        </nav>
      </div>

      <main id="contenido">
        <div className="shell content-layout">
          <aside className="topic-sidebar" aria-label="Temas relacionados">
            <p>PRIMEROS PASOS</p>
            <details open>
              <summary>
                Trabajar con un profesional <ChevronDown size={18} />
              </summary>
              <nav>
                {relatedTopics.map((topic, index) => (
                  <a className={index === 4 ? 'active' : ''} href="#articulo" key={topic}>
                    {topic}
                    {index === 4 && <ArrowRight size={15} />}
                  </a>
                ))}
              </nav>
            </details>
            <a className="sidebar-all" href="#recursos">
              Ver todos los temas <ArrowRight size={16} />
            </a>
          </aside>

          <article className="article" id="articulo">
            <p className="eyebrow">DECISIONES CON INFORMACIÓN</p>
            <h1>Conoce a la persona que orientará tus finanzas</h1>
            <p className="lead">
              Antes de seguir una recomendación, revisa la experiencia, las credenciales y la forma de trabajo de quien te acompaña.
            </p>

            <div className="accent-rule" />

            <p>
              Una buena conversación financiera comienza con transparencia. Pregunta cómo recibe sus honorarios, qué servicios ofrece y si cuenta con experiencia en situaciones parecidas a la tuya.
            </p>
            <p>
              También conviene comprobar la información por tu cuenta. Usa registros públicos, solicita documentos y toma el tiempo necesario antes de decidir. La prisa nunca debería ser parte de una recomendación responsable.
            </p>

            <section className="verification-panel" aria-labelledby="verifica-titulo">
              <div className="verification-copy">
                <span className="section-kicker">COMIENZA AQUÍ</span>
                <h2 id="verifica-titulo">Prepara tu verificación</h2>
                <p>Escribe un nombre o institución y te mostraremos los pasos que deberías revisar.</p>
              </div>
              <form onSubmit={verifyProfessional}>
                <label htmlFor="professional-name">Nombre o institución</label>
                <div className="verification-fields">
                  <Input
                    id="professional-name"
                    onChange={(event) => setVerification(event.target.value)}
                    placeholder="Ej. Andrea Torres"
                    value={verification}
                  />
                  <Button className="verify-button" type="submit">
                    Preparar revisión <ArrowRight size={17} />
                  </Button>
                </div>
                {verificationMessage && (
                  <output className="form-message" aria-live="polite">
                    <CircleCheck size={17} /> {verificationMessage}
                  </output>
                )}
              </form>
            </section>

            <section className="video-card" aria-label="Video educativo">
              <div className="video-graphic" aria-hidden="true">
                <span className="orbit orbit-one" />
                <span className="orbit orbit-two" />
                <span className="video-lines"><i /><i /><i /></span>
              </div>
              <div className="video-copy">
                <span>VIDEO · 3 MIN</span>
                <h2>Tres preguntas que vale la pena hacer</h2>
                <p>Una guía breve para conversar con claridad antes de contratar cualquier servicio.</p>
                <button type="button"><Play size={17} fill="currentColor" /> Ver resumen</button>
              </div>
            </section>
          </article>
        </div>

        <section className="featured-section" id="recursos" aria-labelledby="destacados">
          <div className="shell">
            <div className="section-heading">
              <div>
                <p className="eyebrow">SIGUE APRENDIENDO</p>
                <h2 id="destacados">Recursos destacados</h2>
              </div>
              <a href="#todos">Explorar biblioteca <ArrowRight size={17} /></a>
            </div>
            <div className="featured-grid">
              {featured.map(({ icon: Icon, title, text, tone }) => (
                <article className={`feature-card ${tone}`} key={title}>
                  <div className="feature-icon"><Icon size={25} /></div>
                  <h3>{title}</h3>
                  <p>{text}</p>
                  <a href="#articulo" aria-label={`Leer: ${title}`}>
                    Leer recurso <ArrowRight size={16} />
                  </a>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="learning-banner" id="boletin">
          <div className="shell learning-grid">
            <div>
              <p className="eyebrow">APRENDER ES AVANZAR</p>
              <h2>Una idea clara cada dos semanas.</h2>
              <p>Recibe herramientas prácticas y lecturas breves para cuidar mejor tus decisiones financieras.</p>
            </div>
            {subscribed ? (
              <div className="subscribed-message" role="status">
                <CircleCheck size={26} />
                <span><strong>¡Gracias por sumarte!</strong> Revisa tu correo para completar el registro.</span>
              </div>
            ) : (
              <form className="newsletter-form" onSubmit={subscribe}>
                <label htmlFor="email">Correo electrónico</label>
                <div>
                  <Input
                    id="email"
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="nombre@correo.com"
                    type="email"
                    value={email}
                  />
                  <Button type="submit">Quiero recibirlo <Mail size={17} /></Button>
                </div>
                <small>Sin publicidad. Puedes darte de baja cuando quieras.</small>
              </form>
            )}
          </div>
        </section>
      </main>

      <footer className="footer" id="contacto">
        <div className="shell footer-grid">
          <div>
            <a className="brand footer-brand" href="#inicio">
              <span className="brand-seal" aria-hidden="true"><span>H</span><i /></span>
              <span className="brand-copy"><strong>Horizonte</strong><span>CIUDADANO</span></span>
            </a>
            <p>Educación financiera independiente, explicada de forma simple y útil.</p>
          </div>
          <div>
            <h2>Aprende</h2>
            <a href="#recursos">Guías prácticas</a>
            <a href="#recursos">Herramientas</a>
            <a href="#recursos">Glosario</a>
          </div>
          <div id="nosotros">
            <h2>Proyecto</h2>
            <a href="#nosotros">Quiénes somos</a>
            <a href="#contacto">Contacto</a>
            <a href="#boletin">Novedades</a>
          </div>
          <div>
            <h2>Información</h2>
            <a href="#privacidad">Privacidad</a>
            <a href="#accesibilidad">Accesibilidad</a>
            <a href="#terminos">Términos de uso</a>
          </div>
        </div>
        <div className="shell footer-bottom">
          <span>© 2026 Horizonte Ciudadano</span>
          <span>Contenido educativo. No constituye asesoría financiera.</span>
        </div>
      </footer>
    </>
  );
}
