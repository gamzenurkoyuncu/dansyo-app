import { createElement } from 'react';

import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type DatePickerFieldProps = {
  value: string | null; // ISO date, yyyy-mm-dd
  onChange: (isoDate: string) => void;
  placeholder?: string;
};

export function DatePickerField({ value, onChange }: DatePickerFieldProps) {
  const theme = useTheme();

  return createElement('input', {
    type: 'date',
    value: value ?? '',
    onChange: (event: { target: { value: string } }) => {
      if (event.target.value) onChange(event.target.value);
    },
    style: {
      borderWidth: 1,
      borderColor: theme.backgroundSelected,
      borderRadius: Spacing.two,
      paddingLeft: Spacing.three,
      paddingRight: Spacing.three,
      paddingTop: Spacing.two,
      paddingBottom: Spacing.two,
      fontSize: 16,
      color: theme.text,
      backgroundColor: 'transparent',
      fontFamily: 'inherit',
    },
  });
}
