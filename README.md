geoloc
======

Обертка для удобного получения данных о пизиции пользователя от разных провайдеров.  
При неработоспособности одного провайдера автоматически опрашивает следующего.  
Чтобы не задолбать какого-нибудь провайдера, кеширует результат в localStorage на указанный период (по умолчанию - сутки).

**GeoLoc.getPosition** - получение позиции  
Пример:
```js
GeoLoc.getPosition(function(err, pos) {
    if (err) {
        throw err;
    }
    
    console.log('Latitude:' + pos.latitude);
    console.log('Longitude:' + pos.longitude);
});
```

**GeoLoc.setDefaultProviders** - устанавливает провайдеры которые будут использоваться по умолчанию  
Пример:
```js
GeoLoc.setDefaultProviders([
	GeoLoc.providers['freegeoip_net'],
	GeoLoc.providers['telize_com'],
	GeoLoc.providers['html5geolocation']
]);
```

**GeoLoc.use** - указывает какие провайдеры будут использоваться ниже по цепочке вызовов.  
Пример:
```js
GeoLoc
    .use([GeoLoc.providers['html5geolocation']])
    .getPosition(function(err, pos) {
        console.log(pos);
    });
```
