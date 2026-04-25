# Medical Applied Frontend

Production-oriented Next.js frontend for the Medical Applied service.

## Основные возможности

- вход и выход по JWT;
- регистрация пользователя с валидацией по правилам сервиса;
- защищённый каталог препаратов и карточка препарата;
- фильтрация по стране, категории, названию и действующему веществу;
- история просмотренных препаратов;
- личный кабинет, настройки профиля, смена пароля;
- создание и обновление профиля здоровья;
- запрос подтверждения email и проверка статуса;
- AI-ассистент с сохранением истории диалогов в браузере;
- админ-раздел пользователей для роли ADMIN;
- страница карты аптек на базе Yandex Maps.

## Запуск

```bash
cp .env.example .env.local
npm ci
npm run dev
```

По умолчанию frontend обращается к backend по адресу:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8090
```

Для карты можно указать ключ:

```env
NEXT_PUBLIC_YANDEX_MAPS_API_KEY=your_key
```

## Проверки

```bash
npm run lint
npm run typecheck
npm run build
```
