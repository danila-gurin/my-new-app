// Create a new file: CameraContext.tsx
import { createContext, useContext, useState } from 'react';

const CameraContext = createContext({
  cameraActive: false,
  setCameraActive: (active: boolean) => {},
});

import { ReactNode } from 'react';

export const CameraProvider = ({ children }: { children: ReactNode }) => {
  const [cameraActive, setCameraActive] = useState(false);
  return (
    <CameraContext.Provider value={{ cameraActive, setCameraActive }}>
      {children}
    </CameraContext.Provider>
  );
};

export const useCameraContext = () => useContext(CameraContext);
