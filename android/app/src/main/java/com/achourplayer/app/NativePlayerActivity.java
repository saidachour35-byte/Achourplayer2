package com.achourplayer.app;

import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.view.View;
import android.view.Window;
import android.view.WindowManager;
import android.widget.Toast;

import androidx.annotation.Nullable;
import androidx.appcompat.app.AppCompatActivity;
import androidx.media3.common.AudioAttributes;
import androidx.media3.common.C;
import androidx.media3.common.MediaItem;
import androidx.media3.common.MediaMetadata;
import androidx.media3.common.MimeTypes;
import androidx.media3.common.PlaybackException;
import androidx.media3.common.Player;
import androidx.media3.datasource.okhttp.OkHttpDataSource;
import androidx.media3.exoplayer.DefaultLoadControl;
import androidx.media3.exoplayer.DefaultRenderersFactory;
import androidx.media3.exoplayer.ExoPlayer;
import androidx.media3.exoplayer.source.DefaultMediaSourceFactory;
import androidx.media3.extractor.DefaultExtractorsFactory;
import androidx.media3.extractor.ts.DefaultTsPayloadReaderFactory;
import androidx.media3.ui.PlayerView;

import org.json.JSONObject;

import java.security.SecureRandom;
import java.security.cert.X509Certificate;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;
import java.util.concurrent.TimeUnit;

import javax.net.ssl.SSLContext;
import javax.net.ssl.SSLSocketFactory;
import javax.net.ssl.TrustManager;
import javax.net.ssl.X509TrustManager;

import okhttp3.ConnectionPool;
import okhttp3.OkHttpClient;

public class NativePlayerActivity extends AppCompatActivity {

    public static final String EXTRA_URL = "achour.extra.URL";
    public static final String EXTRA_OPTIONS = "achour.extra.OPTIONS";

    private ExoPlayer player;
    private PlayerView playerView;
    private OkHttpDataSource.Factory httpFactory;
    private DefaultMediaSourceFactory mediaSourceFactory;

    private String currentUrl = "";
    private String currentTitle = "Achour TV";
    private boolean triedFallbackFormat = false;
    private int retryCount = 0;
    private static final int MAX_RETRIES = 6;
    private final Handler mainHandler = new Handler(Looper.getMainLooper());

    private OkHttpClient createUnsafeOkHttpClient() {
        ConnectionPool connectionPool = new ConnectionPool(5, 45, TimeUnit.SECONDS);
        try {
            final X509TrustManager trustManager = new X509TrustManager() {
                @Override
                public void checkClientTrusted(X509Certificate[] chain, String authType) {}

                @Override
                public void checkServerTrusted(X509Certificate[] chain, String authType) {}

                @Override
                public X509Certificate[] getAcceptedIssuers() {
                    return new X509Certificate[]{};
                }
            };

            final SSLContext sslContext = SSLContext.getInstance("TLS");
            sslContext.init(null, new TrustManager[]{trustManager}, new SecureRandom());
            final SSLSocketFactory sslSocketFactory = sslContext.getSocketFactory();

            return new OkHttpClient.Builder()
                    .sslSocketFactory(sslSocketFactory, trustManager)
                    .hostnameVerifier((hostname, session) -> true)
                    .connectionPool(connectionPool)
                    .pingInterval(15, TimeUnit.SECONDS)
                    .followRedirects(true)
                    .followSslRedirects(true)
                    .retryOnConnectionFailure(true)
                    .connectTimeout(15, TimeUnit.SECONDS)
                    .readTimeout(25, TimeUnit.SECONDS)
                    .build();
        } catch (Exception e) {
            return new OkHttpClient.Builder()
                    .connectionPool(connectionPool)
                    .pingInterval(15, TimeUnit.SECONDS)
                    .followRedirects(true)
                    .followSslRedirects(true)
                    .retryOnConnectionFailure(true)
                    .connectTimeout(15, TimeUnit.SECONDS)
                    .readTimeout(25, TimeUnit.SECONDS)
                    .build();
        }
    }

    @Override
    protected void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
        hideSystemUi();

        String url = getIntent().getStringExtra(EXTRA_URL);
        String optionsJson = getIntent().getStringExtra(EXTRA_OPTIONS);

        if (url == null || url.trim().isEmpty()) {
            Toast.makeText(this, "Stream URL is missing", Toast.LENGTH_LONG).show();
            finish();
            return;
        }

        currentUrl = url.trim();
        Map<String, String> headers = new HashMap<>();
        headers.put("User-Agent", "VLC/3.0.18 LibVLC/3.0.18");
        headers.put("Accept", "*/*");
        headers.put("Connection", "keep-alive");

        try {
            JSONObject options = new JSONObject(optionsJson == null ? "{}" : optionsJson);
            currentTitle = options.optString("title", currentTitle);

            JSONObject headerObject = options.optJSONObject("headers");
            if (headerObject != null) {
                Iterator<String> keys = headerObject.keys();
                while (keys.hasNext()) {
                    String key = keys.next();
                    String value = headerObject.optString(key, "");
                    if (!value.isEmpty()) {
                        headers.put(key, value);
                    }
                }
            }
        } catch (Exception ignored) {
        }

        playerView = new PlayerView(this);
        playerView.setUseController(true);
        playerView.setControllerAutoShow(true);
        playerView.setShowBuffering(PlayerView.SHOW_BUFFERING_WHEN_PLAYING);
        setContentView(playerView);

        OkHttpClient okHttpClient = createUnsafeOkHttpClient();
        httpFactory = new OkHttpDataSource.Factory(okHttpClient)
                .setUserAgent("VLC/3.0.18 LibVLC/3.0.18")
                .setDefaultRequestProperties(headers);

        DefaultExtractorsFactory extractorsFactory = new DefaultExtractorsFactory()
                .setConstantBitrateSeekingEnabled(true)
                .setTsExtractorFlags(
                        DefaultTsPayloadReaderFactory.FLAG_ALLOW_NON_IDR_KEYFRAMES
                                | DefaultTsPayloadReaderFactory.FLAG_DETECT_ACCESS_UNITS
                );

        mediaSourceFactory = new DefaultMediaSourceFactory(httpFactory, extractorsFactory);

        DefaultLoadControl loadControl = new DefaultLoadControl.Builder()
                .setBufferDurationsMs(8000, 25000, 2200, 3500)
                .setTargetBufferBytes(24 * 1024 * 1024)
                .setPrioritizeTimeOverSizeThresholds(true)
                .setBackBuffer(2000, false)
                .build();

        DefaultRenderersFactory renderersFactory = new DefaultRenderersFactory(this)
                .setEnableDecoderFallback(true)
                .setExtensionRendererMode(DefaultRenderersFactory.EXTENSION_RENDERER_MODE_PREFER);

        AudioAttributes audioAttributes = new AudioAttributes.Builder()
                .setUsage(C.USAGE_MEDIA)
                .setContentType(C.AUDIO_CONTENT_TYPE_MOVIE)
                .build();

        player = new ExoPlayer.Builder(this, renderersFactory)
                .setLoadControl(loadControl)
                .setMediaSourceFactory(mediaSourceFactory)
                .build();

        player.setAudioAttributes(audioAttributes, true);
        playerView.setPlayer(player);

        player.addListener(new Player.Listener() {
            @Override
            public void onPlayerError(PlaybackException error) {
                if (player == null) return;

                if (error.errorCode == PlaybackException.ERROR_CODE_BEHIND_LIVE_WINDOW) {
                    if (retryCount < MAX_RETRIES) {
                        retryCount++;
                        player.seekToDefaultPosition();
                        player.prepare();
                        player.play();
                    }
                    return;
                }

                // تبديل ذكي تلقائي بين .ts و .m3u8 إذا رفض السيرفر الصيغة الأولى
                if (!triedFallbackFormat && currentUrl != null) {
                    String altUrl = null;
                    if (currentUrl.endsWith(".ts")) {
                        altUrl = currentUrl.substring(0, currentUrl.length() - 3) + ".m3u8";
                    } else if (currentUrl.endsWith(".m3u8")) {
                        altUrl = currentUrl.substring(0, currentUrl.length() - 5) + ".ts";
                    }
                    if (altUrl != null) {
                        triedFallbackFormat = true;
                        currentUrl = altUrl;
                        loadStream(currentUrl);
                        return;
                    }
                }

                if (retryCount < MAX_RETRIES) {
                    retryCount++;
                    mainHandler.postDelayed(() -> {
                        if (player != null) {
                            player.prepare();
                            player.play();
                        }
                    }, 400L * retryCount);
                } else {
                    Toast.makeText(
                            NativePlayerActivity.this,
                            "Playback error: " + error.getErrorCodeName(),
                            Toast.LENGTH_LONG
                    ).show();
                }
            }

            @Override
            public void onPlaybackStateChanged(int playbackState) {
                if (playbackState == Player.STATE_READY) {
                    retryCount = 0;
                }
            }
        });

        loadStream(currentUrl);
    }

    private void loadStream(String streamUrl) {
        if (player == null || streamUrl == null) return;

