# Achour Player (IPTV & Media3 Android / Fire TV Edition)

مشغّل IPTV متكامل ومحسّن للعمل بسلاسة على أجهزة **Amazon Fire TV Stick 4K (1st Gen 2018 / Fire OS 6)** وأجهزة **Android TV / Android Box** والهواتف الذكية، مع دعم التشغيل المباشر عبر **AndroidX Media3 ExoPlayer** ومحرك استخراج فائق السرعة للقوائم الضخمة (+800,000 عنصر).

---

## المميزات الرئيسية

- **محرك استخراج تدفقي عالي السرعة (Web Worker + 0-Index Bucket DB)**: معالجة قوائم Xtream Codes و M3U الضخمة في خيط خلفي بدون تجميد الواجهة أو استنزاف الذاكرة.
- **أولوية البث المباشر (`Live TV -> Movies -> Series`)**: دخول فوري لقسم Live TV بمجرد انتهاء تحميل القنوات المباشرة أثناء استكمال الأفلام والمسلسلات في الخلفية.
- **وكيل بث محلي في Android (`AchourNativeBridge`)**: تمرير البيانات بمخزن مؤقت ثابت `64KB` على `127.0.0.1` لتفادي أخطاء `OutOfMemoryError` على الأجهزة ذات 1.5GB RAM.
- **مشغل Media3 ExoPlayer مدمج (`TextureView`)**: معاينة مدمجة في شاشة Live TV وشاشة كاملة بدون أي تعارض مع خلفية التطبيق أو أزرار الريموت كنترول.
- **دعم كامل للريموت كنترول (D-Pad / Leanback)** وشاشات اللمس على الهواتف.

---

## المتطلبات التقنية لبناء APK Release

| الأداة / المكون | الإصدار المعتمد |
| --- | --- |
| **Node.js** | 20 LTS |
| **Java JDK** | **Java 17 (Temurin / OpenJDK 17)** |
| **Gradle Wrapper** | **8.5** |
| **Android Gradle Plugin (AGP)** | **8.2.1** |
| **Capacitor** | **6.1.2** |
| **AndroidX Media3** | **1.4.1** |
| **minSdkVersion** | **24** (يدعم Fire OS 6 / Android 7.1+) |
| **compileSdk / targetSdk** | **34** (Android 14) |

---

## خطوات بناء ملف APK Release محلياً

```bash
# 1. تثبيت الاعتماديات
npm install

# 2. فحص TypeScript وبناء تطبيق الويب
npm run lint
npm run build

# 3. مزامنة مشروع Android عبر Capacitor
npx cap sync android

# 4. بناء APK Release (Linux / macOS)
cd android
chmod +x gradlew
./gradlew assembleRelease --no-daemon
```

> على نظام Windows داخل مجلد `android`:
> ```bat
> gradlew.bat assembleRelease --no-daemon
> ```

سيتم إنشاء ملف الـ APK في المسار:
`android/app/build/outputs/apk/release/app-release.apk`

---

## توقيع Release APK بمفتاح إنتاج خاص (Production Keystore)

افتراضياً، إذا لم يُضف مفتاح إنتاج مخصص، يتم التوقيع بمفتاح Debug حتى يكون ملف `app-release.apk` جاهزاً للتثبيت المباشر على Fire TV (`adb install` أو Downloader).

لتوقيعه بمفتاح إنتاج خاص:
1. أنشئ ملف `android/keystore.properties` (مُدرج في `.gitignore` ولن يُرفع إلى GitHub):
   ```properties
   storeFile=release.keystore
   storePassword=YOUR_STORE_PASSWORD
   keyAlias=YOUR_KEY_ALIAS
   keyPassword=YOUR_KEY_PASSWORD
   ```
2. أو مرّر متغيرات البيئة التالية (أو عبر **GitHub Actions Secrets**):
   - `ANDROID_KEYSTORE_PATH`
   - `ANDROID_KEYSTORE_PASSWORD`
   - `ANDROID_KEY_ALIAS`
   - `ANDROID_KEY_PASSWORD`

---

## البناء التلقائي عبر GitHub Actions

المشروع مجهز بملف `.github/workflows/android-build.yml`:
1. ارفع المشروع إلى Repository جديد على GitHub (`main` أو `master`).
2. سيقوم GitHub Actions تلقائياً بفحص `tsc --noEmit` وبناء Vite ومزامنة Capacitor وتثبيت JDK 17 و Android SDK 34 ثم بناء `app-release.apk`.
3. حمّل الناتج الجاهز من تبويب **Actions -> Artifacts -> `AchourPlayer-FireTV-Release-APK`**.

---

## التثبيت على Amazon Fire TV Stick 4K 2018 (Fire OS 6)

```bash
adb connect <FIRE_TV_IP>:5555
adb install -r android/app/build/outputs/apk/release/app-release.apk
```
