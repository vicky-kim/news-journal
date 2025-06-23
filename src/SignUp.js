
import { useState } from "react";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";

export default function SignUp({ onUserRegistered }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const auth = getAuth();

  const handleSignUp = async () => {
    try {
      const userCred = await createUserWithEmailAndPassword(auth, email, password);
      alert("회원가입 성공! 이제 로그인해 주세요.");
      setEmail("");
      setPassword("");
      if (onUserRegistered) onUserRegistered(userCred.user);
    } catch (err) {
      alert("회원가입 실패: " + err.message);
    }
  };

  return (
    <div className="border p-4 mb-4 rounded">
      <h2 className="text-lg font-semibold mb-2">📝 회원가입</h2>
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
      <button onClick={handleSignUp} className="bg-green-500 text-white px-4 py-2 rounded">
        회원가입
      </button>
    </div>
  );
}
