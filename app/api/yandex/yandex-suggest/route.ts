export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const text = searchParams.get('text');
  const types = searchParams.get('types') || 'geo';

  const API_KEY = process.env.GEOSUGGEST_API_KEY;
  if (!API_KEY) return new Response('Нет API ключа', { status: 500 });
  if (!text) return new Response('Нет текста', { status: 400 });

  const url = `https://suggest-maps.yandex.ru/v1/suggest?apikey=${API_KEY}&text=${encodeURIComponent(
    text
  )}&lang=ru_RU&results=5&types=${types}&print_address=1`;

  try {
    const res = await fetch(url);
    const data = await res.json();
    return Response.json(data);
  } catch (error) {
    return new Response('Ошибка запроса', { status: 500 });
  }
}
