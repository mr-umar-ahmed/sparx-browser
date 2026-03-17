import React, { useState, useEffect, useMemo, useRef } from "react";
import { motion, useTransform, useSpring, useMotionValue, AnimatePresence } from "framer-motion";
import { Search, ArrowRight, Sparkles, MonitorPlay, Database, LayoutTemplate, Cpu, Github, Plus } from "lucide-react";

export type AnimationPhase = "scatter" | "line" | "circle" | "bottom-strip";

interface FlipCardProps {
  src: string;
  index: number;
  phase: AnimationPhase;
  target: { x: number; y: number; rotation: number; scale: number; opacity: number };
  T: any;
}

const IMG_WIDTH = 60;
const IMG_HEIGHT = 85;

function FlipCard({ src, index, target, T }: FlipCardProps) {
  const fallbackSrc = "https://images.unsplash.com/photo-1558494949-ef0d38d3f9b2?auto=format&fit=crop&w=200&q=75";

  return (
    <motion.div
      animate={{ x: target.x, y: target.y, rotate: target.rotation, scale: target.scale, opacity: target.opacity }}
      transition={{ type: "spring", stiffness: 40, damping: 15 }}
      style={{ position: "absolute", width: IMG_WIDTH, height: IMG_HEIGHT, transformStyle: "preserve-3d", perspective: "1000px" }}
      className="cursor-pointer group"
    >
      <motion.div
        className="relative h-full w-full"
        style={{ transformStyle: "preserve-3d" }}
        transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
        whileHover={{ rotateY: 180 }}
      >
        <div
          className="absolute inset-0 h-full w-full overflow-hidden rounded-xl shadow-lg border"
          style={{ backfaceVisibility: "hidden", borderColor: T.borderMuted }}
        >
          <img
            src={src}
            alt={`hero-${index}`}
            className="h-full w-full object-cover"
            loading="lazy"
            onError={(e) => { e.currentTarget.src = fallbackSrc; }}
          />
          <div className="absolute inset-0 bg-black/20 transition-colors group-hover:bg-transparent" />
        </div>
        <div
          className="absolute inset-0 h-full w-full overflow-hidden rounded-xl shadow-lg flex flex-col items-center justify-center p-2 border"
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
            background: T.surfaceHover,
            borderColor: T.border,
          }}
        >
          <div className="text-center">
            <p className="text-[8px] font-bold uppercase tracking-widest mb-1" style={{ color: T.accent }}>
              View
            </p>
            <p className="text-[10px] font-medium" style={{ color: T.text }}>
              Details
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

const TOTAL_IMAGES = 20;
const MAX_SCROLL = 3000;

const IMAGES = [
  "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=300&q=80", // 1
  "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=300&q=80", // 2
  "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=300&q=80", // 3
  "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=300&q=80", // 4
  "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=300&q=80", // 5
  "https://images.unsplash.com/photo-1504639725590-34d0984388bd?auto=format&fit=crop&w=300&q=80", // 6
  "https://images.unsplash.com/photo-1555949963-aa79dcee981c?auto=format&fit=crop&w=300&q=80", // 7
  
  // --- REPLACED #8 ---
  "https://picsum.photos/id/0/300/400", // Laptop workspace (Picsum)
  
  "https://images.unsplash.com/photo-1517433670267-08bbd4be890f?auto=format&fit=crop&w=300&q=80", // 9
  "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?auto=format&fit=crop&w=300&q=80", // 10
  "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=300&q=80", // 11
  "https://images.unsplash.com/photo-1542831371-29b0f74f9713?auto=format&fit=crop&w=300&q=80", // 12
  "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=300&q=80", // 13
  "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&w=300&q=80", // 14
  
  // --- REPLACED #15 & #16 ---
  "https://picsum.photos/id/119/300/400", // MacBook desk (Picsum)
  "https://picsum.photos/id/180/300/400", // Tech workspace (Picsum)
  
  "https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?auto=format&fit=crop&w=300&q=80", // 17
  "https://images.unsplash.com/photo-1506765515384-028b60a970df?auto=format&fit=crop&w=300&q=80", // 18
  "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?auto=format&fit=crop&w=300&q=80", // 19
  "https://images.unsplash.com/photo-1518020382113-a7e8fc38eac9?auto=format&fit=crop&w=300&q=80", // 20
];
const lerp = (start: number, end: number, t: number) => start * (1 - t) + end * t;

export default function ScrollMorphHero({
  onNavigate,
  T,
  isPrivacyMode,
}: {
  onNavigate: (url: string) => void;
  T: any;
  isPrivacyMode: boolean;
}) {
  const [introPhase, setIntroPhase] = useState<AnimationPhase>("scatter");
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const virtualScroll = useMotionValue(0);
  const scrollRef = useRef(0);

  const [query, setQuery] = useState("");
  const [time, setTime] = useState(new Date());
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const hours = time.getHours();
  const greeting = hours < 12 ? "Good morning" : hours < 18 ? "Good afternoon" : "Good evening";

  const shortcuts = [
    { name: "GitHub", url: "https://github.com", icon: Github, color: "#111827", bg: "#f3f4f6" },
    { name: "Localhost", url: "http://localhost:3000", icon: MonitorPlay, color: "#10b981", bg: "#ecfdf5" },
    { name: "Firebase", url: "https://console.firebase.google.com", icon: Database, color: "#f59e0b", bg: "#fffbeb" },
    { name: "React Native", url: "https://reactnative.dev/", icon: LayoutTemplate, color: "#06b6d4", bg: "#ecfeff" },
    { name: "Hugging Face", url: "https://huggingface.co", icon: Cpu, color: "#fbbf24", bg: "#fffbeb" },
  ];

  useEffect(() => {
    if (!containerRef.current) return;
    const handleResize = (entries: ResizeObserverEntry[]) => {
      for (const entry of entries) {
        setContainerSize({ width: entry.contentRect.width, height: entry.contentRect.height });
      }
    };
    const observer = new ResizeObserver(handleResize);
    observer.observe(containerRef.current);
    setContainerSize({ width: containerRef.current.offsetWidth, height: containerRef.current.offsetHeight });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const newScroll = Math.min(Math.max(scrollRef.current + e.deltaY, 0), MAX_SCROLL);
      scrollRef.current = newScroll;
      virtualScroll.set(newScroll);
    };

    container.addEventListener("wheel", handleWheel, { passive: false });
    return () => container.removeEventListener("wheel", handleWheel);
  }, [virtualScroll]);

  const morphProgress = useTransform(virtualScroll, [0, 600], [0, 1]);
  const smoothMorph = useSpring(morphProgress, { stiffness: 40, damping: 20 });
  const scrollRotate = useTransform(virtualScroll, [600, 3000], [0, 360]);
  const smoothScrollRotate = useSpring(scrollRotate, { stiffness: 40, damping: 20 });

  const mouseX = useMotionValue(0);
  const smoothMouseX = useSpring(mouseX, { stiffness: 30, damping: 20 });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const relativeX = e.clientX - rect.left;
      const normalizedX = (relativeX / rect.width) * 2 - 1;
      mouseX.set(normalizedX * 100);
    };
    container.addEventListener("mousemove", handleMouseMove);
    return () => container.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX]);

  useEffect(() => {
    const timer1 = setTimeout(() => setIntroPhase("line"), 200);
    const timer2 = setTimeout(() => setIntroPhase("circle"), 1200);
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  const scatterPositions = useMemo(() => {
    return IMAGES.map(() => ({
      x: (Math.random() - 0.5) * 1500,
      y: (Math.random() - 0.5) * 1000,
      rotation: (Math.random() - 0.5) * 180,
      scale: 0.6,
      opacity: 0,
    }));
  }, []);

  const [morphValue, setMorphValue] = useState(0);
  const [rotateValue, setRotateValue] = useState(0);
  const [parallaxValue, setParallaxValue] = useState(0);

  useEffect(() => {
    const unsubscribeMorph = smoothMorph.on("change", setMorphValue);
    const unsubscribeRotate = smoothScrollRotate.on("change", setRotateValue);
    const unsubscribeParallax = smoothMouseX.on("change", setParallaxValue);
    return () => {
      unsubscribeMorph();
      unsubscribeRotate();
      unsubscribeParallax();
    };
  }, [smoothMorph, smoothScrollRotate, smoothMouseX]);

  const contentOpacity = useTransform(smoothMorph, [0, 0.5], [1, 0]);

  return (
    <div ref={containerRef} className="relative w-full h-full overflow-hidden" style={{ background: T.bg }}>
      {/* Floating Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-[-1]">
        <motion.div
          animate={{ x: [0, 30, 0], y: [0, -40, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className={`absolute top-[10%] left-[20%] w-[35vw] h-[35vw] rounded-full blur-[100px] opacity-20 ${
            isPrivacyMode ? "bg-amber-300" : "bg-blue-300"
          }`}
        />
        <motion.div
          animate={{ x: [0, -40, 0], y: [0, 30, 0], scale: [1, 1.2, 1] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className={`absolute top-[30%] right-[15%] w-[40vw] h-[40vw] rounded-full blur-[120px] opacity-15 ${
            isPrivacyMode ? "bg-orange-300" : "bg-emerald-200"
          }`}
        />
      </div>

      <div className="absolute inset-0 pointer-events-none z-0 flex items-center justify-center perspective-1000">
        {IMAGES.slice(0, TOTAL_IMAGES).map((src, i) => {
          let target = { x: 0, y: 0, rotation: 0, scale: 1, opacity: 1 };

          if (introPhase === "scatter") {
            target = scatterPositions[i];
          } else if (introPhase === "line") {
            const lineSpacing = 70;
            const lineTotalWidth = TOTAL_IMAGES * lineSpacing;
            target = { x: i * lineSpacing - lineTotalWidth / 2, y: -120, rotation: 0, scale: 1, opacity: 1 };
          } else {
            const isMobile = containerSize.width < 768;
            const minDimension = Math.min(containerSize.width, containerSize.height);

            const circleRadius = Math.min(minDimension * 0.35, 350);
            const circleAngle = (i / TOTAL_IMAGES) * 360;
            const circleRad = (circleAngle * Math.PI) / 180;
            const circlePos = { x: Math.cos(circleRad) * circleRadius, y: Math.sin(circleRad) * circleRadius - 80, rotation: circleAngle + 90 };

            const baseRadius = Math.min(containerSize.width, containerSize.height * 1.5);
            const arcRadius = baseRadius * (isMobile ? 1.4 : 1.1);
            const arcApexY = containerSize.height * (isMobile ? 0.35 : 0.25);
            const arcCenterY = arcApexY + arcRadius;

            const spreadAngle = isMobile ? 100 : 130;
            const startAngle = -90 - spreadAngle / 2;
            const step = spreadAngle / (TOTAL_IMAGES - 1);

            const scrollProgress = Math.min(Math.max(rotateValue / 360, 0), 1);
            const maxRotation = spreadAngle * 0.8;
            const boundedRotation = -scrollProgress * maxRotation;

            const currentArcAngle = startAngle + i * step + boundedRotation;
            const arcRad = (currentArcAngle * Math.PI) / 180;

            const arcPos = {
              x: Math.cos(arcRad) * arcRadius + parallaxValue,
              y: Math.sin(arcRad) * arcRadius + arcCenterY,
              rotation: currentArcAngle + 90,
              scale: isMobile ? 1.4 : 1.8,
            };

            target = {
              x: lerp(circlePos.x, arcPos.x, morphValue),
              y: lerp(circlePos.y, arcPos.y, morphValue),
              rotation: lerp(circlePos.rotation, arcPos.rotation, morphValue),
              scale: lerp(1, arcPos.scale, morphValue),
              opacity: 1,
            };
          }

          return <FlipCard key={i} src={src} index={i} phase={introPhase} target={target} T={T} />;
        })}
      </div>

      {/* SPARX UI OVERLAY */}
      <div className="absolute inset-0 pointer-events-none z-10 flex flex-col items-center justify-center px-4">
        <motion.div style={{ opacity: contentOpacity }} className="flex flex-col items-center w-full max-w-2xl pointer-events-auto">
          <div className="flex flex-col items-center mb-8">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", damping: 20, stiffness: 200 }}
              className="flex items-center gap-3 mb-2"
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg"
                style={{
                  background: isPrivacyMode
                    ? "linear-gradient(135deg, #f59e0b, #d97706)"
                    : "linear-gradient(135deg, #3b82f6, #2563eb)",
                }}
              >
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-3xl font-bold tracking-tight" style={{ color: T.text, textShadow: `0 4px 20px ${T.bg}` }}>
                Sparx
              </h1>
            </motion.div>
            <p style={{ color: T.textMuted, fontSize: 14, fontWeight: 500, textShadow: `0 2px 10px ${T.bg}` }}>
              {greeting}. Ready to build?
            </p>
          </div>

          <div
            className={`w-full relative rounded-2xl overflow-hidden transition-all duration-300 ease-out mb-10 ${
              isSearchFocused ? "shadow-2xl scale-[1.02]" : "shadow-lg scale-100"
            }`}
            style={{ background: `${T.surface}ee`, backdropFilter: "blur(20px)", border: `1px solid ${isSearchFocused ? T.accent : T.border}` }}
          >
            <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
              <Search className="w-5 h-5 transition-colors duration-300" style={{ color: isSearchFocused ? T.accent : T.textMuted }} />
            </div>
            <input
              type="text"
              autoFocus
              value={query}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && query) onNavigate(query);
              }}
              placeholder="Search the web, or enter a URL..."
              className="w-full py-4 pl-14 pr-16 text-base outline-none bg-transparent"
              style={{ color: T.text }}
            />
            <AnimatePresence>
              {query && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  onClick={() => onNavigate(query)}
                  className="absolute inset-y-2 right-2 px-4 rounded-xl flex items-center justify-center transition-transform hover:scale-105 active:scale-95"
                  style={{ background: T.accentDim, color: T.accent }}
                >
                  <ArrowRight className="w-5 h-5" />
                </motion.button>
              )}
            </AnimatePresence>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 w-full">
            {shortcuts.map((sc, i) => (
              <motion.button
                key={i}
                whileHover={{ y: -5, scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onNavigate(sc.url)}
                className="flex flex-col items-center gap-2 p-2 rounded-xl cursor-pointer group"
                style={{ minWidth: 80 }}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center shadow-sm border transition-shadow group-hover:shadow-md"
                  style={{ backgroundColor: sc.bg, borderColor: T.border }}
                >
                  <sc.icon className="w-6 h-6 transition-transform group-hover:scale-110" style={{ color: sc.color }} />
                </div>
                <span style={{ color: T.textMuted, fontSize: 11, fontWeight: 500 }}>{sc.name}</span>
              </motion.button>
            ))}
            <motion.button
              whileHover={{ y: -5, scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex flex-col items-center gap-2 p-2 rounded-xl cursor-pointer group"
              style={{ minWidth: 80 }}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center shadow-sm border border-dashed transition-colors hover:bg-black/5"
                style={{ borderColor: T.border }}
              >
                <Plus className="w-6 h-6 transition-transform group-hover:rotate-90" style={{ color: T.textMuted }} />
              </div>
              <span style={{ color: T.textMuted, fontSize: 11, fontWeight: 500 }}>Add</span>
            </motion.button>
          </div>

          <p className="mt-12 text-[10px] font-bold tracking-[0.2em] uppercase" style={{ color: T.textDim }}>
            SCROLL DOWN TO INTERACT
          </p>
        </motion.div>
      </div>
    </div>
  );
}