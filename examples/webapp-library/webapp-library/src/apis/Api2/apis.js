/* eslint-disable import/prefer-default-export */
import { send } from '../send';

export const photoClicked = (id) => {
  send('photoClicked', [id], false);
};
