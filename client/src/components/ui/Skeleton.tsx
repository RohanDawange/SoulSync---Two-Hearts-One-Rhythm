interface SkeletonProps {
  width?: string;
  height?: string;
  rounded?: string;
  className?: string;
  variant?: 'text' | 'avatar' | 'card' | 'circle';
}

const variantStyles = {
  text: 'h-4 w-full rounded-md',
  avatar: 'h-10 w-10 rounded-full',
  card: 'h-32 w-full rounded-2xl',
  circle: 'h-12 w-12 rounded-full',
};

export default function Skeleton({ width, height, rounded, className = '', variant }: SkeletonProps) {
  const base = 'animate-pulse bg-gradient-to-r from-white/10 via-white/20 to-white/10 bg-[length:200%_100%] animate-shimmer';

  if (variant) {
    return (
      <div
        className={`${base} ${variantStyles[variant]} ${className}`}
        style={width ? { width } : height ? { height } : undefined}
      />
    );
  }

  const style: React.CSSProperties = {};
  if (width) style.width = width;
  if (height) style.height = height;
  if (rounded) style.borderRadius = rounded;
  else style.borderRadius = '0.5rem';

  return (
    <div className={`${base} ${className}`} style={style} />
  );
}
