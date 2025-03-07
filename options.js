// Ayarlar sayfası yüklendiğinde mevcut ayarları input alanlarına yükle
chrome.storage.sync.get(["targetLang", "sourceLang", "apiKey", "builtinApi"], function(data) {
    if (data.targetLang) document.getElementById("targetLang").value = data.targetLang;
    if (data.sourceLang) document.getElementById("sourceLang").value = data.sourceLang;
    if (data.apiKey) document.getElementById("apiKey").value = data.apiKey;
    if (data.builtinApi) {
        document.querySelector(`input[name="builtinApi"][value="${data.builtinApi}"]`).checked = true;
    }
});

document.getElementById("save").addEventListener("click", function () {
    let targetLang = document.getElementById("targetLang").value;
    let sourceLang = document.getElementById("sourceLang").value;
    let apiKey = document.getElementById("apiKey").value;
    let builtinApi = document.querySelector('input[name="builtinApi"]:checked').value;

    chrome.storage.sync.set({ targetLang, sourceLang, apiKey, builtinApi }, function () {
        alert("Ayarlar Kaydedildi! BabelNet API anahtarınız güncellendi.");
    });
});
