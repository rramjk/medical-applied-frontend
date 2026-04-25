'use client';

import { useEffect, useRef, useState } from 'react';
import { MapPin, Navigation, Search } from 'lucide-react';

import { appConfig } from '@/shared/config/app';
import { Alert } from '@/shared/ui/alert';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardHeader } from '@/shared/ui/card';
import { Input } from '@/shared/ui/input';

type YandexCoordinates = [number, number];

type YandexGeoObject = {
  geometry: {
    getCoordinates: () => YandexCoordinates;
  };
  properties: {
    get: (key: string) => unknown;
  };
  getAddressLine?: () => string;
};

type YandexGeoObjectCollectionResult = {
  get: (index: number) => YandexGeoObject | null;
  each: (callback: (geoObject: YandexGeoObject) => void) => void;
};

type YandexGeocodeResult = {
  geoObjects: YandexGeoObjectCollectionResult;
};

type YandexMapGeoObjects = {
  add: (object: unknown) => void;
  remove: (object: unknown) => void;
};

type YandexMapInstance = {
  geoObjects: YandexMapGeoObjects;
  setCenter: (
      coordinates: YandexCoordinates,
      zoom?: number,
      options?: {
        duration?: number;
      },
  ) => void;
  destroy: () => void;
};

type YandexPlacemark = unknown;

type YandexGeoObjectCollection = {
  add: (object: unknown) => void;
  removeAll: () => void;
};

type YandexMapsApi = {
  ready: (callback?: () => void) => Promise<unknown>;
  geocode: (
      request: string | YandexCoordinates,
      options?: Record<string, unknown>,
  ) => Promise<YandexGeocodeResult>;
  search?: (
      request: string,
      options?: Record<string, unknown>,
  ) => Promise<YandexGeocodeResult>;
  Map: new (
      element: HTMLElement,
      state: {
        center: YandexCoordinates;
        zoom: number;
        controls?: string[];
      },
  ) => YandexMapInstance;
  Placemark: new (
      coordinates: YandexCoordinates,
      properties?: Record<string, unknown>,
      options?: Record<string, unknown>,
  ) => YandexPlacemark;
  GeoObjectCollection: new (
      properties?: Record<string, unknown>,
      options?: Record<string, unknown>,
  ) => YandexGeoObjectCollection;
};

type PharmacyItem = {
  id: string;
  name: string;
  address: string;
  coordinates: YandexCoordinates;
};

type YandexPharmacyMapProps = {
  medicineName?: string;
};

declare global {
  interface Window {
    ymaps?: YandexMapsApi;
    __yandexMapsPromise?: Promise<YandexMapsApi>;
  }
}

const DEFAULT_CENTER: YandexCoordinates = [55.755864, 37.617698];
const DEFAULT_ZOOM = 13;
const SEARCH_ZOOM = 15;

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

function getStringProperty(value: unknown) {
  return typeof value === 'string' ? value : undefined;
}

function loadYandexMaps(apiKey: string): Promise<YandexMapsApi> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Yandex Maps доступен только в браузере'));
  }

  if (window.ymaps) {
    return window.ymaps.ready().then(() => window.ymaps as YandexMapsApi);
  }

  if (window.__yandexMapsPromise) {
    return window.__yandexMapsPromise;
  }

  window.__yandexMapsPromise = new Promise<YandexMapsApi>(
      (resolve, reject) => {
        const script = document.createElement('script');

        script.src = `https://api-maps.yandex.ru/2.1/?apikey=${encodeURIComponent(
            apiKey,
        )}&lang=ru_RU`;
        script.async = true;

        script.onload = () => {
          if (!window.ymaps) {
            reject(new Error('Yandex Maps API не загрузился'));
            return;
          }

          window.ymaps.ready(() => resolve(window.ymaps as YandexMapsApi));
        };

        script.onerror = () => {
          reject(new Error('Не удалось загрузить Yandex Maps API'));
        };

        document.head.appendChild(script);
      },
  );

  return window.__yandexMapsPromise;
}

function getBoundsByCenter(
    center: YandexCoordinates,
    delta = 0.035,
): [YandexCoordinates, YandexCoordinates] {
  const [lat, lon] = center;

  return [
    [lat - delta, lon - delta],
    [lat + delta, lon + delta],
  ];
}

function getBrowserLocation(): Promise<YandexCoordinates> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Геолокация не поддерживается вашим браузером'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve([position.coords.latitude, position.coords.longitude]);
        },
        () => {
          reject(
              new Error(
                  'Не удалось получить местоположение. Проверьте разрешение геолокации в браузере.',
              ),
          );
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000,
        },
    );
  });
}

export function YandexPharmacyMap({ medicineName }: YandexPharmacyMapProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<YandexMapInstance | null>(null);
  const userPlacemarkRef = useRef<YandexPlacemark | null>(null);
  const pharmacyCollectionRef = useRef<YandexGeoObjectCollection | null>(null);

  const [address, setAddress] = useState('');
  const [currentAddress, setCurrentAddress] = useState('');
  const [pharmacies, setPharmacies] = useState<PharmacyItem[]>([]);
  const [isMapReady, setIsMapReady] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const apiKey = appConfig.yandexMapsApiKey;

  useEffect(() => {
    if (!apiKey || !mapContainerRef.current || mapRef.current) {
      return;
    }

    let isMounted = true;

    loadYandexMaps(apiKey)
        .then((ymaps: YandexMapsApi) => {
          if (!isMounted || !mapContainerRef.current) {
            return;
          }

          const map = new ymaps.Map(mapContainerRef.current, {
            center: DEFAULT_CENTER,
            zoom: DEFAULT_ZOOM,
            controls: ['zoomControl', 'fullscreenControl'],
          });

          mapRef.current = map;

          pharmacyCollectionRef.current = new ymaps.GeoObjectCollection(
              {},
              {
                preset: 'islands#blueMedicalIcon',
              },
          );

          map.geoObjects.add(pharmacyCollectionRef.current);

          setIsMapReady(true);
        })
        .catch((loadError: unknown) => {
          setError(getErrorMessage(loadError, 'Не удалось загрузить карту'));
        });

    return () => {
      isMounted = false;

      if (mapRef.current) {
        mapRef.current.destroy();
        mapRef.current = null;
      }
    };
  }, [apiKey]);

  const clearPharmacyMarkers = () => {
    pharmacyCollectionRef.current?.removeAll();
    setPharmacies([]);
  };

  const setUserPoint = (
      coordinates: YandexCoordinates,
      label = 'Вы здесь',
  ) => {
    if (!window.ymaps || !mapRef.current) {
      return;
    }

    if (userPlacemarkRef.current) {
      mapRef.current.geoObjects.remove(userPlacemarkRef.current);
    }

    userPlacemarkRef.current = new window.ymaps.Placemark(
        coordinates,
        {
          hintContent: label,
          balloonContent: label,
        },
        {
          preset: 'islands#redCircleDotIcon',
        },
    );

    mapRef.current.geoObjects.add(userPlacemarkRef.current);
  };

  const reverseGeocodeAddress = async (coordinates: YandexCoordinates) => {
    if (!window.ymaps) {
      return;
    }

    const result = await window.ymaps.geocode(coordinates);
    const firstGeoObject = result.geoObjects.get(0);

    if (!firstGeoObject) {
      return;
    }

    const resolvedAddress =
        firstGeoObject.getAddressLine?.() ||
        getStringProperty(firstGeoObject.properties.get('text')) ||
        '';

    setCurrentAddress(resolvedAddress);
  };

  const searchPharmaciesNearby = async (center: YandexCoordinates) => {
    if (!window.ymaps || !mapRef.current || !pharmacyCollectionRef.current) {
      return;
    }

    setIsSearching(true);
    setError(null);
    clearPharmacyMarkers();

    try {
      const searchText = medicineName ? `аптека ${medicineName}` : 'аптека';

      const searchOptions = {
        boundedBy: getBoundsByCenter(center),
        strictBounds: true,
        results: 10,
      };

      const result =
          typeof window.ymaps.search === 'function'
              ? await window.ymaps.search(searchText, searchOptions)
              : await window.ymaps.geocode(searchText, searchOptions);

      const foundItems: PharmacyItem[] = [];
      let index = 0;

      result.geoObjects.each((geoObject: YandexGeoObject) => {
        const coordinates = geoObject.geometry.getCoordinates();

        const name =
            getStringProperty(geoObject.properties.get('name')) ||
            getStringProperty(geoObject.properties.get('hintContent')) ||
            `Аптека ${index + 1}`;

        const description =
            getStringProperty(geoObject.properties.get('description')) ||
            getStringProperty(geoObject.properties.get('text')) ||
            'Адрес не указан';

        const pharmacy: PharmacyItem = {
          id: `${coordinates[0]}-${coordinates[1]}-${index}`,
          name,
          address: description,
          coordinates,
        };

        foundItems.push(pharmacy);

        const placemark = new window.ymaps!.Placemark(
            coordinates,
            {
              hintContent: name,
              balloonContent: `
              <strong>${name}</strong>
              <br />
              <span>${description}</span>
            `,
            },
            {
              preset: 'islands#blueMedicalIcon',
            },
        );

        pharmacyCollectionRef.current?.add(placemark);
        index += 1;
      });

      setPharmacies(foundItems);

      mapRef.current.setCenter(center, SEARCH_ZOOM, {
        duration: 300,
      });

      if (!foundItems.length) {
        setError(
            'Поблизости не удалось найти аптеки. Попробуйте указать другой адрес или увеличить область поиска.',
        );
      }
    } catch (searchError: unknown) {
      console.error('Yandex pharmacy search error:', searchError);

      setError(
          'Не удалось выполнить поиск аптек. Проверьте, что ключ Yandex Maps API поддерживает геокодинг/поиск и разрешён для текущего домена.',
      );
    } finally {
      setIsSearching(false);
    }
  };

  const handleUseCurrentLocation = async () => {
    setIsLocating(true);
    setError(null);

    try {
      const coordinates = await getBrowserLocation();

      setUserPoint(coordinates);
      await reverseGeocodeAddress(coordinates);
      await searchPharmaciesNearby(coordinates);
    } catch (locationError: unknown) {
      setError(
          getErrorMessage(locationError, 'Не удалось получить местоположение'),
      );
    } finally {
      setIsLocating(false);
    }
  };

  const handleSearchByAddress = async () => {
    const trimmedAddress = address.trim();

    if (!trimmedAddress || !window.ymaps) {
      return;
    }

    setIsSearching(true);
    setError(null);

    try {
      const result = await window.ymaps.geocode(trimmedAddress, {
        results: 1,
      });

      const firstGeoObject = result.geoObjects.get(0);

      if (!firstGeoObject) {
        setError('Адрес не найден. Попробуйте указать город, улицу и дом.');
        return;
      }

      const coordinates = firstGeoObject.geometry.getCoordinates();

      const resolvedAddress =
          firstGeoObject.getAddressLine?.() ||
          getStringProperty(firstGeoObject.properties.get('text')) ||
          trimmedAddress;

      setCurrentAddress(resolvedAddress);
      setUserPoint(coordinates, resolvedAddress);

      await searchPharmaciesNearby(coordinates);
    } catch (searchError: unknown) {
      console.error('Yandex address search error:', searchError);

      setError(
          'Не удалось выполнить поиск адреса. Проверьте ключ Yandex Maps API, доступ к Geocoder API и ограничения ключа по домену.',
      );
    } finally {
      setIsSearching(false);
    }
  };

  const openExternalYandexMaps = () => {
    const query = medicineName ? `аптека ${medicineName}` : 'аптека';
    const url = `https://yandex.ru/maps/?text=${encodeURIComponent(query)}`;

    window.open(url, '_blank', 'noopener,noreferrer');
  };

  if (!apiKey) {
    return (
        <Alert
            title="Ключ Yandex Maps не настроен"
            tone="warning"
            description="Добавьте NEXT_PUBLIC_YANDEX_MAPS_API_KEY в .env.local, чтобы включить карту аптек."
        />
    );
  }

  return (
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold text-foreground">
              Карта аптек
            </h2>
            <p className="text-sm text-muted">
              Разрешите геолокацию или укажите адрес вручную, чтобы найти аптеки
              рядом с выбранным местом.
            </p>
          </CardHeader>

          <CardContent className="space-y-4">
            {medicineName ? (
                <Alert
                    title="Поиск с учётом препарата"
                    tone="info"
                    description={`Карта попробует искать аптеки по запросу: аптека ${medicineName}. Наличие препарата нужно уточнять напрямую в аптеке.`}
                />
            ) : (
                <Alert
                    title="Справочный поиск"
                    tone="info"
                    description="Карта показывает ближайшие аптеки по данным внешнего картографического сервиса. Наличие конкретного препарата не гарантируется."
                />
            )}

            {error ? (
                <Alert title="Ошибка поиска" tone="danger" description={error} />
            ) : null}

            <div className="flex flex-col gap-3 md:flex-row">
              <Input
                  value={address}
                  onChange={(event) => setAddress(event.target.value)}
                  placeholder="Введите город, улицу или адрес"
                  disabled={!isMapReady || isSearching || isLocating}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      event.preventDefault();
                      void handleSearchByAddress();
                    }
                  }}
              />

              <Button
                  type="button"
                  onClick={() => void handleSearchByAddress()}
                  disabled={!isMapReady || !address.trim() || isSearching}
              >
                <Search className="mr-2 h-4 w-4" />
                Найти
              </Button>

              <Button
                  type="button"
                  variant="secondary"
                  onClick={() => void handleUseCurrentLocation()}
                  disabled={!isMapReady || isLocating || isSearching}
              >
                <Navigation className="mr-2 h-4 w-4" />
                {isLocating ? 'Определяем...' : 'Моё местоположение'}
              </Button>
            </div>

            {currentAddress ? (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm text-muted">
                  Текущая точка поиска:{' '}
                  <span className="font-medium text-foreground">
                {currentAddress}
              </span>
                </div>
            ) : null}

            <div
                ref={mapContainerRef}
                className="h-[520px] overflow-hidden rounded-3xl border border-slate-200 bg-slate-100"
            />

            {!isMapReady ? (
                <div className="text-sm text-muted">Загружаем карту...</div>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold text-foreground">
              Найденные аптеки
            </h2>
            <p className="text-sm text-muted">
              Список формируется по результатам поиска на карте.
            </p>
          </CardHeader>

          <CardContent className="space-y-4">
            {isSearching ? (
                <Alert
                    title="Идёт поиск"
                    tone="info"
                    description="Ищем аптеки рядом с выбранной точкой."
                />
            ) : null}

            {!isSearching && !pharmacies.length ? (
                <div className="rounded-2xl border border-dashed border-slate-300 p-4 text-sm text-muted">
                  Пока список пуст. Укажите адрес или используйте текущее
                  местоположение.
                </div>
            ) : null}

            {pharmacies.map((pharmacy) => (
                <button
                    key={pharmacy.id}
                    type="button"
                    className="w-full rounded-2xl border border-slate-200 p-4 text-left transition hover:border-primary hover:bg-slate-50"
                    onClick={() => {
                      mapRef.current?.setCenter(pharmacy.coordinates, 17, {
                        duration: 300,
                      });
                    }}
                >
                  <div className="flex items-start gap-3">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />

                    <div>
                      <div className="font-semibold text-foreground">
                        {pharmacy.name}
                      </div>

                      <div className="mt-1 text-sm text-muted">
                        {pharmacy.address}
                      </div>
                    </div>
                  </div>
                </button>
            ))}

            <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={openExternalYandexMaps}
            >
              Открыть поиск в Яндекс Картах
            </Button>
          </CardContent>
        </Card>
      </div>
  );
}