# APKs

Los APK generados por Android Studio o por Gradle se copian aquí automáticamente.

```bash
npm run android:apk          # debug
npm run android:apk:release  # release
```

El archivo queda como `apks/RuntimeEnglish-v<version>-debug.apk` o `apks/RuntimeEnglish-v<version>-release.apk` (por ejemplo, `RuntimeEnglish-v1.1.0-debug.apk`).
Los binarios no se versionan en git; esta carpeta conserva las instrucciones y el destino.
