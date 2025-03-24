'use client';

import React from 'react';
import { AddressSuggestions } from 'react-dadata';
import 'react-dadata/dist/react-dadata.css';

interface Props {
  onChange?: (value?: string) => void;
  className?: string;
  placeholder?: string;
}

export const AdressInput: React.FC<Props> = ({   
  onChange, 
  className, 
  placeholder, 
}) => {
  return <AddressSuggestions 
    token="92dc46b006b9e6a9a71ae755ccefc5e11e8e4eef" 
    onChange={(data) => onChange?.(data?.value)} 
    containerClassName={className}
    inputProps={{
      placeholder: placeholder,
    }}
  />;
};