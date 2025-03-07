Kelime Çeviri Eklentisi
Bu eklenti, kullanıcının seçtiği diller arasında rastgele kelimeler çekip, BabelNet API ve Random Word API kullanarak kelime çevirileri sağlamaktadır. 
Genel doğruluk oranı yaklaşık %60 olup, özellikle BabelNet tarafındaki verilerde bir kelimenin birden fazla anlamı ve diğer ek bilgiler nedeniyle eşleşme sorunu yaşanabilmektedir. 
Öte yandan, kelime API (Random Word API) %100 doğruluk ile çalışmaktadır.
-------
Özellikler
Rastgele Kelime Çekme:
Eklenti, kullanıcının seçtiği hedef dil (örneğin; İngilizce, Almanca, Fransızca, İtalyanca) için rastgele kelimeler çekmektedir.

İngilizce için Random Word API kullanılır.
Diğer diller için, tüm kelime listesini döndüren /all endpointi kullanılarak rastgele seçim yapılmaktadır.
BabelNet API ile Çeviri:
Rastgele kelimenin BabelNet API üzerinden synset ID'leri alınmakta ve bu ID'lerden ilgili çeviri (duyum) bilgisi getirilmektedir.

Ancak, BabelNet API'sinde bazı kelimeler için birden fazla anlam ve ek bilgi bulunduğu için, tam doğru eşleşme her zaman sağlanamamaktadır.
Token Takibi:
Eklenti, BabelNet API çağrılarında kullanılan token sayısını takip edip, kalan token bilgisini anlık olarak gösterir.

BabelNet API, kullanıcıya günlük 1000 istek hakkı tanımaktadır.
Eğer kullanıcı kendi API anahtarını girmezse, eklenti varsayılan olarak built‑in API anahtarlarını kullanır:
API‑1: 2****cf-c8**-4594-947e-********
API‑2: 3****7-8fbf-4**b6-8**b-25**8***a7c
API‑3: 0f6***e-6**f-****-ae8e-688****643
API‑1'in token limiti dolduğunda, otomatik olarak API‑2'ye; API‑2 limiti dolduğunda ise API‑3'e geçiş yapılır.
Kullanıcı Ayarları:

Kullanıcı, Options sayfasından hedef dil, yerel dil ve API anahtarını girebilir.
Ayrıca, built‑in API seçenekleri (API‑1, API‑2, API‑3) arasında seçim yapma imkanı sunulur.
Kendi API anahtarını girerse, built‑in seçenekler devre dışı bırakılarak yalnızca kullanıcının API anahtarı kullanılır.
Ayarlar sayfasında, "BabelNet API, günlük 1000 istek hakkı vermektedir" uyarısı yer almaktadır.
"Hakkında" linki sayesinde GitHub sayfasına yönlendirme yapılmaktadır.
Kullanıcı Deneyimi:

Eğer alınan çeviri uygun değilse (örneğin; "prens" yerine "prince" gibi farklı sonuçlar) eklenti otomatik olarak sonraki kelimeyi denemekte ve "Önceki Kelime" butonu ile daha önce çekilen kelimeler tekrar gösterilebilmektedir.
Ekranda anlık olarak kalan token sayısı görüntülenmektedir.
---
Limitasyonlar
BabelNet Doğruluğu:
BabelNet API, kelimeler için birden fazla anlam ve ek bilgi döndürebildiği için, bazı durumlarda eşleşme doğruluğu düşebilmektedir. Bu nedenle genel doğruluk oranı yaklaşık %60 olarak gözlemlenmektedir.

Kelimelerin Çekilememesi:
Bazı kelimeler için BabelNet’ten veri alınamadığında, eklenti otomatik olarak yeni kelime denemesi yapar. Bu durum, nadiren de olsa kullanıcı deneyimini etkileyebilmektedir.

API Token Sınırları:
Kullanılan built‑in API anahtarları için günlük 1000 istek limiti mevcuttur. Eğer bu limit aşılırsa, eklenti otomatik olarak diğer built‑in API anahtarına geçmeye çalışır; ancak tüm built‑in anahtarların token limiti dolduğunda, eklenti çalışmayı durdurabilir. Bu durumda, kullanıcı kendi API anahtarını girerek sorunu aşabilir.

------
Kurulum
Chrome Eklentisini Yükleyin:

Bu proje, Chrome tarayıcı eklentisi olarak tasarlanmıştır.
Dosyaları indirin ve tarayıcınızın "chrome://extensions/" sayfasında "Geliştirici Modu"nu aktif ettikten sonra "Paketlenmemiş Eklenti Yükle" seçeneğiyle yükleyin.
Ayarları Yapılandırın:

Eklentinin ayarlar sayfasına gidin ve hedef dil, yerel dil ve API anahtarınızı girin.
Eğer kendi API anahtarınızı girmiyorsanız, built‑in API seçenekleri arasından tercih yapabilirsiniz.
"Kaydet" butonuna basın.
Eklentiyi Kullanıma Başlayın:

Eklenti popup'ını açın, rastgele kelimeler ve çevirileri ekranda görmeye başlayın.
"Önceki Kelime" ve "Sonraki Kelime" butonları ile kelime gezintisini gerçekleştirin.
Ekranda anlık kalan BabelNet token sayısını gözlemleyin.
API Kullanılanlar
Random Word API:
Kelime çekme işlemi için kullanılır. İngilizce için /word endpoint, diğer diller için /all endpoint kullanılarak rastgele kelime seçimi yapılmaktadır.

BabelNet API:
Rastgele kelimenin synset ID'lerini ve çeviri duyumlarını almak için kullanılır.

getSynsetIds: Rastgele kelimenin synset ID'lerini getirir.
getSynset: Belirli bir synset ID'si için duyum bilgilerini (çeviri) getirir.
----
Geliştirici Notları
Proje %60 genel doğruluk oranıyla çalışmaktadır; bu oran, BabelNet API'sinin bazı kelimelerde birden fazla anlam döndürmesi ve ek bilgiler nedeniyle düşebilmektedir.
Random Word API ise %100 doğruluk ile çalışmaktadır.
Kullanıcı, kendi API anahtarını girerse, eklenti yalnızca bu anahtarı kullanır; aksi halde built‑in API anahtarları sırasıyla kullanılır.
Günlük 1000 istek hakkı, eklentinin token takibi ile ekranda gösterilmektedir.

