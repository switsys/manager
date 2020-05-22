import controller from './dashboard.controller';
import template from './dashboard.html';

export default {
  bindings: {
    bandwidthInformations: '<',
    changeOwnerUrl: '<',
    eligibleData: '<',
    monitoringProtocolEnum: '<',
    ola: '<',
    orderPrivateBandwidthLink: '<',
    orderPublicBandwidthLink: '<',
    resiliatePrivateBandwidthLink: '<',
    resiliatePublicBandwidthLink: '<',
    server: '<',
    serviceInfos: '<',
    serviceMonitoring: '<',
    specifications: '<',
    trafficInformations: '<',
    user: '<',
    vrackInfos: '<',
    worldPart: '<',
  },
  controller,
  template,
  require: {
    dedicatedServer: '^dedicatedServer',
  },
};
