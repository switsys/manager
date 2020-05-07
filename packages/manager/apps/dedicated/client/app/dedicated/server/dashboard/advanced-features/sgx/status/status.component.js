import controller from './status.controller';
import template from './status.html';

export default {
  bindings: {
    /** @type {boolean} */
    isRunning: '<',
    prmrr: '<',
    /** @type {SgxStatus} */
    status: '<',
  },
  controller,
  template,
};
