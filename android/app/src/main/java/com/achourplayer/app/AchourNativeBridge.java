package com.achourplayer.app;

import android.app.Activity;
import android.graphics.Color;
import android.view.Gravity;
import android.view.View;
import android.view.ViewGroup;
import android.view.ViewParent;
import android.webkit.JavascriptInterface;
import android.webkit.WebView;
import android.widget.FrameLayout;

public class AchourNativeBridge {

    private final Activity activity;
    private final WebView webView;
    private volatile AchourNativePlayerView playerView;
    private final AchourNativePlayerView[] multiSlotViews = new AchourNativePlayerView[4];
    private final boolean[] multiSlotPlayingBeforePause = new boolean[4];
    private final int[] lastSlotX = new int[]{Integer.MIN_VALUE, Integer.MIN_VALUE, Integer.MIN_VALUE, Integer.MIN_VALUE};
    private final int[] lastSlotY = new int[]{Integer.MIN_VALUE, Integer.MIN_VALUE, Integer.MIN_VALUE, Integer.MIN_VALUE};
    private final int[] lastSlotW = new int[]{Integer.MIN_VALUE, Integer.MIN_VALUE, Integer.MIN_VALUE, Integer.MIN_VALUE};
    private final int[] lastSlotH = new int[]{Integer.MIN_VALUE, Integer.MIN_VALUE, Integer.MIN_VALUE, Integer.MIN_VALUE};
    private FrameLayout.LayoutParams layoutParams;
    private boolean wasPlayingBeforePause = false;
    private boolean transparencyConfigured = false;
    private int lastBoundX = Integer.MIN_VALUE;
    private int lastBoundY = Integer.MIN_VALUE;
    private int lastBoundW = Integer.MIN_VALUE;
    private int lastBoundH = Integer.MIN_VALUE;

    public AchourNativeBridge(Activity activity) {
        this(activity, null);
    }

    public AchourNativeBridge(Activity activity, WebView webView) {
        this.activity = activity;
        this.webView = webView;
    }

    private void ensureWebViewTransparent(ViewGroup rootView) {
        if (transparencyConfigured) return;
        transparencyConfigured = true;
        if (webView != null) {
            webView.setBackgroundColor(Color.TRANSPARENT);
            ViewParent parent = webView.getParent();
            if (parent instanceof View) {
                ((View) parent).setBackgroundColor(Color.TRANSPARENT);
            }
        }
        if (rootView != null) {
            rootView.setBackgroundColor(Color.parseColor("#080808"));
        }
    }

    private int[] calculateBounds(ViewGroup rootView, int x, int y, int width, int height) {
        float density = activity.getResources().getDisplayMetrics().density;
        int offsetX = 0;
        int offsetY = 0;

        if (webView != null && rootView != null) {
            int[] webLoc = new int[2];
            int[] rootLoc = new int[2];
            webView.getLocationInWindow(webLoc);
            rootView.getLocationInWindow(rootLoc);
            offsetX = webLoc[0] - rootLoc[0];
            offsetY = webLoc[1] - rootLoc[1];
        }

        int px = offsetX + Math.round(x * density);
        int py = offsetY + Math.round(y * density);
        int pw = width <= 0 ? ViewGroup.LayoutParams.MATCH_PARENT : Math.round(width * density);
        int ph = height <= 0 ? ViewGroup.LayoutParams.MATCH_PARENT : Math.round(height * density);

        return new int[]{px, py, pw, ph};
    }

    @JavascriptInterface
    public void showPlayer(
            String url,
            String options,
            int x,
            int y,
            int width,
            int height
    ) {
        activity.runOnUiThread(() -> {
            // Stop any active MultiView slots when single player takes over
            releaseAllMultiSlotsOnUiThread();

            ViewGroup rootView = (ViewGroup) activity.getWindow().getDecorView().findViewById(android.R.id.content);
            int[] bounds = calculateBounds(rootView, x, y, width, height);

            if (playerView == null) {
                ensureWebViewTransparent(rootView);
                playerView = new AchourNativePlayerView(activity);

                layoutParams = new FrameLayout.LayoutParams(
                        bounds[2], bounds[3]
                );

                layoutParams.gravity = Gravity.TOP | Gravity.LEFT;
                layoutParams.leftMargin = bounds[0];
                layoutParams.topMargin = bounds[1];

                lastBoundX = bounds[0];
                lastBoundY = bounds[1];
                lastBoundW = bounds[2];
                lastBoundH = bounds[3];

                if (rootView != null) {
                    rootView.addView(playerView, 0, layoutParams);
                } else {
                    activity.addContentView(playerView, layoutParams);
                }
                playerView.setVisibility(View.VISIBLE);
                playerView.requestLayout();
            } else {
                boolean boundsChanged = bounds[0] != lastBoundX || bounds[1] != lastBoundY
                        || bounds[2] != lastBoundW || bounds[3] != lastBoundH;
                if (boundsChanged) {
                    FrameLayout.LayoutParams params =
                            (FrameLayout.LayoutParams) playerView.getLayoutParams();
                    if (params != null) {
                        params.gravity = Gravity.TOP | Gravity.LEFT;
                        params.leftMargin = bounds[0];
                        params.topMargin = bounds[1];
                        params.width = bounds[2];
                        params.height = bounds[3];
                        playerView.setLayoutParams(params);
                    }
                    lastBoundX = bounds[0];
                    lastBoundY = bounds[1];
                    lastBoundW = bounds[2];
                    lastBoundH = bounds[3];
                }
                if (playerView.getVisibility() != View.VISIBLE) {
                    playerView.setVisibility(View.VISIBLE);
                }
            }

            playerView.setMedia(url, options);
        });
    }

    @JavascriptInterface
    public void playMedia(String url, String optionsJson) {
        showPlayer(url, optionsJson, 0, 0, 0, 0);
    }

    @JavascriptInterface
    public void updateBounds(int x, int y, int width, int height) {
        activity.runOnUiThread(() -> {
            AchourNativePlayerView pv = playerView;
            if (pv == null) return;

            ViewGroup rootView = (ViewGroup) activity.getWindow().getDecorView().findViewById(android.R.id.content);
            int[] bounds = calculateBounds(rootView, x, y, width, height);
            if (bounds[0] == lastBoundX && bounds[1] == lastBoundY
                    && bounds[2] == lastBoundW && bounds[3] == lastBoundH) {
                return;
            }

            FrameLayout.LayoutParams params =
                    (FrameLayout.LayoutParams) pv.getLayoutParams();
            if (params == null) return;

            params.gravity = Gravity.TOP | Gravity.LEFT;
            params.leftMargin = bounds[0];
            params.topMargin = bounds[1];
            params.width = bounds[2];
            params.height = bounds[3];
            lastBoundX = bounds[0];
            lastBoundY = bounds[1];
            lastBoundW = bounds[2];
            lastBoundH = bounds[3];

            pv.setLayoutParams(params);
        });
    }

    @JavascriptInterface
    public void setResizeMode(String mode) {
        activity.runOnUiThread(() -> {
            AchourNativePlayerView pv = playerView;
            if (pv != null) pv.setResizeMode(mode);
        });
    }

    @JavascriptInterface
    public void play() {
        activity.runOnUiThread(() -> {
            AchourNativePlayerView pv = playerView;
            if (pv != null) pv.play();
        });
    }

    @JavascriptInterface
    public void pause() {
        activity.runOnUiThread(() -> {
            AchourNativePlayerView pv = playerView;
            if (pv != null) pv.pause();
        });
    }

    @JavascriptInterface
    public void seekTo(long position) {
        activity.runOnUiThread(() -> {
            AchourNativePlayerView pv = playerView;
            if (pv != null) pv.seekTo(position);
        });
    }

    @JavascriptInterface
    public void setVolume(float volume) {
        activity.runOnUiThread(() -> {
            AchourNativePlayerView pv = playerView;
            if (pv != null) pv.setVolume(volume);
        });
    }

    @JavascriptInterface
    public void setPlaybackSpeed(float speed) {
        activity.runOnUiThread(() -> {
            AchourNativePlayerView pv = playerView;
            if (pv != null) {
                pv.setPlaybackSpeed(speed);
            }
        });
    }

    @JavascriptInterface
    public void setAudioTrack(int trackIndex) {
        activity.runOnUiThread(() -> {
            AchourNativePlayerView pv = playerView;
            if (pv != null) {
                pv.setAudioTrack(trackIndex);
            }
        });
    }

    @JavascriptInterface
    public void setSubtitleTrack(int trackIndex) {
        activity.runOnUiThread(() -> {
            AchourNativePlayerView pv = playerView;
            if (pv != null) {
                pv.setSubtitleTrack(trackIndex);
            }
        });
    }

    @JavascriptInterface
    public void setSubtitleStyle(float fontSizeSp, String textColorHex, String bgMode) {
        activity.runOnUiThread(() -> {
            AchourNativePlayerView pv = playerView;
            if (pv != null) {
                pv.setSubtitleStyle(fontSizeSp, textColorHex, bgMode);
            }
        });
    }

    @JavascriptInterface
    public long getCurrentPosition() {
        AchourNativePlayerView pv = playerView;
        return pv == null ? 0L : pv.getCachedCurrentPosition();
    }

    @JavascriptInterface
    public long getDuration() {
        AchourNativePlayerView pv = playerView;
        return pv == null ? 0L : pv.getCachedDuration();
    }

    @JavascriptInterface
    public boolean isPlaying() {
        AchourNativePlayerView pv = playerView;
        return pv != null && pv.getCachedIsPlaying();
    }

    @JavascriptInterface
    public boolean isEnded() {
        AchourNativePlayerView pv = playerView;
        return pv != null && pv.getCachedIsEnded();
    }

    @JavascriptInterface
    public String getVideoResolution() {
        AchourNativePlayerView pv = playerView;
        return pv == null ? "" : pv.getCachedVideoResolution();
    }

    @JavascriptInterface
    public String getAudioTracks() {
        AchourNativePlayerView pv = playerView;
        return pv == null ? "[]" : pv.getCachedAudioTracks();
    }

    @JavascriptInterface
    public String getSubtitleTracks() {
        AchourNativePlayerView pv = playerView;
        return pv == null ? "[]" : pv.getCachedSubtitleTracks();
    }

    @JavascriptInterface
    public void hidePlayer() {
        activity.runOnUiThread(() -> {
            wasPlayingBeforePause = false;
            if (playerView != null) {
                // Keep ExoPlayer & MediaSourceFactory warm in memory so channel/movie/fullscreen transitions stay instant
                playerView.stopAndHide();
            }
        });
    }

    private void destroyPlayer() {
        activity.runOnUiThread(() -> {
            wasPlayingBeforePause = false;
            if (playerView != null) {
                ViewGroup parent = (ViewGroup) playerView.getParent();
                if (parent != null) {
                    parent.removeView(playerView);
                }
                playerView.release();
                playerView = null;
                layoutParams = null;
                lastBoundX = Integer.MIN_VALUE;
                lastBoundY = Integer.MIN_VALUE;
                lastBoundW = Integer.MIN_VALUE;
                lastBoundH = Integer.MIN_VALUE;
            }
        });
    }

    private void releaseMultiSlotOnUiThread(int slotIndex) {
        if (slotIndex < 0 || slotIndex >= multiSlotViews.length) return;
        multiSlotPlayingBeforePause[slotIndex] = false;
        AchourNativePlayerView slotView = multiSlotViews[slotIndex];
        if (slotView != null) {
            ViewGroup parent = (ViewGroup) slotView.getParent();
            if (parent != null) {
                parent.removeView(slotView);
            }
            slotView.release();
            multiSlotViews[slotIndex] = null;
        }
        lastSlotX[slotIndex] = Integer.MIN_VALUE;
        lastSlotY[slotIndex] = Integer.MIN_VALUE;
        lastSlotW[slotIndex] = Integer.MIN_VALUE;
        lastSlotH[slotIndex] = Integer.MIN_VALUE;
    }

    private void releaseAllMultiSlotsOnUiThread() {
        for (int i = 0; i < multiSlotViews.length; i++) {
            releaseMultiSlotOnUiThread(i);
        }
    }

    @JavascriptInterface
    public void showMultiSlot(
            int slotIndex,
            String url,
            String options,
            int x,
            int y,
            int width,
            int height
    ) {
        if (slotIndex < 0 || slotIndex >= multiSlotViews.length) return;
        activity.runOnUiThread(() -> {
            if (playerView != null) {
                wasPlayingBeforePause = false;
                playerView.stopAndHide();
            }

            ViewGroup rootView = (ViewGroup) activity.getWindow().getDecorView().findViewById(android.R.id.content);
            int[] bounds = calculateBounds(rootView, x, y, width, height);
            AchourNativePlayerView slotView = multiSlotViews[slotIndex];

            if (slotView == null) {
                ensureWebViewTransparent(rootView);
                slotView = new AchourNativePlayerView(activity, true);
                multiSlotViews[slotIndex] = slotView;

                FrameLayout.LayoutParams params = new FrameLayout.LayoutParams(bounds[2], bounds[3]);
                params.gravity = Gravity.TOP | Gravity.LEFT;
                params.leftMargin = bounds[0];
                params.topMargin = bounds[1];

                lastSlotX[slotIndex] = bounds[0];
                lastSlotY[slotIndex] = bounds[1];
                lastSlotW[slotIndex] = bounds[2];
                lastSlotH[slotIndex] = bounds[3];

                if (rootView != null) {
                    rootView.addView(slotView, 0, params);
                } else {
                    activity.addContentView(slotView, params);
                }
                slotView.setVisibility(View.VISIBLE);
                slotView.requestLayout();
            } else {
                boolean boundsChanged = bounds[0] != lastSlotX[slotIndex] || bounds[1] != lastSlotY[slotIndex]
                        || bounds[2] != lastSlotW[slotIndex] || bounds[3] != lastSlotH[slotIndex];
                if (boundsChanged) {
                    FrameLayout.LayoutParams params = (FrameLayout.LayoutParams) slotView.getLayoutParams();
                    if (params != null) {
                        params.gravity = Gravity.TOP | Gravity.LEFT;
                        params.leftMargin = bounds[0];
                        params.topMargin = bounds[1];
                        params.width = bounds[2];
                        params.height = bounds[3];
                        slotView.setLayoutParams(params);
                    }
                    lastSlotX[slotIndex] = bounds[0];
                    lastSlotY[slotIndex] = bounds[1];
                    lastSlotW[slotIndex] = bounds[2];
                    lastSlotH[slotIndex] = bounds[3];
                }
                if (slotView.getVisibility() != View.VISIBLE) {
                    slotView.setVisibility(View.VISIBLE);
                }
            }

            slotView.setMedia(url, options);
        });
    }

    @JavascriptInterface
    public void updateMultiSlotBounds(int slotIndex, int x, int y, int width, int height) {
        if (slotIndex < 0 || slotIndex >= multiSlotViews.length) return;
        activity.runOnUiThread(() -> {
            AchourNativePlayerView slotView = multiSlotViews[slotIndex];
            if (slotView == null) return;

            ViewGroup rootView = (ViewGroup) activity.getWindow().getDecorView().findViewById(android.R.id.content);
            int[] bounds = calculateBounds(rootView, x, y, width, height);
            if (bounds[0] == lastSlotX[slotIndex] && bounds[1] == lastSlotY[slotIndex]
                    && bounds[2] == lastSlotW[slotIndex] && bounds[3] == lastSlotH[slotIndex]) {
                return;
            }

            FrameLayout.LayoutParams params = (FrameLayout.LayoutParams) slotView.getLayoutParams();
            if (params == null) return;

            params.gravity = Gravity.TOP | Gravity.LEFT;
            params.leftMargin = bounds[0];
            params.topMargin = bounds[1];
            params.width = bounds[2];
            params.height = bounds[3];
            lastSlotX[slotIndex] = bounds[0];
            lastSlotY[slotIndex] = bounds[1];
            lastSlotW[slotIndex] = bounds[2];
            lastSlotH[slotIndex] = bounds[3];

            slotView.setLayoutParams(params);
        });
    }

    @JavascriptInterface
    public void setMultiSlotVolume(int slotIndex, float volume) {
        if (slotIndex < 0 || slotIndex >= multiSlotViews.length) return;
        activity.runOnUiThread(() -> {
            AchourNativePlayerView slotView = multiSlotViews[slotIndex];
            if (slotView != null) {
                slotView.setVolume(volume);
            }
        });
    }

    @JavascriptInterface
    public void hideMultiSlot(int slotIndex) {
        if (slotIndex < 0 || slotIndex >= multiSlotViews.length) return;
        activity.runOnUiThread(() -> releaseMultiSlotOnUiThread(slotIndex));
    }

    @JavascriptInterface
    public void hideAllMultiSlots() {
        activity.runOnUiThread(this::releaseAllMultiSlotsOnUiThread);
    }

    @JavascriptInterface
    public boolean isMultiSlotPlaying(int slotIndex) {
        if (slotIndex < 0 || slotIndex >= multiSlotViews.length) return false;
        AchourNativePlayerView slotView = multiSlotViews[slotIndex];
        return slotView != null && slotView.getCachedIsPlaying();
    }

    @JavascriptInterface
    public boolean hasMultiSlotError(int slotIndex) {
        if (slotIndex < 0 || slotIndex >= multiSlotViews.length) return false;
        AchourNativePlayerView slotView = multiSlotViews[slotIndex];
        return slotView != null && slotView.getCachedHasError();
    }

    public void onHostPause() {
        activity.runOnUiThread(() -> {
            if (playerView != null) {
                wasPlayingBeforePause = playerView.isPlaying();
                if (wasPlayingBeforePause) {
                    playerView.pause();
                }
            }
            for (int i = 0; i < multiSlotViews.length; i++) {
                AchourNativePlayerView slotView = multiSlotViews[i];
                if (slotView != null) {
                    boolean playing = slotView.isPlaying();
                    multiSlotPlayingBeforePause[i] = playing;
                    if (playing) {
                        slotView.pause();
                    }
                }
            }
        });
    }

    public void onHostResume() {
        activity.runOnUiThread(() -> {
            if (playerView != null && wasPlayingBeforePause) {
                wasPlayingBeforePause = false;
                playerView.play();
            }
            for (int i = 0; i < multiSlotViews.length; i++) {
                AchourNativePlayerView slotView = multiSlotViews[i];
                if (slotView != null && multiSlotPlayingBeforePause[i]) {
                    multiSlotPlayingBeforePause[i] = false;
                    slotView.play();
                }
            }
        });
    }

    public void onHostDestroy() {
        activity.runOnUiThread(this::releaseAllMultiSlotsOnUiThread);
        destroyPlayer();
    }
}
