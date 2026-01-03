import { Text, TouchableOpacity } from "react-native";
import { Icon } from "./Icon";


export const Button = ({ children, onPress, variant = 'primary', icon, className = '' }: any) => {
  const variants = {
    primary: "bg-slate-900 shadow-lg",
    secondary: "bg-white border border-slate-200",
    ghost: "bg-transparent",
    danger: "bg-transparent"
  } as any;
  
  const textVariants = {
    primary: "text-white",
    secondary: "text-slate-700",
    ghost: "text-slate-500",
    danger: "text-rose-500"
  } as any;

  return (
    <TouchableOpacity 
      onPress={onPress}
      className={`w-full py-3.5 rounded-xl flex-row items-center justify-center gap-2 active:opacity-80 ${variants[variant]} ${className}`}
    >
      {icon && <Icon name={icon} size={18} color={textVariants[variant].includes('white') ? 'white' : '#64748b'} />}
      <Text className={`font-medium text-sm ${textVariants[variant]}`}>{children}</Text>
    </TouchableOpacity>
  );
};