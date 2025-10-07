import React, { useState, useEffect } from "react"; 
import InstaEmbed from "./components/InstaEmbed";

const STRIPE_URL = "https://buy.stripe.com/5kQdRb8cbglMf7E7dSdQQ00";

// Поменяла местами 1↔3: теперь третье — главное (идёт первым)
const INSTAGRAM_REELS: string[] = [
  "https://www.instagram.com/reel/DJmUkiNsZe1/", // бывшее 3-е — теперь главное
  "https://www.instagram.com/reel/DJSHB73ogs1/", // прежнее 2-е
  "https://www.instagram.com/reel/DJjUiEnM-A_/", // прежнее 1-е
  "https://www.instagram.com/reel/DJoAXfKs6tu/",
  "https://www.instagram.com/reel/DFX57cQobmS/"
];

function useCountdown(hours = 12) {
  const [end] = useState(() => Date.now() + hours * 3600 * 1000);
  const [left, setLeft] = useState(end - Date.now());
  useEffect(() => {
    const id = setInterval(() => setLeft(Math.max(0, end - Date.now())), 1000);
    return () => clearInterval(id);
  }, [end]);
  const total = Math.max(0, left);
  const h = Math.floor(total / 3600000);
  const m = Math.floor((total % 3600000) / 60000);
  const s = Math.floor((total % 60000) / 1000);
  return { h, m, s, finished: total <= 0 };
}

function SectionMarker({ n }: { n: string }) {
  return (
    <div className="section-marker" aria-hidden="true">
      <span className="marker-number">{n}</span>
      <span className="marker-line" />
      <style jsx>{`
        .section-marker{
          position:absolute;
          left: 1rem;
          top: 1.5rem;
          display:flex;
          align-items:center;
          gap:8px;
          z-index:10;
          opacity:0;
          transform: translateY(6px);
          animation: marker-in .7s ease forwards;
          animation-delay: .15s;
        }
        @media (min-width:1024px){
          .section-marker{ left:0; top:0.25rem; transform: translate(-56px, 6px); }
        }
        .marker-number{
          font-weight:700; font-size:11px; letter-spacing:.12em;
          color: rgba(168,181,192,.78);
        }
        @media (min-width:1024px){ .marker-number{ font-size:12px; } }
        .marker-line{
          display:inline-block; width:24px; height:1px;
          background: linear-gradient(90deg, rgba(212,175,122,.45) 0%, transparent 100%);
        }
        @media (min-width:1024px){ .marker-line{ width:36px; } }
        @keyframes marker-in {
          from { opacity:0; transform: translateY(10px); }
          to { opacity:1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

function ReviewLightbox({ isOpen, onClose, imageSrc, reviewNumber }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/85 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="max-w-2xl max-h-[90vh] relative" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onClose}
          className="absolute -top-10 right-0 text-white text-2xl hover:text-gray-300 transition-colors"
          aria-label="Закрыть"
        >
          ✕
        </button>
        <img src={imageSrc} alt={`Отзыв ${reviewNumber}`} className="w-full h-auto rounded-2xl shadow-2xl" />
      </div>
    </div>
  );
}

function ScrollProgress() {
  const [scrollProgress, setScrollProgress] = useState(0);
  useEffect(() => {
    const updateScrollProgress = () => {
      const scrollPx = document.documentElement.scrollTop;
      const winHeightPx = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrolled = (scrollPx / winHeightPx) * 100;
      setScrollProgress(scrolled);
    };
    window.addEventListener('scroll', updateScrollProgress);
    updateScrollProgress();
    return () => window.removeEventListener('scroll', updateScrollProgress);
  }, []);
  return (
    <div className="fixed top-0 left-0 w-full h-1 bg-gray-200 z-50">
      <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-200" style={{ width: `${scrollProgress}%` }} />
    </div>
  );
}

function HighlightedDesc({
  text,
  primaryHighlight,
  extraPhrases = []
}: { text: string; primaryHighlight?: string; extraPhrases?: string[]; }) {
  const escapeHtml = (s: string) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  let html = escapeHtml(text);
  if (primaryHighlight) {
    const ph = escapeHtml(primaryHighlight);
    html = html.replace(
      new RegExp(ph.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g"),
      `<span class="text-blue-600 font-semibold">${ph}</span>`
    );
  }
  for (const phrase of extraPhrases) {
    const p = escapeHtml(phrase);
    html = html.replace(
      new RegExp(p.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g"),
      `<span class="text-blue-600 font-semibold">${p}</span>`
    );
  }
  return <span dangerouslySetInnerHTML={{ __html: html }} />;
}

function CountdownPill({ finished, h, m, s }:{ finished:boolean; h:number; m:number; s:number; }) {
  return (
    <div className="mb-4 sm:mb-6">
      <div className="inline-flex items-center gap-2 rounded-full bg-orange-500 px-3 sm:px-4 py-1.5 sm:py-2 hover:bg-orange-600 transition-colors">
        <span className="text-white">⏰</span>
        {!finished ? (
          <>
            <span className="text-white text-xs sm:text-sm font-medium">До конца:</span>
            <span className="font-bold tabular-nums text-white text-sm sm:text-base">
              {String(h).padStart(2, "0")}:
              {String(m).padStart(2, "0")}:
              {String(s).padStart(2, "0")}
            </span>
          </>
        ) : (
          <span className="font-semibold text-white text-sm">Время истекло</span>
        )}
      </div>
    </div>
  );
}

export default function App() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [viewersCount, setViewersCount] = useState(12);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImage, setLightboxImage] = useState("");
  const [lightboxReviewNumber, setLightboxReviewNumber] = useState(1);
  const [showStickyCTA, setShowStickyCTA] = useState(false);
  const [parOffset, setParOffset] = useState(0);

  const toggleFaq = (i: number) => setOpenFaq(openFaq === i ? null : i);
  const { h, m, s, finished } = useCountdown(12);

  useEffect(() => {
    const updateViewers = () => {
      setViewersCount(prev => {
        const change = Math.floor(Math.random() * 5) - 2; // -2..+2
        const next = prev + change;
        return Math.max(8, Math.min(18, next));
      });
    };
    const interval = setInterval(updateViewers, 8000 + Math.random() * 7000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = (window.scrollY / document.documentElement.scrollHeight) * 100;
      setShowStickyCTA(scrolled > 30);
      if (window.innerWidth < 768) {
        const off = Math.min(8, window.scrollY / 180); // чуть больше «параллакса» на мобиле
        setParOffset(off);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const openLightbox = (imageSrc: string, reviewNumber: number) => {
    setLightboxImage(imageSrc);
    setLightboxReviewNumber(reviewNumber);
    setLightboxOpen(true);
  };

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add("head-in"); }),
      { threshold: 0.3 }
    );
    document.querySelectorAll<HTMLElement>(".js-heading").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Глобальные токены */}
      <style jsx global>{`
        :root{
          --lavender: #BBAAE6;      /* пудрово-лавандовый для «Бонусов» */
          --powder-teal: #A7D4CC;   /* мягкий холодный бирюзовый */
          --ink-90: #0B0B0C;
        }
        .glass-btn{
          background: rgba(15,23,42,0.85);
          color: #fff;
          border: 1px solid rgba(255,255,255,.18);
          backdrop-filter: saturate(120%) blur(8px);
          -webkit-backdrop-filter: saturate(120%) blur(8px);
          transition: all 0.3s ease;
        }
        .glass-btn:hover{
          transform: translateY(-2px);
          box-shadow: 0 10px 30px rgba(0,0,0,0.15);
        }
      `}</style>

      <ReviewLightbox 
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        imageSrc={lightboxImage}
        reviewNumber={lightboxReviewNumber}
      />

      <ScrollProgress />

      <div className="fixed bottom-6 left-6 z-40 hidden lg:block">
        <div className="flex items-center gap-2 text-sm text-gray-600 bg-white/90 backdrop-blur-md px-4 py-3 rounded-full shadow-lg border border-gray-200 hover:scale-105 transition-transform">
          <div className="relative">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <div className="absolute inset-0 w-2 h-2 bg-green-400 rounded-full animate-ping"></div>
          </div>
          <span className="font-medium tabular-nums">{viewersCount} онлайн</span>
        </div>
      </div>

      <header className="fixed top-0 left-0 right-0 bg-white/85 backdrop-blur-md z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center">
          <div className="text-lg sm:text-xl font-bold text-gray-900">Beauty Scripts</div>
          <a
            href={STRIPE_URL}
            target="_blank"
            rel="noopener"
            className="glass-btn px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg text-sm sm:text-base font-medium min-h-[44px] flex items-center justify-center"
            aria-label="Купить скрипты"
          >
            Купить
          </a>
        </div>
      </header>

      {/* HERO — «отдалённый» кадр, больше пустоты справа */}
      <section
        className="relative min-h-[88vh] flex items-center pt-24 hero-bg"
        style={{
          backgroundPosition: typeof window !== "undefined" && window.innerWidth < 768
            ? `75% ${40 + parOffset}%` // чуть правее + параллакс на мобиле
            : undefined
        }}
      >
        {/* Мягкая вуаль слева→вправо, чтобы текст читался, не перекрывая лицо */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-r from-white/75 via-white/40 to-transparent md:from-white/55 md:via-white/25 md:to-transparent"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 w-full">
          <div className="max-w-2xl">
            <h1 className="js-heading text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-extrabold leading-tight mb-4 sm:mb-5 text-gray-900">
              Скрипты, которые превращают <span className="text-blue-600">сообщения в деньги</span>
            </h1>

            <div className="result-subtitle mb-4 sm:mb-5">
              <p className="text-base sm:text-lg lg:text-xl font-semibold leading-relaxed text-gray-900">
                <span className="whitespace-nowrap">Проверенная система</span>{" "}
                <span className="whitespace-nowrap">общения с клиентами</span>{" "}
                <span className="whitespace-nowrap">для бьюти-мастеров</span>
              </p>
            </div>

            <p className="text-sm sm:text-base lg:text-lg text-gray-800 mb-6 sm:mb-8 leading-relaxed">
              <span className="font-medium">Результат:</span>{" "}
              закрытые возражения, увеличенный средний чек, экономия времени
            </p>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 mb-4">
              <a
                href={STRIPE_URL}
                target="_blank"
                rel="noopener"
                className="glass-btn inline-flex items-center gap-2 sm:gap-3 px-5 sm:px-6 lg:px-7 py-3 sm:py-3.5 lg:py-4 rounded-xl text-base sm:text-lg font-semibold min-h-[48px]"
                aria-label="Купить скрипты за 19 евро"
              >
                Купить <span className="inline-block ml-1">→</span>
              </a>
              <div className="hidden sm:flex items-center gap-2 text-xs sm:text-sm">
                <span className="px-2 py-1 bg-black text-white rounded">Apple Pay</span>
                <span className="px-2 py-1 bg-blue-600 text-white rounded">Google Pay</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs text-gray-700">
              <span className="px-2 py-1 bg-white/80 rounded border border-gray-200">🔒 Безопасная оплата</span>
              <span className="px-2 py-1 bg-white/80 rounded border border-gray-200">✓ Stripe</span>
            </div>
          </div>
        </div>

        <style jsx>{`
          .hero-bg{
            background-image: url('/images/IMG_6243.jpeg');
            background-size: cover;
            background-position: right center; /* больше пустоты справа, как в оригинале */
          }
          @media (max-width: 768px){
            .hero-bg{
              background-position: 75% 40%;
            }
          }
          .result-subtitle {
            position: relative;
            padding-top: 12px;
            margin-top: 8px;
          }
          .result-subtitle::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 60px;
            height: 2px;
            background: linear-gradient(90deg, rgba(59,130,246,.5) 0%, transparent 100%);
          }
          @media (max-width: 640px) {
            .result-subtitle::before { width: 50px; }
          }
        `}</style>
      </section>

      {/* 01 — холодный серый градиент */}
      <section id="comparison" className="relative py-12 sm:py-14 lg:py-16 bg-gradient-to-b from-slate-50 via-slate-50/70 to-white">
        <SectionMarker n="01" />
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-2">
            <h2 className="js-heading text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
              Как изменится ваша <span className="text-blue-600">работа с клиентами</span>
            </h2>
            <p className="mt-2 sm:mt-3 text-sm sm:text-base text-gray-600 reveal-up" style={{animationDelay:"120ms"}}>
              Сравните результаты до и после внедрения скриптов
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-4 sm:gap-5 max-w-5xl mx-auto mt-6 sm:mt-8">
            <div className="bg-white rounded-2xl p-4 sm:p-6 border border-gray-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 reveal-up">
              <div className="text-center mb-4">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-50 text-red-600 rounded-full font-medium text-sm">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  Сейчас
                </div>
              </div>
              <ul className="space-y-3 text-sm lg:text-base text-gray-800">
                {[
                  "«Сколько стоит?» → Отвечаете только ценой и тишина.",
                  "«Подумаю» → Не знаете, что ответить: клиент уходит.",
                  "«Переписка 30+ минут» → Клиент остывает, теряете заявку.",
                  "«10 заявок» → Долгие диалоги приводят только к 2–3 записям.",
                ].map((t, i) => (
                  <li key={i} className="flex gap-2 hover:bg-red-50 p-2 rounded-lg transition-colors">
                    <svg className="w-5 h-5 mt-0.5 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white rounded-2xl p-4 sm:p-6 border border-gray-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 reveal-up" style={{animationDelay:"120ms"}}>
              <div className="text-center mb-4">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-600 rounded-full font-medium text-sm">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  После
                </div>
              </div>
              <ul className="space-y-3 text-sm lg:text-base text-gray-800">
                {[
                  "«Сколько стоит?» → Презентуете ценность, получаете запись.",
                  "«Подумаю» → Мягкое возражение возвращает к записи.",
                  "«Переписка 5 минут» → Готовые фразы ведут к быстрой записи.",
                  "«10 заявок» → Чёткие диалоги дают 6–7 записей.",
                ].map((t, i) => (
                  <li key={i} className="flex gap-2 hover:bg-green-50 p-2 rounded-lg transition-colors">
                    <svg className="w-5 h-5 mt-0.5 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 02 — холодный голубой слой */}
      <section id="why" className="relative py-12 sm:py-14 lg:py-16 bg-gradient-to-b from-blue-50/40 via-blue-50/20 to-white">
        <SectionMarker n="02" />
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center">
            <h2 className="js-heading text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
              Почему это <span className="text-rose-700">важно</span>
            </h2>
            <p className="mt-2 sm:mt-3 text-sm sm:text-base text-gray-600 reveal-up" style={{animationDelay:"120ms"}}>
              Каждая потерянная заявка — это упущенная прибыль
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5 mt-6 sm:mt-8">
            {[
              {img:"/images/money.png", title:"Сливаются деньги на рекламу", text:"Платите за заявки, но конвертируете лишь 20–30%. Остальные — выброшенный бюджет."},
              {img:"/images/clock.png", title:"Тратится время впустую", text:"По 30–40 минут на переписку с каждым. Уходит 3–4 часа в день."},
              {img:"/images/door.png", title:"Заявки уходят к конкуренту", text:"Пока вы думаете, клиент записывается к тем, кто отвечает быстро и уверенно."},
            ].map((c,i)=>(
              <div key={i} className="rounded-2xl border p-5 text-center bg-white hover:shadow-lg transition-all duration-300 hover:-translate-y-1 reveal-up" style={{animationDelay:`${i*80}ms`}}>
                <img src={c.img} alt="" className="mx-auto mb-4 w-14 h-14 object-contain" loading="lazy" />
                <h3 className="font-semibold text-base">{c.title}</h3>
                <p className="mt-2 text-sm text-gray-600 leading-relaxed">{c.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 03 — мягкий бирюзовый градиент */}
      <section id="for" className="relative py-12 sm:py-14 lg:py-16 bg-gradient-to-br from-emerald-50/30 via-teal-50/25 to-white">
        <SectionMarker n="03" />
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h2 className="js-heading text-2xl sm:text-3xl lg:text-4xl font-bold text-center text-gray-900">
            Кому подходят <span className="text-emerald-700">скрипты</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 mt-6 sm:mt-8">
            {[
              {img:"/images/salon.png", title:"Владельцам салонов и студий", text:"Стандарт ответов, скорость и контроль: все отвечают одинаково сильно."},
              {img:"/images/med.png", title:"Медицинским центрам", text:"Админы закрывают заявки, врачи работают с реальными пациентами."},
              {img:"/images/team.png", title:"Мастерам-универсалам", text:"Ответы на типовые ситуации ведут быстрее к записи, увереннее в чате."},
              {img:"/images/one.png", title:"Узким специалистам", text:"Ногти, брови, ресницы, волосы, косметология, перманент. Блоки под услугу."},
            ].map((c,i)=>(
              <div
                key={i}
                className="bg-white/85 backdrop-blur-sm rounded-2xl p-5 border-2 border-emerald-200/40 hover:border-emerald-300/60 hover:shadow-[0_0_15px_rgba(16,185,129,.15)] transition-all duration-300 hover:-translate-y-0.5 reveal-up"
                style={{animationDelay:`${i*80}ms`}}
              >
                <div className="flex items-center gap-3">
                  <img src={c.img} alt="" className="w-12 h-12 object-contain" loading="lazy" />
                  <h3 className="text-lg font-bold text-gray-900">{c.title}</h3>
                </div>
                <p className="mt-3 text-sm text-gray-600 leading-relaxed">{c.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 04 — холодный серый слой */}
      <section id="whats-included" className="relative py-12 sm:py-14 lg:py-16 bg-gradient-to-b from-slate-50/60 to-white">
        <SectionMarker n="04" />
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center">
            <h2 className="js-heading text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
              Что входит в <span className="text-blue-600">систему скриптов</span>
            </h2>
            <p className="mt-2 sm:mt-3 text-sm sm:text-base text-gray-600 reveal-up" style={{animationDelay:"120ms"}}>Полный набор инструментов для увеличения продаж</p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-5 mt-6 sm:mt-8">
            {[
              { img:"/images/xmind.png",  title:"Готовые диалоги",         desc:"Контакты до оплаты: приветствия, презентация ценности, запись. Всё пошагово.", highlight:"презентация ценности" },
              { img:"/images/target.png", title:"Закрытие возражений",     desc:"«Дорого», «Подумаю», «У другого дешевле». Мягкие ответы без давления.", highlight:"мягкие ответы без давления" },
              { img:"/images/salons.png", title:"Под каждую услугу",       desc:"Маникюр, брови, ресницы, косметология, массаж. Учтена специфика каждой ниши.", highlight:"учтена специфика каждой ниши" },
              { img:"/images/bucle.png",  title:"Возврат клиентов",        desc:"Сценарии повторных записей и реактивации «спящей» базы без рекламы.", highlight:"реактивации «спящей» базы без рекламы" },
              { img:"/images/phone.png",  title:"Гайд по внедрению",       desc:"Старт за один день: пошаговый план и стандарты для команды.", highlight:"Старт за один день" },
              { img:"/images/rocket.png", title:"Итог",                    desc:"Больше записей, выше средний чек, меньше времени в переписке.", highlight:"выше средний чек", big:true },
            ].map((item, k) => (
              <div key={k} className="rounded-2xl border p-4 sm:p-5 bg-white hover:shadow-lg transition-all duration-300 hover:-translate-y-1 reveal-up" style={{animationDelay:`${k*80}ms`}}>
                <img
                  src={item.img}
                  alt=""
                  className={`${item.big ? "w-14 h-14" : "w-12 h-12"} object-contain mb-3`}
                  loading="lazy"
                />
                <h3 className="text-lg font-bold text-gray-900">{item.title}</h3>
                <p className="mt-2 text-sm text-gray-600 leading-relaxed">
                  <HighlightedDesc
                    text={item.desc}
                    primaryHighlight={item.highlight}
                    extraPhrases={["без давления", "каждой ниши"]}
                  />
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 05 — пудрово-лавандовый + деликатные конфетти */}
      <section id="bonuses" className="relative py-12 sm:py-14 lg:py-16 bg-gradient-to-br from-purple-50/45 via-violet-50/35 to-rose-50/35 overflow-hidden">
        <SectionMarker n="05" />
        {/* Конфетти — очень лёгкие, редкие */}
        <div className="confetti-container">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="confetti" style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2.5}s`,
              animationDuration: `${3.5 + Math.random() * 1.5}s`
            }} />
          ))}
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative">
          <div className="text-center">
            <h2 className="js-heading text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
              <span style={{color:'var(--lavender)'}}>Бонусы</span> при покупке
            </h2>
            <p className="mt-2 sm:mt-3 text-sm sm:text-base text-gray-600 reveal-up" style={{animationDelay:"120ms"}}>
              Суммарная ценность — 79€. Сегодня идут бесплатно со скриптами
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5 mt-6 sm:mt-8">
            {[
              { image: "/images/bonus1.png", title: "Гайд «Работа с клиентской базой»", desc: "Повторные записи без рекламы → возвращайте старых клиентов.", old: "27€" },
              { image: "/images/bonus2.png", title: "Чек-лист «30+ источников клиентов»", desc: "Платные и бесплатные способы → где взять заявки уже сегодня.", old: "32€" },
              { image: "/images/bonus3.png", title: "Гайд «Продажи на консультации»", desc: "5 этапов продаж → мягкий апсейл дополнительных услуг.", old: "20€" },
            ].map((b, i) => (
              <div key={i} className="rounded-2xl p-5 text-center bg-white shadow-sm border hover:shadow-xl hover:-translate-y-2 transition-all duration-300 reveal-up" style={{animationDelay:`${i*100}ms`}}>
                <div className="mb-3 sm:mb-4">
                  <img src={b.image} alt={`Бонус ${i + 1}`} className="w-28 h-36 sm:w-32 sm:h-40 mx-auto object-cover rounded-lg" loading="lazy" />
                </div>
                <h3 className="text-base font-bold text-gray-900">{b.title}</h3>
                <p className="mt-2 text-sm text-gray-600 leading-relaxed">{b.desc}</p>
                <div className="mt-3 flex items-center justify-center gap-2">
                  <span className="text-base font-bold text-gray-400 line-through">{b.old}</span>
                  <span className="text-lg font-bold text-green-600">0€</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <style jsx>{`
          .confetti-container {
            position: absolute; inset: 0; pointer-events: none; overflow: hidden;
          }
          .confetti {
            position: absolute;
            width: 8px; height: 8px;
            background: linear-gradient(45deg, #8b5cf6, #ec4899);
            opacity: 0; animation: confetti-fall linear infinite;
            border-radius: 2px;
          }
          .confetti:nth-child(3n) { background: linear-gradient(45deg, #60a5fa, #22d3ee); }
          .confetti:nth-child(4n) { background: linear-gradient(45deg, #34d399, #10b981); }
          @keyframes confetti-fall {
            0% { transform: translateY(-80px) rotate(0deg); opacity: 0.9; }
            100% { transform: translateY(100vh) rotate(360deg); opacity: 0; }
          }
        `}</style>
      </section>

      {/* 06 — заголовок по центру, тонкое подчёркивание */}
      <section id="immediate" className="relative py-12 sm:py-14 lg:py-16 bg-gradient-to-b from-slate-50/55 to-white">
        <SectionMarker n="06" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h2 className="js-heading text-center text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 relative inline-block mx-auto">
            <span className="text-teal-700">Что изменится сразу</span>
            <span className="block mx-auto mt-2 h-[2px] w-24 bg-gradient-to-r from-teal-700/70 via-teal-500/70 to-sky-600/70 rounded-full"></span>
          </h2>

          <div className="space-y-4 sm:space-y-5 mt-6 sm:mt-8">
            {[
              "Перестанешь терять заявки из-за слабых ответов.",
              "Начнёшь закрывать больше записей уже с первого дня.",
              "Повысишь средний чек через правильные предложения.",
              "Станешь увереннее — на всё есть готовый ответ.",
            ].map((t, i) => (
              <div key={i} className="flex items-start gap-4 bg-white/80 p-5 rounded-2xl border border-slate-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 reveal-up" style={{animationDelay:`${i*80}ms`}}>
                <div className="w-6 h-6 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-4 h-4 text-teal-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                </div>
                <span className="text-base lg:text-lg font-medium text-gray-800">{t}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 07 — отзывы компактнее, без тёмных рамок; Reels: первый (теперь «3-й») крупнее */}
      <section id="reviews" className="relative py-12 sm:py-14 lg:py-16 bg-gradient-to-b from-blue-50/25 via-blue-50/10 to-white">
        <SectionMarker n="07" />
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h2 className="js-heading text-2xl sm:text-3xl lg:text-4xl font-bold text-center text-gray-900 mb-8 sm:mb-10">
            Отзывы клиентов
          </h2>

          {/* Фото-отзывы — более компактные на мобиле, без тёмной окантовки */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-4 mb-8 sm:mb-10">
            {[1,2,3,4].map((n)=>(
              <div key={n} className="group cursor-pointer reveal-up" style={{animationDelay:`${n*60}ms`}}>
                <img
                  src={`/images/reviews/review${n}.png`}
                  alt={`Отзыв ${n}`}
                  className="w-full h-44 sm:h-56 lg:h-64 object-cover rounded-xl border border-gray-200 hover:shadow-lg transition-all duration-300 hover:scale-[1.02]"
                  onClick={() => openLightbox(`/images/reviews/review${n}.png`, n)}
                  loading="lazy"
                />
              </div>
            ))}
          </div>

          {/* Reels — первый (теперь «третье» видео) крупнее, чтобы казалось «главным» */}
          <div className="flex gap-3 sm:gap-4 justify-center items-start mb-8 overflow-x-auto pb-2 reels-row">
            {INSTAGRAM_REELS.map((url, idx) => (
              <div
                key={url}
                className={`reel-card rounded-xl overflow-hidden border-2 border-gray-200 shadow-md flex-shrink-0 hover:shadow-xl transition-all duration-300 ${
                  idx === 0 ? "scale-105" : "hover:scale-[1.02]"
                }`}
                style={{animationDelay:`${idx*100}ms`}}
              >
                <InstaEmbed url={url} maxWidth={idx === 0 ? 280 : 260} />
              </div>
            ))}
          </div>
        </div>

        <style jsx>{`
          .reels-row { scroll-snap-type: x mandatory; }
          .reels-row > * { scroll-snap-align: center; }
          .reel-card { width: 180px; height: 320px; }
          @media (min-width: 640px){ .reel-card { width: 220px; height: 391px; } }
          @media (min-width: 1024px){ .reel-card { width: 260px; height: 462px; } }
          .reel-card :global(iframe) { width: 100% !important; height: 100% !important; display: block; border: none; }
        `}</style>
      </section>

      {/* 08 — оффер: % меняем на 85%, подзаголовок расположен аккуратнее на мобиле */}
      <section id="offer" className="relative py-12 sm:py-14 lg:py-16 bg-gradient-to-b from-slate-50/40 to-white">
        <SectionMarker n="08" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-8 sm:mb-10">
            <h2 className="js-heading text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-900">
              Полная система со скидкой <span className="text-blue-600">85%</span>
            </h2>
            {/* Переносим «специальное…» чуть ниже и делаем бейдж на мобиле, чтобы читалось лучше */}
            <p className="mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/70 border border-gray-200 text-xs sm:text-sm text-gray-600">
              Специальное предложение на этой неделе • Предложение действует ограниченное время
            </p>
          </div>

          <div className="max-w-lg mx-auto">
            <div className="rounded-3xl p-8 bg-slate-800/95 text-white shadow-2xl relative overflow-hidden hover:shadow-3xl transition-all duration-300 hover:scale-[1.01] reveal-up">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full -translate-y-16 translate-x-16" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-rose-400/10 rounded-full translate-y-12 -translate-x-12" />

              <div className="relative z-10 text-center">
                <div className="text-xs sm:text-sm uppercase tracking-wide text-gray-300 mb-3">Полный доступ</div>
                <div className="flex items-center justify-center gap-4 mb-6">
                  <span className="text-gray-400 line-through text-2xl">127€</span>
                  <span className="text-5xl font-extrabold text-white">19€</span>
                </div>

                <CountdownPill finished={finished} h={h} m={m} s={s} />

                <a
                  href={STRIPE_URL}
                  target="_blank"
                  rel="noopener"
                  className="block w-full text-center rounded-xl bg-blue-500 text-white font-bold py-4 px-6 hover:bg-blue-600 transition-all transform hover:scale-105 shadow-lg hover:shadow-xl mb-4 min-h-[48px]"
                  aria-label="Купить полную систему со скидкой 85% — 19 евро"
                >
                  Получить со скидкой 85%
                </a>

                <div className="text-xs text-gray-300 mb-6">Без скрытых платежей • Пожизненный доступ • Обновления включены</div>

                <div className="text-left mb-6">
                  <h3 className="text-lg font-bold text-white mb-3 text-center">Что входит:</h3>
                  <ul className="space-y-2 text-sm text-gray-200">
                    {[
                      "Готовые диалоги для всех ситуаций",
                      "Шаблоны под конкретную услугу",
                      "Бонус: гайд по работе с базой (27€)",
                      "Бонус: 30+ источников клиентов (32€)",
                      "Бонус: продажи на консультации (20€)",
                      "Пожизненный доступ и обновления",
                    ].map((t, i) => (
                      <li key={i} className="flex gap-2 items-start">
                        <span className="w-4 h-4 mt-0.5 text-green-400 flex-shrink-0">✓</span>
                        <span>{t}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex items-center justify-center gap-2 text-xs flex-wrap">
                  <div className="px-2 py-1 bg-black text-white rounded">Apple Pay</div>
                  <div className="px-2 py-1 bg-white/20 text-white rounded">Google Pay</div>
                  <div className="px-2 py-1 bg-white/20 text-white rounded">Visa</div>
                  <div className="px-2 py-1 bg-white/20 text-white rounded">MasterCard</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 09 — FAQ с мягким серым фоном */}
      <section id="faq" className="relative py-12 sm:py-14 lg:py-16 bg-gradient-to-b from-slate-50/60 to-white">
        <SectionMarker n="09" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h2 className="js-heading text-2xl sm:text-3xl lg:text-4xl font-bold text-center text-gray-900">
            Частые вопросы
          </h2>

          <div className="space-y-3 sm:space-y-4 mt-6 sm:mt-8">
            {[
              { q: "Сработает в моей нише?", a: "Да. База универсальная и блоки под ногти/бровы/ресницы/волосы/косметологию/перманент." },
              { q: "Не будет ли звучать «по-скриптовому»?", a: "Нет. Формулировки живые, адаптируешь под свой тон. Главное — следовать алгоритму." },
              { q: "Зачем это админам?", a: "Единый стандарт повышает конверсию, скорость и управляемость. Новички включаются быстрее." },
              { q: "Когда будут результаты?", a: "Часто в первые 24 часа: готовые фразы экономят время и быстрее ведут к записи." },
            ].map((f, i) => (
              <div key={i} className="border border-gray-200 rounded-2xl overflow-hidden bg-white hover:shadow-lg transition-all duration-300 reveal-up" style={{animationDelay:`${i*80}ms`}}>
                <button
                  onClick={() => toggleFaq(i)}
                  className="w-full px-6 lg:px-8 py-5 text-left hover:bg-gray-50 flex justify-between items-center transition-colors min-h-[48px]"
                  aria-label={`Вопрос: ${f.q}`}
                >
                  <span className="font-semibold text-base lg:text-lg text-gray-900 pr-4">{f.q}</span>
                  <span className={`w-5 h-5 text-gray-400 transition-transform flex-shrink-0 ${openFaq === i ? "rotate-180" : ""}`}>⌄</span>
                </button>
                {openFaq === i && (
                  <div className="px-6 lg:px-8 py-5 border-t border-gray-200">
                    <p className="text-sm lg:text-base text-gray-700 leading-relaxed">{f.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="py-8 sm:py-10 lg:py-12 bg-white border-t border-gray-200 text-center">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">Beauty Scripts</div>
          <p className="text-sm sm:text-base text-gray-500">© {new Date().getFullYear()} Все права защищены</p>
        </div>
      </footer>

      {showStickyCTA && (
        <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur border-t border-gray-200 p-3 z-50 lg:hidden shadow-2xl animate-slide-up">
          <a
            href={STRIPE_URL}
            target="_blank"
            rel="noopener"
            className="w-full bg-gray-900 text-white py-3 px-4 rounded-xl font-semibold text-sm text-center block hover:bg-gray-800 transition-all flex items-center justify-between min-h-[48px]"
            aria-label="Купить скрипты за 19 евро"
          >
            <span>Скрипты — 19€</span>
            <span>Купить →</span>
          </a>
        </div>
      )}

      <style jsx>{`
        @keyframes fade-in { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slide-up { from { transform: translateY(100%); } to { transform: translateY(0); } }

        .reveal-up { opacity: 0; animation: fade-in 0.8s ease-out forwards; }
        .animate-slide-up { animation: slide-up 0.3s ease-out; }

        .js-heading{
          opacity: 0;
          transform: translateY(14px);
          transition: opacity .7s ease, transform .7s ease;
          will-change: opacity, transform;
        }
        .js-heading.head-in{
          opacity: 1;
          transform: translateY(0);
        }
      `}</style>
    </div>
  );
}
