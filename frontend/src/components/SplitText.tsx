import React, { useRef, useEffect, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText as GSAPSplitText } from 'gsap/SplitText';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger, GSAPSplitText, useGSAP);

export interface SplitTextProps {
  text: string;
  className?: string;
  delay?: number;
  duration?: number;
  ease?: string | ((t: number) => number);
  splitType?: 'chars' | 'words' | 'lines' | 'words, chars';
  from?: gsap.TweenVars;
  to?: gsap.TweenVars;
  threshold?: number;
  rootMargin?: string;
  tag?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span';
  textAlign?: React.CSSProperties['textAlign'];
  onLetterAnimationComplete?: () => void;
  /** optional overrides for heading sizing/weight */
  fontSize?: React.CSSProperties['fontSize'];
  fontWeight?: React.CSSProperties['fontWeight'];
}

const SplitText: React.FC<SplitTextProps> = ({
  text,
  className = '',
  delay = 1000,
  duration = 2.0,
  ease = 'power3.out',
  splitType = 'chars',
  from = { opacity: 0, y: 40 },
  to = { opacity: 1, y: 0 },
  threshold = 1.1,
  rootMargin = '-10px',
  textAlign = 'center',
  tag = 'h1', // 👈 default: H1
  onLetterAnimationComplete,
  fontSize,
  fontWeight,
}) => {
  const ref = useRef<HTMLElement | null>(null);
  const animationCompletedRef = useRef(false);
  const lastTextRef = useRef<string | null>(null);
  const onCompleteRef = useRef<SplitTextProps['onLetterAnimationComplete']>();
  const [fontsLoaded, setFontsLoaded] = useState<boolean>(false);

  useEffect(() => {
    if (document.fonts.status === 'loaded') {
      setFontsLoaded(true);
    } else {
      document.fonts.ready.then(() => {
        setFontsLoaded(true);
      });
    }
  }, []);

  useGSAP(
    () => {
      if (!ref.current || !text || !fontsLoaded) return;

      // If text changed (e.g., locale change), instantly update without re-animating
      if (lastTextRef.current !== null && lastTextRef.current !== text) {
        const el = ref.current as HTMLElement & {
          _rbsplitInstance?: GSAPSplitText;
        };
        
        // Revert previous split
        if (el._rbsplitInstance) {
          try {
            el._rbsplitInstance.revert();
          } catch (_) {}
          el._rbsplitInstance = undefined;
        }
        
        // Set new text directly without animation
        el.textContent = text;
        lastTextRef.current = text;
        animationCompletedRef.current = true;
        onCompleteRef.current?.();
        return;
      }

      // Avoid re-running the same animation over and over for identical text
      if (animationCompletedRef.current && lastTextRef.current === text) {
        return;
      }

      lastTextRef.current = text;
      animationCompletedRef.current = false;

      const el = ref.current as HTMLElement & {
        _rbsplitInstance?: GSAPSplitText;
      };

      if (el._rbsplitInstance) {
        try {
          el._rbsplitInstance.revert();
        } catch (_) {}
        el._rbsplitInstance = undefined;
      }

      // Detect Arabic text and avoid per-character splitting (which can be glitchy)
      const containsArabic = /[\u0600-\u06FF]/.test(text);
      const effectiveSplitType: typeof splitType =
        containsArabic && splitType && splitType.includes('chars') ? 'words' : splitType;

      let targets: Element[] = [];
      const assignTargets = (self: GSAPSplitText) => {
        if (effectiveSplitType.includes('chars') && self.chars.length) targets = self.chars;
        if (!targets.length && effectiveSplitType.includes('words') && self.words.length) targets = self.words;
        if (!targets.length && effectiveSplitType.includes('lines') && self.lines.length) targets = self.lines;
        if (!targets.length) targets = self.chars || self.words || self.lines;
      };

      const splitInstance = new GSAPSplitText(el, {
        type: effectiveSplitType,
        smartWrap: true,
        autoSplit: splitType === 'lines',
        linesClass: 'split-line',
        wordsClass: 'split-word',
        charsClass: 'split-char',
        reduceWhiteSpace: false,
        onSplit: (self: GSAPSplitText) => {
          assignTargets(self);
          return gsap.fromTo(
            targets,
            { ...from },
            {
              ...to,
              duration,
              ease,
              stagger: delay / 1000,
              onComplete: () => {
                animationCompletedRef.current = true;
                onCompleteRef.current?.();
              },
              willChange: 'transform, opacity',
              force3D: true,
            }
          );
        },
      });

      el._rbsplitInstance = splitInstance;

      return () => {
        ScrollTrigger.getAll().forEach((st) => {
          if (st.trigger === el) st.kill();
        });
        try {
          splitInstance.revert();
        } catch (_) {}
        el._rbsplitInstance = undefined;
      };
    },
    {
      dependencies: [text, splitType, fontsLoaded],
      scope: ref,
    }
  );

  useEffect(() => {
    onCompleteRef.current = onLetterAnimationComplete;
  }, [onLetterAnimationComplete]);

  const renderTag = () => {
    const style: React.CSSProperties = {
      textAlign,
      overflow: 'visible', // 👈 don't clip multi-line text
      display: 'block',    // 👈 block so it takes full width
      whiteSpace: 'normal',
      wordWrap: 'break-word',
      willChange: 'transform, opacity',
      margin: 0,
      fontSize: fontSize ?? 'clamp(2rem, 4vw, 3rem)', // big heading
      fontWeight: fontWeight ?? 800,                  // bold
      color: '#b7a27d',
    };

    const classes = `split-parent ${className}`;

    switch (tag) {
      case 'h1':
        return (
          <h1 ref={ref as any} style={style} className={classes}>
            {text}
          </h1>
        );
      case 'h2':
        return (
          <h2 ref={ref as any} style={style} className={classes}>
            {text}
          </h2>
        );
      case 'h3':
        return (
          <h3 ref={ref as any} style={style} className={classes}>
            {text}
          </h3>
        );
      case 'h4':
        return (
          <h4 ref={ref as any} style={style} className={classes}>
            {text}
          </h4>
        );
      case 'h5':
        return (
          <h5 ref={ref as any} style={style} className={classes}>
            {text}
          </h5>
        );
      case 'h6':
        return (
          <h6 ref={ref as any} style={style} className={classes}>
            {text}
          </h6>
        );
      default:
        return (
          <p ref={ref as any} style={style} className={classes}>
            {text}
          </p>
        );
    }
  };

  return renderTag();
};

export default SplitText;
