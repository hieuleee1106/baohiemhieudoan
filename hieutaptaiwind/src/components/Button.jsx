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
  };

  const sizeStyles = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3',
    lg: 'px-8 py-4 text-lg',
  };

  const combinedClassName = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`;

  if (as === 'link') {
    return <Link to={to} className={combinedClassName} {...props}>{children}</Link>;
  }

  return <button type={type} onClick={onClick} disabled={disabled} className={combinedClassName} {...props}>{children}</button>;
};

export default Button;