export const categories = [
  { key: 'electric', name: 'كهرباء', emoji: '🔌' },
  { key: 'plumbing', name: 'سباكة', emoji: '🚰' },
  { key: 'ac', name: 'تكييف', emoji: '❄️' },
  { key: 'painting', name: 'دهان', emoji: '🎨' },
  { key: 'carpentry', name: 'نجارة', emoji: '🪚' },
  { key: 'appliances', name: 'أجهزة', emoji: '🧺' },
  { key: 'cleaning', name: 'تنظيف', emoji: '🧹' },
  { key: 'satellite', name: 'ستالايت', emoji: '📡' },
  { key: 'it', name: 'شبكات', emoji: '💻' },
  { key: 'others', name: 'أخرى', emoji: '🧰' }
];

export function getCategory(key) {
  return categories.find(c => c.key === key);
}
