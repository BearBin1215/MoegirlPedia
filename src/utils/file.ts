/** 将字符串保存为文件 */
export function downloadStringAsFile(filename: string, textContent: string) {
  // 创建Blob对象
  const blob = new Blob([textContent], { type: 'text/plain' });

  // 创建隐藏的可下载链接
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';

  // 将链接添加到DOM中以触发下载
  document.body.appendChild(link);

  // 触发点击下载
  link.click();

  // 清理资源
  URL.revokeObjectURL(url);
  document.body.removeChild(link);
}
