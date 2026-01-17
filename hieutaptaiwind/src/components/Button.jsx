import { Link } from 'react-router-dom';

const Button = ({
  children,
  onClick,
  variant = 'primary', // 'primary', 'secondary', 'danger', 'gradient', 'subtle'
  size = 'md', // 'sm', 'md', 'lg'
  type = 'button',
  disabled = false,
  className = '',
  as = 'button', // 'button' or 'link'
  to = '#',
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center gap-2 font-bold rounded-lg transition-all transform disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100';

  const variantStyles = {
    primary: 'bg-purple-600 text-white hover:bg-purple-700 disabled:bg-purple-300',
    gradient: 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-lg hover:shadow-purple-500/40 hover:scale-105',
    secondary: 'bg-slate-200 text-slate-800 hover:bg-slate-300',
    danger: 'bg-red-500 text-white hover:bg-red-600',
    subtle: 'bg-slate-100 text-slate-700 hover:bg-slate-200',
    slide: 'group relative overflow-hidden bg-white text-slate-900 shadow hover:shadow-md',
    'slide-red': 'group relative overflow-hidden bg-white text-slate-900 shadow hover:shadow-md',
    'slide-purple': 'group relative overflow-hidden bg-white text-slate-900 shadow hover:shadow-md',
    'slide-green': 'group relative overflow-hidden bg-white text-slate-900 shadow hover:shadow-md',
    'slide-blue': 'group relative overflow-hidden bg-white text-slate-900 shadow hover:shadow-md',
  };

  const sizeStyles = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3',
    lg: 'px-8 py-4 text-lg',
  };

  const combinedClassName = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`;

  const isSlide = variant.startsWith('slide');
  
  let slideColor = 'bg-amber-400';
  if (variant === 'slide-red') slideColor = 'bg-red-600';
  if (variant === 'slide-purple') slideColor = 'bg-purple-600';
  if (variant === 'slide-green') slideColor = 'bg-green-600';
  if (variant === 'slide-blue') slideColor = 'bg-blue-600';

  const content = isSlide ? (
    <>
      <div className={`absolute inset-0 w-3 ${slideColor} transition-all duration-250 ease-out group-hover:w-full active:w-full`}></div>
      <span className="relative group-hover:text-white active:text-white flex items-center justify-center gap-2 w-full pointer-events-none">{children}</span>
    </>
  ) : children;

  if (as === 'link') {
    return <Link to={to} className={combinedClassName} {...props}>{content}</Link>;
  }

  return <button type={type} onClick={onClick} disabled={disabled} className={combinedClassName} {...props}>{content}</button>;
};

export default Button;