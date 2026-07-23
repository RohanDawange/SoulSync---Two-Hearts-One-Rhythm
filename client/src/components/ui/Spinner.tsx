interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
}

const sizes = {
  sm: 'h-5 w-5 border-2',
  md: 'h-8 w-8 border-[3px]',
  lg: 'h-12 w-12 border-4',
};

export default function Spinner({ size = 'md', color }: SpinnerProps) {
  return (
    <div
      className={`${sizes[size]} rounded-full animate-spin ${color || 'border-t-purple-500 border-r-pink-500 border-b-purple-500 border-l-transparent'}`}
      style={!color ? undefined : {
        borderTopColor: color,
        borderRightColor: color,
        borderBottomColor: color,
        borderLeftColor: 'transparent',
      }}
    />
  );
}
