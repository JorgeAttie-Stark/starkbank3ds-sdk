const MPI_SCRIPT_ELEMENT_ID = 'stark-3ds-mpi-script';

let loadPromise = null;
let activeUrl = null;

export function clearScriptLoadState() {
  loadPromise = null;
  activeUrl = null;
  document.getElementById(MPI_SCRIPT_ELEMENT_ID)?.remove();
}

export function loadScript(url) {
  if (loadPromise && activeUrl === url) return loadPromise;

  activeUrl = url;
  loadPromise = new Promise((resolve, reject) => {
    document.getElementById(MPI_SCRIPT_ELEMENT_ID)?.remove();

    const script = document.createElement('script');
    script.id = MPI_SCRIPT_ELEMENT_ID;
    script.src = url;
    script.async = true;
    script.onload = () => resolve(script);
    script.onerror = () => {
      loadPromise = null;
      activeUrl = null;
      script.remove();
      reject(new Error('Failed to load MPI script'));
    };
    document.head.appendChild(script);
  });

  return loadPromise;
}
