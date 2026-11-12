package com.devnet.distrodurum;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(DevnetPlugin.class);
        super.onCreate(savedInstanceState);
    }
}
