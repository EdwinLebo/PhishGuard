package za.co.phishguard.watch;

import android.Manifest;
import android.app.*;
import android.content.*;
import android.content.pm.PackageManager;
import android.graphics.Color;
import android.graphics.Typeface;
import android.os.*;
import android.provider.Settings;
import android.provider.Telephony;
import android.text.InputFilter;
import android.view.*;
import android.widget.*;

public final class MainActivity extends Activity {
    private LinearLayout page;
    private TextView status,evidence;
    private EditText manual;
    private Switch enabled;
    private final Handler ticker=new Handler(Looper.getMainLooper());
    private final Runnable refreshTask=new Runnable() { public void run() { refresh(); ticker.postDelayed(this,1500); } };
    private int dp(int n) {return (int)(getResources().getDisplayMetrics().density*n);}
    private TextView text(String value,int size,boolean bold) {
        TextView v=new TextView(this);v.setText(value);v.setTextSize(size);v.setTextColor(Color.rgb(22,59,48));v.setPadding(0,dp(8),0,dp(8));
        if(bold)v.setTypeface(null,Typeface.BOLD);page.addView(v);return v;
    }
    private void button(String label,View.OnClickListener action) { Button b=new Button(this);b.setText(label);b.setAllCaps(false);page.addView(b);b.setOnClickListener(action); }
    private boolean access() { return getSystemService(NotificationManager.class).isNotificationListenerAccessGranted(new ComponentName(this,WatchService.class)); }
    @Override public void onCreate(Bundle state) {
        super.onCreate(state);WatchService.channels(this);
        ScrollView scroll=new ScrollView(this);page=new LinearLayout(this);page.setOrientation(LinearLayout.VERTICAL);page.setPadding(dp(24),dp(20),dp(24),dp(30));page.setBackgroundColor(Color.rgb(250,251,248));scroll.addView(page);setContentView(scroll);
        // Keep content out of system bars when Android 15 enforces edge-to-edge.
        scroll.setOnApplyWindowInsetsListener((v,insets)->{v.setPadding(insets.getSystemWindowInsetLeft(),insets.getSystemWindowInsetTop(),insets.getSystemWindowInsetRight(),insets.getSystemWindowInsetBottom());return insets;});
        text("PHISHGUARD WATCH",14,true);text("A warning before\nthe next tap.",30,true);
        text("Android demo • on-device rules • no account",13,false);
        status=text("Monitoring is off.",16,true);
        text("1. Choose what to check",20,true);
        text("Android notification access can expose notifications from all apps, including sensitive content. PhishGuard ignores other apps and checks only the sources you select below. Available text is processed on this phone, never uploaded or saved as message history. Derived warning details remain in memory until cleared or the process ends.",14,false);
        CheckBox consent=new CheckBox(this);consent.setText("I understand notification access and agree to local checks of my selected sources.");consent.setChecked(WatchService.prefs(this).getBoolean("consent",false));page.addView(consent);
        consent.setOnCheckedChangeListener((b,value)->{WatchService.prefs(this).edit().putBoolean("consent",value).apply();if(!value){disable();WatchService.clearEvidence(this);}refresh();});
        source("WhatsApp and WhatsApp Business","whatsapp");
        String sms=Telephony.Sms.getDefaultSmsPackage(this);
        source("Default SMS app"+(sms==null?" (not detected)":" ("+sms+")"),"sms");
        text("2. Allow access and warnings",20,true);
        button("Open notification access settings",v->{if(!consent.isChecked()){toast("Read and accept the explanation first.");return;}startActivity(new Intent(Settings.ACTION_NOTIFICATION_LISTENER_SETTINGS));});
        button("Allow PhishGuard warning notifications",v->{
            if(Build.VERSION.SDK_INT>=33 && checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS)!=PackageManager.PERMISSION_GRANTED) requestPermissions(new String[]{Manifest.permission.POST_NOTIFICATIONS},10);
            else startActivity(new Intent(Settings.ACTION_APP_NOTIFICATION_SETTINGS).putExtra(Settings.EXTRA_APP_PACKAGE,getPackageName()));
        });
        text("3. Start Watch",20,true);
        enabled=new Switch(this);enabled.setText("Monitor selected message notifications");enabled.setChecked(WatchService.prefs(this).getBoolean("enabled",false));page.addView(enabled);
        enabled.setOnCheckedChangeListener((b,on)->{
            var p=WatchService.prefs(this);
            if(on && (!p.getBoolean("consent",false)||!access()||!WatchService.alertsAvailable(this)||!(p.getBoolean("whatsapp",false)||p.getBoolean("sms",false)))) {
                b.setChecked(false);toast("Choose a source, consent, enable notification access and allow warnings first.");return;
            }
            p.edit().putBoolean("enabled",on).apply();if(!on)WatchService.clearEvidence(this);refresh();
        });
        text("Coverage limits",18,true);
        text("Only new notification text made available by Android can be checked. Hidden previews, muted chats, an open conversation, grouped or truncated notifications, sensitive-content restrictions and device settings can cause misses. No inbox history is read. Watch cannot guarantee a warning before a tap, block a link or detect every scam. No malware scanning is performed.",14,false);
        text("Latest warning • memory only",20,true);evidence=text("No warning in this session.",14,false);
        button("Clear warning details",v->{WatchService.clearEvidence(this);refresh();});
        text("Try a message or share one here",20,true);
        manual=new EditText(this);manual.setHint("Paste a message without personal information");manual.setGravity(Gravity.TOP);manual.setMinLines(3);manual.setFilters(new InputFilter[]{new InputFilter.LengthFilter(5000)});manual.setInputType(android.text.InputType.TYPE_CLASS_TEXT|android.text.InputType.TYPE_TEXT_FLAG_MULTI_LINE);page.addView(manual);
        button("Check locally",v->checkManual());
        button("Run labelled test alert",v->{
            Detector.Result r=Detector.analyze("FNB FINAL WARNING: enter your OTP at https://fnb.co.za@account-check.example");
            WatchService.lastResult=r;WatchService.lastSource="Built-in synthetic test (not an incoming message)";refresh();
            toast(WatchService.showWarning(this,r,"Synthetic demonstration",true)?"Test warning posted. Check your notification tray.":"Test result ready. Allow warning notifications to see an alert.");
        });
        text("Already acted?",18,true);text("Stop replying. If you shared banking details or paid, contact your bank through its official app or a trusted number. Change exposed passwords through the genuine service. Keep evidence; do not pay someone promising recovery.",14,false);
        text("You can pause Watch above or revoke notification access in Android Settings at any time. Demo build, not Play Store approved. Keep the share/paste option when monitoring is unavailable.",12,false);
        receiveShare(getIntent());
    }
    private void source(String label,String key) {CheckBox box=new CheckBox(this);box.setText(label);box.setChecked(WatchService.prefs(this).getBoolean(key,false));page.addView(box);box.setOnCheckedChangeListener((b,on)->{WatchService.prefs(this).edit().putBoolean(key,on).apply();WatchService.clearEvidence(this);refresh();});}
    private void disable() {WatchService.prefs(this).edit().putBoolean("enabled",false).apply();if(enabled!=null)enabled.setChecked(false);}
    private void toast(String s) {Toast.makeText(this,s,Toast.LENGTH_LONG).show();}
    private void checkManual() {try {WatchService.lastResult=Detector.analyze(manual.getText().toString());WatchService.lastSource="Manual / shared text check";manual.setText("");refresh();}catch(IllegalArgumentException e){toast(e.getMessage());}}
    private void receiveShare(Intent intent) {if(Intent.ACTION_SEND.equals(intent.getAction())){CharSequence value=intent.getCharSequenceExtra(Intent.EXTRA_TEXT);if(value!=null){if(value.length()>5000){toast("Shared text exceeds 5,000 characters. Paste a shorter excerpt.");return;}manual.setText(value);checkManual();}intent.removeExtra(Intent.EXTRA_TEXT);}}
    @Override protected void onNewIntent(Intent intent) {super.onNewIntent(intent);setIntent(intent);receiveShare(intent);refresh();}
    private void refresh() {
        if(status==null)return;
        var p=WatchService.prefs(this);
        boolean selected=p.getBoolean("whatsapp",false)||p.getBoolean("sms",false);
        status.setText(!p.getBoolean("enabled",false)?"Watch is paused":!access()?"Watch needs notification access":!WatchService.alertsAvailable(this)?"Warnings are blocked — enable notifications":!selected?"No sources selected":!WatchService.connected?"Waiting for Android to connect Watch":"Watch is listening • available previews only");
        if(evidence!=null) evidence.setText(WatchService.lastResult==null?"No warning in this session.":WatchService.lastSource+"\n\n"+WatchService.lastResult.explanation());
    }
    @Override protected void onResume(){super.onResume();ticker.post(refreshTask);}
    @Override protected void onPause(){ticker.removeCallbacks(refreshTask);super.onPause();}
}
