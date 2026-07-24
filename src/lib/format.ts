// 臺灣慣用的日期／時間格式

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六'];

// 不含年份的月日與星期，例如「7月24日（週五）」
export function formatMonthDay(iso: string): string {
  const [, m, d] = iso.split('-').map(Number);
  const wd = new Date(`${iso}T00:00:00+08:00`).getDay();
  return `${m}月${d}日（週${WEEKDAYS[wd]}）`;
}

// 以相對天數標示，例如今天、明天、後天、之後為「N 天後」
export function relativeDayLabel(offset: number): string {
  if (offset === 0) return '今天';
  if (offset === 1) return '明天';
  if (offset === 2) return '後天';
  return `${offset} 天後`;
}

export function todayISOInTaipei(): string {
  // 建置期以 UTC 計算，補上 +8 得到台北當日
  const now = new Date(Date.now() + 8 * 3600 * 1000);
  return now.toISOString().slice(0, 10);
}
