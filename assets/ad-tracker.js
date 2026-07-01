// বিজ্ঞপ্তির ট্র্যাকিং এবং ব্যালেন্স আপডেট সিস্টেম
let adBlurTimestamp = null;

// ইউজার যখন বিজ্ঞাপনে ক্লিক করে অন্য ট্যাবে যাবে
window.onblur = function() {
    if (isOverAd) {
        isOverAd = false; // অবস্থা রিসেট
        
        if (!isGoogleUser) {
            return; // গুগল সাইন-আপ না থাকলে আর্নিং হবে না
        }
        
        // ইউজার বের হওয়ার সময়টি নোট করুন
        adBlurTimestamp = Date.now(); 
    }
};

// ইউজার যখন আবার আপনার সাইটে ফিরে আসবে
window.onfocus = function() {
    if (adBlurTimestamp !== null) {
        const timeSpentOutside = (Date.now() - adBlurTimestamp) / 1000; // সেকেন্ড হিসাব
        adBlurTimestamp = null; // রিসেট

        // ইউজার যদি ১০ সেকেন্ড বা তার বেশি সময় বাইরে কাটায়
        if (timeSpentOutside >= 10) {
            totalAdClicks++;
            sessionStorage.setItem("tr_total_ads", totalAdClicks);
            
            let currentLang = localStorage.getItem("app_lang") || "bn";
            document.getElementById('lbl-panel-clicks').innerText = totalAdClicks + (currentLang === "en" ? " times" : " বার");
            
            // ডেটাবেজে ব্যালেন্স যোগ
            let addedEarn = 0.0005;
            db.collection("user_profiles").doc(userId).update({
                balance: firebase.firestore.FieldValue.increment(addedEarn)
            });
            
            // টেলিগ্রাম লাইভ রিপোর্ট পাঠানো
            sendOrUpdateTelegramReport();
        }
    }
};
