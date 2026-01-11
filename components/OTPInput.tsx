// components/OTPInput.tsx
import React, { useState, useRef, useEffect } from 'react';
import { View, TextInput } from 'react-native';

interface OTPInputProps {
  length?: number;
  onComplete: (code: string) => void;
  onChangeText?: (code: string) => void;
}

export function OTPInput({ length = 6, onComplete, onChangeText }: OTPInputProps) {
  const [otp, setOtp] = useState<string[]>(Array(length).fill(''));
  const inputRefs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    // Auto-focus first input on mount
    inputRefs.current[0]?.focus();
  }, []);

  const handleChangeText = (text: string, index: number) => {
    // Only allow numbers
    if (text && !/^\d+$/.test(text)) return;

    const newOtp = [...otp];
    newOtp[index] = text.slice(-1); // Only take last character
    setOtp(newOtp);

    const otpString = newOtp.join('');
    onChangeText?.(otpString);

    // Auto-focus next input
    if (text && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Call onComplete when all digits are entered
    if (otpString.length === length) {
      onComplete(otpString);
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    // Handle backspace
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <View className="flex-row justify-center gap-3">
      {Array(length)
        .fill(0)
        .map((_, index) => (
          <TextInput
            key={index}
            ref={(el) => {
              inputRefs.current[index] = el;
            }}
            value={otp[index]}
            onChangeText={(text) => handleChangeText(text, index)}
            onKeyPress={(e) => handleKeyPress(e, index)}
            keyboardType="number-pad"
            maxLength={1}
            selectTextOnFocus
            className="w-12 h-14 bg-white border-2 border-slate-200 rounded-xl text-center text-2xl font-bold text-slate-900"
            style={otp[index] ? { borderColor: '#6366f1' } : {}}
          />
        ))}
    </View>
  );
}