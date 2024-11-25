// 匯入 Firebase 函數
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-analytics.js";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";
import {
  getDatabase,
  ref,
  set,
  update,
  onValue,
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-database.js";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAUi_whIkhj7figYOMqRP-tQOUnvoUNi1Q",
  authDomain: "login-ead0d.firebaseapp.com",
  databaseURL:
    "https://login-ead0d-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "login-ead0d",
  storageBucket: "login-ead0d.firebasestorage.app",
  messagingSenderId: "278988806452",
  appId: "1:278988806452:web:5ca9c10139b7a00f4aad61",
  measurementId: "G-Y2C6RJK5QF",
};

// 初始化 Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const database = getDatabase(app);

// Google 註冊功能
async function googleRegister() {
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    const uid = user.uid;
    const { displayName, email, photoURL } = user;

    // 檢查使用者是否已存在
    const userRef = ref(database, "users/" + uid);
    onValue(userRef, (snapshot) => {
      if (snapshot.exists()) {
        alert("使用者已註冊！");
      } else {
        // 存儲新使用者資訊，並將註冊時間設置為當前時間
        const lastLoginTime = new Date().toISOString();
        set(userRef, {
          displayName,
          email,
          photoURL,
          lastLoginTime,
        });
        displayUserInfo({ displayName, email, photoURL, lastLoginTime });
        alert("註冊成功！");
      }
    });
  } catch (error) {
    console.error("註冊失敗:", error);
  }
}

// Google 登入功能
async function googleLogin() {
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    const uid = user.uid;

    // 獲取使用者資訊
    const userRef = ref(database, "users/" + uid);
    onValue(userRef, (snapshot) => {
      if (snapshot.exists()) {
        const { displayName, email, photoURL, lastLoginTime } = snapshot.val();
        const newLastLoginTime = new Date().toISOString();

        // 更新資料庫中的最後登入時間
        update(userRef, { lastLoginTime: newLastLoginTime });

        // 顯示使用者資訊
        displayUserInfo({
          displayName,
          email,
          photoURL,
          lastLoginTime,
          newLastLoginTime,
        });
      } else {
        alert("使用者未註冊，請先註冊！");
      }
    });
  } catch (error) {
    console.error("登入失敗:", error);
  }
}

// 顯示使用者資訊
function displayUserInfo(userInfo) {
  const { displayName, email, photoURL, lastLoginTime, newLastLoginTime } =
    userInfo;
  const localLastLoginTime = new Date(lastLoginTime).toLocaleString("zh-TW", {
    timeZone: "Asia/Taipei",
  });
  const localNewLastLoginTime = new Date(newLastLoginTime).toLocaleString(
    "zh-TW",
    { timeZone: "Asia/Taipei" }
  );

  document.getElementById("user-info").innerHTML = `
  <p>姓名: ${displayName}</p>
  <p>Email: ${email}</p>
  <img src="${photoURL}" alt="Profile Picture" width="100"/>
  <p>上次登入時間: ${localLastLoginTime}</p>
  <p>當前登入時間: ${localNewLastLoginTime}</p>
`;
}

// 綁定按鈕事件
document.addEventListener("DOMContentLoaded", () => {
  document
    .getElementById("register-button")
    .addEventListener("click", googleRegister);
  document
    .getElementById("login-button")
    .addEventListener("click", googleLogin);
});
