package za.co.phishguard.watch;

import android.app.*;
import android.content.*;
import android.os.*;
import android.provider.Telephony;
import android.service.notification.*;
import java.util.concurrent.*;

public final class WatchService extends NotificationListenerService {
    public static final String CHANNEL="phishguard_warnings";
    public static volatile boolean connected=false;
    // Only derived evidence lives in process memory. No message bodies, senders or inbox history.
    public static volatile Detector.Result lastResult;
    public static volatile String lastSource="";
    private final WatchPolicy policy=new WatchPolicy();
    private final ExecutorService worker=new ThreadPoolExecutor(1,1,0L,TimeUnit.MILLISECONDS,new ArrayBlockingQueue<>(20),new ThreadPoolExecutor.DiscardPolicy());
    static android.content.SharedPreferences prefs(Context c) { return c.getSharedPreferences("watch_settings",MODE_PRIVATE); }
    public static void channels(Context context) {
        NotificationChannel channel=new NotificationChannel(CHANNEL,"Suspicious message warnings",NotificationManager.IMPORTANCE_HIGH);
        channel.setDescription("Advisory warnings for selected messaging-app notifications");
        channel.setLockscreenVisibility(Notification.VISIBILITY_PRIVATE);
        context.getSystemService(NotificationManager.class).createNotificationChannel(channel);
    }
    public static boolean alertsAvailable(Context c) {
        NotificationManager manager=c.getSystemService(NotificationManager.class);
        NotificationChannel channel=manager.getNotificationChannel(CHANNEL);
        return manager.areNotificationsEnabled() && channel!=null && channel.getImportance()!=NotificationManager.IMPORTANCE_NONE;
    }
    @Override public void onListenerConnected() { connected=true; channels(this); }
    @Override public void onListenerDisconnected() { connected=false; policy.clear(); }
    @Override public void onDestroy() { connected=false; worker.shutdownNow(); policy.clear(); super.onDestroy(); }
    private boolean allowed(String pkg) {
        var p=prefs(this);
        return p.getBoolean("enabled",false) && p.getBoolean("consent",false)
            && WatchPolicy.selected(pkg,Telephony.Sms.getDefaultSmsPackage(this),p.getBoolean("sms",false),p.getBoolean("whatsapp",false));
    }
    @Override public void onNotificationPosted(StatusBarNotification sbn) {
        if (sbn==null || !allowed(sbn.getPackageName())) return;
        Notification notification=sbn.getNotification();
        if (notification==null || (notification.flags & Notification.FLAG_GROUP_SUMMARY)!=0) return;
        String text=extract(notification.extras);
        if (text.isBlank() || text.length()>5000) return;
        String pkg=sbn.getPackageName();
        worker.execute(() -> {
            if (!allowed(pkg) || !policy.fresh(pkg,text,SystemClock.elapsedRealtime())) return;
            Detector.Result result=Detector.analyze(text);
            // Re-check after analysis so switching off or deselecting a source stops queued work.
            if (result.warn() && allowed(pkg)) {
                String source=pkg.startsWith("com.whatsapp")?"WhatsApp notification":"SMS app notification";
                lastResult=result; lastSource=source;
                showWarning(this,result,source,false);
            }
        });
    }
    static String extract(Bundle extras) {
        if (extras==null) return "";
        // Messaging notifications often repeat old messages. Analyse only the latest available entry.
        Parcelable[] messages=extras.getParcelableArray(Notification.EXTRA_MESSAGES);
        if (messages!=null && messages.length>0) {
            Parcelable latest=messages[messages.length-1];
            if (latest instanceof Bundle b) { CharSequence text=b.getCharSequence("text"); if(text!=null) return text.toString(); }
        }
        CharSequence big=extras.getCharSequence(Notification.EXTRA_BIG_TEXT);
        if (big!=null && big.length()>0) return big.toString();
        CharSequence text=extras.getCharSequence(Notification.EXTRA_TEXT);
        return text==null ? "" : text.toString();
    }
    public static boolean showWarning(Context context,Detector.Result result,String source,boolean test) {
        channels(context); if (!alertsAvailable(context)) return false;
        Intent intent=new Intent(context,MainActivity.class).setFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP|Intent.FLAG_ACTIVITY_CLEAR_TOP);
        PendingIntent open=PendingIntent.getActivity(context,0,intent,PendingIntent.FLAG_UPDATE_CURRENT|PendingIntent.FLAG_IMMUTABLE);
        String title=(test?"TEST · ":"")+"PhishGuard: "+result.risk()+" risk signals";
        Notification publicVersion=new Notification.Builder(context,CHANNEL).setSmallIcon(za.co.phishguard.watch.R.drawable.ic_shield).setContentTitle("PhishGuard advisory").setContentText("Open PhishGuard to review warning signs.").build();
        Notification alert=new Notification.Builder(context,CHANNEL).setSmallIcon(za.co.phishguard.watch.R.drawable.ic_shield)
            .setContentTitle(title).setContentText(source+" — pause and verify before opening links.")
            .setStyle(new Notification.BigTextStyle().bigText(source+". Warning signs detected. Open PhishGuard for reasons and next steps. This is not a confirmed scam or malware verdict."))
            .setVisibility(Notification.VISIBILITY_PRIVATE).setPublicVersion(publicVersion)
            .setContentIntent(open).setAutoCancel(true).setOnlyAlertOnce(false).build();
        try { context.getSystemService(NotificationManager.class).notify(41,alert); return true; }
        catch(SecurityException denied) { return false; }
    }
    public static void clearEvidence(Context c) { lastResult=null; lastSource=""; c.getSystemService(NotificationManager.class).cancel(41); }
}
