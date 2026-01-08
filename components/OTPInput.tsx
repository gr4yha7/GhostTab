import React, { useRef, useState } from 'react';
import { View, TextInput, StyleSheet } from 'react-native';

interface OTPInputProps {
  length?: number;
  value: string[];
  onChange: (otp: string[]) => void;
}

export function OTPInput({ length = 6, value, onChange }: OTPInputProps) {
  const inputs = useRef<(TextInput | null)[]>([]);

  const handleChange = (text: string, index: number) => {
    if (text.length > 1) {
      // Handle paste
      const otpArray = text.slice(0, length).split('');
      onChange(otpArray);
      inputs.current[Math.min(length - 1, otpArray.length - 1)]?.focus();
      return;
    }

    const newOtp = [...value];
    newOtp[index] = text;
    onChange(newOtp);

    // Auto-focus next input
    if (text && index < length - 1) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !value[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  return (
    <View className="flex-row justify-between gap-2">
      {Array.from({ length }).map((_, index) => (
        <TextInput
          key={index}
          ref={(ref) => (inputs.current[index] = ref)}
          value={value[index] || ''}
          onChangeText={(text) => handleChange(text, index)}
          onKeyPress={(e) => handleKeyPress(e, index)}
          keyboardType="number-pad"
          maxLength={1}
          className="flex-1 h-16 bg-slate-50 rounded-xl text-center text-2xl font-semibold text-slate-900 border-2 border-slate-200"
          style={styles.input}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  input: {
    // Add focus style if needed
  },
});