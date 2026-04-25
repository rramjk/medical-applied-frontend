'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { getMedicalCategories, getMedicalCountries, getMedicals } from '@/shared/api/medical';
import { SectionHeader } from '@/shared/ui/section-header';
import { Alert } from '@/shared/ui/alert';
import { Button } from '@/shared/ui/button';
import { EmptyState } from '@/shared/ui/empty-state';
import { Input } from '@/shared/ui/input';
import { Select } from '@/shared/ui/select';
import { Skeleton } from '@/shared/ui/skeleton';
import { useAuthStore } from '@/shared/stores/auth-store';
import { MedicalCard } from '@/entities/medical/ui/medical-card';
import type { MedicalDto } from '@/shared/types/api';

function filterClientSide(medicals: MedicalDto[], searchParams: URLSearchParams) {
  const activeIngredient = searchParams.get('activeIngredient')?.toLowerCase().trim() || '';
  const kidneyFriendly = searchParams.get('kidneyFriendly') === 'true';
  const pregnantFriendly = searchParams.get('pregnantFriendly') === 'true';
  const childFriendly = searchParams.get('childFriendly') === 'true';

  return medicals.filter((medical) => {
    if (activeIngredient && !medical.activeIngredient?.toLowerCase().includes(activeIngredient)) return false;
    if (kidneyFriendly && medical.kidneyFriendly !== true) return false;
    if (pregnantFriendly && medical.pregnantFriendly !== true) return false;
    if (childFriendly && medical.childFriendly !== true) return false;
    return true;
  });
}

export default function CatalogPage() {
  const searchParams = useSearchParams();
  const identity = useAuthStore((state) => state.identity);

  const countryEn = searchParams.get('countryEn') || '';
  const category = searchParams.get('category') || '';
  const name = searchParams.get('name') || '';
  const activeIngredient = searchParams.get('activeIngredient') || '';

  const categoriesQuery = useQuery({ queryKey: ['catalog-categories'], queryFn: getMedicalCategories, enabled: Boolean(identity) });
  const countriesQuery = useQuery({ queryKey: ['catalog-countries'], queryFn: () => getMedicalCountries(true), enabled: Boolean(identity) });
  const medicalsQuery = useQuery({
    queryKey: ['medicals', countryEn, category, name],
    queryFn: () => getMedicals({ countryEn, category, name }),
    enabled: Boolean(identity),
  });

  const filteredMedicals = useMemo(() => filterClientSide(medicalsQuery.data ?? [], new URLSearchParams(searchParams.toString())), [medicalsQuery.data, searchParams]);

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Каталог"
        title="Поиск и подбор препаратов"
        description="Используйте страну, категорию и название для детального поиска лекарственного препарата именно для Вас."
      />

      {!identity ? (
        <Alert
          title="Требуется вход"
          tone="warning"
          description={<span>Для просмотра каталога авторизуйтесь. <Link href="/auth/login" className="underline">Перейти ко входу</Link>.</span>}
        />
      ) : null}

      <form className="grid gap-4 rounded-[24px] border border-border bg-white p-6 shadow-soft md:grid-cols-2 xl:grid-cols-4" action="/catalog">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Страна</label>
          <Select name="countryEn" defaultValue={countryEn}>
            <option value="">Все страны</option>
            {(countriesQuery.data ?? []).map((country) => <option key={country} value={country}>{country}</option>)}
          </Select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Категория</label>
          <Select name="category" defaultValue={category}>
            <option value="">Все категории</option>
            {(categoriesQuery.data ?? []).map((item) => <option key={item} value={item}>{item}</option>)}
          </Select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Название</label>
          <Input name="name" defaultValue={name} placeholder="Например, Nurofen" />
        </div>
        {/*<div className="space-y-2">*/}
        {/*  <label className="text-sm font-medium text-foreground">Действующее вещество</label>*/}
        {/*  <Input name="activeIngredient" defaultValue={activeIngredient} placeholder="Например, Ibuprofen" />*/}
        {/*</div>*/}
        {/*<Checkbox name="kidneyFriendly" defaultChecked={kidneyFriendly} label="Подходит при особенностях почек" />*/}
        {/*<Checkbox name="pregnantFriendly" defaultChecked={pregnantFriendly} label="Подходит при беременности" />*/}
        {/*<Checkbox name="childFriendly" defaultChecked={childFriendly} label="Подходит детям" />*/}
        <div className="flex items-end">
          <Button type="submit" className="w-full">Применить фильтры</Button>
        </div>
      </form>

      {medicalsQuery.isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => <Skeleton key={index} className="h-[320px]" />)}
        </div>
      ) : null}

      {identity && !medicalsQuery.isLoading ? (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-muted">
            <span>Найдено карточек: {filteredMedicals.length}</span>
            <div className="flex flex-wrap gap-2">
              {[countryEn && `Страна: ${countryEn}`, category && `Категория: ${category}`, name && `Название: ${name}`, activeIngredient && `Вещество: ${activeIngredient}`]
                .filter(Boolean)
                .map((item) => (
                  <span key={item} className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700">{item}</span>
                ))}
            </div>
          </div>
          {filteredMedicals.length ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {filteredMedicals.map((medical) => <MedicalCard key={medical.id} medical={medical} />)}
            </div>
          ) : (
            <EmptyState title="По вашему запросу ничего не найдено" description="Попробуйте ослабить фильтры или убрать клиентские ограничения применимости." />
          )}
        </>
      ) : null}
    </div>
  );
}
