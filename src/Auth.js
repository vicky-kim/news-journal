
import { useEffect, useState } from "react";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";

export default function Auth({ onUserChanged }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState(null);
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (onUserChanged) onUserChanged(currentUser);
    });
    return () => unsubscribe();
  }, [auth, onUserChanged]); // ✅ 의존성 배열 수정

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setEmail("");
      setPassword("");
    } catch (err) {
      alert("로그인 실패: " + err.message);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  if (user) {
    return (
      <div className="mb-4 flex items-center justify-between border p-4 rounded">
        <span>👋 {user.email}</span>
        <button onClick={handleLogout} className="text-sm text-red-500 hover:underline">
          로그아웃
        </button>
      </div>
    );
  }

  return (
    <div className="border p-4 mb-4 rounded">
      <h2 className="text-lg font-semibold mb-2">🔐 로그인</h2>
      <input
        type="email"
        placeholder="이메일"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="border p-2 rounded w-full mb-2"
      />
      <input
        type="password"
        placeholder="비밀번호 (6자 이상)"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="border p-2 rounded w-full mb-2"
      />
      <button onClick={handleLogin} className="bg-blue-500 text-white px-4 py-2 rounded w-full">
        로그인
      </button>
    </div>
  );
}
