import { cn } from "@/shared/lib/utils";

interface Props {
  name: string;
  weight: number;
  eValue: number;
  className?: string;
}

export const CartItemInfo: React.FC<Props> = ({name, weight, eValue, className}) => {
  
  return (
    <div>
      <div className={cn("flex items-center justify-between", className)}>
        <h2 className="text-lg font-bold flex-1 leading-6">{name}</h2>
      </div>
      <p className="text-xs text-gray-400 w-90%">{weight} г | {eValue} ккал</p>
    </div>
  );
};
