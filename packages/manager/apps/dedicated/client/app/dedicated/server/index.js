import angular from 'angular';

import '@uirouter/angularjs';
import 'angular-translate';
import 'ovh-ui-angular';

import bandwidth from './bandwidth/bandwidth.module';
import dashboard from './dashboard';
import interfaces from './interfaces/interfaces.module';
import servers from './servers/servers.module';

import bandwidthVrackOrderService from './server.bandwidth-vrack-order.service';
import component from './server.component';
import featureAvailability from './server.feature-availability';
import routing from './server.routing';
import service from './server.service';

const moduleName = 'ovhManagerDedicatedServer';

angular
  .module(moduleName, [
    bandwidth,
    dashboard,
    interfaces,
    'oui',
    'pascalprecht.translate',
    servers,
    'ui.router',
  ])
  .component('dedicatedServer', component)
  .config(routing)
  .service('Server', service)
  .service('BandwidthVrackOrderService', bandwidthVrackOrderService)
  .service('DedicatedServerFeatureAvailability', featureAvailability)
  .constant('WEATHERMAP_URL', 'http://weathermap.ovh.net/')
  .constant('VMS_URL', 'http://weathermap.ovh.net/')
  .constant('NO_AUTORENEW_COUNTRIES', [
    'ASIA',
    'AU',
    'CZ',
    'PL',
    'CA',
    'QC',
    'SG',
    'WE',
    'WS',
    'MA',
    'TN',
    'SN',
  ])
  .constant('FIREWALL_RULE_ACTIONS', {
    ALLOW: 'PERMIT',
    DENY: 'DENY',
  })
  .constant('FIREWALL_RULE_PROTOCOLS', {
    IPV_4: 'IPv4',
    UDP: 'UDP',
    TCP: 'TCP',
    ICMP: 'ICMP',
  })
  .constant('FIREWALL_STATUSES', {
    ACTIVATED: 'ACTIVATED',
    DEACTIVATED: 'DEACTIVATED',
    NOT_CONFIGURED: 'NOT_CONFIGURED',
  })
  .constant('MITIGATION_STATUSES', {
    ACTIVATED: 'ACTIVATED',
    AUTO: 'AUTO',
    FORCED: 'FORCED',
  })
  .constant('STATISTICS_SCALE', {
    TENSECS: '_10_S',
    ONEMIN: '_1_M',
    FIVEMINS: '_5_M',
  })
  .constant('NEW_RANGE', {
    PATTERN: /^(ADV|STOR|ADVANCE|RISE|INFRA)-[1-9]$/,
  })
  .constant('SERVERSTATS_PERIOD_ENUM', {
    HOURLY: {
      standardDays: 0,
      standardHours: 0,
      standardMinutes: 1,
      standardSeconds: 60,
      millis: 60000,
    },
    DAILY: {
      standardDays: 0,
      standardHours: 0,
      standardMinutes: 5,
      standardSeconds: 300,
      millis: 300000,
    },
    WEEKLY: {
      standardDays: 0,
      standardHours: 0,
      standardMinutes: 30,
      standardSeconds: 1800,
      millis: 1800000,
    },
    MONTHLY: {
      standardDays: 0,
      standardHours: 2,
      standardMinutes: 120,
      standardSeconds: 7200,
      millis: 7200000,
    },
    YEARLY: {
      standardDays: 1,
      standardHours: 24,
      standardMinutes: 1440,
      standardSeconds: 86400,
      millis: 86400000,
    },
  })
  .constant('HARDWARE_RAID_RULE_DEFAULT_NAME', 'managerHardRaid')
  .run(/* @ngTranslationsInject:json ../translations */);

export default moduleName;
