package com.devnet.server;

import android.Manifest;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.Build;
import android.os.Environment;
import android.os.PowerManager;
import android.provider.Settings;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "Devnet")
public class DevnetPlugin extends Plugin {

    private boolean storageGranted() {
        if (Build.VERSION.SDK_INT >= 30) return Environment.isExternalStorageManager();
        return ContextCompat.checkSelfPermission(getContext(), Manifest.permission.WRITE_EXTERNAL_STORAGE)
                == PackageManager.PERMISSION_GRANTED;
    }

    private void openSettings(String action) {
        Intent i = new Intent(action, Uri.parse("package:" + getContext().getPackageName()));
        i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        getContext().startActivity(i);
    }

    @PluginMethod
    public void hasStorageAccess(PluginCall call) {
        JSObject r = new JSObject();
        r.put("granted", storageGranted());
        call.resolve(r);
    }

    // /sdcard/devnet@0.0.0.0 için "tüm dosyalara erişim" iznini ister
    @PluginMethod
    public void requestStorageAccess(PluginCall call) {
        if (!storageGranted()) {
            if (Build.VERSION.SDK_INT >= 30) {
                openSettings(Settings.ACTION_MANAGE_APP_ALL_FILES_ACCESS_PERMISSION);
            } else {
                ActivityCompat.requestPermissions(
                        getActivity(),
                        new String[] {Manifest.permission.WRITE_EXTERNAL_STORAGE, Manifest.permission.READ_EXTERNAL_STORAGE},
                        9001);
            }
        }
        call.resolve();
    }

    @PluginMethod
    public void startKeepAlive(PluginCall call) {
        ContextCompat.startForegroundService(getContext(), new Intent(getContext(), KeepAliveService.class));
        call.resolve();
    }

    @PluginMethod
    public void requestBatteryExemption(PluginCall call) {
        PowerManager pm = (PowerManager) getContext().getSystemService(Context.POWER_SERVICE);
        if (pm != null && !pm.isIgnoringBatteryOptimizations(getContext().getPackageName())) {
            openSettings(Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS);
        }
        call.resolve();
    }
}
