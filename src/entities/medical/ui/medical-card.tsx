import Link from 'next/link';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardHeader } from '@/shared/ui/card';
import type { MedicalDto } from '@/shared/types/api';

function safetyVariant(value: boolean | null | undefined) {
  if (value === true) return 'success';
  if (value === false) return 'warning';
  return 'neutral';
}

export function MedicalCard({ medical }: { medical: MedicalDto }) {
  return (
    <Card className="h-full">
      <CardHeader className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="info">{medical.countryRu || medical.countryEn}</Badge>
          <Badge>{medical.type}</Badge>
        </div>
        <div>
          <h3 className="text-xl font-semibold text-foreground">{medical.name}</h3>
          <p className="mt-1 text-sm text-muted">Действующее вещество: {medical.activeIngredient || 'не указано'}</p>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="line-clamp-3 text-sm text-slate-600">{medical.description || 'Описание отсутствует'}</p>
        <div className="flex flex-wrap gap-2">
          <Badge variant={safetyVariant(medical.kidneyFriendly)}>Почки</Badge>
          <Badge variant={safetyVariant(medical.pregnantFriendly)}>Беременность</Badge>
          <Badge variant={safetyVariant(medical.childFriendly)}>Дети</Badge>
          <Badge variant={safetyVariant(medical.stomachFriendly)}>ЖКТ</Badge>
        </div>
        <Button asChild className="w-full">
          <Link href={`/medical/${medical.id}`}>Открыть карточку</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
