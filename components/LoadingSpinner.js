import { ChefHat } from 'lucide-react';

export default function LoadingSpinner() {
  return (
    <div className="flex justify-center items-center">
      <div className="relative">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-orange-500"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <ChefHat className="h-8 w-8 text-orange-500 animate-pulse" />
        </div>
      </div>
    </div>
  );
}