import { Badge } from '@/shared/ui/badge';
import type { MedicalDto } from '@/shared/types/api';

const labels: Array<{ key: keyof MedicalDto; label: string }> = [
  { key: 'kidneyFriendly', label: 'Подходит при особенностях почек' },
  { key: 'pregnantFriendly', label: 'Подходит при беременности' },
  { key: 'breastfedFriendly', label: 'Подходит при грудном вскармливании' },
  { key: 'liverFriendly', label: 'Подходит при особенностях печени' },
  { key: 'childFriendly', label: 'Подходит детям' },
  { key: 'stomachFriendly', label: 'Бережно для желудка' },
];

function resolveVariant(value: boolean | null | undefined) {
  if (value === true) return { label: 'Да', variant: 'success' as const };
  if (value === false) return { label: 'Ограничение', variant: 'warning' as const };
  return { label: 'Нет данных', variant: 'neutral' as const };
}

export function MedicalSafetyGrid({ medical }: { medical: MedicalDto }) {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {labels.map(({ key, label }) => {
        const state = resolveVariant(medical[key] as boolean | null | undefined);
        return (
          <div key={key} className="flex items-center justify-between rounded-2xl border border-border bg-white p-4">
            <span className="text-sm text-foreground">{label}</span>
            <Badge variant={state.variant}>{state.label}</Badge>
          </div>
        );
      })}
    </div>
  );
}
