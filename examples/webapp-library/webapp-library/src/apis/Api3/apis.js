import { send } from '../Send';

export const setGrayscale = (grayscale) => {
  send('setGrayscale', [grayscale], false);
};

export const setBlur = (blurAmount) => {
  send('setBlur', [blurAmount], false);
};
