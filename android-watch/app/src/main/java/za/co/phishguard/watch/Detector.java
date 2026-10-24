package za.co.phishguard.watch;

import java.net.URI;
import java.net.IDN;
import java.util.*;
import java.util.regex.*;

/** Local heuristics only. Never opens a URL or declares a destination safe. */
public final class Detector {
    public record Result(String risk, int score, List<String> reasons, List<String> hosts) {
        public boolean warn() { return score >= 15; }
        public String explanation() {
            return risk + " risk · advisory\n\n" + (reasons.isEmpty() ? "Few known warning signs matched. This does not establish safety." : String.join("\n• ", reasons))
                + (hosts.isEmpty() ? "" : "\n\nActual hostnames (not opened):\n" + String.join("\n", hosts))
                + "\n\nVerify through an official app or a contact you already trust. Never share passwords, PINs or OTPs in response to a message. Rules can miss scams and flag legitimate messages.";
        }
    }
    private static boolean matches(String text, String regex) { return Pattern.compile(regex, Pattern.CASE_INSENSITIVE | Pattern.UNICODE_CASE).matcher(text).find(); }
    private static boolean within(String host, String domain) { return host.equals(domain) || host.endsWith("." + domain); }
    public static Result analyze(String input) {
        if (input == null || input.trim().isEmpty() || input.length() > 5000) throw new IllegalArgumentException("Enter 1–5,000 characters.");
        String text = input.trim(); Map<String,Integer> scores = new LinkedHashMap<>(); Map<String,String> reasons = new LinkedHashMap<>(); Set<String> hosts = new LinkedHashSet<>();
        java.util.function.BiConsumer<String,Integer> add = (reason,points) -> {scores.put(reason,points); reasons.put(reason,reason);};
        if (matches(text,"\\b(urgent(?:ly)?|immediate(?:ly)?|act now|within \\d+ (?:hours?|minutes?)|today only|final (?:notice|warning)|suspend(?:ed)?|blocked)\\b")) add.accept("Pressure to act quickly",18);
        boolean hasUrl = matches(text,"https?://|www\\.|\\b[a-z0-9-]+\\.[a-z]{2,}");
        if (matches(text,"\\b(otp|one[ -]time (?:pin|password)|password|pin|bank(?:ing)? details|card (?:number|details)|cvv|login credentials)\\b") && matches(text,"\\b(send|share|enter|submit|provide|confirm|verify|reply|validate|update|give)\\b") && (!matches(text,"\\b(never|do not|don['’]t)\\s+(?:ever\\s+)?(?:share|send|give|disclose)\\b") || hasUrl)) add.accept("Request for sensitive information",35);
        if (matches(text,"\\b(pay|payment|deposit|transfer|fee)\\b") && matches(text,"\\b(bursary|scholarship|grant|prize|winner|job|internship|release|unlock|processing)\\b")) add.accept("Payment tied to an opportunity",28);
        if (matches(text,"\\b(winner|won|congratulations|guaranteed (?:return|income)|free money|selected for a prize)\\b")) add.accept("Unexpected reward or promise",15);
        if (matches(text,"\\b(download|install|enable macros|open (?:the )?attachment|remote access)\\b")) add.accept("Instruction to open or install something",20);
        if (matches(text,"\\b(ignore (?:all |previous |the )*(?:instructions|rules)|system prompt|you are now|classify (?:this|it) as (?:safe|low))\\b")) add.accept("Instructions aimed at the checker",15);
        Matcher urls = Pattern.compile("(?:https?://|www\\.)[^\\s<>\"']+|\\b(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\\.)+[a-z]{2,}(?::\\d+)?(?:/[^\\s<>\"']*)?",Pattern.CASE_INSENSITIVE).matcher(text);
        for (int count=0; count<30 && urls.find(); count++) {
            String raw=urls.group().replaceAll("[.,;!?)\\]}]+$", "");
            try {
                URI uri=new URI(raw.matches("(?i)^https?://.*") ? raw : "https://"+raw);
                String authority=uri.getRawAuthority(); if (authority==null) continue;
                boolean userinfo=authority.contains("@");
                String host=authority.substring(authority.lastIndexOf('@')+1).toLowerCase(Locale.ROOT);
                if (!host.startsWith("[")) { host=host.split(":",2)[0]; host=IDN.toASCII(host); }
                if (host.isEmpty()) continue; hosts.add(host);
                if ("http".equalsIgnoreCase(uri.getScheme())) add.accept("Unencrypted HTTP link",10);
                if (userinfo) add.accept("Misleading @ structure: destination follows the @ sign",28);
                if (host.matches("(?:\\d{1,3}\\.){3}\\d{1,3}") || host.startsWith("[")) add.accept("Link uses an IP address",20);
                if (host.contains("xn--")) add.accept("Internationalised domain: verify possible lookalikes",15);
                for (String shortener:List.of("bit.ly","tinyurl.com","t.co","cutt.ly","shorturl.at","rb.gy")) if (within(host,shortener)) add.accept("Short link hides the final destination",15);
                String[][] brands={{"NSFAS","nsfas.org.za"},{"TUT","tut.ac.za"},{"FNB","fnb.co.za"}};
                boolean known=within(host,"nsfas.org.za") || within(host,"tut.ac.za") || within(host,"fnb.co.za");
                for (String[] brand:brands) if (!known && (matches(text,"\\b"+brand[0]+"\\b") || raw.toLowerCase(Locale.ROOT).contains(brand[0].toLowerCase(Locale.ROOT)))) add.accept("Check the "+brand[0]+" identity: destination is outside this prototype's known domains",28);
            } catch (IllegalArgumentException | java.net.URISyntaxException ignored) { /* Invalid addresses never become links. */ }
        }
        int score=Math.min(100,scores.values().stream().mapToInt(Integer::intValue).sum());
        return new Result(score>=50?"High":score>=15?"Medium":"Low",score,List.copyOf(reasons.values()),List.copyOf(hosts));
    }
}
