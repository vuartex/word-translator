document.addEventListener("DOMContentLoaded", function () {
    let currentSynsetIndex = 0;
    let synsetIds = []; // getSynsetIds'den dönen ID'leri tutar
    let words = [];     // Başarılı getSynset çağrılarından dönen kelime verilerini tutar
    let targetLang, sourceLang, userApiKey, builtinApi;
    // Built-in API anahtarlarımız:
    const defaultApi1 = "21ee75cf-c812-4594-947e-c0f29fe51518";
    const defaultApi2 = "3401d497-8fbf-48b6-8a2b-25e888061a7c";
    const defaultApi3 = "0f6410ae-63df-49da-ae8e-68870a3ff643";
    // Eğer kullanıcı API anahtarı girmezse, Options'da seçili olan built-in API'yi kullanacağız.
    let currentDefaultApi = defaultApi1;
    let usingUserKey = false;
    
    let retryCount = 0;
    const maxRetries = 5; // En fazla 5 deneme
    let currentRandomWord = ""; // Şu an çekilen rastgele kelimeyi saklar

    // Token takibi
    let tokensUsed = 0;
    const dailyTokenLimit = 1000;
    function updateTokenDisplay() {
        const remaining = dailyTokenLimit - tokensUsed;
        document.getElementById("token-info").innerText = `BabelNet Token: ${remaining}`;
    }

    // Eğer kullanıcı kendi API anahtarını girmemişse, built-in API seçenekleri üzerinden çalışırız.
    // Eğer mevcut kullanılan built-in API'nin token limiti dolduysa, sırasıyla API-1 → API-2 → API-3 şeklinde geçiş yaparız.
    function checkAndSwitchDefaultApi() {
        if (!usingUserKey && tokensUsed >= dailyTokenLimit) {
            if (currentDefaultApi === defaultApi1) {
                console.log("API-1 token limiti doldu, API-2'ye geçiliyor.");
                currentDefaultApi = defaultApi2;
            } else if (currentDefaultApi === defaultApi2) {
                console.log("API-2 token limiti doldu, API-3'e geçiliyor.");
                currentDefaultApi = defaultApi3;
            } else if (currentDefaultApi === defaultApi3) {
                console.log("Tüm built-in API'ler için token limiti doldu.");
                alert("Tüm built-in API'lerin token limitleri doldu. Lütfen daha sonra tekrar deneyin veya kendi API anahtarınızı girin.");
                return;
            }
            tokensUsed = 0;
            updateTokenDisplay();
            userApiKey = currentDefaultApi;
        }
    }

    // Ayarlar sayfasını açmak için dinleyici
    document.getElementById("settings").addEventListener("click", function () {
        chrome.runtime.openOptionsPage();
    });

    // Ayarları çekiyoruz
    chrome.storage.sync.get(["targetLang", "sourceLang", "apiKey", "builtinApi"], function (data) {
        if (!data.targetLang || !data.sourceLang) {
            alert("Önce ayarlardan dil seçmelisiniz!");
            return;
        }
        targetLang = data.targetLang;
        sourceLang = data.sourceLang;
        if (data.apiKey && data.apiKey.trim() !== "") {
            userApiKey = data.apiKey;
            usingUserKey = true;
        } else {
            builtinApi = data.builtinApi ? data.builtinApi : "api1";
            if (builtinApi === "api2") {
                currentDefaultApi = defaultApi2;
            } else if (builtinApi === "api3") {
                currentDefaultApi = defaultApi3;
            } else {
                currentDefaultApi = defaultApi1;
            }
            userApiKey = currentDefaultApi;
        }
        document.getElementById("source-lang").innerText = sourceLang.toUpperCase();
        document.getElementById("target-lang").innerText = targetLang.toUpperCase();

        updateTokenDisplay();
        fetchRandomWord();
    });

    // "Sonraki Kelime" butonuna tıklanınca
    document.getElementById("next").addEventListener("click", function () {
        nextWord();
    });

    // "Önceki Kelime" butonuna tıklanınca
    document.getElementById("prev").addEventListener("click", function () {
        if (words.length === 0) return;
        if (currentSynsetIndex > 0) {
            currentSynsetIndex--;
            displayWord();
        }
    });

    // Rastgele kelime API çağrısı
    function fetchRandomWord() {
        retryCount = 0;
        let randomWordUrl = "";
        if (targetLang.toLowerCase() === "en") {
            randomWordUrl = "https://random-word-api.herokuapp.com/word";
        } else {
            randomWordUrl = `https://random-word-api.herokuapp.com/all?lang=${targetLang.toLowerCase()}`;
        }
        console.log(`Rastgele kelime API isteği: ${randomWordUrl}`);
        
        fetch(randomWordUrl)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Random Word API Hatası! Durum: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                console.log("Rastgele kelime API Yanıtı:", data);
                if (!data || data.length === 0) {
                    alert("Rastgele kelime alınamadı.");
                    return;
                }
                if (targetLang.toLowerCase() !== "en") {
                    const randomIndex = Math.floor(Math.random() * data.length);
                    currentRandomWord = data[randomIndex];
                } else {
                    currentRandomWord = data[0];
                }
                console.log("Seçilen rastgele kelime:", currentRandomWord);
                fetchSynsetIds(currentRandomWord);
            })
            .catch(error => console.error("Rastgele kelime API Hatası:", error.message));
    }

    // getSynsetIds çağrısı
    function fetchSynsetIds(lemma) {
        const idsUrl = `https://babelnet.io/v9/getSynsetIds?lemma=${lemma}&searchLang=${targetLang.toUpperCase()}&key=${userApiKey}`;
        const cloudflareWorkerUrl = "https://word-plugin.gokhan-gkz1742.workers.dev/?url=";
        const fullIdsUrl = cloudflareWorkerUrl + encodeURIComponent(idsUrl);
        console.log(`Synset ID'leri için istek: ${fullIdsUrl}`);
        
        fetch(fullIdsUrl, { mode: 'cors' })
            .then(response => {
                console.log("getSynsetIds Yanıt Durumu:", response.status);
                if (!response.ok) {
                    return response.text().then(text => {
                        throw new Error(`HTTP Hatası! (getSynsetIds) Durum: ${response.status} - Yanıt: ${text}`);
                    });
                }
                tokensUsed++;
                updateTokenDisplay();
                checkAndSwitchDefaultApi();
                return response.json();
            })
            .then(data => {
                console.log("getSynsetIds Yanıtı:", data);
                if (!data || data.length === 0) {
                    console.warn(`BabelNet'ten '${lemma}' kelimesine ait synset ID'leri alınamadı.`);
                    retryFetchRandomWord();
                    return;
                }
                synsetIds = data.map(item => item.id);
                currentSynsetIndex = 0;
                fetchSynsetDetail(synsetIds[currentSynsetIndex], lemma);
            })
            .catch(error => {
                console.error("getSynsetIds Hatası:", error.message);
                retryFetchRandomWord();
            });
    }

    // Eğer getSynsetIds hata veriyorsa
    function retryFetchRandomWord() {
        retryCount++;
        if (retryCount >= maxRetries) {
            alert("Maalesef geçerli bir kelime bulunamadı. Lütfen 'Sonraki Kelime' butonuna basarak tekrar deneyin.");
            return;
        }
        console.log(`Retry: ${retryCount}/${maxRetries}. Yeni rastgele kelime çekiliyor...`);
        setTimeout(fetchRandomWord, 1000);
    }

    // getSynset çağrısı
    function fetchSynsetDetail(synsetId, originalLemma) {
        const synsetUrl = `https://babelnet.io/v9/getSynset?id=${synsetId}&targetLang=${sourceLang.toUpperCase()}&key=${userApiKey}`;
        const cloudflareWorkerUrl = "https://word-plugin.gokhan-gkz1742.workers.dev/?url=";
        const fullSynsetUrl = cloudflareWorkerUrl + encodeURIComponent(synsetUrl);
        console.log(`getSynset için istek: ${fullSynsetUrl}`);
        
        fetch(fullSynsetUrl, { mode: 'cors' })
            .then(response => {
                console.log("getSynset Yanıt Durumu:", response.status);
                if (!response.ok) {
                    return response.text().then(text => {
                        throw new Error(`HTTP Hatası (getSynset)! Durum: ${response.status} - Yanıt: ${text}`);
                    });
                }
                tokensUsed++;
                updateTokenDisplay();
                checkAndSwitchDefaultApi();
                return response.json();
            })
            .then(synsetData => {
                console.log("getSynset Yanıtı:", synsetData);
                if (!synsetData || !synsetData.senses || synsetData.senses.length === 0) {
                    console.warn("getSynset çağrısından veri alınamadı, sonraki kelimeye geçiliyor.");
                    nextWord();
                    return;
                }
                let nativeSense = synsetData.senses.find(sense => sense.properties.language.toUpperCase() === sourceLang.toUpperCase());
                if (!nativeSense) {
                    nativeSense = synsetData.senses[0];
                }
                const translatedWord = nativeSense.properties.lemma.lemma;
                console.log("Yerel çeviri kelimesi:", translatedWord);
                if (!isTranslationValid(originalLemma, translatedWord)) {
                    console.warn("Çeviri uygun değil, sonraki synset'e geçiliyor.");
                    nextWord();
                    return;
                }
                words.push({
                    [targetLang]: originalLemma,
                    [sourceLang]: translatedWord
                });
                displayWord();
            })
            .catch(error => {
                console.error("getSynset Hatası:", error.message);
                nextWord();
            });
    }

    // Eğer getSynsetDetail başarısız olursa
    function nextWord() {
        if (synsetIds.length > 0 && currentSynsetIndex < synsetIds.length - 1) {
            currentSynsetIndex++;
            fetchSynsetDetail(synsetIds[currentSynsetIndex], currentRandomWord);
        } else {
            fetchRandomWord();
        }
    }

    // Basit doğrulama fonksiyonu
    function isTranslationValid(original, translated) {
        if (!translated) return false;
        if (original.toLowerCase() === translated.toLowerCase()) return false;
        if (translated.length < 2) return false;
        return true;
    }

    // Kelime bilgisini ekrana gösteren fonksiyon
    function displayWord() {
        if (words.length === 0) return;
        let word = words[words.length - 1];
        document.getElementById("word").innerText = word[sourceLang];
        document.getElementById("translation").innerText = word[targetLang];
    }
});
