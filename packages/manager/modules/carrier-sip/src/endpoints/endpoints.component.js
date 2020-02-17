import controller from './endpoints.controller';
import template from './endpoints.html';

export default {
  bindings: {
    endpoints: '<',
  },
  controller,
  name: 'carrierSipEndpoints',
  template,
};
