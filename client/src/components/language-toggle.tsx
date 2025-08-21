import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useLanguage } from '@/context/language-context';
import { Languages, Globe } from 'lucide-react';

export default function LanguageToggle() {
  const { language, setLanguage, t } = useLanguage();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="flex items-center gap-2"
          data-testid="language-toggle"
        >
          <Globe className="w-4 h-4" />
          <span className="hidden sm:inline">
            {language === 'en' ? 'EN' : 'SW'}
          </span>
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => setLanguage('en')}
          className={`flex items-center gap-2 ${language === 'en' ? 'bg-green-50 text-green-700' : ''}`}
          data-testid="language-en"
        >
          <span className="text-lg">🇺🇸</span>
          <span>{t('lang.english')}</span>
          {language === 'en' && <span className="ml-auto">✓</span>}
        </DropdownMenuItem>
        
        <DropdownMenuItem
          onClick={() => setLanguage('sw')}
          className={`flex items-center gap-2 ${language === 'sw' ? 'bg-green-50 text-green-700' : ''}`}
          data-testid="language-sw"
        >
          <span className="text-lg">🇰🇪</span>
          <span>{t('lang.swahili')}</span>
          {language === 'sw' && <span className="ml-auto">✓</span>}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}