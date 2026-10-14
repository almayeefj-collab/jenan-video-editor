// أيقونات خطية بسيطة (24×24) مرسومة يدوياً للمشاهد
const paths = {
  parliament: 'M2 10 L12 4 L22 10 Z M4 21h16 M6 21V12 M10 21V12 M14 21V12 M18 21V12 M3 21h18',
  gear: 'M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z M12 2v3 M12 19v3 M2 12h3 M19 12h3 M4.9 4.9l2.1 2.1 M17 17l2.1 2.1 M4.9 19.1L7 17 M17 7l2.1-2.1',
  scales: 'M12 3v18 M7 21h10 M4 7h16 M4 7l-3 7a3 3 0 0 0 6 0z M20 7l-3 7a3 3 0 0 0 6 0z',
  crown: 'M3 19h18 M3 16l-1-10 6 4 4-6 4 6 6-4-1 10z',
  users: 'M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M1 21v-1a7 7 0 0 1 14 0v1 M17 11a3 3 0 1 0 0-6 M23 21v-1a6 6 0 0 0-4-5.6',
  briefcase: 'M3 8h18v12H3z M8 8V5a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v3 M3 13h18',
  shield: 'M12 2l8 3v6c0 5-3.5 9-8 11-4.5-2-8-6-8-11V5z',
  star: 'M12 2l3 6.5 7 .8-5.2 4.8 1.4 7L12 17.6 5.8 21.1l1.4-7L2 9.3l7-.8z',
  doc: 'M6 2h9l5 5v15H6z M14 2v6h6 M9 13h8 M9 17h8',
  pen: 'M3 21l3.5-1L19 7.5 16.5 5 4 17.5z M14.5 7l2.5 2.5 M3 21h18',
  idcard: 'M3 5h18v14H3z M9 12a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z M5 17a4 4 0 0 1 8 0 M15 9h4 M15 13h4',
  bolt: 'M13 2L4 14h7l-1 8 9-12h-7z',
  chat: 'M21 12a8 8 0 0 1-12 7l-6 2 2-5a8 8 0 1 1 16-4z M8 11h.01 M12 11h.01 M16 11h.01',
  book: 'M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5z M4 19.5A2.5 2.5 0 0 0 6.5 22H20v-5',
  question: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6V14 M12 17.5v.5',
  mic: 'M12 2a3 3 0 0 1 3 3v6a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3z M5 11a7 7 0 0 0 14 0 M12 18v4 M8 22h8',
  vote: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z M9 9l6 6 M15 9l-6 6',
  unlink: 'M9 15l-2 2a3 3 0 0 1-4.2-4.2l3-3a3 3 0 0 1 4.2 0 M15 9l2-2a3 3 0 0 1 4.2 4.2l-3 3a3 3 0 0 1-4.2 0 M8 2v3 M2 8h3 M16 22v-3 M22 16h-3',
  chart: 'M3 3v18h18 M7 15l4-4 3 3 5-6',
  eye: 'M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
  link: 'M10 14a4 4 0 0 0 5.6 0l3-3a4 4 0 0 0-5.6-5.6l-1 1 M14 10a4 4 0 0 0-5.6 0l-3 3a4 4 0 0 0 5.6 5.6l1-1',
  flag: 'M5 22V3 M5 3h13l-3 4 3 4H5',
  compass: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z M16 8l-2 6-6 2 2-6z',
  lock: 'M5 11h14v10H5z M8 11V7a4 4 0 0 1 8 0v4',
} as const;

export type IconName = keyof typeof paths;

export const Icon: React.FC<{name: IconName; size: number; color: string; stroke?: number; draw?: number}> = ({
  name,
  size,
  color,
  stroke = 1.6,
  draw = 1,
}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{overflow: 'visible', flexShrink: 0}}>
    <path
      d={paths[name]}
      stroke={color}
      strokeWidth={stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      pathLength={1}
      strokeDasharray={1}
      strokeDashoffset={1 - draw}
    />
  </svg>
);
