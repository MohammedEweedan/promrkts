import { useEffect, useRef, FC, ReactNode } from 'react';
import { gsap } from 'gsap';
import './GridMotion.css';

export interface GridMotionItem {
  content: ReactNode | string;
  onClick?: () => void;
}

interface GridMotionProps {
  items?: GridMotionItem[];
  gradientColor?: string;
  bgColor?: string;
}

const GridMotion: FC<GridMotionProps> = ({
  items = [],
  gradientColor = 'rgba(101, 168, 191, 0.06)',
  bgColor = '#050811',
}) => {
  const gridRef = useRef<HTMLDivElement>(null);
  const rowRefs = useRef<(HTMLDivElement | null)[]>([]);
  const mouseXRef = useRef<number>(typeof window !== 'undefined' ? window.innerWidth / 2 : 500);

  const totalItems = 28;
  const combinedItems: GridMotionItem[] =
    items.length > 0
      ? Array.from({ length: totalItems }, (_, i) => items[i % items.length])
      : Array.from({ length: totalItems }, (_, i) => ({ content: `Item ${i + 1}` }));

  useEffect(() => {
    gsap.ticker.lagSmoothing(0);

    const handleMouseMove = (e: MouseEvent): void => {
      mouseXRef.current = e.clientX;
    };

    const updateMotion = (): void => {
      const maxMoveAmount = 300;
      const baseDuration = 0.8;
      const inertiaFactors = [0.6, 0.4, 0.3, 0.2];

      rowRefs.current.forEach((row, index) => {
        if (row) {
          const direction = index % 2 === 0 ? 1 : -1;
          const moveAmount =
            ((mouseXRef.current / window.innerWidth) * maxMoveAmount - maxMoveAmount / 2) *
            direction;

          gsap.to(row, {
            x: moveAmount,
            duration: baseDuration + inertiaFactors[index % inertiaFactors.length],
            ease: 'power3.out',
            overwrite: 'auto',
          });
        }
      });
    };

    const removeAnimationLoop = gsap.ticker.add(updateMotion);
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      removeAnimationLoop();
    };
  }, []);

  return (
    <div
      className="gridmotion-wrap"
      ref={gridRef}
      style={{ '--gm-bg': bgColor } as React.CSSProperties}
    >
      <section
        className="gridmotion-intro"
        style={{
          background: `radial-gradient(circle, ${gradientColor} 0%, transparent 100%)`,
        }}
      >
        <div className="gridmotion-fade-top" />
        <div className="gridMotion-container">
          {Array.from({ length: 4 }, (_, rowIndex) => (
            <div
              key={rowIndex}
              className="row"
              ref={(el) => {
                rowRefs.current[rowIndex] = el;
              }}
            >
              {Array.from({ length: 7 }, (_, itemIndex) => {
                const item = combinedItems[rowIndex * 7 + itemIndex];
                const clickable = Boolean(item?.onClick);
                return (
                  <div key={itemIndex} className="row__item">
                    <div
                      className="row__item-inner"
                      data-clickable={clickable ? 'true' : undefined}
                      onClick={item?.onClick}
                    >
                      {typeof item?.content === 'string' &&
                      item.content.startsWith('http') ? (
                        <div
                          className="row__item-img"
                          style={{ backgroundImage: `url(${item.content})` }}
                        />
                      ) : (
                        <div className="row__item-content">{item?.content}</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
        <div className="gridmotion-fade-bottom" />
      </section>
    </div>
  );
};

export default GridMotion;
