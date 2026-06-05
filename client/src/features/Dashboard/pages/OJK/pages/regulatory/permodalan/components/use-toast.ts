import { ToastOptions } from 'react-hot-toast';

export function useToast() {
  const toast = (options: ToastOptions) => {
    const { title, description, variant = 'default' } = options;
    const timestamp = new Date().toLocaleTimeString();

    switch (variant) {
      case 'destructive':
        console.error(`❌ [${timestamp}] ${title}:`, description || '');
        break;
      case 'success':
        console.log(`✅ [${timestamp}] ${title}:`, description || '');
        break;
      default:
        console.log(`ℹ️ [${timestamp}] ${title}:`, description || '');
        break;
    }

    return Math.random().toString(36).substring(2, 9);
  };

  return { toast };
}
