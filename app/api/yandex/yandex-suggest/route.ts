// app/api/yandex-suggest/route.ts
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const text = searchParams.get('text');
    const types = searchParams.get('types') || 'geo';
    const ll = searchParams.get('ll');
    //const API_KEY = process.env.GEOSUGGEST_API_KEY;
  const API_KEY=123;
    if (!API_KEY) return new Response('Нет API ключа', { status: 500 });
    if (!text) return new Response('Нет текста', { status: 400 });
  
    let url = `https://suggest-maps.yandex.ru/v1/suggest?apikey=${API_KEY}&text=${encodeURIComponent(
      text
    )}&lang=ru_RU&results=5&types=${types}&print_address=1`;
  
    if (ll) {
      url += `&ll=${ll}&spn=0.002,0.002&strict_bounds=1`;
    }
  
    try {
      const res = await fetch(url);
      const data = await res.json();
      return Response.json(data);
    } catch (error) {
      return new Response('Ошибка запроса', { status: 500 });
    }
  }
  