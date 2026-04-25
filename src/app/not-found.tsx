import Link from 'next/link';
import { Button } from '@/shared/ui/button';
import { EmptyState } from '@/shared/ui/empty-state';

export default function NotFound() {
  return (
    <div className="py-20">
      <EmptyState
        title="Страница не найдена"
        description="Проверьте адрес или вернитесь на главную страницу проекта."
        action={
          <Button asChild>
            <Link href="/">На главную</Link>
          </Button>
        }
      />
    </div>
  );
}
