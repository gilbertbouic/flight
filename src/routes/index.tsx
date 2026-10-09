import { useEffect, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Grid3x3, Moon, Sun } from "lucide-react";
import { FlightCanvas } from "@/game/FlightCanvas";
import { hudBus, inputState, installProbe, simState } from "@/game/input";
import { resetRun } from "@/game/aperture";
import { resetSim } from "@/game/sim";

export const Route = createFileRoute("/")({ component: Home });

export function Home() {
  const [mounted, setMounted] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [night, setNight] = useState(false);
  const [wire, setWire] = useState(false);
  const [locked, setLocked] = useState(false);
  const [cleared, setCleared] = useState(false);
  const [grade, setGrade] = useState(0);
  const nightRef = useRef(false);
  const wireRef = useRef(false);
  const altRef = useRef<HTMLElement>(null);
  const aglRef = useRef<HTMLSpanElement>(null);
  const spdRef = useRef<HTMLElement>(null);
  const hdgRef = useRef<HTMLSpanElement>(null);
  const placeRef = useRef<HTMLParagraphElement>(null);
  const scoreRef = useRef<HTMLElement>(null);
  const deckRef = useRef<HTMLParagraphElement>(null);
  const altCard = useRef<HTMLDivElement>(null);
  const ticksRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    installProbe();
    const onLock = () => setLocked(document.pointerLockElement instanceof HTMLCanvasElement);
    document.addEventListener("pointerlockchange", onLock);
    const onKey = (e: KeyboardEvent) => {
      if (e.code.startsWith("Arrow") || e.code === "Space") e.preventDefault();
      if (e.repeat) return;
      if (e.code === "KeyN") {
        nightRef.current = !nightRef.current;
        setNight(nightRef.current);
      } else if (e.code === "KeyF") {
        wireRef.current = !wireRef.current;
        setWire(wireRef.current);
      } else if (e.code === "KeyR") {
        resetSim(simState);
        resetRun();
        setCleared(false);
        setGrade(0);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerlockchange", onLock);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  useEffect(() => {
    if (!playing) return;
    let frame = 0;
    let last = -1;
    const paint = () => {
      frame = requestAnimationFrame(paint);
      if (hudBus.tick === last) return;
      last = hudBus.tick;
      if (altRef.current) altRef.current.textContent = hudBus.alt;
      if (aglRef.current) aglRef.current.textContent = `${hudBus.agl} m ground`;
      if (spdRef.current) spdRef.current.textContent = hudBus.spd;
      if (hdgRef.current) hdgRef.current.textContent = `${hudBus.hdg}°`;
      if (placeRef.current) placeRef.current.textContent = hudBus.call;
      if (scoreRef.current) scoreRef.current.textContent = hudBus.score;
      if (deckRef.current) deckRef.current.textContent = hudBus.deck;
      if (hudBus.locks !== grade) setGrade(hudBus.locks);
      if (hudBus.done) setCleared(true);
      altCard.current?.setAttribute("data-warn", hudBus.warn ? "true" : "false");
      const marks = ticksRef.current?.children;
      if (marks) {
        for (let i = 0; i < marks.length; i++) {
          marks[i]?.setAttribute("data-on", i < hudBus.ticks ? "true" : "false");
        }
      }
    };
    frame = requestAnimationFrame(paint);
    return () => cancelAnimationFrame(frame);
  }, [playing, grade]);

  function toggleNight() {
    nightRef.current = !nightRef.current;
    setNight(nightRef.current);
  }

  function toggleWire() {
    wireRef.current = !wireRef.current;
    setWire(wireRef.current);
  }

  function restart() {
    resetSim(simState);
    resetRun();
    setCleared(false);
    setGrade(0);
    inputState.lookX = 0;
    inputState.lookY = 0;
  }

  function start() {
    restart();
    inputState.playing = true;
    setPlaying(true);
    const canvas = document.querySelector("canvas");
    if (canvas && !window.matchMedia("(pointer: coarse)").matches) void canvas.requestPointerLock();
  }

  return (
    <main className="flight-root" data-grade={String(grade)}>
      {mounted ? <FlightCanvas nightRef={nightRef} wireRef={wireRef} /> : null}

      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-4 left-4 max-w-[16rem]">
          <p className="font-display text-3xl leading-none tracking-tight text-fg">Aperture</p>
          <p ref={deckRef} className="kicker mt-2">
            {playing ? "1 / 5" : "Five decks"}
          </p>
          <p ref={placeRef} className="kicker mt-1 text-accent">
            {playing ? "Find the ring" : "Land to rewrite the light"}
          </p>
          {playing ? (
            <b ref={scoreRef} className="mt-2 block font-mono text-3xl leading-none text-fg">
              0
            </b>
          ) : null}
        </div>

        <div className="pointer-events-auto absolute top-4 right-4 flex gap-2">
          <button type="button" className="hud-btn" data-on={night ? "true" : "false"} onClick={toggleNight}>
            {night ? <Moon className="size-4" aria-hidden /> : <Sun className="size-4" aria-hidden />}
            {night ? "Night" : "Day"}
          </button>
          <button type="button" className="hud-btn" data-on={wire ? "true" : "false"} onClick={toggleWire}>
            <Grid3x3 className="size-4" aria-hidden />
            Wire
          </button>
        </div>

        {playing ? (
          <>
            <div className="reticle" />
            <div className="instruments">
              <div ref={altCard} className="panel instrument">
                <span className="kicker">Alt</span>
                <b ref={altRef}>980</b>
                <span ref={aglRef} className="kicker">
                  m msl
                </span>
              </div>
              <div className="panel instrument">
                <span className="kicker">
                  Spd <span ref={hdgRef}>000°</span>
                </span>
                <b ref={spdRef}>0</b>
                <div ref={ticksRef} className="throttle" aria-hidden>
                  {Array.from({ length: 8 }, (_, i) => (
                    <i key={i} />
                  ))}
                </div>
              </div>
            </div>
            {!locked ? <p className="look-hint kicker pointer-events-none absolute top-16 left-4 text-sand">Click the view to look</p> : null}
            <TouchLayer />
            {cleared ? (
              <div className="pointer-events-auto absolute inset-0 flex items-center justify-center p-4">
                <section className="panel start-card">
                  <p className="kicker">Circuit closed</p>
                  <h2 className="font-display mt-1 text-5xl leading-none text-fg">{hudBus.score}</h2>
                  <p className="mt-3 text-sm text-muted">Five locks. Best {hudBus.best}.</p>
                  <button type="button" className="hud-btn mt-5 w-full" data-on="true" onClick={restart}>
                    Fly it again
                  </button>
                </section>
              </div>
            ) : null}
          </>
        ) : (
          <div className="pointer-events-auto absolute inset-0 flex items-end justify-center p-4 sm:items-center">
            <section className="panel start-card">
              <p className="kicker">The other way around</p>
              <h1 className="font-display mt-1 text-5xl leading-none tracking-tight text-fg">Aperture</h1>
              <p className="mt-3 text-sm leading-relaxed text-muted">
                Five rings on the Mauritius coast. The nose leads away from you. Settle inside the live ring — slow, wings level — and the island changes light. Too fast, and the deck will not take you.
              </p>
              <button type="button" className="hud-btn mt-5 w-full" data-on="true" onClick={start}>
                Start circuit
              </button>
              <ul className="control-list mt-5">
                <li>
                  <kbd>Mouse</kbd>
                  <span>Look</span>
                </li>
                <li>
                  <kbd>W / S</kbd>
                  <span>Thrust</span>
                </li>
                <li>
                  <kbd>A / D</kbd>
                  <span>Rudder</span>
                </li>
                <li>
                  <kbd>Shift</kbd>
                  <span>Boost</span>
                </li>
                <li>
                  <kbd>F</kbd>
                  <span>Wireframe</span>
                </li>
                <li>
                  <kbd>N</kbd>
                  <span>Day / night</span>
                </li>
                <li>
                  <kbd>R</kbd>
                  <span>Reset</span>
                </li>
                <li>
                  <kbd>Esc</kbd>
                  <span>Free mouse</span>
                </li>
              </ul>
              <div className="swatches mt-5">
                <span>
                  <i className="swatch-lagoon" /> Steel
                </span>
                <span>
                  <i className="swatch-cane" /> Dusk
                </span>
                <span>
                  <i className="swatch-forest" /> Reef
                </span>
                <span>
                  <i className="swatch-peak" /> Ember
                </span>
              </div>
            </section>
          </div>
        )}
      </div>
    </main>
  );
}

function TouchLayer() {
  return (
    <div className="touch-layer">
      <Stick />
      <LookPad />
    </div>
  );
}

function Stick() {
  const base = useRef<HTMLDivElement>(null);
  const knob = useRef<HTMLDivElement>(null);

  function apply(clientX: number, clientY: number) {
    const rect = base.current?.getBoundingClientRect();
    if (!rect || !knob.current) return;
    const max = rect.width * 0.34;
    let dx = clientX - (rect.left + rect.width / 2);
    let dy = clientY - (rect.top + rect.height / 2);
    const mag = Math.hypot(dx, dy) || 1;
    if (mag > max) {
      dx = (dx / mag) * max;
      dy = (dy / mag) * max;
    }
    inputState.touchSteer = Math.max(-1, Math.min(1, -dx / max));
    inputState.touchThrust = Math.max(-1, Math.min(1, -dy / max));
    knob.current.style.transform = `translate(${dx}px, ${dy}px)`;
  }

  function end() {
    inputState.touchSteer = 0;
    inputState.touchThrust = 0;
    if (knob.current) knob.current.style.transform = "translate(0px, 0px)";
  }

  return (
    <div
      ref={base}
      className="touch-pad"
      onPointerDown={(e) => {
        e.currentTarget.setPointerCapture(e.pointerId);
        apply(e.clientX, e.clientY);
      }}
      onPointerMove={(e) => {
        if (e.currentTarget.hasPointerCapture(e.pointerId)) apply(e.clientX, e.clientY);
      }}
      onPointerUp={end}
      onPointerCancel={end}
    >
      <span className="kicker absolute bottom-2 left-3">Thrust</span>
      <div ref={knob} className="stick-knob" />
    </div>
  );
}

function LookPad() {
  const last = useRef<{ x: number; y: number } | null>(null);
  return (
    <div
      className="touch-pad"
      onPointerDown={(e) => {
        e.currentTarget.setPointerCapture(e.pointerId);
        last.current = { x: e.clientX, y: e.clientY };
        inputState.touchBoost = e.shiftKey;
      }}
      onPointerMove={(e) => {
        if (!last.current || !e.currentTarget.hasPointerCapture(e.pointerId)) return;
        inputState.lookX += (e.clientX - last.current.x) * 1.7;
        inputState.lookY += (e.clientY - last.current.y) * 1.7;
        last.current = { x: e.clientX, y: e.clientY };
      }}
      onPointerUp={() => {
        last.current = null;
      }}
    >
      <span className="kicker absolute bottom-2 left-3">Look</span>
      <button
        type="button"
        className="hud-btn absolute top-2 right-2"
        onPointerDown={(e) => {
          e.stopPropagation();
          inputState.touchBoost = true;
        }}
        onPointerUp={() => {
          inputState.touchBoost = false;
        }}
        onPointerLeave={() => {
          inputState.touchBoost = false;
        }}
      >
        Boost
      </button>
    </div>
  );
}
