import angular from 'angular';

import '@uirouter/angularjs';
import 'angular-translate';
import 'ovh-ui-angular';

import component from './status.component';
import service from './status.service';

const moduleName =
  'ovhManagerDedicatedServerDashboardAdvancedFeaturesSgxStatus';

angular
  .module(moduleName, ['oui', 'pascalprecht.translate', 'ui.router'])
  .component('dedicatedServerDashboardAdvancedFeaturesSgxStatus', component)
  .service('DedicatedServerDashboardAdvancedFeaturesSgxStatus', service)
  .run(/* @ngTranslationsInject:json ./translations */);

export default moduleName;
