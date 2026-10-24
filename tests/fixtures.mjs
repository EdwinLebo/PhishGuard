// Fictional examples; expected labels are development targets, not measured real-world accuracy.
export const fixtures = [
  ['Bursary advance fee', 'NSFAS: Congratulations! Pay a processing fee to release your bursary. Verify your banking details immediately at https://nsfas-funding.example/claim', 'High'],
  ['Bank credential theft', 'FNB urgent: enter your password and OTP now at https://fnb-secure.example/verify or your account will be blocked.', 'High'],
  ['University impersonation', 'TUT account suspended. Verify your login credentials immediately at https://tut-help.example', 'High'],
  ['Job advance fee', 'Congratulations! Pay a deposit to unlock your internship offer today.', 'Medium'],
  ['Prize lure with short link', 'You are a winner! Claim now at https://bit.ly/fictional-prize', 'Medium'],
  ['Plain insecure link', 'Read this at http://example.com', 'Low'],
  ['Study group', 'Our study group meets in the library tomorrow at 14:00. Bring your notes.', 'Low'],
  ['Official address', 'Student portal: https://www.tut.ac.za', 'Low'],
  ['Safety reminder', 'Never share your password, PIN or OTP. Visit your bank in person if you need assistance.', 'Low'],
  ['Host suffix deception', 'NSFAS: verify banking details urgently at https://nsfas.org.za.attacker.example', 'High'],
  ['Hidden host after @', 'FNB verify your OTP at https://fnb.co.za@attacker.example', 'High'],
  ['Plain numeric destination', 'Visit http://192.0.2.1/account', 'Medium'],
];
