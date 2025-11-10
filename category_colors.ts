// Função para retornar gradiente baseado na porcentagem (34 cores, uma a cada 3%)
export function getCategoryColor(percentage: number): string {
  if (percentage <= 2) return 'from-gray-900 to-black'; // 0-2%
  if (percentage <= 5) return 'from-gray-800 to-gray-700'; // 3-5%
  if (percentage <= 8) return 'from-amber-900 to-amber-800'; // 6-8%
  if (percentage <= 11) return 'from-amber-700 to-amber-600'; // 9-11%
  if (percentage <= 14) return 'from-orange-700 to-orange-600'; // 12-14%
  if (percentage <= 17) return 'from-orange-500 to-orange-400'; // 15-17%
  if (percentage <= 20) return 'from-red-400 to-red-300'; // 18-20%
  if (percentage <= 23) return 'from-pink-300 to-pink-200'; // 21-23%
  if (percentage <= 26) return 'from-pink-400 to-pink-300'; // 24-26%
  if (percentage <= 29) return 'from-pink-500 to-pink-400'; // 27-29%
  if (percentage <= 32) return 'from-pink-600 to-pink-500'; // 30-32%
  if (percentage <= 35) return 'from-pink-500 to-purple-400'; // 33-35%
  if (percentage <= 38) return 'from-pink-400 to-purple-400'; // 36-38%
  if (percentage <= 41) return 'from-purple-400 to-purple-300'; // 39-41%
  if (percentage <= 44) return 'from-purple-500 to-purple-400'; // 42-44%
  if (percentage <= 47) return 'from-purple-600 to-purple-500'; // 45-47%
  if (percentage <= 50) return 'from-purple-700 to-purple-600'; // 48-50%
  if (percentage <= 53) return 'from-purple-600 to-blue-500'; // 51-53%
  if (percentage <= 56) return 'from-purple-500 to-blue-500'; // 54-56%
  if (percentage <= 59) return 'from-blue-500 to-purple-400'; // 57-59%
  if (percentage <= 62) return 'from-blue-500 to-blue-400'; // 60-62%
  if (percentage <= 65) return 'from-blue-600 to-blue-500'; // 63-65%
  if (percentage <= 68) return 'from-blue-700 to-blue-600'; // 66-68%
  if (percentage <= 71) return 'from-blue-500 to-cyan-400'; // 69-71%
  if (percentage <= 74) return 'from-cyan-500 to-cyan-400'; // 72-74%
  if (percentage <= 77) return 'from-cyan-400 to-teal-400'; // 75-77%
  if (percentage <= 80) return 'from-teal-500 to-teal-400'; // 78-80%
  if (percentage <= 83) return 'from-green-500 to-green-400'; // 81-83%
  if (percentage <= 86) return 'from-green-400 to-lime-400'; // 84-86%
  if (percentage <= 89) return 'from-lime-500 to-yellow-400'; // 87-89%
  if (percentage <= 92) return 'from-yellow-500 to-yellow-400'; // 90-92%
  if (percentage <= 95) return 'from-yellow-600 to-amber-500'; // 93-95%
  if (percentage <= 98) return 'from-rose-600 to-pink-600'; // 96-98%
  return 'from-pink-500 via-purple-500 to-blue-500'; // 99-100%
}

// Função para retornar cor do texto baseado na porcentagem (contraste)
export function getCategoryTextColor(percentage: number): string {
  // Cores escuras (0-20%) precisam de texto branco
  if (percentage <= 20) return 'text-white';
  // Cores médias-escuras (21-50%) texto branco
  if (percentage <= 50) return 'text-white';
  // Cores médias-claras (51-80%) texto escuro
  if (percentage <= 80) return 'text-gray-900';
  // Cores claras (81-100%) texto escuro
  return 'text-gray-900';
}
