# Keep RN + native module entry points (extend as third-party libs require).
-keep class com.facebook.react.** { *; }
-keep class com.facebook.jni.** { *; }
-keep class com.facebook.hermes.** { *; }
-keep class com.facebook.infer.annotation.** { *; }
-keep class com.facebook.proguard.** { *; }
-keep class com.facebook.yoga.** { *; }

# React Native AsyncStorage / MMKV / Keychain / NetInfo bridges
-keep class com.reactnativecommunity.** { *; }
-keep class com.swmansion.** { *; }
-keep class com.zoontek.** { *; }
-keep class com.nhancv.** { *; }
-keep class com.reactnativekv.** { *; }

# OkHttp / Retrofit (axios native stack if used)
-dontwarn okhttp3.**
-dontwarn okio.**
-keep class okhttp3.** { *; }
-keep class okio.** { *; }

# Enum values referenced from native
-keepclassmembers enum * {
    public static **[] values();
    public static ** valueOf(java.lang.String);
}

# Parcelable
-keep class * implements android.os.Parcelable {
  public static final android.os.Parcelable$Creator *;
}
