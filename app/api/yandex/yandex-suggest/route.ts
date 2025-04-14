export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const text = searchParams.get('text');
  const types = searchParams.get('types') || 'geo';
  const ll = searchParams.get('ll') || '82.938612,55.052716'; // ЖЁСТКО заданные координаты
  const spn = searchParams.get('spn') || '0.28,0.02';         // ЖЁСТКО заданный охват

  const API_KEY = process.env.GEOSUGGEST_API_KEY;
  if (!API_KEY) return new Response('Нет API ключа', { status: 500 });
  if (!text) return new Response('Нет текста', { status: 400 });

  const params = new URLSearchParams({
    apikey: API_KEY,
    text: text,
    types,
    lang: 'ru_RU',
    results: '5',
    print_address: '1',
    ll,
    spn,
    strict_bounds: '1',
    attrs: 'uri', // Добавлено для получения uri
  });

  const url = `https://suggest-maps.yandex.ru/v1/suggest?${params.toString()}`;

  try {
    const res = await fetch(url);
    const data = await res.json();
    return Response.json(data);
  } catch (error) {
    return new Response('Ошибка запроса', { status: 500 });
  }
}
