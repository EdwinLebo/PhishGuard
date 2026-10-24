package za.co.phishguard.watch;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.*;

/** Policy and short-lived deduplication contain no Android dependencies. */
public final class WatchPolicy {
    private final Map<String,Long> seen=new LinkedHashMap<>();
    public static boolean selected(String pkg, String smsPackage, boolean sms, boolean whatsapp) {
        return whatsapp && ("com.whatsapp".equals(pkg) || "com.whatsapp.w4b".equals(pkg))
            || sms && smsPackage!=null && !smsPackage.isEmpty() && smsPackage.equals(pkg);
    }
    public synchronized boolean fresh(String pkg,String text,long now) {
        seen.entrySet().removeIf(e -> now-e.getValue()>=120000);
        try {
            byte[] digest=MessageDigest.getInstance("SHA-256").digest((pkg+"\n"+text).getBytes(StandardCharsets.UTF_8));
            String key=Base64.getEncoder().encodeToString(digest);
            if (seen.containsKey(key)) return false;
            if (seen.size()>=100) seen.remove(seen.keySet().iterator().next());
            seen.put(key,now); return true;
        } catch (java.security.NoSuchAlgorithmException e) { return false; }
    }
    public synchronized void clear() { seen.clear(); }
}
