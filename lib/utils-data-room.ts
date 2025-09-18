export const formatFileSize = (bytes: number): string => {
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;
  
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  
  return `${size.toFixed(unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
};

export const formatDate = (date: Date | string): string => {
  const now = new Date();
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const diff = now.getTime() - dateObj.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  if (days === 0) {
    return 'Today';
  } else if (days === 1) {
    return 'Yesterday';
  } else if (days < 7) {
    return `${days} days ago`;
  } else {
    return dateObj.toLocaleDateString();
  }
};

export const validateFileName = (name: string, existingNames: string[]): string | null => {
  if (!name.trim()) {
    return 'Name cannot be empty';
  }
  
  if (name.length > 255) {
    return 'Name is too long';
  }
  
  if (name.includes('/') || name.includes('\\')) {
    return 'Name cannot contain / or \\';
  }
  
  if (existingNames.includes(name.trim())) {
    return 'Name already exists';
  }
  
  return null;
};

export const generateUniqueFileName = (baseName: string, existingNames: string[]): string => {
  let counter = 1;
  let uniqueName = baseName;
  
  while (existingNames.includes(uniqueName)) {
    const ext = baseName.includes('.') ? baseName.split('.').pop() : '';
    const nameWithoutExt = ext ? baseName.slice(0, -(ext.length + 1)) : baseName;
    uniqueName = ext ? `${nameWithoutExt} (${counter}).${ext}` : `${nameWithoutExt} (${counter})`;
    counter++;
  }
  
  return uniqueName;
};

export const readFileAsBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(',')[1]); // Remove data URL prefix
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const downloadFile = (content: string, filename: string) => {
  const blob = new Blob([atob(content)], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  
  URL.revokeObjectURL(url);
};