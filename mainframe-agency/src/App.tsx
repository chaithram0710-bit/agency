import { useEffect, useRef, useState } from 'react';

const VIDEO_URL =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260826_041744_63efcd78-bf7d-4039-99e2-2461e8a61903.mp4';

const SENSITIVITY = 0.8;

function useTypewriter(
  text: string,
  speed = 38,
  startDelay = 600
) {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    let interval: number | undefined;
    const delay = window.setTimeout(() => {
      let index = 0;
      interval = window.setInterval(() => {
        index += 1;
        setDisplayed(text.slice(0, index));
        if (index >= text.length) {
          if (interval) window.clearInterval(interval);
          setDone(true);
        }
      }, speed);
    }, startDelay);

    return () => {
      window.clearTimeout(delay);
      if (interval) window.clearInterval(interval);
    };
  }, [text, speed, startDelay]);

  return { displayed, done };
}

function CopyIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      aria-hidden="true"
    >
      <rect x="3.5" y="1.5" width="7" height="7" rx="1" stroke="currentColor" />
      <rect x="1.5" y="3.5" width="7" height="7" rx="1" stroke="currentColor" />
    </svg>
  );
}

export default function App() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const prevX = useRef<number | null>(null);
  const targetTime = useRef(0);
  const seeking = useRef(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [actionsVisible, setActionsVisible] = useState(false);

  const { displayed, done } = useTypewriter(
    "Glad you stopped in. Good taste tends to find us. Now, what are we building?"
  );

  useEffect(() => {
    const timer = window.setTimeout(() => setActionsVisible(true), 400);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedMetadata = () => {
      targetTime.current = video.currentTime;
    };

    const seekNext = () => {
      seeking.current = false;
      if (Math.abs(video.currentTime - targetTime.current) > 0.001) {
        seeking.current = true;
        video.currentTime = targetTime.current;
      }
    };

    const handleMouseMove = (event: MouseEvent) => {
      if (!video.duration || !Number.isFinite(video.duration)) return;

      if (prevX.current === null) {
        prevX.current = event.clientX;
        return;
      }

      const delta = event.clientX - prevX.current;
      prevX.current = event.clientX;

      targetTime.current = Math.max(
        0,
        Math.min(
          video.duration,
          targetTime.current +
            (delta / window.innerWidth) * SENSITIVITY * video.duration
        )
      );

      if (!seeking.current) {
        seeking.current = true;
        video.currentTime = targetTime.current;
      }
    };

    const handleMouseLeave = () => {
      prevX.current = null;
    };

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('seeked', seekNext);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseout', handleMouseLeave);

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('seeked', seekNext);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseout', handleMouseLeave);
    };
  }, []);

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText('hello@mainframe.co');
    } catch {
      // Clipboard access may be unavailable in some browsers.
    }
  };

  const links = ['Labs', 'Studio', 'Openings', 'Shop'];

  return (
    <main className="relative min-h-screen overflow-hidden bg-black">
      <video
        ref={videoRef}
        className="fixed inset-0 z-0 h-full w-full object-cover"
        style={{ objectPosition: '70% center' }}
        src={VIDEO_URL}
        muted
        playsInline
        preload="auto"
      />

      <div className="fixed inset-0 z-[1] bg-black/10 pointer-events-none" />

      <header className="fixed left-0 top-0 z-10 flex w-full items-center justify-between px-5 py-4 sm:px-8 sm:py-5">
        <a
          href="#"
          className="flex items-center gap-3 text-white"
          style={{ fontFamily: 'var(--font-heading)' }}
          aria-label="Mainframe home"
        >
          <span className="text-[21px] tracking-tight sm:text-[26px]">
            Mainframe®
          </span>
          <span
            className="select-none text-[25px] sm:text-[30px]"
            style={{ letterSpacing: '-0.02em' }}
          >
            ✳︎
          </span>
        </a>

        <nav className="hidden items-center text-[23px] text-white md:flex">
          {links.map((link, index) => (
            <span key={link}>
              <a
                href={`#${link.toLowerCase()}`}
                className="transition-opacity hover:opacity-60"
              >
                {link}
              </a>
              {index < links.length - 1 && ', '}
            </span>
          ))}
        </nav>

        <a
          href="mailto:hello@mainframe.co"
          className="hidden text-[23px] text-white underline underline-offset-2 transition-opacity hover:opacity-60 md:block"
        >
          Get in touch
        </a>

        <button
          type="button"
          aria-label="Toggle navigation"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
          className="relative z-[11] flex flex-col gap-[5px] md:hidden"
        >
          <span
            className={`block h-[2px] w-6 bg-white transition-transform duration-300 ${
              menuOpen ? 'translate-y-[7px] rotate-45' : ''
            }`}
          />
          <span
            className={`block h-[2px] w-6 bg-white transition-opacity duration-300 ${
              menuOpen ? 'opacity-0' : 'opacity-100'
            }`}
          />
          <span
            className={`block h-[2px] w-6 bg-white transition-transform duration-300 ${
              menuOpen ? '-translate-y-[7px] -rotate-45' : ''
            }`}
          />
        </button>
      </header>

      <div
        className={`fixed inset-0 z-[9] flex flex-col justify-center gap-8 bg-black/90 px-8 backdrop-blur-md transition-opacity duration-300 md:hidden ${
          menuOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        }`}
      >
        {links.map((link) => (
          <a
            key={link}
            href={`#${link.toLowerCase()}`}
            onClick={() => setMenuOpen(false)}
            className="text-[32px] font-medium text-white"
          >
            {link}
          </a>
        ))}
        <a
          href="mailto:hello@mainframe.co"
          onClick={() => setMenuOpen(false)}
          className="text-[32px] font-medium text-white underline underline-offset-4"
        >
          Get in touch
        </a>
      </div>

      <section className="relative z-[1] flex h-screen w-full flex-col justify-end overflow-hidden px-5 pb-12 sm:px-8 md:justify-center md:px-10 md:pb-0">
        <div className="relative z-10 max-w-xl">
          <div
            className="pointer-events-none mb-5 select-none text-white sm:mb-6"
            style={{
              fontSize: 'clamp(18px, 4vw, 26px)',
              lineHeight: 1.3,
              fontWeight: 400,
              filter: 'blur(4px)',
            }}
          >
            Hey there, meet A.R.I.A,<br />
            Mainframe&apos;s Adaptive Response Interface Agent
          </div>

          <p
            className="mb-5 min-h-[54px] text-white sm:mb-6"
            style={{
              fontSize: 'clamp(18px, 4vw, 26px)',
              lineHeight: 1.35,
              fontWeight: 400,
            }}
          >
            {displayed}
            {!done && (
              <span className="ml-[2px] inline-block h-[1.1em] w-[2px] align-middle bg-white cursor-blink" />
            )}
          </p>

          <div
            className={`flex flex-wrap gap-y-1 transition-all duration-[400ms] ease-out ${
              actionsVisible
                ? 'translate-y-0 opacity-100'
                : 'translate-y-2 opacity-0'
            }`}
          >
            {[
              'Pitch us an idea',
              'Come work here',
              'Send a brief hello',
              'See how we operate',
            ].map((label) => (
              <a
                key={label}
                href="#"
                className="mx-[0.2em] mb-[0.4em] inline-flex items-center justify-center whitespace-nowrap rounded-full border border-black/10 bg-white px-4 py-[0.3em] text-[13px] text-black transition-colors duration-200 hover:bg-black hover:text-white sm:px-5 sm:text-[15px]"
              >
                {label}
              </a>
            ))}

            <button
              type="button"
              onClick={copyEmail}
              className="mx-[0.2em] mb-[0.4em] inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full border border-white bg-transparent px-4 py-[0.3em] text-[13px] text-white transition-colors duration-200 hover:bg-white hover:text-black sm:gap-3 sm:px-5 sm:text-[15px]"
              aria-label="Copy hello@mainframe.co"
            >
              <span className="underline underline-offset-1">
                Reach us: hello@mainframe.co
              </span>
              <CopyIcon />
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}