import { cn } from "@/shared/lib/utils";

interface Props {
  src: string;
  className?: string;
}

export const CartItemDetailsImage: React.FC<Props> = ({ src, className }) => {
  return <img className={cn('w-[60px] h-[60px]', className)} src={`${process.env.NEXT_PUBLIC_BLOB_URL}${src}`} />;
};
