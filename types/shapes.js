/* eslint-disable import/no-extraneous-dependencies, import/prefer-default-export */
import PropTypes from 'prop-types';

export const Message = PropTypes.shape({
  type: PropTypes.oneOf(['response', 'request']),
  msgId: PropTypes.number,
  targetFunc: PropTypes.string,
  args: PropTypes.arrayOf(PropTypes.any),
  wantResult: PropTypes.bool,
  sourceHref: PropTypes.string,
});
