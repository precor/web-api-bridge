const getPhoto = async ({ id, grayscale, blur }) => {
  let url = (id)
    ? `https://picsum.photos/id/${id}/${window.innerWidth}/${window.innerHeight}/`
    : `https://picsum.photos/${window.innerWidth}/${window.innerHeight}/`;
  if (grayscale) url = `${url}?grayscale`;
  if (blur) url = (grayscale) ? `${url}&blur` : `${url}?blur`;
  const response = await fetch(url);
  const newId = response.url.split('/')[4];
  const imageBlob = await response.blob();
  return {
    id: newId, imageUrl: URL.createObjectURL(imageBlob), grayscale, blur,
  };
};

export default getPhoto;
