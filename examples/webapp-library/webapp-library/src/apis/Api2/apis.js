/* eslint-disable import/prefer-default-export */
import { send } from '../Send';

export const photoClicked = (id) => {
  send('photoClicked', [id], false);
};
