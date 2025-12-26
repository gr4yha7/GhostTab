import React from 'react';
import { TouchableOpacity, Animated } from 'react-native';

interface ToggleProps {
  checked: boolean;
  onChange: (value: boolean) => void;
}

export const Toggle: React.FC<ToggleProps> = ({ checked, onChange }) => (
  <TouchableOpacity
    onPress={() => onChange(!checked)}
    className={`w-11 h-6 rounded-full relative ${checked ? 'bg-indigo-600' : 'bg-slate-200'}`}
  >
    <Animated.View
      className="absolute top-1 left-1 bg-white w-4 h-4 rounded-full shadow-sm"
      style={{ transform: [{ translateX: checked ? 20 : 0 }] }}
    />
  </TouchableOpacity>
);
