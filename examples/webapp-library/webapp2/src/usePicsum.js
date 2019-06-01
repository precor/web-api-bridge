
import { useState, useEffect } from 'react';

const buildRequestUrl = (data) => {
  const {
    size: { width, height }, id, grayscale, blur,
  } = data;
  let requestUrl = (id)
    ? `https://picsum.photos/id/${id}/${width}/${height}/`
    : `https://picsum.photos/${width}/${height}/`;
  if (grayscale) requestUrl = `${requestUrl}?grayscale`;
  if (blur) requestUrl = (grayscale) ? `${requestUrl}&blur` : `${requestUrl}?blur`;
  return requestUrl;
};

const getPhoto = async (data) => {
  const { lastRequestUrl } = data;
  const requestUrl = buildRequestUrl(data);
  if (requestUrl === lastRequestUrl) return data; // no changes
  const response = await fetch(requestUrl);
  const imageBlob = await response.blob();
  const id = response.url.split('/')[4];
  return {
    ...data,
    lastRequestUrl: buildRequestUrl({ ...data, id }),
    id,
    url: URL.createObjectURL(imageBlob),
  };
};

function useWindowSize() {
  const [size, setSize] = useState({ width: window.innerWidth, height: window.innerHeight });

  useEffect(() => {
    const handleResize = () => setSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  });

  return size;
}

const usePicsum = () => {
  const size = useWindowSize();
  const [data, setData] = useState({});
  const { id, grayscale, blur } = data;

  useEffect(() => {
    getPhoto({ ...data, size }).then(d => setData(d));
  }, [size, id, grayscale, blur]); // eslint-disable-line react-hooks/exhaustive-deps

  return [data, setData];
};

export default usePicsum;
