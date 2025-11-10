import { useEffect, useState } from "react";

const KONAMI_CODE = [
  "ArrowUp",
  "ArrowUp",
  "ArrowDown",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowLeft",
  "ArrowRight",
  "b",
  "a",
];

export function useKonamiCode(callback: () => void) {
  const [keys, setKeys] = useState<string[]>([]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      setKeys((prevKeys) => {
        const newKeys = [...prevKeys, e.key].slice(-KONAMI_CODE.length);
        
        // Verificar se o código foi digitado
        if (newKeys.join(",") === KONAMI_CODE.join(",")) {
          callback();
          return []; // Resetar
        }
        
        return newKeys;
      });
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [callback]);
}

// Easter egg alternativo: digitar "gay" ativa modo super gay
export function useSecretWord(word: string, callback: () => void) {
  const [typed, setTyped] = useState("");

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      setTyped((prev) => {
        const newTyped = (prev + e.key).slice(-word.length);
        
        if (newTyped.toLowerCase() === word.toLowerCase()) {
          callback();
          return "";
        }
        
        return newTyped;
      });
    };

    window.addEventListener("keypress", handleKeyPress);
    return () => window.removeEventListener("keypress", handleKeyPress);
  }, [word, callback]);
}
