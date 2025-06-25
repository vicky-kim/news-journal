
import { useState, useEffect } from "react";
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import Auth from "./Auth";
import SignUp from "./SignUp";

// Firebase 설정
const firebaseConfig = {
  apiKey: "AIzaSyAsCOlQjlJ_g9QRPOYrkp1tvoh6SDWlAwA",
  authDomain: "helloworld-17af4.firebaseapp.com",
  projectId: "helloworld-17af4",
  storageBucket: "helloworld-17af4.firebasestorage.app",
  messagingSenderId: "278174024658",
  appId: "1:278174024658:web:e63c7100b2fbb50a5ffe0b",
  measurementId: "G-0SM5DWPKE6"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export default function NewsThoughtLog() {
  const [entries, setEntries] = useState([]);
  const [newsTitle, setNewsTitle] = useState("");
  const [newsLink, setNewsLink] = useState("");
  const [thoughts, setThoughts] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [user, setUser] = useState(null);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;

    const fetchEntries = async () => {
      const q = query(collection(db, "entries"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      const loaded = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setEntries(loaded);
    };

    fetchEntries();
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const auth = getAuth();
    const currentUser = auth.currentUser;

    const now = new Date();
    const newEntry = {
      newsTitle,
      newsLink,
      thoughts,
      createdAt: now,
      date: now.toLocaleDateString(),
      time: now.toLocaleTimeString(),
      userId: currentUser.uid,
    };

    const docRef = await addDoc(collection(db, "entries"), newEntry);
    setEntries([{ id: docRef.id, ...newEntry }, ...entries]);

    setNewsTitle("");
    setNewsLink("");
    setThoughts("");
  };

  const handleDelete = async (id) => {
    await deleteDoc(doc(db, "entries", id));
    setEntries(entries.filter((entry) => entry.id !== id));
  };

  return (
    <div className="flex justify-center px-4 py-6">
      <div className="w-full max-w-2xl space-y-8">

        <header className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-blue-600">📰 나의 투자 뉴스 일지</h1>
          {user && (
            <div className="text-right">
              <p className="text-sm text-gray-700">👋 {user.email}</p>
              <button
                onClick={() => signOut(getAuth())}
                className="text-xs text-red-500 hover:underline"
              >
                로그아웃
              </button>
            </div>
          )}
        </header>

        {!user && (
          <section>
            <SignUp />
            <Auth onUserChanged={setUser} />
          </section>
        )}

        {/* 검색창 */}
        <section className="border-t border-gray-300 pt-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-2">🔍 검색</h2>
          <input
            type="text"
            placeholder="제목 또는 생각을 입력하세요"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
        </section>

        {/* 입력창 */}
        {user && (
          <section className="border-t border-gray-300 pt-6">
            <h2 className="text-lg font-semibold text-blue-700 mb-3">✏️ 뉴스 기록하기</h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="text"
                placeholder="뉴스 제목"
                value={newsTitle}
                onChange={(e) => setNewsTitle(e.target.value)}
                className="w-full border rounded px-3 py-2"
                required
              />
              <input
                type="url"
                placeholder="뉴스 링크 (선택)"
                value={newsLink}
                onChange={(e) => setNewsLink(e.target.value)}
                className="w-full border rounded px-3 py-2"
              />
              <textarea
                placeholder="나의 생각을 입력하세요"
                value={thoughts}
                onChange={(e) => setThoughts(e.target.value)}
                className="w-full border rounded px-3 py-2"
                rows={4}
                required
              />
              <button
                type="submit"
                className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
              >
                기록하기
              </button>
            </form>
          </section>
        )}

        {!user && (
          <p className="text-center text-gray-500">
            ✋ 로그인 후 뉴스 일지를 작성할 수 있습니다.
          </p>
        )}

        {/* 게시글 목록 */}
        <section className="border-t border-gray-300 pt-6 space-y-6">
          <h2 className="text-xl font-semibold text-gray-700">📚 뉴스 목록</h2>
          {entries
            .filter((entry) =>
              entry.newsTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
              entry.thoughts.toLowerCase().includes(searchTerm.toLowerCase())
            )
            .map((entry) => (
              <div
                key={entry.id}
                className="relative border border-gray-300 bg-white p-4 rounded-2xl shadow-md max-w-full speech-bubble"
              >
                <div className="text-sm text-gray-400 mb-1">
                  📅 {entry.date} 🕒 {entry.time || ""}
                </div>
                <h3 className="font-semibold text-lg">{entry.newsTitle}</h3>
                {entry.newsLink && (
                  <a
                    href={entry.newsLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 text-sm underline"
                  >
                    원문 보기
                  </a>
                )}
                <p className="mt-2 text-gray-700 whitespace-pre-line">{entry.thoughts}</p>
                {user && user.uid === entry.userId && (
                  <button
                    onClick={() => handleDelete(entry.id)}
                    className="mt-2 text-xs text-red-500 hover:underline"
                  >
                    삭제하기
                  </button>
                )}
              </div>
          ))}
        </section>
      </div>

      <style jsx>{`
        .speech-bubble {
          position: relative;
          background: #fff;
        }
        .speech-bubble::after {
          content: '';
          position: absolute;
          bottom: -10px;
          left: 30px;
          border-width: 10px 10px 0;
          border-style: solid;
          border-color: #ffffff transparent;
          display: block;
          width: 0;
        }
      `}</style>
    </div>
  );
}
