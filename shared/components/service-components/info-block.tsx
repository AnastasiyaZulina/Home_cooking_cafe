import React from 'react';
import { Button } from '../ui/button';
import { ArrowLeft } from 'lucide-react';
import { Title } from '@/shared/components';
import Link from 'next/link';
import { cn } from '@/shared/lib/utils';

interface Props {
  title: string;
  text: string;
  className?: string;
  imageUrl?: string;
}

export const InfoBlock: React.FC<Props> = ({ className, title, text, imageUrl }) => {
  return (
    <div className={cn(
      className,
      'flex flex-col-reverse md:flex-row items-center justify-between w-full max-w-[840px] gap-8 md:gap-12'
    )}>
      <div className="flex flex-col items-center md:items-start text-center md:text-left">
        <div className="w-full max-w-[445px]">
          <Title size="lg" text={title} className="font-extrabold" />
          <p className="text-gray-400 text-base md:text-lg mt-2">{text}</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 sm:gap-5 mt-8 md:mt-11">
          <Link href="/">
            <Button variant="outline" className="gap-2 w-full sm:w-auto">
              <ArrowLeft size={18} />
              На главную
            </Button>
          </Link>
          <a href="">
            <Button variant="outline" className="text-gray-500 border-gray-400 hover:bg-gray-50 w-full sm:w-auto">
              Обновить
            </Button>
          </a>
        </div>
      </div>

      {imageUrl && (
        <img 
          src={imageUrl} 
          alt={title} 
          className="w-[200px] md:w-[300px] mb-6 md:mb-0" 
        />
      )}
    </div>
  );
};