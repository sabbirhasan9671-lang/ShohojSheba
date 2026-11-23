# সহজসেবা (ShohojSheba)
স্বাধীন নাগরিক সেবা ও শিক্ষা তথ্য-প্ল্যাটফর্ম (সরকারি নয়)। HTML/CSS/JS + Supabase (Database, Auth, Storage)।

## ফাইল
`index.html` `style.css` `app.js` `config.js` · `supabase/schema.sql` `supabase/seed.sql` · `data/seed.json` (ডেমো মোড)

## সেটআপ (Supabase, ফ্রি প্ল্যানে চলে)
1. supabase.com → New project।
2. SQL Editor → `supabase/schema.sql` Run, তারপর `supabase/seed.sql` Run (তোমার TXT-এর ১০ শিক্ষা + ৬ সেবা, সব `pending`)।
3. Authentication → Users → Add user (তোমার ইমেইল/পাসওয়ার্ড)। তারপর SQL Editor-এ:
   `insert into public.admins(user_id) select id from auth.users where email='তোমার@ইমেইল';`
4. Settings → API থেকে Project URL ও **anon key** `config.js`-এ বসাও। **service_role key কখনো নয়।**
5. Authentication → URL Configuration-এ সাইটের URL দাও; Sign-ups বন্ধ রাখো (Disable signups)।

## অ্যাডমিন
সাইটের নিচে "অ্যাডমিন" (`#/admin`) → লগইন → কনটেন্ট যোগ/এডিট/মুছুন/আর্কাইভ, ছবি ও PDF আপলোড, যাচাই অবস্থা ও শেষ যাচাইয়ের তারিখ। ডাটাবেস RLS দিয়ে সুরক্ষিত: শুধু `admins` টেবিলের ইউজার লিখতে পারে; সবাই শুধু প্রকাশিত কনটেন্ট পড়তে পারে।

## ডিপ্লয়
- **GitHub Pages:** Settings → Pages → main / root। **Netlify:** repo import, publish dir `.`
- `config.js` ফাঁকা থাকলে সাইট ডেমো মোডে চলে (localStorage, আসল নিরাপত্তা নেই)।

## নীতি
সব রেকর্ড শুরুতে `pending`। ফি/তারিখ/যোগ্যতা অফিসিয়াল সোর্স দেখে বসাও, তারপর `verified` করো।
