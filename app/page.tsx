
function handleImport(file?: File) {
  if (!file) return;

  if (!file.name.toLowerCase().endsWith('.zip')) {
    window.alert('Please select a ZIP archive.');
    if (fileInputRef.current) fileInputRef.current.value = '';
    return;
  }

  // Keep the selected ZIP available for the workspace to import.
  const reader = new FileReader();

  reader.onload = () => {
    if (typeof reader.result !== 'string') return;

    try {
      sessionStorage.setItem('alphex-pending-project', reader.result);
      sessionStorage.setItem('alphex-pending-project-name', file.name);
      window.location.href = '/workspace';
    } catch {
      window.alert(
        'This ZIP is too large to pass through browser session storage. Open the workspace and import it there instead.',
      );
    }
  };

  reader.onerror = () => {
    window.alert('Could not read the selected ZIP file.');
  };

  reader.readAsDataURL(file);

  if (fileInputRef.current) fileInputRef.current.value = '';
}
