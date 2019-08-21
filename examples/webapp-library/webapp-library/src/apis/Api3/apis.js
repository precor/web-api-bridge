import { send } from '../send';

export const setGrayscale = (grayscale) => {
  send('setGrayscale', [grayscale], false);
};

export const setBlur = (blurAmount) => {
  send('setBlur', [blurAmount], false);
};
