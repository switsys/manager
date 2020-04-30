import controller from './server.controller';
import template from './server.html';

export default {
  bindings: {
    ola: '<',
    orderPrivateBandwidthLink: '<',
    orderPublicBandwidthLink: '<',
    server: '<',
    specifications: '<',
    resiliatePublicBandwidthLink: '<',
    resiliatePrivateBandwidthLink: '<',
  },
  controller,
  template,
};
