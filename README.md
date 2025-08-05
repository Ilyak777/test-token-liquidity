Тестовое задание

ЗАПУСК

*все команды выполнять из корня*

поднять редис через docker-compose 
```
npm run start:redis
```

если во время теста редис забьется - очистить так
```
npm run redis:flush
```

после этого запускаем апку - 
```
npm run dev / npm run start
```

После запуска начинается процесс поиска токенов и проверки их ликвидность. Все данные, попадающие в очереди можем увидеть тут -
```
http://localhost:3000/admin/queues
```

Весь функционал реализован при помощи очередей поверх Reddis - все запросы к DexScreener отправляются через очередь, не стал заморачиваться с воркером для определения роста ликвидности

Есть пара моментом - один описал в коде комментарием
```
      if(!pool.liquidity || !pool.liquidity.usd) {
        // здесь я бы поресерчил процесс добавления ликвидности в пул, то есть через сколько времени она появится - и делал бы re-request
        console.warn(`Skipping pool ${JSON.stringify(pool)} due to missing liquidity data`);
        continue;
      }
```
Здесь имеется в виду то, что в некоторых пулах просто напросто отсутсвует ликвидность, но это легко решается

Реализовал логику оповещения через вебхук - без логики с ключом доступа и тд, так скажем "легкое исполнение", вот поля которые приходят в нотификации-
```
{
  "data": {
    "url": "https://dexscreener.com/solana/7zhjfuggxcbyimb4zci6rmtqqi2k2scz4uec8qhq8ccd",
    "prev": 35466.33,
    "current": 37970.26,
    "baseToken": {
      "address": "5ghpHpgiew7WuuKY1f3CSMgGHmDiZUeMjZrgDrfzBAGS",
      "name": "grokprompt.fun",
      "symbol": "GROKPROMPT"
    },
    "quoteToken": {
      "address": "So11111111111111111111111111111111111111112",
      "name": "Wrapped SOL",
      "symbol": "SOL"
    }
  },
  "returnValue": null
}
```

соответсвенно есть возможность сразу перейти по ссылке в конкретный пул, дописать ручку - фронт будет знать в какой паре и какой рост произошел благодаря baseToken и quoteToken

В данном исполнении настройки задаются в src/config, выглядят они так-
```
export const config: Config = {
  API_BASE_URL: 'https://api.dexscreener.com',
  CACHE_TTL: 60,
  LIQUIDITY_THRESHOLD: 1.05,
  REDIS_URL: process.env.REDIS_URL || 'redis://127.0.0.1:6379',
  WEBHOOK_URL: process.env.WEBHOOK_URL || 'https://example.com/your-webhook',
  ALLOWED_CHAINS: ['ethereum', 'solana'],
};
```

то есть нотифай будет отправлен при условии что в пуле есть сведения о ликивдности, и разница между предыдущим значением и настоящим составляет больше 5 ти процентов, задается полем ```LIQUIDITY_THRESHOLD```

