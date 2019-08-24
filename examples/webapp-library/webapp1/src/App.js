import React, { useState, useEffect } from 'react';
import { startApis, stopApis } from 'webapp-library';
import Type1 from './Type1';
import Type2 from './Type2';
import './App.css';

const parentOrigin = process.env.REACT_APP_PARENT_ORIGIN;

const App = () => {
  console.log('webapp1 render');
  const [loadedType, setLoadedType] = useState();
  const [canModPhotos, setCanModPhotos] = useState();

  useEffect(() => {
    startApis(parentOrigin).then(({ type, apis }) => {
      setCanModPhotos(!!apis.find(api => api === 'Api3'));
      setLoadedType(type);
    });
    return stopApis;
  }, []);

  if (!loadedType) return null;
  if (loadedType === 'LibType1') return <Type1 />;
  return <Type2 canModPhotos={canModPhotos} />;
};

export default App;
