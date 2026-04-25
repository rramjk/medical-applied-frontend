'use client';

import { useSearchParams } from 'next/navigation';
import { SectionHeader } from '@/shared/ui/section-header';
import { Alert } from '@/shared/ui/alert';
import { YandexPharmacyMap } from '@/entities/map/ui/yandex-pharmacy-map';

export default function MapPage() {
  const searchParams = useSearchParams();
  const medicineName = searchParams.get('medicine') || undefined;

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Карта аптек"
        title="Поиск ближайших аптек на базе Yandex Maps"
        description="Карта помогает быстро открыть поиск ближайших аптек по геолокации или названию препарата."
      />
      <Alert
        title="Практический сценарий"
        tone="info"
        description="После изучения карточки препарата пользователь может перейти сюда и быстро проверить ближайшие аптеки рядом со своим местоположением."
      />
      <YandexPharmacyMap medicineName={medicineName} />
    </div>
  );
}
