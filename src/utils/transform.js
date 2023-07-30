export function timeSince(date) {
  if(date == 0)
    return "从未.";

  let seconds = Math.floor((new Date() - date) / 1000);
  let interval = Math.floor(seconds / 60);
  if (interval > 1)
    return interval + " 分钟前.";
  else
    return "几秒前.";
}

export function formatBytes(bytes, decimals = 2) {
  if (!+bytes) return '0B'

  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['B', 'K', 'M', 'G', 'T', 'P', 'E', 'Z', 'Y']

  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
}
