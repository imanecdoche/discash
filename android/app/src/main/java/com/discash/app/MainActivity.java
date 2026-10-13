package com.discash.app;

import android.graphics.Color;
import android.os.Bundle;
import android.view.View;
import android.view.Window;
import android.view.WindowManager;
import android.webkit.WebSettings;
import android.webkit.WebView;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.core.view.WindowInsetsControllerCompat;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        Window window = getWindow();

        // 1. NON-FULLSCREEN: Pastikan status bar dan navigation bar selalu terlihat
        window.clearFlags(WindowManager.LayoutParams.FLAG_FULLSCREEN);
        window.addFlags(WindowManager.LayoutParams.FLAG_DRAWS_SYSTEM_BAR_BACKGROUNDS);

        // Atur warna status bar dan navigation bar selaras dengan tema Discord (#1E1F22)
        window.setStatusBarColor(Color.parseColor("#1E1F22"));
        window.setNavigationBarColor(Color.parseColor("#1E1F22"));

        // fitsSystemWindows agar konten webview tidak menabrak status bar / navbar
        WindowCompat.setDecorFitsSystemWindows(window, true);

        WindowInsetsControllerCompat insetsController = new WindowInsetsControllerCompat(window, window.getDecorView());
        // Tampilkan status bar dan navigation bar sistem secara eksplisit
        insetsController.show(WindowInsetsCompat.Type.statusBars() | WindowInsetsCompat.Type.navigationBars());
        insetsController.setAppearanceLightStatusBars(false); // teks & icon status bar terang
        insetsController.setAppearanceLightNavigationBars(false); // tombol navbar terang

        // 2. OPTIMASI PERFORMA 60+ FPS: Hardware Acceleration & Chromium GPU pipeline
        WebView webView = getBridge() != null ? getBridge().getWebView() : null;
        if (webView != null) {
            webView.setLayerType(View.LAYER_TYPE_HARDWARE, null);
            WebSettings settings = webView.getSettings();
            settings.setRenderPriority(WebSettings.RenderPriority.HIGH);
            settings.setCacheMode(WebSettings.LOAD_DEFAULT);
            settings.setDomStorageEnabled(true);
            settings.setDatabaseEnabled(true);
            settings.setOffscreenPreRaster(true);
        }
    }
}
