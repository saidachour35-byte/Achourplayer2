package com.achourplayer.app;

import android.content.Context;
import android.graphics.Color;
import android.net.Uri;
import android.os.Handler;
import android.os.Looper;
import android.util.TypedValue;
import android.view.LayoutInflater;
import android.widget.FrameLayout;

import androidx.media3.common.AudioAttributes;
import androidx.media3.common.C;
import androidx.media3.common.Format;
import androidx.media3.common.MediaItem;
import androidx.media3.common.MediaMetadata;
import androidx.media3.common.MimeTypes;
import androidx.media3.common.PlaybackException;
import androidx.media3.common.PlaybackParameters;
import androidx.media3.common.Player;
import androidx.media3.common.TrackSelectionOverride;
import androidx.media3.common.TrackSelectionParameters;
import androidx.media3.common.Tracks;
import androidx.media3.common.VideoSize;
import androidx.media3.datasource.DefaultHttpDataSource;
import androidx.media3.exoplayer.DefaultLoadControl;
import androidx.media3.exoplayer.DefaultRenderersFactory;
import androidx.media3.exoplayer.ExoPlayer;
import androidx.media3.exoplayer.SeekParameters;
import androidx.media3.exoplayer.hls.HlsMediaSource;
import androidx.media3.exoplayer.source.DefaultMediaSourceFactory;
import androidx.media3.ui.AspectRatioFrameLayout;
import androidx.media3.ui.CaptionStyleCompat;
import androidx.media3.ui.PlayerView;
import androidx.media3.ui.SubtitleView;

import org.json.JSONArray;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

public class AchourNativePlayerView extends FrameLayout {

    private ExoPlayer player;
    private PlayerView playerView;
    private DefaultHttpDataSource.Factory persistentHttpFactory;
    private DefaultMediaSourceFactory persistentMediaSourceFactory;
    private HlsMediaSource.Factory persistentHlsFactory;
    private int retryCount = 0;
    private static final int MAX_RETRIES = 5;

    private final boolean isMultiSlot;
    private boolean configuredForLive = false;
    private final Handler mainHandler = new Handler(Looper.getMainLooper());
    private volatile boolean currentIsLive = false;
    private final Runnable retryRunnable = new Runnable() {
        @Override
        public void run() {
            if (player != null) {
                player.prepare();
                player.play();
            }
        }
    };
    private volatile long cachedPositionMs = 0L;
    private volatile long cachedDurationMs = 0L;
    private volatile boolean cachedIsPlaying = false;
    private volatile boolean cachedIsEnded = false;
    private volatile boolean cachedHasError = false;
    private volatile String cachedVideoResolution = "";
    private volatile String cachedAudioTracksJson = "[]";
    private volatile String cachedSubtitleTracksJson = "[]";

    private final Runnable positionTicker = new Runnable() {
        @Override
        public void run() {
            if (player != null && !currentIsLive && player.isPlaying()) {
                refreshPositionSnapshot();
                mainHandler.postDelayed(this, 250);
            }
        }
    };

    private void startPositionTicker() {
        mainHandler.removeCallbacks(positionTicker);
        if (player != null && !currentIsLive && player.isPlaying()) {
            mainHandler.postDelayed(positionTicker, 250);
        }
    }

    private void stopPositionTicker() {
        mainHandler.removeCallbacks(positionTicker);
    }

    public AchourNativePlayerView(Context context) {
        this(context, false);
    }

    public AchourNativePlayerView(Context context, boolean isMultiSlot) {
        super(context);
        this.isMultiSlot = isMultiSlot;
        initialize(context);
    }

    private void initialize(Context context) {
        setFocusable(false);
        setFocusableInTouchMode(false);
        setDescendantFocusability(FOCUS_BLOCK_DESCENDANTS);

        playerView = (PlayerView) LayoutInflater.from(context)
                .inflate(R.layout.view_achour_player, this, false);
        playerView.setUseController(false);
        playerView.setResizeMode(AspectRatioFrameLayout.RESIZE_MODE_FIT);
        playerView.setFocusable(false);
        playerView.setFocusableInTouchMode(false);
        playerView.setKeepScreenOn(true);

        addView(playerView, new FrameLayout.LayoutParams(
                LayoutParams.MATCH_PARENT,
                LayoutParams.MATCH_PARENT
        ));

        persistentHttpFactory =
                new DefaultHttpDataSource.Factory()
                        .setAllowCrossProtocolRedirects(true)
                        .setConnectTimeoutMs(8000)
                        .setReadTimeoutMs(15000);

        persistentMediaSourceFactory = new DefaultMediaSourceFactory(persistentHttpFactory);
        persistentHlsFactory = new HlsMediaSource.Factory(persistentHttpFactory)
                .setAllowChunklessPreparation(true);

        buildExoPlayer(context, false);
    }

    private DefaultLoadControl createLoadControl(boolean forLive) {
        if (isMultiSlot) {
            return new DefaultLoadControl.Builder()
                    .setBufferDurationsMs(
                            2500,   // minBufferMs (lightweight for 2-4 concurrent slots)
                            7000,   // maxBufferMs
                            450,    // bufferForPlaybackMs
                            1000    // bufferForPlaybackAfterRebufferMs
                    )
                    .setTargetBufferBytes(6 * 1024 * 1024)
                    .setPrioritizeTimeOverSizeThresholds(true)
                    .setBackBuffer(0, false)
                    .build();
        }
        if (forLive) {
            return new DefaultLoadControl.Builder()
                    .setBufferDurationsMs(
                            3000,   // minBufferMs (keeps HTTP live socket draining continuously without server idle drops)
                            8000,   // maxBufferMs (prevents 12-18s burst-idle stalls on TS/HLS IPTV streams)
                            700,    // bufferForPlaybackMs (crisp zapping without immediate underrun)
                            1400    // bufferForPlaybackAfterRebufferMs
                    )
                    .setTargetBufferBytes(10 * 1024 * 1024)
                    .setPrioritizeTimeOverSizeThresholds(true)
                    .setBackBuffer(0, false)
                    .build();
        }
        return new DefaultLoadControl.Builder()
                .setBufferDurationsMs(
                        6000,   // minBufferMs (smooth Wi-Fi jitter absorption for VOD)
                        18000,  // maxBufferMs
                        600,    // bufferForPlaybackMs
                        1500    // bufferForPlaybackAfterRebufferMs
                )
                .setTargetBufferBytes(16 * 1024 * 1024)
                .setPrioritizeTimeOverSizeThresholds(true)
                .setBackBuffer(3000, false)
                .build();
    }

    private void buildExoPlayer(Context context, boolean forLive) {
        mainHandler.removeCallbacks(retryRunnable);
        stopPositionTicker();
        if (playerView != null) {
            playerView.setPlayer(null);
        }
        if (player != null) {
            try {
                player.release();
            } catch (Exception ignored) {
            }
            player = null;
        }

        configuredForLive = forLive;
        DefaultLoadControl loadControl = createLoadControl(forLive);

        DefaultRenderersFactory renderersFactory =
                new DefaultRenderersFactory(context)
                        .setEnableDecoderFallback(true);

        AudioAttributes audioAttributes = new AudioAttributes.Builder()
                .setUsage(C.USAGE_MEDIA)
                .setContentType(C.AUDIO_CONTENT_TYPE_MOVIE)
                .build();

        player = new ExoPlayer.Builder(context, renderersFactory)
                .setLoadControl(loadControl)
                .setMediaSourceFactory(persistentMediaSourceFactory)
                .build();

        // Only single-player holds Android AudioFocus so 2-4 MultiView ExoPlayers never pause each other
        player.setAudioAttributes(audioAttributes, !isMultiSlot);
        player.setVideoScalingMode(C.VIDEO_SCALING_MODE_SCALE_TO_FIT);
        player.setSeekParameters(SeekParameters.CLOSEST_SYNC);

        player.addListener(new Player.Listener() {
            @Override
            public void onPlayerError(PlaybackException error) {
                mainHandler.removeCallbacks(retryRunnable);
                if (player == null) return;
                if (error.errorCode == PlaybackException.ERROR_CODE_BEHIND_LIVE_WINDOW) {
                    if (retryCount < MAX_RETRIES) {
                        retryCount++;
                        player.seekToDefaultPosition();
                        player.prepare();
                        player.play();
                    } else {
                        cachedHasError = true;
                        cachedIsPlaying = false;
                    }
                    return;
                }
                if (retryCount < MAX_RETRIES) {
                    retryCount++;
                    if (currentIsLive) {
                        player.seekToDefaultPosition();
                    }
                    mainHandler.postDelayed(retryRunnable, 250L * retryCount);
                } else {
                    cachedHasError = true;
                    cachedIsPlaying = false;
                }
            }

            @Override
            public void onPlaybackStateChanged(int playbackState) {
                if (playbackState == Player.STATE_READY) {
                    cachedIsEnded = false;
                    cachedHasError = false;
                    retryCount = 0;
                    refreshPositionSnapshot();
                    refreshTrackSnapshots();
                    refreshVideoResolution();
                } else if (playbackState == Player.STATE_ENDED) {
                    cachedIsEnded = true;
                    cachedIsPlaying = false;
                    stopPositionTicker();
                    refreshPositionSnapshot();
                }
            }

            @Override
            public void onIsPlayingChanged(boolean isPlaying) {
                cachedIsPlaying = isPlaying;
                refreshPositionSnapshot();
                if (isPlaying && !currentIsLive) {
                    startPositionTicker();
                } else {
                    stopPositionTicker();
                }
            }

            @Override
            public void onTracksChanged(Tracks tracks) {
                refreshTrackSnapshots();
            }

            @Override
            public void onVideoSizeChanged(VideoSize videoSize) {
                if (videoSize != null && videoSize.width > 0 && videoSize.height > 0) {
                    cachedVideoResolution = videoSize.width + "x" + videoSize.height;
                } else {
                    refreshVideoResolution();
                }
            }

            @Override
            public void onPositionDiscontinuity(
                    Player.PositionInfo oldPosition,
                    Player.PositionInfo newPosition,
                    int reason
            ) {
                refreshPositionSnapshot();
            }
        });

        if (playerView != null) {
            playerView.setPlayer(player);
        }
    }

    private void refreshPositionSnapshot() {
        if (player == null) return;
        cachedPositionMs = Math.max(0L, player.getCurrentPosition());
        long dur = player.getDuration();
        cachedDurationMs = (dur == C.TIME_UNSET || dur < 0L) ? 0L : dur;
        cachedIsPlaying = player.isPlaying();
    }

    private void refreshVideoResolution() {
        if (player == null) {
            cachedVideoResolution = "";
            return;
        }
        try {
            VideoSize size = player.getVideoSize();
            if (size != null && size.width > 0 && size.height > 0) {
                cachedVideoResolution = size.width + "x" + size.height;
                return;
            }
            Format format = player.getVideoFormat();
            if (format != null && format.width > 0 && format.height > 0) {
                cachedVideoResolution = format.width + "x" + format.height;
                return;
            }
        } catch (Exception ignored) {
        }
        cachedVideoResolution = "";
    }

    private void refreshTrackSnapshots() {
        if (currentIsLive) return;
        cachedAudioTracksJson = buildAudioTracksJson();
        cachedSubtitleTracksJson = buildSubtitleTracksJson();
    }

    public void setMedia(String url, String optionsJson) {
        if (url == null || url.trim().isEmpty()) return;

        if (getVisibility() != VISIBLE) {
            setVisibility(VISIBLE);
        }
        if (playerView != null) {
            playerView.setKeepScreenOn(true);
        }

        mainHandler.removeCallbacks(retryRunnable);
        retryCount = 0;
        cachedPositionMs = 0L;
        cachedDurationMs = 0L;
        cachedIsEnded = false;
        cachedHasError = false;
        cachedVideoResolution = "";
        cachedAudioTracksJson = "[]";
        cachedSubtitleTracksJson = "[]";

        String title = "Achour Player";
        boolean isLiveStream = false;
        boolean autoPlay = true;
        boolean initialMuted = false;
        float initialVolume = 1f;
        long startPositionMs = 0L;
        Map<String, String> headers = new HashMap<>();
        headers.put("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36");

        JSONObject parsedOptions = null;
        try {
            parsedOptions = new JSONObject(
                    optionsJson == null ? "{}" : optionsJson
            );

            title = parsedOptions.optString("title", title);
            isLiveStream = parsedOptions.optBoolean("isLive", false);
            autoPlay = parsedOptions.optBoolean("autoPlay", true);
            initialMuted = parsedOptions.optBoolean("muted", false);
            double volOpt = parsedOptions.optDouble("volume", initialMuted ? 0.0 : 1.0);
            initialVolume = initialMuted ? 0f : (float) Math.max(0.0, Math.min(1.0, volOpt));
            startPositionMs = Math.max(0L, parsedOptions.optLong("startPositionMs", 0L));

            JSONObject headerObject = parsedOptions.optJSONObject("headers");

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

        currentIsLive = isLiveStream;
        stopPositionTicker();
        if (!isMultiSlot && (player == null || configuredForLive != isLiveStream)) {
            buildExoPlayer(getContext(), isLiveStream);
        }
        if (player == null) return;

        if (persistentHttpFactory != null) {
            persistentHttpFactory.setDefaultRequestProperties(headers);
        }

        String trimmedUrl = url.trim();
        MediaItem.Builder item = new MediaItem.Builder()
                .setUri(trimmedUrl);

        String lowerUrl = trimmedUrl.toLowerCase();
        int queryIdx = lowerUrl.indexOf('?');
        String pathOnly = queryIdx >= 0 ? lowerUrl.substring(0, queryIdx) : lowerUrl;
        boolean isHlsStream = false;

        if (pathOnly.endsWith(".m3u8") || lowerUrl.contains(".m3u8")) {
            item.setMimeType(MimeTypes.APPLICATION_M3U8);
            isHlsStream = true;
        } else if (pathOnly.endsWith(".ts") || pathOnly.endsWith(".mpegts")) {
            item.setMimeType(MimeTypes.VIDEO_MP2T);
        } else if (pathOnly.endsWith(".mp4") || pathOnly.endsWith(".m4v") || pathOnly.endsWith(".mov")) {
            item.setMimeType(MimeTypes.APPLICATION_MP4);
        } else if (pathOnly.endsWith(".mkv") || pathOnly.endsWith(".webm")) {
            item.setMimeType(MimeTypes.VIDEO_MATROSKA);
        } else if (pathOnly.endsWith(".avi")) {
            item.setMimeType(MimeTypes.VIDEO_AVI);
        } else if (pathOnly.endsWith(".flv")) {
            item.setMimeType(MimeTypes.VIDEO_FLV);
        }

        if (isLiveStream && isHlsStream) {
            // Keep natural playlist live hold-back at steady 1.0x speed so Fire TV never starves or resamples audio every ~20s
            item.setLiveConfiguration(
                    new MediaItem.LiveConfiguration.Builder()
                            .setMinPlaybackSpeed(1.0f)
                            .setMaxPlaybackSpeed(1.0f)
                            .build()
            );
        }

        item.setMediaMetadata(
                new MediaMetadata.Builder()
                        .setTitle(title)
                        .build()
        );

        try {
            if (parsedOptions != null && !isLiveStream) {
                JSONArray subsArray = parsedOptions.optJSONArray("subtitles");
                if (subsArray != null && subsArray.length() > 0) {
                    List<MediaItem.SubtitleConfiguration> subConfigs = new ArrayList<>();
                    for (int i = 0; i < subsArray.length(); i++) {
                        JSONObject subObj = subsArray.optJSONObject(i);
                        if (subObj == null) continue;
                        String subUrl = subObj.optString("url", "").trim();
                        if (subUrl.isEmpty()) continue;
                        String subLang = subObj.optString("lang", "").trim();
                        String subLabel = subObj.optString("label", "").trim();
                        String subMime = subObj.optString("mimeType", "").trim();
                        if (subMime.isEmpty()) {
                            String lowerSub = subUrl.toLowerCase();
                            if (lowerSub.contains(".vtt")) subMime = MimeTypes.TEXT_VTT;
                            else if (lowerSub.contains(".ass") || lowerSub.contains(".ssa")) subMime = MimeTypes.TEXT_SSA;
                            else subMime = MimeTypes.APPLICATION_SUBRIP;
                        }
                        MediaItem.SubtitleConfiguration.Builder subBuilder =
                                new MediaItem.SubtitleConfiguration.Builder(Uri.parse(subUrl))
                                        .setMimeType(subMime);
                        if (!subLang.isEmpty()) subBuilder.setLanguage(subLang);
                        if (!subLabel.isEmpty()) subBuilder.setLabel(subLabel);
                        subConfigs.add(subBuilder.build());
                    }
                    if (!subConfigs.isEmpty()) {
                        item.setSubtitleConfigurations(subConfigs);
                    }
                }
            }
        } catch (Exception ignored) {
        }

        if (!isLiveStream) {
            // Clear any previous overrides and start with subtitles OFF until explicitly selected by user
            TrackSelectionParameters resetParams = player.getTrackSelectionParameters()
                    .buildUpon()
                    .clearOverridesOfType(C.TRACK_TYPE_AUDIO)
                    .clearOverridesOfType(C.TRACK_TYPE_TEXT)
                    .setTrackTypeDisabled(C.TRACK_TYPE_TEXT, true)
                    .build();
            player.setTrackSelectionParameters(resetParams);
        }

        MediaItem builtItem = item.build();
        long initialPosMs = (!isLiveStream && startPositionMs > 0L) ? startPositionMs : C.TIME_UNSET;
        if (isHlsStream && persistentHlsFactory != null) {
            if (initialPosMs != C.TIME_UNSET) {
                player.setMediaSource(persistentHlsFactory.createMediaSource(builtItem), initialPosMs);
            } else {
                player.setMediaSource(persistentHlsFactory.createMediaSource(builtItem), true);
            }
        } else if (persistentMediaSourceFactory != null) {
            if (initialPosMs != C.TIME_UNSET) {
                player.setMediaSource(persistentMediaSourceFactory.createMediaSource(builtItem), initialPosMs);
            } else {
                player.setMediaSource(persistentMediaSourceFactory.createMediaSource(builtItem), true);
            }
        } else {
            if (initialPosMs != C.TIME_UNSET) {
                player.setMediaItem(builtItem, initialPosMs);
            } else {
                player.setMediaItem(builtItem, true);
            }
        }

        if (initialPosMs != C.TIME_UNSET) {
            cachedPositionMs = initialPosMs;
        }
        player.setVolume(initialVolume);
        player.setPlayWhenReady(autoPlay);
        player.prepare();
        cachedIsPlaying = autoPlay;
    }

    public void setResizeMode(String mode) {
        if (playerView == null || mode == null) return;
        switch (mode) {
            case "fill":
                playerView.setResizeMode(AspectRatioFrameLayout.RESIZE_MODE_FILL);
                break;
            case "zoom":
                playerView.setResizeMode(AspectRatioFrameLayout.RESIZE_MODE_ZOOM);
                break;
            case "16:9":
            case "4:3":
            case "fit":
            default:
                playerView.setResizeMode(AspectRatioFrameLayout.RESIZE_MODE_FIT);
                break;
        }
    }

    public void play() {
        if (player != null) {
            player.play();
            cachedIsPlaying = true;
            startPositionTicker();
        }
    }

    public void pause() {
        if (player != null) {
            player.pause();
            cachedIsPlaying = false;
            stopPositionTicker();
        }
    }

    public void seekTo(long position) {
        if (player == null) return;
        try {
            boolean wasPlaying = player.getPlayWhenReady();
            long targetPos = Math.max(0, position);
            long dur = player.getDuration();
            if (dur != C.TIME_UNSET && dur > 0) {
                targetPos = Math.min(dur, targetPos);
            }
            cachedPositionMs = targetPos;
            player.seekTo(targetPos);
            if (player.getPlaybackState() == Player.STATE_IDLE) {
                player.prepare();
            }
            if (wasPlaying) {
                player.setPlayWhenReady(true);
            }
        } catch (Exception ignored) {
        }
    }

    public void setVolume(float volume) {
        if (player != null) {
            player.setVolume(Math.max(0f, Math.min(1f, volume)));
        }
    }

    public void setPlaybackSpeed(float speed) {
        if (player != null && speed > 0) {
            player.setPlaybackParameters(
                    new PlaybackParameters(speed)
            );
        }
    }

    private int findFirstSupportedTrackIndex(Tracks.Group group) {
        if (group == null || group.length == 0) return -1;
        for (int t = 0; t < group.length; t++) {
            if (group.isTrackSupported(t)) {
                return t;
            }
        }
        return 0;
    }

    public void setAudioTrack(int trackIndex) {
        if (player == null) return;
        try {
            TrackSelectionParameters.Builder builder = player.getTrackSelectionParameters()
                    .buildUpon()
                    .clearOverridesOfType(C.TRACK_TYPE_AUDIO)
                    .setTrackTypeDisabled(C.TRACK_TYPE_AUDIO, false);

            if (trackIndex >= 0) {
                List<Tracks.Group> audioGroups = getGroupsForType(C.TRACK_TYPE_AUDIO);
                if (trackIndex < audioGroups.size()) {
                    Tracks.Group group = audioGroups.get(trackIndex);
                    int supportedIdx = findFirstSupportedTrackIndex(group);
                    if (supportedIdx >= 0) {
                        builder.addOverride(new TrackSelectionOverride(
                                group.getMediaTrackGroup(),
                                supportedIdx
                        ));
                    }
                }
            }

            player.setTrackSelectionParameters(builder.build());
            refreshTrackSnapshots();
        } catch (Exception ignored) {
        }
    }

    public void setSubtitleTrack(int trackIndex) {
        if (player == null) return;
        try {
            TrackSelectionParameters.Builder builder = player.getTrackSelectionParameters()
                    .buildUpon()
                    .clearOverridesOfType(C.TRACK_TYPE_TEXT);

            if (trackIndex < 0) {
                builder.setTrackTypeDisabled(C.TRACK_TYPE_TEXT, true);
            } else {
                builder.setTrackTypeDisabled(C.TRACK_TYPE_TEXT, false);
                List<Tracks.Group> textGroups = getGroupsForType(C.TRACK_TYPE_TEXT);
                if (trackIndex < textGroups.size()) {
                    Tracks.Group group = textGroups.get(trackIndex);
                    int supportedIdx = findFirstSupportedTrackIndex(group);
                    if (supportedIdx >= 0) {
                        builder.addOverride(new TrackSelectionOverride(
                                group.getMediaTrackGroup(),
                                supportedIdx
                        ));
                    }
                }
            }

            player.setTrackSelectionParameters(builder.build());
            refreshTrackSnapshots();
        } catch (Exception ignored) {
        }
    }

    public void setSubtitleStyle(float fontSizeSp, String textColorHex, String bgMode) {
        if (playerView == null) return;
        SubtitleView subView = playerView.getSubtitleView();
        if (subView == null) return;
        try {
            int fgColor = Color.WHITE;
            if (textColorHex != null && !textColorHex.trim().isEmpty()) {
                try {
                    fgColor = Color.parseColor(textColorHex.trim());
                } catch (IllegalArgumentException ignored) {
                    fgColor = Color.WHITE;
                }
            }
            int bgColor = Color.argb(165, 0, 0, 0);
            if ("none".equalsIgnoreCase(bgMode)) {
                bgColor = Color.TRANSPARENT;
            } else if ("black".equalsIgnoreCase(bgMode)) {
                bgColor = Color.argb(242, 0, 0, 0);
            }
            CaptionStyleCompat style = new CaptionStyleCompat(
                    fgColor,
                    bgColor,
                    Color.TRANSPARENT,
                    CaptionStyleCompat.EDGE_TYPE_DROP_SHADOW,
                    Color.BLACK,
                    null
            );
            subView.setApplyEmbeddedStyles(false);
            subView.setStyle(style);
            if (fontSizeSp > 0f) {
                subView.setFixedTextSize(TypedValue.COMPLEX_UNIT_SP, fontSizeSp);
            }
        } catch (Exception ignored) {
        }
    }

    private List<Tracks.Group> getGroupsForType(int trackType) {
        List<Tracks.Group> matching = new ArrayList<>();
        if (player == null) return matching;
        Tracks currentTracks = player.getCurrentTracks();
        for (Tracks.Group group : currentTracks.getGroups()) {
            if (group.getType() == trackType) {
                matching.add(group);
            }
        }
        return matching;
    }

    public long getCurrentPosition() {
        return player == null ? 0 : Math.max(0, player.getCurrentPosition());
    }

    public long getCachedCurrentPosition() {
        return cachedPositionMs;
    }

    public long getDuration() {
        if (player == null) return 0;
        long dur = player.getDuration();
        return dur == C.TIME_UNSET || dur < 0 ? 0 : dur;
    }

    public long getCachedDuration() {
        return cachedDurationMs;
    }

    public boolean isPlaying() {
        return player != null && player.isPlaying();
    }

    public boolean getCachedIsPlaying() {
        return cachedIsPlaying;
    }

    public boolean getCachedIsEnded() {
        return cachedIsEnded;
    }

    public boolean getCachedHasError() {
        return cachedHasError;
    }

    private String buildAudioTracksJson() {
        JSONArray result = new JSONArray();
        if (player == null) return "[]";
        try {
            List<Tracks.Group> groups = getGroupsForType(C.TRACK_TYPE_AUDIO);
            for (int i = 0; i < groups.size(); i++) {
                Tracks.Group group = groups.get(i);
                if (group.length == 0) continue;
                int fmtIdx = findFirstSupportedTrackIndex(group);
                Format fmt = group.getTrackFormat(Math.max(0, fmtIdx));
                JSONObject obj = new JSONObject();
                obj.put("id", i);
                obj.put("lang", fmt.language != null ? fmt.language : "");
                obj.put("label", fmt.label != null ? fmt.label : "");
                int ch = fmt.channelCount;
                obj.put("channels", ch);
                String chLabel = "";
                if (ch >= 8) chLabel = "7.1";
                else if (ch >= 6) chLabel = "5.1";
                else if (ch == 2) chLabel = "Stereo";
                else if (ch == 1) chLabel = "Mono";
                obj.put("channelLabel", chLabel);
                obj.put("bitrate", fmt.bitrate);
                obj.put("selected", group.isSelected());
                result.put(obj);
            }
        } catch (Exception ignored) {
        }
        return result.toString();
    }

    public String getAudioTracks() {
        return buildAudioTracksJson();
    }

    public String getCachedAudioTracks() {
        return cachedAudioTracksJson;
    }

    private String buildSubtitleTracksJson() {
        JSONArray result = new JSONArray();
        if (player == null) return "[]";
        try {
            List<Tracks.Group> groups = getGroupsForType(C.TRACK_TYPE_TEXT);
            for (int i = 0; i < groups.size(); i++) {
                Tracks.Group group = groups.get(i);
                if (group.length == 0) continue;
                int fmtIdx = findFirstSupportedTrackIndex(group);
                Format fmt = group.getTrackFormat(Math.max(0, fmtIdx));
                JSONObject obj = new JSONObject();
                obj.put("id", i);
                obj.put("lang", fmt.language != null ? fmt.language : "");
                obj.put("label", fmt.label != null ? fmt.label : "");
                obj.put("mimeType", fmt.sampleMimeType != null ? fmt.sampleMimeType : "");
                obj.put("selected", group.isSelected());
                result.put(obj);
            }
        } catch (Exception ignored) {
        }
        return result.toString();
    }

    public String getSubtitleTracks() {
        return buildSubtitleTracksJson();
    }

    public String getCachedSubtitleTracks() {
        return cachedSubtitleTracksJson;
    }

    public String getVideoResolution() {
        if (player == null) return "";
        try {
            VideoSize size = player.getVideoSize();
            if (size != null && size.width > 0 && size.height > 0) {
                return size.width + "x" + size.height;
            }
            Format format = player.getVideoFormat();
            if (format != null && format.width > 0 && format.height > 0) {
                return format.width + "x" + format.height;
            }
        } catch (Exception ignored) {}
        return "";
    }

    public String getCachedVideoResolution() {
        return cachedVideoResolution;
    }

    public void stopAndHide() {
        mainHandler.removeCallbacks(retryRunnable);
        stopPositionTicker();
        cachedIsPlaying = false;
        cachedIsEnded = false;
        cachedHasError = false;
        cachedPositionMs = 0L;
        cachedDurationMs = 0L;
        cachedVideoResolution = "";
        cachedAudioTracksJson = "[]";
        cachedSubtitleTracksJson = "[]";

        if (playerView != null) {
            playerView.setKeepScreenOn(false);
        }
        if (player != null) {
            try {
                player.stop();
                player.clearMediaItems();
            } catch (Exception ignored) {
            }
        }
        setVisibility(GONE);
    }

    public void release() {
        mainHandler.removeCallbacks(retryRunnable);
        stopPositionTicker();
        cachedIsPlaying = false;
        cachedIsEnded = false;
        cachedPositionMs = 0L;
        cachedDurationMs = 0L;
        cachedVideoResolution = "";
        cachedAudioTracksJson = "[]";
        cachedSubtitleTracksJson = "[]";

        if (playerView != null) {
            playerView.setKeepScreenOn(false);
            playerView.setPlayer(null);
        }

        if (player != null) {
            player.release();
            player = null;
        }
    }
}

