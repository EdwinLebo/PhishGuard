package za.co.phishguard.watch;
import org.junit.Test;
import static org.junit.Assert.*;
import java.nio.charset.StandardCharsets;
import java.util.*;
public class DetectorTest {
    @Test public void matchesWebFixtures() throws Exception {
        try(var stream=getClass().getResourceAsStream("/rule-fixtures.tsv")) {
            assertNotNull(stream);
            for(String line:new String(stream.readAllBytes(),StandardCharsets.UTF_8).split("\n")) {
                String[] columns=line.trim().split("\t");
                assertEquals(columns[0],columns[2],Detector.analyze(new String(Base64.getDecoder().decode(columns[1]),StandardCharsets.UTF_8)).risk());
            }
        }
    }
    @Test public void revealsHostAfterAt() {assertEquals(List.of("attacker.example"),Detector.analyze("https://fnb.co.za@attacker.example").hosts());}
    @Test public void warnsOnShorteners() {assertTrue(Detector.analyze("https://bit.ly/hello").warn());}
    @Test public void flagsKnownBrandOnUntrustedSuffix() {assertTrue(Detector.analyze("https://fnb.co.za.attacker.example").warn());}
    @Test public void noMatchingSignalsIsNotSafe() {assertTrue(Detector.analyze("See you tomorrow").explanation().contains("does not establish safety"));}
    @Test public void capsAndDeduplicates() {assertEquals(Detector.analyze("https://bit.ly/a").score(),Detector.analyze("https://bit.ly/a https://bit.ly/b").score());}
    @Test public void rejectsInvalidInputs() {for(String s:new String[]{null," ","x".repeat(5001)}){try{Detector.analyze(s);fail();}catch(IllegalArgumentException expected){}}}
    @Test public void unicodeHostCanonicalized() {assertTrue(Detector.analyze("https://xn--tst-qla.example").warn());}
    @Test public void markupIsJustText() {assertFalse(Detector.analyze("<script>alert(1)</script>").warn());}
    @Test public void defaultSmsAndWhatsAppOnly() {
        assertTrue(WatchPolicy.selected("com.whatsapp","sms.app",false,true));
        assertTrue(WatchPolicy.selected("com.whatsapp.w4b","sms.app",false,true));
        assertTrue(WatchPolicy.selected("sms.app","sms.app",true,false));
        assertFalse(WatchPolicy.selected("com.whatsapp","sms.app",true,false));
        assertFalse(WatchPolicy.selected("other.app","sms.app",true,true));
        assertFalse(WatchPolicy.selected("za.co.phishguard.watch","sms.app",true,true));
        assertFalse(WatchPolicy.selected("com.whatsapp",null,false,false));
    }
    @Test public void deduplicatesUpdatesButAllowsChangedMessagesAndExpiry() {
        WatchPolicy p=new WatchPolicy();assertTrue(p.fresh("app","message",0));assertFalse(p.fresh("app","message",1));
        assertTrue(p.fresh("app","changed",2));assertTrue(p.fresh("another","message",3));
        assertTrue(p.fresh("app","message",120001));p.clear();assertTrue(p.fresh("app","message",120002));
    }
}
