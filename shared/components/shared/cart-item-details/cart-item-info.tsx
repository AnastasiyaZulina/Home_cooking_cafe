interface Props {
  name: string;
  weight: number;
  eValue: number;
}

export const CartItemInfo: React.FC<Props> = ({name, weight, eValue}) => {
  
  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold flex-1 leading-6">{name}</h2>
      </div>
      <p className="text-xs text-gray-400">{weight} г | {eValue} ккал</p>
    </div>
  );
};
