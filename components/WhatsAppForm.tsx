'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { parsePhoneNumber } from 'libphonenumber-js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { Card } from '@/components/ui/card';

const countries = [
  { code: 'ID', name: 'Indonesia', dialCode: '62' },
  { code: 'MY', name: 'Malaysia', dialCode: '60' },
  { code: 'SG', name: 'Singapore', dialCode: '65' },
  { code: 'TH', name: 'Thailand', dialCode: '66' },
];

export default function WhatsAppForm() {
  const [selectedCountry, setSelectedCountry] = useState('ID');
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data: any) => {
    try {
      const country = countries.find(c => c.code === selectedCountry);
      const phoneNumber = parsePhoneNumber(data.phoneNumber, country?.code);
      
      if (phoneNumber && phoneNumber.isValid()) {
        const formattedNumber = phoneNumber.format('E.164').replace('+', '');
        const whatsappUrl = `https://wa.me/${formattedNumber}`;
        
        // Save to database
        await fetch('/api/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            phoneNumber: formattedNumber,
            country: selectedCountry,
          }),
        });

        // Open WhatsApp
        window.open(whatsappUrl, '_blank');
        
        toast.success('WhatsApp chat window opened');
      } else {
        toast.error('Please enter a valid phone number');
      }
    } catch (error) {
      toast.error('Something went wrong. Please try again.');
    }
  };

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="flex gap-4">
          <div className="w-1/3">
            <Select
              value={selectedCountry}
              onValueChange={setSelectedCountry}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select country" />
              </SelectTrigger>
              <SelectContent>
                {countries.map((country) => (
                  <SelectItem key={country.code} value={country.code}>
                    {country.name} (+{country.dialCode})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1">
            <Input
              {...register('phoneNumber', { required: true })}
              placeholder="Enter phone number"
              className={errors.phoneNumber ? 'border-red-500' : ''}
            />
          </div>
        </div>
        <Button type="submit" className="w-full">
          Open in WhatsApp
        </Button>
      </form>
    </Card>
  );
}